import axiosClient from './axiosClient'

export const login = (userInfo) => {
  const url = '/users/login'
  return axiosClient.post(url, userInfo)
}

export const logout = (uuid) => {
  const url = '/users/logout'
  return axiosClient.post(url, uuid)
}

export const checkUser = (uuid) => {
  const url = '/users/check'
  return axiosClient.post(url, uuid)
}

export const updateSessionCreator = (data) => {
  const url = 'sessions/creator/update'
  return axiosClient.post(url, data)
}

export const joinSession = (data) => {
  const url = 'sessions/join'
  return axiosClient.post(url, data)
}
