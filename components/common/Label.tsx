import React, { memo } from 'react'
import { ChildrenProps } from 'lib/interfaces'

interface LabelProps extends ChildrenProps {
  htmlFor: string
}

const Label = memo(({ htmlFor, children }: LabelProps) => {
  return (
    <label htmlFor={htmlFor} className="mb-1 md:text-2xl">
      {children}
    </label>
  )
})

export default Label
