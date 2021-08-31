import React, { memo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

const ButtonGroup = memo(({ children }: Props) => {
  return <div className="flex flex-col md:flex-row items-center justify-between py-4">{children}</div>
})

export default ButtonGroup
