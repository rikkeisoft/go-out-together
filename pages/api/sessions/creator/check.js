import { openDb } from 'lib/db'
import * as yup from 'yup'
import _ from 'lodash'
import messageCodes from 'consts/messageCodes'
import withProtect from 'middware/withProtect'

const schema = yup.object().shape({
  uid: yup.string().required(),
  sid: yup.string().required(),
})

async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(404).json({ messageCode: messageCodes.ERROR, message: 'Không tìm thấy api route' })
    return
  }

  const { uid, sid } = req.query

  const isValid = await schema.isValid({ uid, sid })

  if (!isValid) {
    res.status(400).json({ messageCode: messageCodes.ERROR, message: 'Các thông tin không hợp lệ' })
    return
  }

  const db = await openDb()

  let isCreator = false
  let queryString = `SELECT creator FROM sessions WHERE sid = ?`
  let values = [sid]
  let result = await db.get(queryString, values)

  if (_.isNil(result)) {
    await db.close()
    res.status(500).json({ messageCode: messageCodes.ERROR, message: 'Session không tồn tại' })
    return
  }

  if (uid === result.creator) {
    isCreator = true
  }

  await db.close()
  res.status(200).json({
    messageCode: messageCodes.SUCCESS,
    data: {
      isCreator,
    },
  })
}

export default withProtect(handler)
