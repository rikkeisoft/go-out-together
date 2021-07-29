import React, { memo } from 'react'
import PropTypes from 'prop-types'

const Container = memo(({ children }) => {
  return <div className="container mx-auto p-2">{children}</div>
})

Container.propTypes = {
  children: PropTypes.any,
}

Container.defaultProps = {}

export default Container
