import React, { memo } from 'react'
import PropTypes from 'prop-types'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CopyIcon from 'components/icons/CopyIcon'

const CopyableLink = memo(({ text, children, onClick }) => {
  const notify = () => toast('Đã sao chép!')

  return (
    <>
      <div className="flex flex-row justify-center">
        <span
          className="inline-block mb-5 text-blue-500 text-xl font-bold cursor-pointer"
          onClick={() => {
            onClick && onClick()
          }}
        >
          {children}
        </span>
        <CopyToClipboard
          text={text}
          onCopy={() => {
            notify()
          }}
        >
          <span className="inline-block ml-3 cursor-pointer">
            <CopyIcon className="w-7" />
          </span>
        </CopyToClipboard>
      </div>

      <ToastContainer />
    </>
  )
})

CopyableLink.propTypes = {
  text: PropTypes.string,
  children: PropTypes.any,
  onClick: PropTypes.func,
}

CopyableLink.defaultProps = {}

export default CopyableLink
