import React, { memo } from 'react'
import { ChildrenProps } from 'lib/interfaces'

const Field = memo(({ children }: ChildrenProps) => {
  return <div className="relative mb-8">{children}</div>
})

export default Field
