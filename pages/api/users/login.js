// /api/users/login
// query: uuid, username, avatar_url
// check user is in table, if not -> add
import * as yup from 'yup'
import { openDb } from 'lib/db'
import messageCodes from 'consts/messageCodes'
import _ from 'lodash'

const schema = yup.object().shape({
  uuid: yup.string().required(),
  username: yup.string().required(),
  avatar_url: yup.string().required(),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({
      messageCode: messageCodes.ERROR,
      message: 'Không tìm thấy api route',
    })
    return
  }

  const isValid = await schema.isValid({ ...req.body })

  if (!isValid) {
    // error
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }
  // valid -> check user is already in table or not
  const { uuid, username, avatar_url } = req.body

  const db = await openDb()

  let queryString = 'SELECT username, avatar_url FROM users WHERE uuid = ?'
  let values = [uuid]
  let result = await db.get(queryString, values)

  if (_.isNil(result)) {
    // new user -> insert
    queryString = 'INSERT INTO users (uuid, username, avatar_url) VALUES (?, ?, ?)'
    values = [uuid, username, avatar_url]
    result = await db.run(queryString, values)
    if (_.isNil(result)) {
      await db.close()
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được thông tin người dùng' })
      return
    }
  } else {
    // user already in db -> check update info
    let user = result

    if (user.username !== username || user.avatar_url !== avatar_url) {
      queryString = `UPDATE users SET username = ?, avatar_url = ? WHERE uuid = ?`
      values = [username, avatar_url, uuid]
      result = await db.run(queryString, values)
      if (_.isNil(result)) {
        await db.close()
        res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được người dùng' })
        return
      }
    }
  }

  // all done
  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Đăng nhập thành công',
    data: result,
  })
}
