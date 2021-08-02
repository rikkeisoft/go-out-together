export const getExpireTime = (minutes) => {
  const future = new Date()
  future.setDate(future.getMinutes() + minutes)
  return (
    future.getFullYear() +
    '-' +
    (future.getMonth() + 1) +
    '-' +
    future.getDate() +
    ' ' +
    future.getHours() +
    ':' +
    future.getMinutes() +
    ':' +
    future.getSeconds()
  )
}
