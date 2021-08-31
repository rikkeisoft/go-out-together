import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  sid: yup.string().required(),
})

interface AddressResult {
  aid: string
  created_at: null
  id: number
  latitude: number
  longitude: number
  name: string
  updated_at: null
}

interface Data {
  voters?: number
  addresses?: AddressResult[]
  expireTime?: Date
}

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

    let queryString: string, values: string[], result: any
    let data: Data = {
      voters: 0,
      addresses: [],
    }

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
      queryString = `
      SELECT address_id, vote as vote_count FROM
      (
        (SELECT address_id, COUNT(address_id) AS vote
        FROM session_address_user 
        WHERE session_id = ? GROUP BY address_id) as count_table
        INNER JOIN (
          SELECT MAX(vote) AS voter
          FROM (SELECT COUNT(address_id) AS vote
          FROM session_address_user 
          WHERE session_id = ? GROUP BY address_id) as test_table
        ) as max_table
        ON max_table.voter = count_table.vote
      )`
      values = [sessionId, sessionId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được', err)
      }
      if (result.length === 0) {
        cleanUp(mysql)
        res.status(200).json({
          messageCode: messageCodes.SUCCESS,
          message: 'Lấy kết quả vote thành công',
          data: {
            address: null,
            voters: null,
          },
        })
        return
      }
      const voters = result[0].vote_count
      const addressIds = result.map((row) => row.address_id)

      const addressPromises = addressIds.map((id) => {
        queryString = `SELECT * FROM addresses WHERE id = ?`
        values = [id]
        try {
          result = mysql.query(queryString, values)
        } catch (err) {
          cleanUp(mysql)
          throw new ApiException(500, 'Không lấy được id từ bảng users', err)
        }
        if (result.length === 0) {
          cleanUp(mysql)
          throw new ApiException(500, 'Không tìm thấy address')
        }

        return result
      })
      queryString = `SELECT * FROM session_result WHERE session_id = ?`
      values = [sessionId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được id từ bảng users', err)
      }
      if (result.length === 0) {
        const sessionResultPromises = addressIds.map((id) => {
          queryString = `INSERT INTO session_result VALUES (?, ?)`
          values = [sessionId, id]
          try {
            result = mysql.query(queryString, values)
          } catch (err) {
            cleanUp(mysql)
            throw new ApiException(500, 'Không thêm được dữ liệu', err)
          }
          return result
        })
        await Promise.all(sessionResultPromises)
      }

      const addresses = await Promise.all(addressPromises)
      const addressResult = addresses.map((address) => address[0])
      data = {
        voters,
        addresses: addressResult,
      }
    } else {
      // time is not expired
      data = { expireTime }
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Lấy kết quả vote thành công',
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
