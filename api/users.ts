import { JoinSessionParams, LoginParams, UpdateSessionCreatorParams, UpdateUserInfoParams } from 'lib/interfaces'
import axiosClient from './axiosClient'

interface OnlyMessageResponse {
  messageCode: number
  message: string
}

interface LoginResponse extends OnlyMessageResponse {
  data: {
    accessToken: string
    avatarURL: string
  }
}

interface CheckUserResponse extends OnlyMessageResponse {
  data: {
    avatar_url: string
    username: string
  }
}

export const login = (userInfo: LoginParams): Promise<LoginResponse> => {
  const url = '/users/login'
  return axiosClient.post(url, userInfo)
}

export const checkUser = (): Promise<CheckUserResponse> => {
  const url = '/users/check'
  return axiosClient.post(url)
}

export const updateSessionCreator = (data: UpdateSessionCreatorParams): Promise<OnlyMessageResponse> => {
  const url = 'sessions/creator/update'
  return axiosClient.post(url, data)
}

export const updateUserInfo = (data: UpdateUserInfoParams): Promise<OnlyMessageResponse> => {
  const url = 'users/update'
  return axiosClient.put(url, data)
}

export const joinSession = (data: JoinSessionParams): Promise<OnlyMessageResponse> => {
  const url = 'sessions/join'
  return axiosClient.post(url, data)
}
