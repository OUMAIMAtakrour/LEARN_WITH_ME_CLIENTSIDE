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
  access_token: string; 
  refresh_token: string;
  user: User | null;
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

export interface Teacher {
  _id: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
}

export interface CourseVideo {
  _id?: string;
  title: string;
  description?: string;
  url?: string;
  key?: string;
  duration?: number;
  order?: number;
}

export interface CourseDocument {
  _id?: string;
  title: string;
  description?: string;
  url?: string;
  key?: string;
  order?: number;
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  certified?: boolean;
  courseImageUrl?: string;
  courseImageKey?: string;
  category?: string;
  level?: string;
  progress?: number;
  userProgress?: number;
  teacher?: Teacher;
  courseVideos?: CourseVideo[];
  courseDocuments?: CourseDocument[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type VideoProgress = {
  videoId: string;
  watchedSeconds: number;
  completed: boolean;
};

export type CourseProgress = {
  _id: string;
  userId: string;
  courseId: string;
  videosProgress: VideoProgress[];
  completed: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};