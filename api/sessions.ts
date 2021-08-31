import {
  CheckSessionParams,
  CreateSessionParams,
  DeleteSessionAddressParams,
  SessionIdParams,
  UpdateSessionAddressesParams,
  VoteSessionParams,
} from 'lib/interfaces'
import axiosClient from './axiosClient'

interface CreateSessionResponse {
  messageCode: number
  message: string
  data: { sid: string }
}

interface CheckSessionResponse {
  messageCode: number
  data: {
    canVote: boolean
    voted: boolean
    isCreator: boolean
  }
}

// session detail response
interface Member {
  id: number
  username: string
  name: string
  avatarUrl: string
}

interface Address {
  id: number
  aid: string
  name: string
  latitude: number
  longitude: number
  username: string
  voteCount: number
}

interface GetSessionDetailsResponse {
  messageCode: number
  data: {
    title: string
    content: string
    expireTime: Date
    members: Member[]
    addresses: Address[]
  }
}

// only message reponse
interface OnlyMessageResponse {
  messageCode: number
  message: string
}

interface UserAddress {
  latitude: number
  longitude: number
  name: string
  userId: string
  username: string
}

interface GetAllAddressesResponse {
  data: UserAddress[]
}

// result of session response
interface AddressResult {
  aid: string
  created_at: null
  id: number
  latitude: number
  longitude: number
  name: string
  updated_at: null
}

interface SessionResultResponse {
  messageCode: number
  data: {
    voters?: number
    addresses?: AddressResult[]
    expireTime?: Date
  }
}

export const createSession = (data: CreateSessionParams): Promise<CreateSessionResponse> => {
  const url = '/sessions/create'
  return axiosClient.post(url, data)
}

export const checkSession = (data: CheckSessionParams): Promise<CheckSessionResponse> => {
  const url = `/sessions/check?sid=${data.sid}&uid=${data.uid}`
  return axiosClient.get(url)
}

export const getSessionDetails = (data: SessionIdParams): Promise<GetSessionDetailsResponse> => {
  const url = `/sessions/details?sid=${data.sid}`
  return axiosClient.get(url)
}

export const getOldSessions = (data) => {
  const url = `/sessions/get-old?uid=${data.uid}`
  return axiosClient.get(url)
}

export const updateSessionAddresses = (data: UpdateSessionAddressesParams): Promise<OnlyMessageResponse> => {
  const url = `/sessions/addresses/update`
  return axiosClient.post(url, data)
}

export const getAllAddresses = (data: SessionIdParams): Promise<GetAllAddressesResponse> => {
  const url = `/sessions/addresses/get-all?sid=${data.sid}`
  return axiosClient.get(url)
}

export const deleteSessionAddress = (data: DeleteSessionAddressParams): Promise<OnlyMessageResponse> => {
  const url = `/sessions/addresses/delete`
  return axiosClient.delete(url, { data })
}

export const getSessionResult = (data: SessionIdParams): Promise<SessionResultResponse> => {
  const url = `/sessions/result?sid=${data.sid}`
  return axiosClient.get(url)
}

export const voteSession = (data: VoteSessionParams): Promise<OnlyMessageResponse> => {
  const url = '/sessions/vote'
  return axiosClient.post(url, data)
}
