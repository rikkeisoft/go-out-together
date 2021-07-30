// /api/users/logout
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

  const isValid = schema.isValid({ ...req.body })

  if (!isValid) {
    // error
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
  }

  const isOnline = 0

  const db = await openDb()

  let queryString = 'UPDATE users SET is_online = ? WHERE uuid = ?'
  let values = [isOnline, req.body.uuid]
  let result = await db.run(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được thông tin người dùng' })
  }

  // all done
  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Đăng xuất thành công',
    data: result,
  })
}
