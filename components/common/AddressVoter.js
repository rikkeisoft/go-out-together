import React, { memo, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useFormContext, Controller } from 'react-hook-form'
import TrashIcon from 'components/icons/TrashIcon'
import Popup from './Popup'
import Button from './Button'

const AddressVoter = memo(({ name, data, onClick, onDelete }) => {
  const { control, watch, setValue } = useFormContext()
  const [openPopup, setOpenPopup] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)

  useEffect(() => {
    const votedAddress = localStorage.getItem('votedAddress')
    if (votedAddress) {
      setValue(name, JSON.parse(votedAddress), { shouldValidate: true })
      setSelectedItemId(JSON.parse(votedAddress).id)
    }
  }, [])

  if (!_.isNil(watch(name)) && _.isNil(data.find((item) => item.aid === watch(name)?.aid))) {
    setValue(name, null, { shouldValidate: true })
  }

  const onSelect = (item) => {
    setValue(name, item, { shouldValidate: true })
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
                <tr
                  key={`item-` + item.aid}
                  className="hover:bg-gray-100 font-bold border border-transparent rounded-md"
                >
                  <td className="p-2 cursor-pointer border border-transparent rounded-tl-md rounded-bl-md">
                    <label className="cursor-pointer text-lg">
                      <input
                        type="radio"
                        className="mr-4"
                        onChange={() => {
                          onClick(item)
                          onSelect(item)
                        }}
                        checked={item.aid === value?.aid}
                        disabled={item.id === selectedItemId}
                      />
                      {item.name} ({item.voteCount} người vote)
                    </label>
                  </td>
                  <td className="p-2 w-10 cursor-pointer rounded-tr-md rounded-br-md">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItemId(() => item.id)
                        setOpenPopup(true)
                      }}
                    >
                      <TrashIcon className="w-6" />
                    </button>
                  </td>
                  <Popup isOpen={openPopup} onRequestClose={() => setOpenPopup(false)}>
                    <>
                      <h1 className="mb-4">Bạn có chắc chắn muốn xóa địa chỉ này?</h1>
                      <div className="w-full flex items-center justify-around">
                        <Button variant="primary" onClick={() => setOpenPopup(false)}>
                          Không
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setOpenPopup(false), onDelete(selectedItemId)
                          }}
                        >
                          Có
                        </Button>
                      </div>
                    </>
                  </Popup>
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
