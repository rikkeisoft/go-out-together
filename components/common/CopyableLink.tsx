import React, { memo, ReactNode } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CopyIcon from '../../components/icons/CopyIcon'

interface CopyableLink {
  text: string
  children: ReactNode
  onClick: () => unknown
}

const CopyableLink = memo(({ text, children, onClick }: CopyableLink) => {
  const notify = () => toast('Đã sao chép!')

  return (
    <>
      <div className="flex flex-row justify-center">
        <span
          className="inline-block mb-5 text-blue-500 text-xl md:text-3xl font-bold cursor-pointer whitespace-nowrap overflow-hidden overflow-ellipsis"
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

export default CopyableLink
