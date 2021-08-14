import React, { memo } from 'react'
import PropTypes from 'prop-types'

const ButtonGroup = memo(({ children }) => {
  return <div className="flex items-center justify-between py-4">{children}</div>
})

ButtonGroup.propTypes = {
  children: PropTypes.any,
}

ButtonGroup.defaultProps = {}

export default ButtonGroup
