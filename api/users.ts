import { Address, JoinSessionParams } from 'lib/interfaces'
import axiosClient from './axiosClient'

interface UpdateSessionCreatorProps {
  uid: string
  name: string
  address: Address
}

interface OnlyMessageResponse {
  messageCode: number
  message: string
}

export const login = (userInfo) => {
  const url = '/users/login'
  return axiosClient.post(url, userInfo)
}

export const checkUser = (uuid: string) => {
  const url = '/users/check'
  return axiosClient.post(url, uuid)
}

export const updateSessionCreator = (data: UpdateSessionCreatorProps): Promise<OnlyMessageResponse> => {
  const url = 'sessions/creator/update'
  return axiosClient.post(url, data)
}

export const updateUserInfo = (data) => {
  const url = 'users/update'
  return axiosClient.put(url, data)
}

export const joinSession = (data: JoinSessionParams): Promise<OnlyMessageResponse> => {
  const url = 'sessions/join'
  return axiosClient.post(url, data)
}
