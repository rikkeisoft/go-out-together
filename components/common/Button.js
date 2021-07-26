import React, { memo } from 'react'
import PropTypes from 'prop-types'

const Button = memo(({ type, variant, children, onClick }) => {
  let className = 'px-5 py-2 text-white rounded-md'
  if (variant === 'primary') {
    className += ' bg-blue-500 hover:bg-blue-400'
  } else if (variant === 'danger') {
    className += ' bg-red-500 hover:bg-red-400'
  }

  return (
    <button
      type={type}
      className={className}
      onClick={() => {
        onClick && onClick()
      }}
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
}

Button.defaultProps = {}

export default Button
