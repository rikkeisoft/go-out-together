// /api/users/login
// query: uuid, username, avatar_url
// check user is in table, if not -> add
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import { query } from 'lib/db'
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
  }

  const isValid = await schema.isValid({ ...req.body })

  if (!isValid) {
    // error
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
  }
  // valid -> check user is already in table or not
  const { uuid, username, avatar_url } = req.body
  const isOnline = 1
  let queryString = 'SELECT username, avatar_url FROM users WHERE uuid = ?'
  let values = [uuid]
  let result = await query(queryString, values)

  if (_.isNil(result)) {
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin người dùng' })
  }
  if (result.length === 0) {
    // new user -> insert
    queryString = 'INSERT INTO users (uuid, username, avatar_url, is_online) VALUES (?, ?, ?, ?)'
    values = [uuid, username, avatar_url, isOnline]
    result = await query(queryString, values)
    if (_.isNil(result)) {
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được thông tin người dùng' })
    }
  } else {
    // user already in db -> check update info
    let user = result[0]

    if (user.username !== username || user.avatar_url !== avatar_url) {
      queryString = `UPDATE users SET username = ?, avatar_url = ?, is_online = ? WHERE uuid = ?`
      values = [username, avatar_url, isOnline, uuid]
      result = await query(queryString, values)
      if (_.isNil(result)) {
        res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được người dùng' })
      }
    } else {
      // update user is online now
      queryString = `UPDATE users SET is_online = ? WHERE uuid = ?`
      values = [isOnline, uuid]
      result = await query(queryString, values)
      if (_.isNil(result)) {
        res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được người dùng' })
      }
    }
  }

  // all done
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Đăng nhập thành công',
    data: result,
  })
}
