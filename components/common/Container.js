import React, { memo } from 'react'
import PropTypes from 'prop-types'
import BackgroundImage from 'components/common/BackgroundImage'
import homeBgSrc from 'public/assets/images/homeBg.svg'

// import  from 'public/assets/images/bg.png'

const Container = memo(({ children }) => {
  return (
    <BackgroundImage src={homeBgSrc}>
      <div className="container top-0  mx-auto p-2">{children}</div>
    </BackgroundImage>
  )
})

Container.propTypes = {
  children: PropTypes.any,
}

Container.defaultProps = {}

export default Container
