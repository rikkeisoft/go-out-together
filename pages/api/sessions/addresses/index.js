import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  addressId: yup.number().required(),
  sessionId: yup.number().required(),
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'DELETE') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { addressId, sessionId } = req.body

    try {
      await schema.validate({ addressId, sessionId })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString, values

    queryString = `DELETE session_address_user, session_address FROM session_address_user INNER JOIN session_address ON session_address_user.session_id = session_address.session_id WHERE session_id = ? AND address_id = ?`
    values = [sessionId, addressId]
    try {
      await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không xóa được thông tin', err)
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Xóa địa chỉ trong session thành công',
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
