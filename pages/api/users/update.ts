import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'
import { NextApiRequest, NextApiResponse } from 'next'
import { UpdateUserInfoParams } from 'lib/interfaces'

const schema = yup.object().shape({
  uuid: yup.string().required(),
  avatarURL: yup.string().required(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'PUT') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uuid, avatarURL } = req.body as unknown as UpdateUserInfoParams

    try {
      await schema.validate({ uuid, avatarURL })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString: string, values: string[], result

    queryString = `SELECT * FROM users WHERE uuid = ?`
    values = [uuid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được info từ bảng users', err)
    }
    if (result.length === 0) {
      // no user
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy user')
    }

    // found user in database
    queryString = `UPDATE users SET avatar_url = ? WHERE uuid = ?`
    values = [avatarURL, uuid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được info từ bảng users', err)
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Cập nhật avatar thành công',
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
