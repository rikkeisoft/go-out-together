import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'
import { NextApiRequest, NextApiResponse } from 'next'
import { CheckSessionParams, StringOrNumberGeneric } from 'lib/interfaces'

const schema = yup.object().shape({
  uid: yup.string().required(),
  sid: yup.string().required(),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { uid, sid } = req.query as unknown as CheckSessionParams

    try {
      await schema.validate({ uid, sid })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString: string, values: StringOrNumberGeneric[], result

    queryString = `SELECT id, expire_time FROM sessions WHERE sid = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng sessions', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy session')
    }
    const sessionId = result[0].id
    const expireTime = new Date(result[0].expire_time)
    const now = new Date()
    let canVote: boolean
    if (expireTime.getTime() < now.getTime()) {
      canVote = false
    } else {
      canVote = true
    }

    queryString = `SELECT id FROM users WHERE uuid = ?`
    values = [uid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng users', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy người dùng')
    }
    const userId = result[0].id

    let voted: boolean
    queryString = `SELECT session_id, address_id, user_id FROM session_address_user WHERE session_id =? AND user_id = ?`
    values = [sessionId, userId]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được thông tin từ bảng session_address_user', err)
    }
    if (result.length === 0) {
      voted = false
    } else {
      voted = true
    }

    let isCreator: boolean
    queryString = `SELECT creator FROM sessions WHERE sid = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được creator từ bảng addresses', err)
    }
    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy session')
    }

    if (uid === result[0].creator) {
      isCreator = true
    } else {
      isCreator = false
    }

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      data: {
        canVote,
        voted,
        isCreator,
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
