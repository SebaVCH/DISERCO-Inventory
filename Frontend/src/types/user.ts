export interface UserProfile {
    id: number
    email: string
    full_name: string
}

export interface User extends UserProfile {
    password?: string
}

export interface LoginPayload {
    email: string
    password: string
}

export interface RegisterPayload {
    email: string
    full_name: string
    password: string
}

export interface TokenResponse {
    access_token: string
    token_type: string
}