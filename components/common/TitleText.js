import React, { memo } from 'react'
import PropTypes from 'prop-types'

const TitleText = memo(({ children }) => {
  return <h1 className="mb-3 text-gray-700 text-2xl md:text-4xl font-bold">{children}</h1>
})

TitleText.propTypes = {
  children: PropTypes.any,
}

TitleText.defaultProps = {}

export default TitleText
