import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'
import { NextApiRequest, NextApiResponse } from 'next'
import { JoinSessionParams, StringOrNumberGeneric } from 'lib/interfaces'

const schema = yup.object().shape({
  sid: yup.string().required(),
  uid: yup.string().required(),
  name: yup.string().required(),
  address: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { sid, uid, name, address } = req.body as unknown as JoinSessionParams

    try {
      await schema.validate({ sid, uid, name, address })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString: string, values: StringOrNumberGeneric[], result

    queryString = `SELECT id FROM addresses WHERE aid = ?`
    values = [address.aid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng addresses', err)
    }

    let addressId: number
    if (result.length === 0) {
      queryString = `INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)`
      values = [address.aid, address.name, address.latitude, address.longitude]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không chèn được bản ghi vào bảng addresses', err)
      }
      addressId = result.insertId
    } else {
      addressId = result[0].id
    }

    queryString = `UPDATE users SET address_id = ?, name = ? WHERE uuid = ?`
    values = [addressId, name, uid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không cập nhật được tên và địa chỉ người dùng', err)
    }

    queryString = `SELECT id FROM sessions WHERE sid = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng sessions', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy session')
    }
    const sessionId: number = result[0].id

    queryString = `SELECT id FROM users WHERE uuid = ?`
    values = [uid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng users', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy người dùng')
    }
    const userId: number = result[0].id

    queryString = `SELECT session_id, user_id FROM  session_user WHERE session_id = ? AND user_id = ?`
    values = [sessionId, userId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được session_id, user_id từ bảng session_user', err)
    }
    if (result.length === 0) {
      queryString = `INSERT INTO session_user (session_id, user_id, address_id) VALUES (?, ?, ?)`
      values = [sessionId, userId, addressId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không join được session', err)
      }
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Join session thành công',
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
