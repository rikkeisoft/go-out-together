import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import jwt from 'jsonwebtoken'
import ApiException from 'exceptions/ApiException'
import { NextApiRequest, NextApiResponse } from 'next'
import { LoginParams } from 'lib/interfaces'

const schema = yup.object().shape({
  uuid: yup.string().required(),
  username: yup.string().required(),
  avatar_url: yup.string().required(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uuid, username, avatar_url } = req.body as unknown as LoginParams

    try {
      await schema.validate({ uuid, username, avatar_url })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString: string, values: string[], result, imgURL: string

    queryString = 'SELECT username, avatar_url FROM users WHERE uuid = ?'
    values = [uuid]
    result = await mysql.query(queryString, values)

    if (result.length === 0) {
      // new user -> insert
      imgURL = avatar_url

      queryString = 'INSERT INTO users (uuid, username, name, avatar_url) VALUES (?, ?, ?, ?)'
      values = [uuid, username, username, avatar_url]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không thêm được thông tin người dùng', err)
      }
    } else {
      // user already in db -> check update info
      let user = result[0]
      imgURL = user.avatar_url

      if (user.username !== username) {
        queryString = `UPDATE users SET username = ? WHERE uuid = ?`
        values = [username, avatar_url, uuid]
        try {
          await mysql.query(queryString, values)
        } catch (err) {
          cleanUp(mysql)
          throw new ApiException(500, 'Không cập nhật được người dùng', err)
        }
      }
    }

    // generate jwt token
    let accessToken: string
    try {
      accessToken = jwt.sign({ userId: uuid }, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET, { expiresIn: '10h' })
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tạo được token', err)
    }

    // all done
    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Đăng nhập thành công',
      data: {
        accessToken,
        avatarURL: imgURL,
      },
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
