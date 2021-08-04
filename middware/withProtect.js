import messageCodes from 'consts/messageCodes'
import jwt from 'jsonwebtoken'
import _ from 'lodash'
import { openDb } from 'lib/db'

export default function withProtect(handler) {
  return async (req, res) => {
    let token
    if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken
    }

    if (!token) {
      res.status(401).json({
        messageCode: messageCodes.ERROR,
        message: 'Access token not found. You need to login to get access',
      })
      return
    }

    try {
      const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_ACCESS_TOKEN_SECRET)
      const db = await openDb()
      let queryString = `SELECT username FROM users WHERE uuid = ?`
      let values = [decoded.userId]
      let result = await db.get(queryString, values)

      if (_.isNil(result)) {
        await db.close()
        res.status(401).json({
          messageCode: messageCodes.ERROR,
          message: 'The user no longer exists',
        })
        return
      }
      req.userId = decoded.userId

      return handler(req, res)
    } catch (error) {
      return res.status(403).json({
        messageCode: messageCodes.ERROR,
        message: 'Invalid token',
      })
    }
  }
}
