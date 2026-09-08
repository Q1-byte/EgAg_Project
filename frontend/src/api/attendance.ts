import client from './client'

export const getTodayAttendance = async (): Promise<{ attended: boolean }> => {
  const response = await client.get('/attendance/today')
  return response.data
}

export const checkInAttendance = async (): Promise<{ message: string }> => {
  const response = await client.post('/attendance')
  return response.data
}

export const getAttendanceHistory = async (): Promise<string[]> => {
  const response = await client.get('/attendance/history')
  return response.data
}

export const getClaimedBonuses = async (): Promise<number[]> => {
  const response = await client.get('/attendance/claimed-bonuses')
  return response.data
}

export const claimStreakBonus = async (days: number): Promise<{ bonus: number; message: string }> => {
  const response = await client.post(`/attendance/claim-streak?days=${days}`)
  return response.data
}
