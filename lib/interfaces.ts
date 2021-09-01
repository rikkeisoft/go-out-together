import { ReactNode } from 'react'

export interface ChildrenProps {
  children: ReactNode
}

export interface ClassNameProps {
  className?: string
}

interface Geometry {
  coordinates: number[]
  type: 'Point'
}

export interface Location {
  id: string
  place_name: string
  text: string
  center: number[]
  geometry: Geometry
}

export interface Address {
  aid: string
  id?: number
  latitude: number
  longitude: number
  name: string
  username?: string
  voteCount?: number
  uuid?: string
}

export interface OldSession {
  content: string
  id: number
  result: string[]
  sid: string
  title: string
}

export interface UserLocation {
  userId?: number
  name?: string
  address?: string
  coordinates?: number[]
  username?: string
}

export interface SessionIdParams {
  sid: string
}

export interface CreateSessionParams {
  uid: string
  title: string
  content: string
  timeLimit: number
  addresses: Address[]
}

export interface CheckSessionParams extends SessionIdParams {
  uid: string
}

export interface GetOldSessionsParams {
  uid: string
}

export interface JoinSessionParams extends SessionIdParams {
  uid: string
  name: string
  address: Address
}

export interface UpdateSessionAddressesParams extends SessionIdParams {
  addresses: Address[]
}

export interface DeleteSessionAddressParams {
  addressId: number
  sid: string
}

export interface VoteSessionParams extends SessionIdParams {
  uid: string
  aid: string
}

// user
export interface LoginParams {
  uuid: string
  username: string
  avatar_url: string
}

export interface UpdateUserInfoParams {
  uuid: string
  avatarURL: string
}
export interface UpdateSessionCreatorParams {
  uid: string
  name: string
  address: Address
}

// api
export type StringOrNumberGeneric = string | number
