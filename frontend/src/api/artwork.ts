import client from './client'
import type { ArtworkResponse } from '../types'

export interface ArtworkSummary {
  id: string
  title: string | null
  topic: string | null
  imageUrl: string | null
  userImageData: string | null
  status: string
  isPublic: boolean
  likeCount: number
  createdAt: string
}

export const getArtwork = async (id: string): Promise<ArtworkResponse> => {
  const response = await client.get<ArtworkResponse>(`/artworks/${id}`)
  return response.data
}

export const exploreArtworks = async (
  sort: string = 'latest',
  cursor?: string,
  limit: number = 20
): Promise<ArtworkResponse[]> => {
  const response = await client.get<ArtworkResponse[]>('/artworks/explore', {
    params: { sort, cursor, limit },
  })
  return response.data
}

export const getMyArtworks = () =>
  client.get<ArtworkSummary[]>('/gallery/my').then(res => res.data)

export const saveArtworkToGallery = (imageUrl: string, userImageData: string, title: string, source: string) =>
  client.post<ArtworkSummary>('/artworks', { imageUrl, userImageData, title, source }).then(res => res.data)

export const toggleLikeArtwork = async (id: string): Promise<void> => {
  await client.post(`/artworks/${id}/like`)
}

export const deleteArtwork = async (id: string): Promise<void> => {
  await client.delete(`/artworks/${id}`)
}

export const toggleArtworkVisibility = (id: string): Promise<{ isPublic: boolean }> =>
  client.patch<{ isPublic: boolean }>(`/artworks/${id}/visibility`).then(res => res.data)

export const reportArtwork = async (id: string, data: { reason: string, description?: string }): Promise<void> => {
  await client.post(`/artworks/${id}/report`, data)
}

export const updateArtworkTitle = async (id: string, title: string): Promise<void> => {
  await client.patch(`/artworks/${id}/title`, { title })
}
