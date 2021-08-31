import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  uid: yup.string().required(),
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uid } = req.query

    try {
      await schema.validate({ uid })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString, values, result

    queryString = `SELECT id FROM users WHERE uuid = ?`
    values = [uid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được nội dung session', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy session')
    }
    const userId = result[0].id

    queryString = `
		SELECT sessions.id, sessions.sid, sessions.title, sessions.content
		FROM sessions
		INNER JOIN session_user
		ON sessions.id = session_user.session_id
		WHERE session_user.user_id = ?
		`
    values = [userId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được nội dung session', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy session')
    }
    let sessionResult = result.map((rs) => ({
      id: rs.id,
      sid: rs.sid,
      title: rs.title,
      content: rs.content,
    }))

    // get result of session
    const sIds = result.map((rs) => rs.id)
    const resultSessionPromises = sIds.map((sid) => {
      queryString = `
			SELECT session_result.session_id, addresses.name FROM addresses
			INNER JOIN session_result ON addresses.id = session_result.address_id
			WHERE session_result.session_id = ?
			`
      values = [sid]
      try {
        result = mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được nội dung session', err)
      }
      return result
    })
    result = await Promise.all(resultSessionPromises)

    if (result.length !== 0) {
      sessionResult.forEach((session) => {
        // session.id
        result.map((rs) => {
          if (rs.length !== 0 && rs[0].session_id === session.id) {
            session.result = rs.map((item) => item.name)
          }
          return
        })
      })
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Lấy dữ liệu session thành công',
      data: sessionResult,
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
