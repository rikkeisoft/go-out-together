class ApiException {
  statusCode: number
  message: string
  err: unknown
  constructor(statusCode: number, message: string, err = null) {
    this.statusCode = statusCode
    this.message = message
    this.err = err
  }
}

export default ApiException
