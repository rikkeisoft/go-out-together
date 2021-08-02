import axiosClient from './axiosClient'

export const createSession = (data) => {
  const url = 'sessions/create'
  return axiosClient.post(url, data)
}

export const checkSessionCreator = (data) => {
  const url = `sessions/creator/check?sid=${data.sid}&uid=${data.uid}`
  return axiosClient.get(url)
}

export const getSessionDetails = (data) => {
  const url = `sessions/${data.sid}`
  return axiosClient.get(url)
}
