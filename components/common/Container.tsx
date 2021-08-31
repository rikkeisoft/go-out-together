import React, { memo } from 'react'
import classnames from 'classnames'
import { ChildrenProps, ClassNameProps } from 'lib/interfaces'

interface ContainerProps extends ClassNameProps, ChildrenProps {}

const Container = memo(({ className, children }: ContainerProps) => {
  return (
    <div className={classnames('relative w-screen min-h-screen', className)}>
      <div className="absolute w-full h-full top-0 left-0 z-0 bg-white opacity-50" />
      <div className="relative">{children}</div>
    </div>
  )
})

export default Container
