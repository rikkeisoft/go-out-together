// /api/users/logout
import _ from 'lodash'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import { query } from 'lib/db'

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
  let queryString = 'UPDATE users SET is_online = ? WHERE uuid = ?'
  let values = [isOnline, req.body.uuid]
  let result = await query(queryString, values)

  if (_.isNil(result)) {
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không cập nhật được thông tin người dùng' })
  }

  // all done
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Đăng xuất thành công',
    data: result,
  })
}
