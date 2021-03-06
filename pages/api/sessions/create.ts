import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import { nanoid } from 'nanoid'
import messageCodes from 'consts/messageCodes'
import { getExpireTime } from 'lib/date'
import ApiException from 'exceptions/ApiException'
import { NextApiRequest, NextApiResponse } from 'next'
import { Address, CreateSessionParams, StringOrNumberGeneric } from 'lib/interfaces'

const schema = yup.object().shape({
  uid: yup.string().required(),
  title: yup.string().required(),
  content: yup.string().required(),
  timeLimit: yup.number().required(),
  addresses: yup.array().of(
    yup.object().shape({
      aid: yup.string().required(),
      name: yup.string().required(),
      latitude: yup.number().required(),
      longitude: yup.number().required(),
    }),
  ),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uid, title, content, timeLimit, addresses } = req.body as unknown as CreateSessionParams

    try {
      await schema.validate({ uid, title, content, timeLimit, addresses })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    const expireTime = getExpireTime(timeLimit)

    const sid = nanoid()
    let queryString: string, values: StringOrNumberGeneric[], result

    queryString = `INSERT INTO sessions (sid, title, content, expire_time, creator) VALUES (?, ?, ?, ?, ?) `
    values = [sid, title, content, expireTime, uid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không chèn được dữ liệu vào bảng sessions', err)
    }

    const sessionId: string = result.insertId

    let addressIds: StringOrNumberGeneric[] = []
    for (let address of addresses) {
      queryString = `SELECT id FROM addresses WHERE aid = ?`
      values = [address.aid]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được id từ bảng addresses', err)
      }

      if (result.length > 0) {
        addressIds.push(result[0].id)
        continue
      }

      queryString = `INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)`
      values = [address.aid, address.name, address.latitude, address.longitude]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không thêm được bản ghi mới vào bảng addresses', err)
      }

      addressIds.push(result.insertId)
    }

    queryString = `SELECT id, address_id FROM users WHERE uuid = ?`
    values = [uid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id, address_id từ bảng users', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy người dùng')
    }
    const userId: number = result[0].id
    const addressId: number = result[0].address_id

    for (let addressId of addressIds) {
      queryString = `INSERT INTO session_address (session_id, address_id, added_user_id) VALUES (?, ?, ?)`
      values = [sessionId, addressId, userId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không thêm được bản ghi mới vào bảng session_address', err)
      }
    }

    // insert admin to session_user
    queryString = `INSERT INTO session_user (session_id, user_id, address_id) VALUES (?, ?, ?)`
    values = [sessionId, userId, addressId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không thêm được bản ghi mới vào bảng session_user', err)
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Tạo session thành công',
      data: {
        sid: sid,
      },
    })
  } catch (exception) {
    if (exception instanceof ApiException) {
      res.status(exception.statusCode).json({
        messageCode: messageCodes.ERROR,
        message: exception.message,
        err: exception.err,
      })
    } else {
      res.status(500).json({
        messageCode: messageCodes.ERROR,
        message: 'Đã xảy ra lỗi',
        err: exception,
      })
    }
  }
}
