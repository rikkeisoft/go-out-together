import React, { memo } from 'react'
import { useFormContext } from 'react-hook-form'

interface TextFieldProps {
  type?: string
  id?: string
  readOnly?: boolean
  name?: string
  placeholder?: string
}

const TextField = memo(({ type = 'text', id, readOnly, name, placeholder }: TextFieldProps) => {
  const { register } = useFormContext()
  return (
    <input
      type={type}
      className="w-full px-3 py-2 border rounded-md border-gray-500 focus-visible:outline-none text-lg shadow-md"
      id={id}
      readOnly={readOnly}
      {...register(name)}
      placeholder={placeholder}
    />
  )
})

export default TextField
