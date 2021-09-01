import React from 'react'
import { io } from 'socket.io-client'

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_IO_URL)

export const SocketContext = React.createContext(null)

const SocketContextProvider: React.FC<React.ReactNode> = ({ children }) => {
  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>
}

export default SocketContextProvider
