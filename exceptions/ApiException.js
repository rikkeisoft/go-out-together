export default function ApiException(statusCode, message, err = null) {
  this.statusCode = statusCode
  this.message = message
  this.err = err
}
