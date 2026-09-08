import client from './client'
import type { UserResponse, ArtworkResponse } from '../types'

export interface UserProfile {
  id: string
  email: string
  subEmail: string | null
  name: string
  nickname: string
  phone: string
  profileImageUrl: string | null
  tokenBalance: number
  followerCount: number
  followingCount: number
  provider: string
  createdAt: string
}

export const getUserProfile = async (id: string): Promise<UserResponse> => {
  const response = await client.get<UserResponse>(`/users/${id}`)
  return response.data
}

export const getUserArtworks = async (id: string, onlyPublic: boolean = true): Promise<ArtworkResponse[]> => {
  const response = await client.get<ArtworkResponse[]>(`/users/${id}/artworks`, {
    params: { onlyPublic }
  })
  return response.data
}

export const getMe = async (): Promise<UserResponse> => {
  const response = await client.get<UserResponse>('/users/me')
  return response.data
}

export const uploadProfilePhoto = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await client.post('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const uploadAvatar = async (file: File): Promise<UserResponse> => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await client.post<UserResponse>('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const toggleFollowUser = async (id: string): Promise<void> => {
  await client.post(`/users/${id}/follow`)
}

export const getFollowers = async (userId: string): Promise<UserResponse[]> => {
  const res = await client.get(`/users/${userId}/followers`)
  return res.data
}

export const getFollowing = async (userId: string): Promise<UserResponse[]> => {
  const res = await client.get(`/users/${userId}/following`)
  return res.data
}

export const getMyProfile = () =>
  client.get<UserProfile>('/users/me').then(res => res.data)

export const updateMyProfile = (data: { name?: string; nickname?: string; phone?: string; email?: string }) =>
  client.put<UserProfile>('/users/me', data).then(res => res.data)

export const changePassword = (data: { currentPassword: string; newPassword: string }) =>
  client.put<{ message: string }>('/users/me/password', data).then(res => res.data)

export const completeOnboarding = (data: { name: string; phone: string; nickname: string; email?: string }) =>
  client.post<UserProfile>('/users/me/onboarding', data).then(res => res.data)

export const checkNicknameAvailable = async (nickname: string): Promise<boolean> => {
  const response = await client.get('/users/check-nickname', { params: { nickname } })
  return response.data.available
}
