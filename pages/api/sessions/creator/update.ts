import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'
import { NextApiRequest, NextApiResponse } from 'next'
import { StringOrNumberGeneric, UpdateSessionCreatorParams } from 'lib/interfaces'

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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uid, name, address } = req.body as unknown as UpdateSessionCreatorParams

    try {
      await schema.validate({ uid, name, address })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString: string, values: StringOrNumberGeneric[], result

    queryString = 'SELECT id FROM addresses WHERE aid = ?'
    values = [address.aid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng addresses', err)
    }

    let addressId
    if (result.length === 0) {
      queryString = 'INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)'
      values = [address.aid, address.name, address.latitude, address.longitude]

      try {
        result = await mysql.query(queryString, values)
        addressId = result.insertId
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
      await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
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
