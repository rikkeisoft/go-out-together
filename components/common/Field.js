import React, { memo } from 'react'
import PropTypes from 'prop-types'

const Field = memo(({ children }) => {
  return <div className="relative mb-8">{children}</div>
})

Field.propTypes = {
  children: PropTypes.any,
}

Field.defaultProps = {}

export default Field
