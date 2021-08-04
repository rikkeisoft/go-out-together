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

    queryString = `SELECT id, title, content, expire_time FROM sessions WHERE sid = ?`
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

    let members = []
    queryString = `SELECT user_id FROM session_user WHERE session_id = ?`
    values = [sessionId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được các thành viên trong session', err)
    }

    let userIds = result.map((row) => row.user_id)
    for (let userId of userIds) {
      queryString = `SELECT name, username, avatar_url FROM users WHERE id = ?`
      values = [userId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được thông tin thành viên trong session', err)
      }
      if (result.length === 0) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không tìm thấy thành viên')
      }

      members.push({
        id: userId,
        username: result[0].username,
        name: result[0].name,
        avatarUrl: result[0].avatar_url,
      })
    }
    data.members = members

    let addresses = []
    queryString = `SELECT address_id FROM session_address WHERE session_id = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được các địa điểm vui chơi từ session', err)
    }

    let addressIds = result.map((row) => row.address_id)
    for (let addressId of addressIds) {
      queryString = `SELECT aid, name, latitude, longitude FROM addresses WHERE id = ?`
      values = [addressId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được thông tin địa điểm vui chơi', err)
      }
      if (result.length === 0) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không tìm thấy địa điểm vui chơi')
      }
      addresses.push({
        id: addressId,
        aid: result[0].aid,
        name: result[0].name,
        latitude: result[0].latitude,
        longitude: result[0].longitude,
      })
    }
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
