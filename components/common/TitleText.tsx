import React, { memo } from 'react'
import { ChildrenProps } from 'lib/interfaces'

const TitleText = memo(({ children }: ChildrenProps) => {
  return <h1 className="mb-3 text-gray-700 text-2xl md:text-4xl font-bold">{children}</h1>
})

export default TitleText
