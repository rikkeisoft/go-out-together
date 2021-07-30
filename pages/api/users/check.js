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

  if (_.isNil(req?.body?.uuid)) {
    // error
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const { uuid } = req.body

  const isValid = await schema.isValid({ uuid })

  if (!isValid) {
    // error
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()

  let queryString = 'SELECT username, avatar_url, is_online FROM users WHERE uuid = ?'
  let values = [req.body.uuid]
  let result = await db.all(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin người dùng' })
    return
  }
  if (!result) {
    // user not in table
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Thông tin người dùng không có trong bảng' })
    return
  } else if (result.is_online === 0) {
    // user is offline
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Người dùng đang offline' })
    return
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
