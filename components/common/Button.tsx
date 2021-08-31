import React, { memo } from 'react'

interface ButtonProps {
  type: 'button' | 'submit' | 'reset'
  variant: string
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}

const Button = memo(({ type, variant, children, onClick, disabled }: ButtonProps) => {
  let className = 'my-2 inline-flex items-center px-6 py-2 text-white rounded-md text-lg'
  if (variant === 'primary') {
    className += ' bg-blue-500 hover:bg-blue-400'
  } else if (variant === 'danger') {
    className += ' bg-red-500 hover:bg-red-400'
  } else if (variant === 'dark') {
    className += ' bg-gray-900 hover:bg-gray-700'
  }

  return (
    <button
      type={type}
      className={className}
      onClick={() => {
        onClick && onClick()
      }}
      disabled={disabled}
    >
      {children}
    </button>
  )
})

export default Button
