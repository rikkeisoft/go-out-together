import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import ApiException from 'exceptions/ApiException'

// you would have to import / invoke this in another file
export async function openDb() {
  try {
    return open({
      filename: process.env.SQLITE3_FILENAME,
      driver: sqlite3.Database,
    })
  } catch (err) {
    throw new ApiException(500, 'Không mở được cơ sở dữ liệu', err)
  }
}

export async function closeDb(db) {
  try {
    await db.close()
  } catch (err) {
    throw new ApiException(500, 'Không đóng được cơ sở dữ liệu', err)
  }
}
