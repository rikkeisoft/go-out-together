import { openDb } from 'lib/db'
import _ from 'lodash'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import withProtect from 'middware/withProtect'

const schema = yup.object().shape({
  sid: yup.string().required(),
})

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { sid } = req.query

  const isValid = await schema.isValid({ sid })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()

  let queryString = `SELECT id FROM sessions WHERE sid = ?`
  let values = [sid]
  let result = await db.get(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không xóa được thông tin' })
    return
  }

  const sessionId = result.id

  queryString = `
  SELECT users.uuid AS userId, users.name AS username, addresses.name, addresses.latitude, addresses.longitude
  FROM (addresses
  INNER JOIN users
  ON users.address_id = addresses.id)
  INNER JOIN session_user
  ON users.id = session_user.user_id
  WHERE session_id = ?`
  values = [sessionId]
  result = await db.all(queryString, values)

  if (_.isNil(result)) {
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không thêm được thông tin địa chỉ ' })
    return
  }

  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Lay địa chỉ tu session thành công',
    data: result,
  })
}

export default withProtect(handler)
