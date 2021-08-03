import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Controller, useFormContext } from 'react-hook-form'

const AddressField = memo(({ name }) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={{}}
      render={({ field: { value } }) => (
        <input
          type="text"
          className="w-full px-2 py-1 border border-gray-500 focus-visible:outline-none"
          readOnly={true}
          value={value.name}
        />
      )}
    />
  )
})

AddressField.propTypes = {
  name: PropTypes.string,
}

AddressField.defaultProps = {
  name: '',
}

export default AddressField
