import axiosClient from './axiosClient'

export const updateSessionCreator = (data) => {
  const url = 'sessions/creator/update'
  return axiosClient.post(url, data)
}

export const joinSession = (data) => {
  const url = 'sessions/join'
  return axiosClient.post(url, data)
}
