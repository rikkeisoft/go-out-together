import React, { memo } from 'react'
import { useFormContext } from 'react-hook-form'

interface SelectBox {
  label: string
  value: number
}

interface SelectBoxProps {
  id?: string
  name: string
  data: SelectBox[]
}

const SelectBox = memo(({ name, data }: SelectBoxProps) => {
  const { register } = useFormContext()

  return (
    <select
      {...register(name)}
      className="w-full px-3 py-2 border rounded-md border-gray-500 focus-visible:outline-none text-lg"
    >
      {data.map((item, index) => {
        return (
          <option value={item?.value ?? ''} key={'select-item-' + index}>
            {item?.label ?? ''}
          </option>
        )
      })}
    </select>
  )
})

export default SelectBox
