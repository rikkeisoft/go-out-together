import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'
import withProtect from 'middware/withProtect'

const schema = yup.object().shape({
  userId: yup.string().required(),
  sessionId: yup.string().required(),
  address: yup.object({
    aid: yup.string().required(),
    name: yup.string().required(),
    latitude: yup.number().required(),
    longitude: yup.number().required(),
  }),
})

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { userId, sessionId, address } = req.body

  const isValid = await schema.isValid({ userId, sessionId, address })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  // check user has voted or not
  // user has voted -> address_id is the same -> not update, address_id is different -> update
  // user has not voted -> insert

  // get addressId of address sent to server base on aid
  // if session_id === null -> not have sessionId -> insert
  // session_id !== null -> userId not in userId array -> insert
  // address_id !== addressId of userId -> update, else do nothing

  const db = await openDb()

  let queryString = `SELECT id FROM addresses WHERE aid = ?`
  let values = [address.aid]
  let result = await db.get(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin địa chỉ' })
    return
  }
  let addressId = result.id

  queryString = `SELECT user_id, address_id FROM session_address_user WHERE session_id = ?`
  values = [sessionId]
  result = await db.all(queryString, values)

  if (_.isNil(result) || result.every((ele) => ele.user_id !== userId)) {
    queryString = `INSERT INTO session_address_user VALUES (?, ?, ?)`
    values = [sessionId, addressId, userId]
    result = await db.run(queryString, values)

    if (_.isNil(result)) {
      await db.close()
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được thông tin' })
      return
    }
  } else if (result.find((ele) => ele.user_id === userId).address_id !== addressId) {
    queryString = `UPDATE session_address_user SET address_id = ? WHERE session_id = ? AND user_id = ?`
    values = [addressId, sessionId, userId]
    result = await db.run(queryString, values)

    if (_.isNil(result)) {
      await db.close()
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được thông tin' })
      return
    }
  }

  // get expire time
  queryString = `SELECT expire_time FROM sessions WHERE id = ?`
  values = [sessionId]
  result = await db.get(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin' })
    return
  }

  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Thêm vote địa chỉ cho người dùng thành công',
    data: {
      expireTime: result.expire_time,
    },
  })
}

export default withProtect(handler)
