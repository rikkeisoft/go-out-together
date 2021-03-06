import React, { memo, useEffect, useState } from 'react'
import _ from 'lodash'
import { useFormContext, Controller } from 'react-hook-form'
import TrashIcon from '../../components/icons/TrashIcon'
import Popup from './Popup'
import Button from './Button'

interface Address {
  aid: string
  id: number
  latitude: number
  longitude: number
  name: string
  username: string
  voteCount: number
}

interface Props {
  name: string
  showDelete: boolean
  data: Address[]
  onOpenModalMap: (item: Address) => unknown
  onClick: (item: Address) => unknown
  onDelete: (selectedItemId: number) => unknown
}

const AddressVoter = memo(({ name, showDelete, data, onOpenModalMap, onClick, onDelete }: Props) => {
  const { control, watch, setValue } = useFormContext()
  const [openPopup, setOpenPopup] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState(null)

  useEffect(() => {
    const votedAddress = localStorage.getItem('votedAddress')
    if (votedAddress) {
      setValue(name, JSON.parse(votedAddress), { shouldValidate: true })
      setSelectedItemId(JSON.parse(votedAddress).id)
    }
    if (!_.isNil(watch(name)) && _.isNil(data.find((item) => item.aid === watch(name)?.aid))) {
      setValue(name, null, { shouldValidate: true })
    }
  }, [])

  const onSelect = (item: Address) => {
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
            {data?.map((item) => {
              return (
                <tr
                  key={`item-` + item.aid}
                  title={item.username ? `${item.username} đã thêm địa chỉ này` : ''}
                  className="hover:bg-gray-100 font-bold border border-transparent rounded-md"
                >
                  {showDelete ? (
                    <td
                      title={item.username ? `${item.username} đã thêm địa chỉ này` : ''}
                      className="p-2 cursor-pointer border border-transparent rounded-tl-md rounded-bl-md"
                    >
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
                      </label>

                      <span onClick={() => onOpenModalMap(item)}>
                        {item.name.split(',')[0]} ({item.voteCount} người vote)
                      </span>
                    </td>
                  ) : (
                    <td className="p-2 cursor-pointer border border-transparent rounded-tl-md rounded-bl-md">
                      <label className="cursor-pointer text-lg">
                        <span onClick={() => onOpenModalMap(item)}>
                          {item.name.split(',')[0]} ({item.voteCount} người vote)
                        </span>
                      </label>
                    </td>
                  )}
                  {showDelete ? (
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
                  ) : null}
                  <Popup isOpen={openPopup} onRequestClose={() => setOpenPopup(false)}>
                    <>
                      <h1 className="mb-4">Bạn có chắc chắn muốn xóa địa chỉ này?</h1>
                      <div className="w-full flex items-center justify-around">
                        <Button type="button" variant="primary" onClick={() => setOpenPopup(false)}>
                          Không
                        </Button>
                        <Button
                          type="button"
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

export default AddressVoter
