import { ChildrenProps } from 'lib/interfaces'
import React, { memo } from 'react'

const FormCard = memo(({ children }: ChildrenProps) => {
  return <div className="p-1 md:p-5 md:w-1/2 w-full mx-auto">{children}</div>
})

export default FormCard
