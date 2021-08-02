import { openDb } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
  sessionId: yup.string().required(),
})

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { sessionId } = req.query

  const isValid = await schema.isValid({ sessionId })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()

  let data = {}
  let queryString = `SELECT title, content, expire_time FROM sessions WHERE id = ?`
  let values = [sessionId]
  let result = await db.get(queryString, values)
  data.title = result.title
  data.content = result.content
  data.expireTime = result.expire_time

  let members = []
  queryString = `SELECT user_id FROM session_user WHERE session_id = ?`
  values = [sessionId]
  result = await db.all(queryString, values)
  let userIds = result.map((row) => row.user_id)
  for (let userId of userIds) {
    queryString = `SELECT name, avatar_url FROM users WHERE id = ?`
    values = [userId]
    result = await db.get(queryString, values)
    members.push({
      id: userId,
      username: result.username,
      name: result.name,
      avatarURl: result.avatar_url,
    })
  }
  data.members = members

  let addresses = []
  queryString = `SELECT address_id FROM session_address WHERE session_id = ?`
  values = [sessionId]
  result = await db.all(queryString, values)
  let addressIds = result.map((row) => row.address_id)
  for (let addressId of addressIds) {
    queryString = `SELECT aid, name, latitude, longitude FROM addresses WHERE id = ?`
    values = [addressId]
    result = await db.get(queryString, values)
    addresses.push({
      id: addressId,
      aid: result.aid,
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
    })
  }
  data.addresses = addresses

  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Tạo session thành công',
    data: data,
  })
}
