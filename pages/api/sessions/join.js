import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
  userId: yup.string().required(),
  sessionId: yup.number().required(),
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

  const { userId, sessionId, name, address } = req.body

  const isValid = await schema.isValid({ userId, sessionId, name, address })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()
  // check address is already in addresses table ?
  let queryString = `SELECT id FROM addresses WHERE aid = ?`
  let values = [address.aid]
  let result = await db.get(queryString, values)

  if (_.isNil(result.id)) {
    // insert address to table
    queryString = `INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)`
    values = [address.aid, address.name, address.latitude, address.longitude]
    result = await db.run(queryString, values)

    if (_.isNil(result)) {
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được thông tin địa chỉ ' })
      return
    }
  }

  // address already in table -> save user's address
  const addressId = result.id
  queryString = `UPDATE users SET address_id = ?, name = ? WHERE uuid = ?`
  values = [addressId, name, userId]
  result = await db.run(queryString, values)

  if (_.isNil(result)) {
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được địa chỉ người dùng' })
    return
  }

  // save user to session_users (user join)

  queryString = `INSERT INTO session_user (session_id, user_id) VALUES (?, ?)`
  values = [sessionId, userId]
  result = await db.run(queryString, values)

  if (_.isNil(result)) {
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin' })
    return
  }

  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Thêm người dùng vào session thành công',
  })
}
