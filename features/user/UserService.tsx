import { api } from '@/lib/apiClient';
import { Role } from './types';

// API Response Types
export interface AuthResponse {
  userId: number;
  email: string;
  role: Role;
  message?: string;
}

// 스프링 부트 LoginSuccessHandler 응답 형식에 맞춤
export interface LoginResponse {
  userId: number;
  email: string;
  role: Role;
}

// API Request Types
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  company: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// User Service Class
export class UserService {
  // Signup method
  async signup(request: SignupRequest): Promise<AuthResponse> {
    return api.post<AuthResponse>('/api/auth/signup', request);
  }

  // Login method - 스프링 부트 LoginSuccessHandler에 맞춤
  async login(request: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', request);
    
    // 로그인 성공 시 쿠키 정보 확인 (디버깅용)
    if (typeof document !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('🔐 UserService - 로그인 성공!');
      console.log('📡 API 응답:', response);
      
      // JWT 토큰 쿠키 확인
      const authToken = document.cookie.split(';').find(cookie => cookie.trim().startsWith('auth-token='));
      console.log('🔑 JWT 토큰 쿠키:', authToken ? '설정됨' : '없음');
      
      if (authToken) {
        const tokenValue = authToken.split('=')[1];
        console.log('🔑 토큰 값 (처음 20자):', tokenValue.substring(0, 20) + '...');
      }
    }
    
    // 서버에서 JWT 토큰을 쿠키에 저장하므로 클라이언트에서는 별도 처리 불필요
    // LoginSuccessHandler에서 자동으로 auth-token 쿠키가 설정됨
    
    return response;
  }

  // Logout method
  async logout(): Promise<void> {
    try {
      // 서버에 로그아웃 요청 (선택사항)
      await api.post('/api/auth/logout');
    } catch (error) {
      console.warn('로그아웃 요청 실패:', error);
    } finally {
      // 클라이언트에서 토큰 제거
      api.logout();
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<LoginResponse | null> {
    try {
      return await api.get<LoginResponse>('/api/auth/me');
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return api.isAuthenticated();
  }

  // Get user role
  async getUserRole(): Promise<Role | null> {
    const user = await this.getCurrentUser();
    return user?.role || null;
  }

  // Check if user has specific role
  async hasRole(role: Role): Promise<boolean> {
    const userRole = await this.getUserRole();
    return userRole === role;
  }

  // Check if user has any of the specified roles
  async hasAnyRole(roles: Role[]): Promise<boolean> {
    const userRole = await this.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  // Update user profile
  async updateProfile(userId: number, data: Partial<SignupRequest>): Promise<LoginResponse> {
    return api.put<LoginResponse>(`/api/users/${userId}`, data);
  }

  // Change password
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    await api.post(`/api/users/${userId}/change-password`, {
      currentPassword,
      newPassword,
    });
  }

  // Delete account
  async deleteAccount(userId: number, password: string): Promise<void> {
    await api.delete(`/api/users/${userId}`, {
      data: { password },
    });
  }
}

// Create a singleton instance
export const userService = new UserService();
