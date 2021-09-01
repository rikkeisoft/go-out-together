export const getExpireTime = (minutes: number | string): string => {
  const future = new Date()
  future.setMinutes(future.getMinutes() + Number(minutes))
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
