import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'

const schema = yup.object().shape({
  userId: yup.string().required(),
  sessionId: yup.number().required(),
})

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { userId, sessionId } = req.body

  const isValid = await schema.isValid({ userId, sessionId })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()

  let isAdmin = false
  let queryString = `SELECT creator FROM sessions WHERE id = ?`
  let values = [sessionId]
  let result = await db.get(queryString, values)

  if (_.isNil(result)) {
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Không lấy được thông tin' })
    return
  }

  if (userId === result.creator) isAdmin = true

  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    data: {
      isAdmin,
    },
  })
}
