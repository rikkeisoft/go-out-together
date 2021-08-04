import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  uid: yup.string().required(),
  sid: yup.string().required(),
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uid, sid } = req.query

    try {
      await schema.validate({ uid, sid })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString, values, result
    let isCreator = false
    queryString = `SELECT creator FROM sessions WHERE sid = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được creator từ bảng addresses', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy session')
    }

    if (uid === result[0].creator) {
      isCreator = true
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      data: {
        isCreator,
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
