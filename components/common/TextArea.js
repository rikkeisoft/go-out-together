import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'

const TextArea = memo(({ id, readOnly, name, placeholder }) => {
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

TextArea.propTypes = {
  id: PropTypes.string,
  readOnly: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
}

TextArea.defaultProps = {
  id: '',
  readOnly: false,
  name: '',
  placeholder: '',
}

export default TextArea
