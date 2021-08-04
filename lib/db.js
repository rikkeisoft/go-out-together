import serverlessMysql from 'serverless-mysql'
import ApiException from 'exceptions/ApiException'

export function initialize() {
  try {
    return serverlessMysql({
      config: {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD,
      },
    })
  } catch (err) {
    throw new ApiException(500, 'Không mở được cơ sở dữ liệu', err)
  }
}

export const mysql = initialize()

export async function cleanUp(mysql) {
  try {
    await mysql.end()
  } catch (err) {
    throw new ApiException(500, 'Không clean up được', err)
  }
}
