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

    let queryString, values, result
    let data = {}

    queryString = `
    SELECT sessions.id, sessions.title, sessions.content, sessions.expire_time, session_user.user_id 
    FROM sessions
    INNER JOIN session_user
    ON sessions.id = session_user.session_id
    WHERE sid = ?`
    values = [sid]
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
    const sessionId = result[0].id

    data.title = result[0].title
    data.content = result[0].content
    data.expireTime = result[0].expire_time
    let userIds = result.map((row) => row.user_id)

    const userPromises = userIds.map((userId) => {
      queryString = `SELECT id, name, username, avatar_url FROM users WHERE id = ?`
      values = [userId]
      try {
        result = mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được thông tin thành viên trong session', err)
      }
      if (result.length === 0) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không tìm thấy thành viên')
      }
      return result
    })

    queryString = `SELECT address_id FROM session_address WHERE session_id = ?`
    values = [sessionId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được các địa điểm vui chơi từ session', err)
    }

    let addressIds = result.map((row) => row.address_id)
    const addressPromises = addressIds.map((addressId) => {
      queryString = `
      SELECT addresses.id, addresses.aid, addresses.name, addresses.latitude, addresses.longitude, users.name as username,
      (
      SELECT COUNT(address_id) FROM session_address_user 
      WHERE session_id = ? AND address_id = ?
      ) AS vote_count
      FROM ((addresses
      INNER JOIN session_address 
      ON addresses.id = session_address.address_id)
      LEFT JOIN users ON session_address.added_user_id = users.id)
      WHERE session_address.session_id = ? AND session_address.address_id = ?`
      values = [sessionId, addressId, sessionId, addressId]
      try {
        result = mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được thông tin địa điểm vui chơi', err)
      }
      if (result.length === 0) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không tìm thấy địa điểm vui chơi')
      }

      return result
    })
    const userResult = await Promise.all(userPromises)
    const members = userResult.map((user) => ({
      id: user[0].id,
      username: user[0].username,
      name: user[0].name,
      avatarUrl: user[0].avatar_url,
    }))
    const addressResult = await Promise.all(addressPromises)
    const addresses = addressResult.map((address) => ({
      id: address[0].id,
      aid: address[0].aid,
      name: address[0].name,
      latitude: address[0].latitude,
      longitude: address[0].longitude,
      username: address[0].username,
      voteCount: address[0].vote_count,
    }))

    data.members = members
    data.addresses = addresses

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Lấy dữ liệu session thành công',
      data: data,
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
