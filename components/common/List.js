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
        <table className="w-full font-bold mt-4">
          <tbody>
            {value.map((item, index) => {
              console.log('---', value)
              return (
                <tr key={`item-` + index} className="hover:bg-gray-100 border border-transparent rounded-md text-lg">
                  <td className="pl-4 py-2 rounded-tl-md rounded-bl-md">{item.name}</td>
                  <td className="pr-4 py-2 w-10 rounded-tr-md rounded-br-md">
                   {!(sessionStorage.getItem('sid')) ? (

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
                    ) : null}
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
