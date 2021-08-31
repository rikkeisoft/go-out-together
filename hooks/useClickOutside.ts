import React from 'react'

export default function useClickOutside(contentRef, toggleRef, callback) {
  const handleMouseDown = (e) => {
    // user click toggle
    if (toggleRef.current && toggleRef.current.contains(e.target)) {
      callback(true)
    }
    // user click outside toggle and content
    else if (contentRef.current && !contentRef.current.contains(e.target)) {
      callback(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown)

    return () => document.removeEventListener('mousedown', handleMouseDown)
  })
}
