export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string; 
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  expiresAt: Date;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user';
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  profilePicture?: string;    
  phoneNumber?: string;       
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}