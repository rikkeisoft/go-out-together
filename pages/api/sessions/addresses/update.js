import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
  sessionId: yup.number().required(),
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

  const { sessionId, address } = req.body

  const isValid = await schema.isValid({ sessionId, address })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
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
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được thông tin địa chỉ ' })
      return
    }
  }

  // save user to session_address (address of session)
  // check
  const addressId = result?.id ?? result.lastID
  queryString = `SELECT DISTINCT session_id FROM session_address WHERE address_id = ?`
  values = [addressId]
  result = await db.all(queryString, values)

  if (_.isNil(result) || result.findIndex((ele) => ele.session_id === sessionId) === -1) {
    // not in table
    queryString = `INSERT INTO session_address (session_id, address_id) VALUES (?, ?)`
    values = [sessionId, addressId]
    result = await db.run(queryString, values)

    if (_.isNil(result)) {
      await db.close()
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được thông tin' })
      return
    }
  }

  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Thêm địa chỉ vào session thành công',
  })
}