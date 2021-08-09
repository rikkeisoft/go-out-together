import { mysql, cleanUp } from 'lib/db'
import * as yup from 'yup'
import messageCodes from 'consts/messageCodes'
import ApiException from 'exceptions/ApiException'

const schema = yup.object().shape({
  sid: yup.string().required(),
  addresses: yup.array().of(
    yup.object().shape({
      aid: yup.string().required(),
      name: yup.string().required(),
      latitude: yup.number().required(),
      longitude: yup.number().required(),
    }),
  ),
})

const findAddressID = async (queryString, values, address) => {
  queryString = `SELECT id FROM addresses WHERE aid = ?`
  values = [address.aid]
  try {
    const result = await mysql.query(queryString, values)
    return result
  } catch (err) {
    cleanUp(mysql)
    throw new ApiException(500, 'Không lấy được id từ bảng addresses', err)
  }
}

const insertAddress = async (queryString, values, address) => {
  queryString = `INSERT INTO addresses (aid, name, latitude, longitude) VALUES (?, ?, ?, ?)`
  values = [address.aid, address.name, address.latitude, address.longitude]
  try {
    const result = await mysql.query(queryString, values)
    return result
  } catch (err) {
    cleanUp(mysql)
    throw new ApiException(500, 'Không thêm được thông tin địa chỉ', err)
  }
}

const getCurrentSessionID = async (queryString, values, addressId) => {
  queryString = `SELECT DISTINCT session_id FROM session_address WHERE address_id = ?`
  values = [addressId]
  try {
    const result = await mysql.query(queryString, values)
    return result
  } catch (err) {
    cleanUp(mysql)
    throw new ApiException(500, 'Không lấy được session_id từ session_address', err)
  }
}

const insertToSessionAddress = async (queryString, values, sessionId, addressId) => {
  queryString = `INSERT INTO session_address (session_id, address_id) VALUES (?, ?)`
  values = [sessionId, addressId]
  try {
    const result = await mysql.query(queryString, values)
    return result
  } catch (err) {
    cleanUp(mysql)
    throw new ApiException(500, 'Không thêm được thông tin', err)
  }
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      throw new ApiException(405, 'Không tìm thấy api route')
    }

    const { sid, addresses } = req.body

    try {
      await schema.validate({ sid, addresses })
    } catch (err) {
      throw new ApiException(400, 'Các thông tin không hợp lệ', err)
    }

    let queryString, values, result

    queryString = `SELECT id FROM sessions WHERE sid = ?`
    values = [sid]
    try {
      result = await mysql.query(queryString, values)
    } catch (err) {
      cleanUp(mysql)
      throw new ApiException(500, 'Không lấy được id từ bảng sessions', err)
    }
    const sessionId = result[0].id

    const addressPromises = addresses.map(async (address) => {
      result = await findAddressID(queryString, values, address)

      let addressId
      if (result.length === 0) {
        result = await insertAddress(queryString, values, address)
        addressId = result.insertId
      } else {
        addressId = result[0].id
      }
      result = await getCurrentSessionID(queryString, values, addressId)

      if (result.findIndex((ele) => ele.session_id === sessionId) === -1) {
        result = await insertToSessionAddress(queryString, values, sessionId, addressId)
      }

      return result
    })

    await Promise.all(addressPromises)

    cleanUp(mysql)
    res.status(200).json({
      messageCode: messageCodes.SUCCESS,
      message: 'Thêm địa chỉ vào session thành công',
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
