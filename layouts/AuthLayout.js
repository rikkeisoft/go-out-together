import React, { memo } from 'react'
import PropTypes from 'prop-types'

const AuthLayout = memo(({ children }) => {
  return <div className="container mx-auto">{children}</div>
})

AuthLayout.propTypes = {
  children: PropTypes.any,
}

AuthLayout.defaultProps = {}

export default AuthLayout
