import React, { RefObject } from 'react'

export default function useClickOutside(
  contentRef: RefObject<HTMLElement>,
  toggleRef: RefObject<HTMLElement>,
  callback: (params: boolean) => void,
): void {
  const handleMouseDown = (e: MouseEvent | TouchEvent) => {
    // user click toggle
    if (toggleRef.current && toggleRef.current.contains(e.target as Node)) {
      callback(true)
    }
    // user click outside toggle and content
    else if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
      callback(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown)

    return () => document.removeEventListener('mousedown', handleMouseDown)
  })
}
