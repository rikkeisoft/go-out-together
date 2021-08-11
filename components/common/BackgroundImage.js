import React, { memo } from 'react'
import PropTypes from 'prop-types'
// import Image from 'next/image'

const BackgroundImage = memo(({ children }) => {
  return (
    <div className="relative w-screen h-screen bg-image">
      {/* <Image src={src} layout="fill" className="object-cover bg-image"  alt="" /> */}
      <div className="absolute top-0 left-0 w-full h-full">{children}</div>
    </div>
  )
})

BackgroundImage.propTypes = {
  src: PropTypes.any,
}

BackgroundImage.defaultProps = {}

export default BackgroundImage
