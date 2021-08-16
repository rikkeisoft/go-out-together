import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'

const SelectBox = memo(({ name, data }) => {
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

SelectBox.propTypes = {
  name: PropTypes.string,
  data: PropTypes.array,
}

SelectBox.defaultProps = {}

export default SelectBox
