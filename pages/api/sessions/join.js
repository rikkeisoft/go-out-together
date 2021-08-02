import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
  sid: yup.string().required(),
  uid: yup.string().required(),
  name: yup.string().required(),
  address: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { sid, uid, name, address } = req.body

  const isValid = await schema.isValid({ uid, sid, name, address })

  if (!isValid) {
    res.status(400).json({
      messageCode: messageCodes.ERROR,
      message: 'Các thông tin không hợp lệ',
    })
    return
  }

  const db = await openDb()
  // check address is already in addresses table ?
  let queryString = `SELECT id FROM addresses WHERE aid = ?`
  let values = [address.aid]
  let result = await db.get(queryString, values)

  if (_.isNil(result)) {
    // insert address to table
    queryString = `INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)`
    values = [address.aid, address.name, address.latitude, address.longitude]
    result = await db.run(queryString, values)

    if (_.isNil(result)) {
      await db.close()
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được địa chỉ mới' })
      return
    }
  }

  // address already in table -> save user's address
  const addressId = result.id ?? result.lastID
  queryString = `UPDATE users SET address_id = ?, name = ? WHERE uuid = ?`
  values = [addressId, name, uid]
  result = await db.run(queryString, values)
  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được tên và địa chỉ người dùng' })
    return
  }

  queryString = `SELECT id FROM sessions WHERE sid = ?`
  values = [sid]
  result = await db.get(queryString, values)
  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy session' })
    return
  }
  const sessionId = result.id

  queryString = `SELECT id FROM users WHERE uuid = ?`
  values = [uid]
  result = await db.get(queryString, values)
  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy người dùng' })
    return
  }
  const userId = result.id

  queryString = `SELECT session_id, user_id FROM  session_user WHERE session_id = ? AND user_id = ?`
  values = [sessionId, userId]
  result = await db.get(queryString, values)
  if (_.isNil(result)) {
    queryString = `INSERT INTO session_user (session_id, user_id) VALUES (?, ?)`
    values = [sessionId, userId]
    result = await db.run(queryString, values)
    if (_.isNil(result)) {
      await db.close()
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không join được session' })
      return
    }
  }

  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Join session thành công',
  })
}
