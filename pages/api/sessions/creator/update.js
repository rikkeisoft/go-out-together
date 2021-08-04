import { openDb, closeDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  uid: yup.string().required(),
  name: yup.string().required(),
  address: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uid, name, address } = req.body

    try {
      await schema.validate({ uid, name, address })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    const db = await openDb()

    let queryString, values, result

    queryString = 'SELECT id FROM addresses WHERE aid = ?'
    values = [address.aid]
    try {
      result = await db.get(queryString, values)
    } catch (err) {
      closeDb(db)
      throw new ApiException(500, 'Không lấy được id từ bảng addresses', err)
    }

    let addressId
    if (_.isNil(result)) {
      queryString = 'INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)'
      values = [address.aid, address.name, address.latitude, address.longitude]

      try {
        result = await db.run(queryString, values)
        addressId = result.lastID
      } catch (err) {
        closeDb(db)
        throw new ApiException(500, 'Không chèn được bản ghi vào bảng addresses', err)
      }
    } else {
      addressId = result.id
    }

    queryString = `UPDATE users SET address_id = ?, name = ? WHERE uuid = ?`
    values = [addressId, name, uid]

    try {
      await db.run(queryString, values)
    } catch (err) {
      closeDb(db)
      throw new ApiException(500, 'Không cập nhật được address_id của bảng user', err)
    }

    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Cập nhật thông tin người tạo session thành công',
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
