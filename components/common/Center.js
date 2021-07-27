import React, { memo } from 'react'
import PropTypes from 'prop-types'

const Center = memo(({ children }) => {
  return <div className="mt-10 text-center">{children}</div>
})

Center.propTypes = {
  children: PropTypes.any,
}

Center.defaultProps = {}

export default Center
