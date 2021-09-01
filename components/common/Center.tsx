import { ChildrenProps } from 'lib/interfaces'
import React, { memo } from 'react'

const Center = memo(({ children }: ChildrenProps) => {
  return <div className=" text-center">{children}</div>
})

export default Center
