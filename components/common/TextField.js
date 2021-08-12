import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'

const TextField = memo(({ type, id, readOnly, name, placeholder }) => {
  const { register } = useFormContext()
  return (
    <input
      type={type}
      className="w-full px-2 py-1 border border-gray-500 focus-visible:outline-none shadow-md"
      id={id}
      readOnly={readOnly}
      {...register(name)}
      placeholder={placeholder}
    />
  )
})

TextField.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  readOnly: PropTypes.bool,
  name: PropTypes.string,
  placeholder: PropTypes.string,
}

TextField.defaultProps = {
  type: 'text',
  id: '',
  readOnly: false,
  name: '',
  placeholder: '',
}

export default TextField
