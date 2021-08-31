import React, { memo } from 'react'
import { useFormContext } from 'react-hook-form'

interface TextAreaProps {
  id?: string
  readOnly?: boolean
  name?: string
  placeholder?: string
}

const TextArea = memo(({ id, readOnly, name, placeholder }: TextAreaProps) => {
  const { register } = useFormContext()

  return (
    <textarea
      className="w-full h-32 px-3 py-2 border rounded-md border-gray-500 focus-visible:outline-none resize-none text-lg"
      id={id}
      readOnly={readOnly}
      {...register(name)}
      placeholder={placeholder}
    />
  )
})

export default TextArea
