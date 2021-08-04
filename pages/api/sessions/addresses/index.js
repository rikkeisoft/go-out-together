import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'
import withProtect from 'middware/withProtect'

const schema = yup.object().shape({
  addressId: yup.number().required(),
  sessionId: yup.number().required(),
})

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { addressId, sessionId } = req.body

  const isValid = await schema.isValid({ addressId, sessionId })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  // need to delete address in vote table and in session_address

  const db = await openDb()

  let queryString = `DELETE FROM session_address_user WHERE session_id = ? AND address_id = ?`
  let values = [sessionId, addressId]
  let result = await db.run(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không xóa được thông tin' })
    return
  }

  queryString = `DELETE FROM session_address WHERE session_id = ? AND address_id = ?`
  values = [sessionId, addressId]
  result = await db.run(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không xóa được thông tin' })
    return
  }

  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    message: 'Xóa địa chỉ trong session thành công',
  })
}

export default withProtect(handler)
