import React, { memo } from 'react'
import PropTypes from 'prop-types'
// import Image from 'next/image'

const BackgroundImage = memo(({ children }) => {
  return (
    <div className="relative w-screen h-screen bg-image">
      <div className="w-full h-full bg-main">{children}</div>
    </div>
  )
})

BackgroundImage.propTypes = {
  src: PropTypes.any,
}

BackgroundImage.defaultProps = {}

export default BackgroundImage
