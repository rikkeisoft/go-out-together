import mysql from 'serverless-mysql'

export const db = mysql({
  config: {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
  },
})

export async function query(queryString, values = []) {
  try {
    const result = await db.query(queryString, values)
    await db.end()
    return result
  } catch (e) {
    throw Error(e.message)
  }
}
