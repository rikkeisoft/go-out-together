import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  uuid: yup.string().required(),
  username: yup.string().required(),
  avatar_url: yup.string().required(),
})

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uuid, username, avatar_url } = req.body

    try {
      await schema.validate({ uuid, username, avatar_url })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString, values, result

    queryString = `SELECT username, avatar_url FROM users WHERE uuid = ?`
    values = [uuid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được username, avatar_url từ bảng users', err)
    }

    if (result.length === 0) {
      queryString = `INSERT INTO  users (uuid, username, avatar_url) VALUES (?,?,?)`
      values = [uuid, username, avatar_url]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không thêm được người dùng vào cơ sở dữ liệu', err)
      }
    } else {
      let user = result[0]
      if (user.username !== username || user.avatar_url !== avatar_url) {
        queryString = `UPDATE users SET username = ?, avatar_url = ? WHERE uuid = ?`
        values = [username, avatar_url, uuid]
        try {
          result = await mysql.query(queryString, values)
        } catch (err) {
          cleanUp(mysql)
          throw new ApiException(500, 'Không cập nhật được người dùng', err)
        }
      }
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Đăng nhập thành công',
      data: result,
    })
  } catch (exception) {
    if (exception instanceof ApiException) {
      res.status(exception.statusCode).json({
        messageCode: messageCodes.ERROR,
        message: exception.message,
        err: exception.err,
      })
    } else {
      res.status(500).json({
        messageCode: messageCodes.ERROR,
        message: 'Đã xảy ra lỗi',
        err: exception,
      })
    }
  }
}
