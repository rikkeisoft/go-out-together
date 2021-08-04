import axiosClient from './axiosClient'

const endPoint = {
  CREATE_ADMIN_INFO: '/sessions/creator/update',
}

const sessionsCreate = {
  createInfoAdmin: (dataAdmin) => {
    const url = endPoint.CREATE_ADMIN_INFO
    return axiosClient.post(url, dataAdmin)
  },
}

export default sessionsCreate
