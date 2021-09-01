import React, { memo } from 'react'
import { ReactNode } from 'react'

interface ChildrenProps {
  children: ReactNode
}

const ErrorText = memo(({ children }: ChildrenProps) => {
  return <div className="absolute text-red-500 text-lg font-bold">{children}</div>
})

export default ErrorText
