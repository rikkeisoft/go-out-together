import React, { memo } from 'react'
import PropTypes from 'prop-types'

const MessageText = memo(({ children }) => {
  return <h4 className="mb-4 text-gray-900 text-base md:text-xl font-bold ">{children}</h4>
})

MessageText.propTypes = {
  children: PropTypes.any,
}

MessageText.defaultProps = {}

export default MessageText
