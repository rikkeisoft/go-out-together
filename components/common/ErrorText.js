import React, { memo } from 'react'
import PropTypes from 'prop-types'

const ErrorText = memo(({ children }) => {
  return <div className="absolute text-red-500 text-lg font-bold">{children}</div>
})

ErrorText.propTypes = {
  children: PropTypes.any,
}

ErrorText.defaultProps = {}

export default ErrorText
