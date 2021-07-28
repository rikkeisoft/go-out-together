import React, { memo } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useFormContext } from 'react-hook-form'
import TrashIcon from 'components/icons/TrashIcon'

const RadioList = memo(({ name, data, onDelete, onClick }) => {
  const { register, watch, setValue } = useFormContext()

  if (!_.isNil(watch(name)) && _.isNil(data.find((item) => item.value === watch(name)))) {
    setValue(name, null)
  }

  return (
    <table className="w-full">
      <tbody>
        {data.map((item, index) => {
          return (
            <tr key={`list-item-` + index} className="hover:bg-gray-100" onClick={() => {
              onClick(item)
            }}>
              <td className="p-2">
                <label>
                  <input type="radio" {...register(name)} value={item.value} className="mr-4" />
                  {item.label}
                </label>
              </td>
              <td className="p-2 w-10">
                <button
                  type="button"
                  onClick={() => {
                    onDelete(index)
                  }}
                >
                  <TrashIcon className="w-6" />
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
})

RadioList.propTypes = {
  name: PropTypes.string,
  data: PropTypes.array,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
}

RadioList.defaultProps = {}

export default RadioList
