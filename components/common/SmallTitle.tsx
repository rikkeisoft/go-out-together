import React, { memo } from 'react'
import { ChildrenProps } from 'lib/interfaces'

const SmallTitle = memo(({ children }: ChildrenProps) => {
  return <h3 className="my-3 text-gray-700 text-center">{children}</h3>
})

export default SmallTitle
