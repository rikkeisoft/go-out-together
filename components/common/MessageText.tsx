import React, { memo } from 'react'
import { ChildrenProps } from 'lib/interfaces'

const MessageText = memo(({ children }: ChildrenProps) => {
  return <h4 className="mb-4 text-gray-900 text-base md:text-xl font-bold ">{children}</h4>
})

export default MessageText
