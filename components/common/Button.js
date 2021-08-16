import React, { memo } from 'react'
import PropTypes from 'prop-types'

const Button = memo(({ type, variant, children, onClick, disabled }) => {
  let className = 'inline-flex items-center px-5 py-2 text-white rounded-md'
  if (variant === 'primary') {
    className += ' bg-blue-500 hover:bg-blue-400'
  } else if (variant === 'danger') {
    className += ' bg-red-500 hover:bg-red-400'
  } else if (variant === 'dark') {
    className += ' bg-gray-900 hover:bg-gray-900'
  }

  return (
    <button
      type={type}
      className={className}
      onClick={() => {
        onClick && onClick()
      }}
      disabled={disabled}
    >
      {children}
    </button>
  )
})

Button.propTypes = {
  type: PropTypes.oneOf(['button', 'submit']),
  variant: PropTypes.oneOf(['primary', 'danger']),
  children: PropTypes.any,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
}

Button.defaultProps = {
  disabled: false,
}

export default Button
