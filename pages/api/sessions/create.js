import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'
import { getExpireTime } from 'lib/date'

const schema = yup.object().shape({
  uid: yup.string().required(),
  title: yup.string().required(),
  content: yup.string().required(),
  timeLimit: yup.number().required(),
  addresses: yup.array().of(
    yup.object().shape({
      aid: yup.string().required(),
      name: yup.string().required(),
      latitude: yup.number().required(),
      longitude: yup.number().required(),
    }),
  ),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { uid, title, content, timeLimit, addresses } = req.body

  const isValid = await schema.isValid({ uid, title, content, timeLimit, addresses })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()

  const expireTime = getExpireTime(timeLimit)

  let queryString = `INSERT INTO sessions (title, content, expire_time, creator) VALUES (?, ?, ?, ?) `
  let values = [title, content, expireTime, uid]
  let result = await db.run(queryString, values)
  const sessionId = result.lastID

  let addressIds = []
  for (let address of addresses) {
    queryString = `SELECT id FROM addresses WHERE aid = ?`
    values = [address.aid]
    result = await db.get(queryString, values)

    if (!_.isNil(result)) {
      addressIds.push(result.id)
      continue
    }

    queryString = `INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)`
    values = [address.aid, address.name, address.latitude, address.longitude]
    result = await db.run(queryString, values)
    addressIds.push(result.lastId)
  }

  for (let addressId of addressIds) {
    queryString = `INSERT INTO session_address (session_id, address_id) VALUES (?, ?)`
    values = [sessionId, addressId]
    result = await db.run(queryString, values)
  }

  // insert admin to session_user
  queryString = `INSERT INTO session_user VALUES (?, ?)`
  values = [sessionId, uid]
  result = await db.run(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin' })
    return
  }

  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Tạo session thành công',
    data: {
      sharedLink: req.headers.host + '/sessions/' + sessionId,
    },
  })
}
