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
  bio?: string;
  location?: string;
  username?: string;
}
export enum UserRole {
  User = 'user',
  STUDENT = 'student',
  COORDINATOR = 'coordinator'
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  phoneNumber?: string;
  department?: string; 
  studentId?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}