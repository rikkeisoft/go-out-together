import messageCodes from 'consts/messageCodes'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import { mysql, cleanUp } from 'lib/db'
import ApiException from 'exceptions/ApiException'

export default function withProtect(handler) {
  return async (req, res) => {
    try {
      let token
      if (req.cookies && req.cookies.accessToken) {
        token = req.cookies.accessToken
      }

      if (_.isNil(token)) {
        throw new ApiException(401, 'Bạn cần đăng nhập để truy cập trang')
      }

      let decoded
      try {
        decoded = jwt.verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET)
      } catch (err) {
        throw new ApiException(400, 'Xác nhận token thất bại', err)
      }

      let queryString, values, result

      queryString = `SELECT username FROM users WHERE uuid = ?`
      values = [decoded.userId]
      try {
        result = await mysql.query(queryString, values)
      } catch (err) {
        cleanUp(mysql)
        throw new ApiException(500, 'Không lấy được username từ bảng addresses', err)
      }

      if (result.length === 0) {
        cleanUp(mysql)
        throw new ApiException(400, 'Người dùng này không tồn tại')
      }

      cleanUp(mysql)
      req.userId = decoded.userId

      return handler(req, res)
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
}
