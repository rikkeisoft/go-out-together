// /api/users/check
// check user whenever load page
import _ from 'lodash'
import * as yup from 'yup'
import { openDb } from 'lib/db'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
  uuid: yup.string().required(),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({
      messageCode: messageCodes.ERROR,
      message: 'Không tìm thấy api route',
    })
  }

  const isValid = schema.isValid({ ...req.body })

  if (!isValid) {
    // error
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
  }

  const db = await openDb()

  let queryString = 'SELECT username, avatar_url, is_online FROM users WHERE uuid = ?'
  let values = [req.body.uuid]
  let result = await db.get(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin người dùng' })
  }
  if (result.length === 0) {
    // user not in table
    await db.close()
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Thông tin người dùng không có trong bảng' })
  } else if (result[0].is_online === 0) {
    // user is offline
    await db.close()
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Người dùng đang offline' })
  } else {
    // user is online
    await db.close()
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Người dùng đang online',
      data: result[0],
    })
  }
}
