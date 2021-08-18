import React, { memo } from 'react'
import PropTypes from 'prop-types'
// import classnames from 'classnames'
// import BackgroundImage from 'components/common/BackgroundImage'

const Container = memo(({ className, children }) => {
  return (
    <div className=" relative w-screen h-screen">
      <div className={ className}>{children}</div>
    </div>
  )
})

Container.propTypes = {
  children: PropTypes.any,
}

Container.defaultProps = {}

export default Container
