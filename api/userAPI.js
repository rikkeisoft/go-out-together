import axiosClient from './axiosClient'

const userAPI = {
  login: (userInfo) => {
    const url = '/users/login'

    return axiosClient.post(url, userInfo)
  },
  logout: (uuid) => {
    const url = '/users/logout'

    return axiosClient.post(url, uuid)
  },
  checkUser: (uuid) => {
    const url = '/users/check'

    return axiosClient.post(url, uuid)
  },
}

export default userAPI
