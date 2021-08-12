import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { Controller, useFormContext } from 'react-hook-form'
import { toast } from 'react-toastify'
import TrashIcon from 'components/icons/TrashIcon'

const List = memo(({ name }) => {
  const { control, watch } = useFormContext()

  return (
    <Controller
      control={control}
      name={name}
      defaultValue={[]}
      render={({ field: { onChange, value, name } }) => (
        <table className="w-full font-bold">
          <tbody>
            {value.map((item, index) => {
              return (
                <tr key={`item-` + index} className="hover:bg-gray-100">
                  <td className="p-2">{item.name}</td>
                  <td className="p-2 w-10">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = watch(name).slice()
                        newValue.splice(index, 1)
                        toast.success('Xóa thành công', { position: 'top-right' })
                        onChange(newValue)
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

List.propTypes = {
  name: PropTypes.string,
}

List.defaultProps = {}

export default List
