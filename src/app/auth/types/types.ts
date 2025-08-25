// Interfaces
export interface LoginCredentials {
  usernameOrEmail: string
  password: string
}

export interface AuthRegisterRequest {
  username: string
  email: string
  password: string
  displayName?: string | null
}

export interface User {
  id?: string | null
  userName?: string | null
  normalizedUserName?: string | null
  email?: string | null
  normalizedEmail?: string | null
  emailConfirmed: boolean
  passwordHash?: string | null
  securityStamp?: string | null
  concurrencyStamp?: string | null
  phoneNumber?: string | null
  phoneNumberConfirmed: boolean
  twoFactorEnabled: boolean
  lockoutEnd?: string | null
  lockoutEnabled: boolean
  accessFailedCount: number
  displayName?: string | null
}

export interface AuthResponse {
  accessToken?: string | null
  expiresAt: string
  user: User
}

export interface ApiError {
  type?: string | null
  title?: string | null
  detail?: string | null
  status: number
}
