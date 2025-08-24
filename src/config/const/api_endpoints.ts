// Configuración del API

export const API_BASE_URL = 'http://localhost:5215'

export const API_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  ME: '/auth/me',
} as const
