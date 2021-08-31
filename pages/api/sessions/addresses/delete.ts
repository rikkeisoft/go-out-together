import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  addressId: yup.number().required(),
  sid: yup.string().required(),
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'DELETE') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { sid, addressId } = req.body

    try {
      await schema.validate({ sid, addressId })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString: string, values: string[], result: any

    queryString = `SELECT id FROM sessions WHERE sid = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng sessions', err)
    }
    const sessionId = result[0].id

    queryString = `DELETE FROM session_address_user WHERE session_id = ? AND address_id = ?`
    values = [sessionId, addressId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không xoa được address', err)
    }

    queryString = `DELETE FROM session_address WHERE session_id = ? AND address_id = ?`
    values = [sessionId, addressId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không xóa được address', err)
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Xóa địa chỉ thành công',
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
