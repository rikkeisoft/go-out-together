import React, { memo } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
// import BackgroundImage from 'components/common/BackgroundImage'

const Container = memo(({ className, children }) => {
  return (
    <div className={classnames('relative w-screen min-h-screen', className)}>
      <div className="absolute w-full h-full top-0 left-0 z-0 bg-white opacity-50" />
      <div className="relative">{children}</div>
    </div>
  )
})

Container.propTypes = {
  children: PropTypes.any,
}

Container.defaultProps = {}

export default Container
