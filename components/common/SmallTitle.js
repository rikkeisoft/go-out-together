import React, { memo } from 'react'
import PropTypes from 'prop-types'

const SmallTitle = memo(({ children }) => {
  return <h3 className="my-3 text-gray-700 text-center">{children}</h3>
})

SmallTitle.propTypes = {
  children: PropTypes.any,
}

SmallTitle.defaultProps = {}

export default SmallTitle
