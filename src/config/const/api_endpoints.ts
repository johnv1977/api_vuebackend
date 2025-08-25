// Configuración del API

export const API_BASE_URL = 'http://localhost:5215'

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',

  // Rooms endpoints
  ROOMS: '/api/rooms',
  ROOM_BY_SLUG: (slug: string) => `/api/rooms/${slug}`,
  ROOM_BY_ID: (id: string) => `/api/rooms/${id}`,
} as const
