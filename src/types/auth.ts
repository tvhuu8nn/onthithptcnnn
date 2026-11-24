export type UserRole = 'admin' | 'teacher' | 'student';

export type PaymentTierAmount = 50000 | 200000 | number;

export interface AuthUser {
  username: string;
  role: UserRole;
  fullName: string;
  className?: string;
  studentId?: string;
  token: string;
  loggedInAt: string;
  email?: string;
  phone?: string;
  firstLoginChanged?: boolean;
  paymentAmount?: number;
  startDate?: string;
  expiresAt?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  className?: string;
  paymentAmount?: number;
  startDate?: string;
  expiresAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
  source?: 'demo_fallback' | 'local_storage' | 'datauser_file';
  isFirstLogin?: boolean;
}


