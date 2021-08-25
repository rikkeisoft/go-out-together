import React, { memo } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
// import BackgroundImage from 'components/common/BackgroundImage'

const Container = memo(({ className, children }) => {
  return <div className={classnames('relative w-screen min-h-screen', className)}>{children}</div>
})

Container.propTypes = {
  children: PropTypes.any,
}

Container.defaultProps = {}

export default Container
