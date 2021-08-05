import React, { memo } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useFormContext, Controller } from 'react-hook-form'
import TrashIcon from 'components/icons/TrashIcon'

const AddressVoter = memo(({ name, data, onDelete }) => {
  const { control, watch, setValue } = useFormContext()

  if (!_.isNil(watch(name)) && _.isNil(data.find((item) => item.aid === watch(name)?.aid))) {
    setValue(name, null)
  }

  const onSelect = (item) => {
    setValue(name, item)
  }

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={{}}
      render={({ field: { value } }) => (
        <table className="w-full">
          <tbody>
            {data.map((item) => {
              return (
                <tr key={`item-` + item.aid} className="hover:bg-gray-100">
                  <td className="p-2 cursor-pointer">
                    <label className="cursor-pointer">
                      <input
                        type="radio"
                        className="mr-4"
                        onClick={() => {
                          onSelect(item)
                        }}
                        checked={item.aid === value?.aid}
                      />
                      {item.name}
                    </label>
                  </td>
                  <td className="p-2 w-10 cursor-pointer">
                    <button
                      type="button"
                      onClick={() => {
                        onDelete(item.aid)
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
      )}
    />
  )
})

AddressVoter.propTypes = {
  name: PropTypes.string,
  data: PropTypes.array,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
}

AddressVoter.defaultProps = {}

export default AddressVoter
