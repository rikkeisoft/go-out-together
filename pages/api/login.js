import { query } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
  uuid: yup.string().required(),
  username: yup.string().required(),
  avatar_url: yup.string().required(),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
  }

  const { uuid, username, avatar_url } = req.query

  const isValid = await schema.isValid({ uuid, username, avatar_url })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
  }

  let queryString = `SELECT username, avatar_url FROM users WHERE uuid = ? LIMIT 1`
  let values = [uuid]
  let result = await query(queryString, values)

  if (_.isNil(result)) {
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin người dùng' })
  }

  if (result.length === 0) {
    queryString = `INSERT INTO  users (uuid, username, avatar_url) VALUES (?,?,?)`
    values = [uuid, username, avatar_url]
    result = await query(queryString, values)

    if (_.isNil(result)) {
      res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được người dùng vào cơ sở dữ liệu' })
    }
  } else {
    let user = result[0]

    if (user.username !== username || user.avatar_url !== avatar_url) {
      queryString = `UPDATE users SET username = ?, avatar_url = ? WHERE uuid = ?`
      values = [username, avatar_url, uuid]
      result = await query(queryString, values)
      if (_.isNil(result)) {
        res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được người dùng' })
      }
    }
  }

  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Đăng nhập thành công',
    data: result,
  })
}
