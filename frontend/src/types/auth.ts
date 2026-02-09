export type UserRole = "ADMIN" | "MANAGER" | "MECHANIC" | "RECEPTIONIST";

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
