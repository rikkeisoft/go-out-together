import React, { memo, useState } from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import { useFormContext } from 'react-hook-form'
import TrashIcon from 'components/icons/TrashIcon'
import Popup from './Popup'
import Button from './Button'

const RadioList = memo(({ name, data, onDelete, onClick }) => {
  const { register, watch, setValue } = useFormContext()
  const [openPopup, setOpenPopup] = useState(false)

  if (!_.isNil(watch(name)) && _.isNil(data.find((item) => item.name === watch(name)))) {
    setValue(name, null)
  }

  return (
    <table className="w-full">
      <tbody>
        {data.map((item, index) => {
          return (
            <tr key={`list-item-` + index} className="hover:bg-gray-100">
              <td className="p-2 cursor-pointer">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    {...register(name)}
                    value={item.name}
                    className="mr-4"
                    onClick={() => {
                      onClick(item)
                    }}
                  />
                  {item.name}
                </label>
              </td>
              <td className="p-2 w-10 cursor-pointer">
                <button type="button" onClick={() => setOpenPopup(true)}>
                  <TrashIcon className="w-6" />
                </button>
              </td>
              <Popup isOpen={openPopup} onRequestClose={() => setOpenPopup(false)}>
                <div>
                  <h1 className="mb-4">Are you sure to delete this address?</h1>
                  <div className="w-full flex items-center justify-around">
                    <Button variant="primary" onClick={() => setOpenPopup(false)}>
                      No
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setOpenPopup(false), onDelete(item.id)
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                </div>
              </Popup>
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
