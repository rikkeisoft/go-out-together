import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { useFormContext } from 'react-hook-form'

const SelectBox = memo(({ name, data }) => {
  const { register } = useFormContext()

  return (
    <select {...register(name)} className="w-full px-2 py-1 border border-gray-500 focus-visible:outline-none">
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
