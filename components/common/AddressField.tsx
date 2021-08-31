import React, { memo } from 'react'
import { Controller, useFormContext } from 'react-hook-form'

interface Props {
  name: string
}

const AddressField = memo(({ name = '' }: Props) => {
  const { control } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={{}}
      render={({ field: { value } }) => (
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md border-gray-500 focus-visible:outline-none text-lg"
          readOnly={true}
          defaultValue={value.name}
        />
      )}
    />
  )
})

export default AddressField
