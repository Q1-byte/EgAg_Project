import client from './client'

export const identifyCanvas = (canvasBase64: string) =>
  client.post<{ subject: string; reason: string }>('/canvas/identify', { canvasBase64 })

export const transformCanvas = (canvasBase64: string, style: string, subject?: string, reason?: string) =>
  client.post<{ imageUrl: string; prompt: string; style: string; story: string; tokenBalance: number }>('/canvas/transform', {
    canvasBase64,
    style,
    subject,
    reason,
  })

export const consumeToken = (): Promise<{ tokenBalance: number }> =>
  client.post<{ tokenBalance: number }>('/canvas/consume-token').then(res => res.data)

export const startSession = (nickname: string): Promise<{ id: string; topic: string }> =>
  client.post<{ id: string; topic: string }>('/canvas/start', { nickname }).then(res => res.data)
