import React from 'react'

interface LoadingProps {
  isOpen: boolean
  message: string
}

function LoadingOverlay({ isOpen, message = 'Đang xử lí...' }: LoadingProps) {
  if (!isOpen) {
    return <></>
  }

  return (
    <div className="fixed top-0 left-0 flex flex-col justify-center items-center w-screen h-screen">
      <div className="absolute z-0 w-full h-full bg-gray-900 bg-opacity-75"></div>
      <h1 className="font-bold text-yellow-500 z-10">{message}</h1>
      <div className="my-4 flex justify-center items-center z-10">
        <svg
          className="animate-spin -ml-1 mr-3 h-8 w-8 text-yellow-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
    </div>
  )
}

export default LoadingOverlay
