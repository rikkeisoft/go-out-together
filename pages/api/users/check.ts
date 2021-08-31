import * as yup from 'yup'
import { mysql, cleanUp } from 'lib/db'
import messageCodes from 'consts/messageCodes'
import withProtect from 'middware/withProtect'
import ApiException from 'exceptions/ApiException'
import { NextApiRequest, NextApiResponse } from 'next'

const schema = yup.object().shape({
  uuid: yup.string().required(),
})

interface Request {
  userId: string
}

async function handler(req: NextApiRequest & Request, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const uuid = req.userId
    try {
      await schema.validate({ uuid })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString: string, values: string[], result: any
    queryString = 'SELECT username, avatar_url FROM users WHERE uuid = ?'
    values = [uuid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được thông tin người dùng', err)
    }

    if (result.length === 0) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không tìm thấy user')
    }
    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Người dùng đang online',
      data: result[0],
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

export default withProtect(handler)
