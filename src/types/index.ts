export type UserRole = 'citizen' | 'worker' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface CleanupRequest {
  id: string;
  title: string;
  description: string;
  location: string;
  reportDate: string;
  beforeImage: string;
  afterImage?: string;
  status: 'reported' | 'assigned' | 'in-progress' | 'completed' | 'verified';
  citizenId: string;
  workerId?: string;
  completedDate?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}