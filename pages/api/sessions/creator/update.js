import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
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

  const { uid, name, address } = req.body

  const isValid = await schema.isValid({ uid, name, address })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()

  let queryString = `SELECT id FROM addresses WHERE aid = ?`
  let values = [address.aid]
  let result = await db.get(queryString, values)

  let addressId
  if (_.isNil(result)) {
    queryString = `INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)`
    values = [address.aid, address.name, address.latitude, address.longitude]
    result = await db.run(queryString, values)

    addressId = result.lastID
  } else {
    addressId = result.id
  }

  queryString = `UPDATE users SET address_id = ?, name = ? WHERE uuid = ?`
  values = [addressId, name, uid]
  result = await db.run(queryString, values)

  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Cập nhật thông tin người tạo session thành công',
  })
}
