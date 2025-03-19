export enum UserRole {
  STUDENT = "STUDENT",
  INSTRUCTOR = "INSTRUCTOR",
  ADMIN = "ADMIN",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImageUrl?: string;
  points: number;
}

export interface AuthResponse {
  access_token: string; // This maps from access_token
  refresh_token: string;
  user: User | null; // This will be null after login
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  access_token: string | null;
  refresh_token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    password: string,
    profileImage?: any
  ) => Promise<boolean>;
  logout: () => void;
}
