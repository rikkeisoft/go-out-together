import React, { memo } from 'react'
import PropTypes from 'prop-types'

const ButtonGroup = memo(({ children }) => {
  return <div className="flex justify-between py-4">{children}</div>
})

ButtonGroup.propTypes = {
  children: PropTypes.any,
}

ButtonGroup.defaultProps = {}

export default ButtonGroup
