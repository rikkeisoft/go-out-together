import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  sid: yup.string().required(),
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { sid } = req.query

    try {
      await schema.validate({ sid })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString, values, result, data

    queryString = `SELECT id, expire_time FROM sessions WHERE sid = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng users', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy session')
    }
    const expireTime = result[0].expire_time
    const sessionId = result[0].id
    const now = new Date()
    const expireTimeDate = new Date(result[0].expire_time)

    // check vote time is expired or not
    if (expireTimeDate.getTime() < now.getTime()) {
      // not expire
      queryString = `SELECT address_id, MAX(vote) AS vote_count FROM ( SELECT address_id, COUNT(address_id) AS vote FROM session_address_user WHERE session_id = ? GROUP BY address_id) AS vote_table GROUP BY address_id ORDER BY vote_count DESC LIMIT 1`
      values = [sessionId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được id từ bảng users', err)
      }
      if (result.length === 0) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lay duoc thong tin vote')
      }
      const voters = result[0].vote_count
      const addressId = result[0].address_id

      // get this address
      queryString = `SELECT * FROM addresses WHERE id = ?`
      values = [addressId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được id từ bảng users', err)
      }
      if (result.length === 0) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không tìm thấy address')
      }
      data = {
        voters,
        address: result[0],
      }
    } else {
      // time is not expired
      data = { expireTime }
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Vote successfully',
      data,
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
