// Interfaces
export interface LoginCredentials {
  usernameOrEmail: string
  password: string
}

export interface AuthRegisterRequest {
  email: string
  password: string
  displayname: string
  username: string
}

// public record MeResponse(string Id, string Username, string? Email, string? DisplayName);
export interface User {
  id: string
  email: string
  username: string
  displayName: string
}

export interface AuthResponse {
  // user: User
  accessToken: string
  expiresAt: string
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
