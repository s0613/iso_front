import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// API 응답 타입
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}

// 에러 응답 타입
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// API 클라이언트 클래스
class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
      timeout: 10000, // 10초 타임아웃
      withCredentials: true, // 쿠키 포함 (스프링 부트 JWT 쿠키 인증을 위해 필수)
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // 인터셉터 설정
  private setupInterceptors() {
    // Request 인터셉터
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // JWT 토큰을 쿠키에서 읽어와 Authorization 헤더에 추가
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 JWT 토큰을 Authorization 헤더에 추가');
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log('⚠️ JWT 토큰이 쿠키에 없습니다');
          }
        }
        
        // 요청 로깅 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          console.log('🚀 API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            withCredentials: config.withCredentials,
          });
        }
        
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response 인터셉터
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // 응답 로깅 (개발 환경에서만)
        if (process.env.NODE_ENV === 'development') {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
          });
          
          // 로그인 API 응답인 경우 JWT 쿠키 확인
          if (response.config.url?.includes('/api/auth/login') && response.status === 200) {
            console.log('🎉 로그인 성공! JWT 토큰이 쿠키에 설정되었습니다.');
            
            // JWT 토큰 쿠키 확인
            setTimeout(() => {
              const token = this.getAuthToken();
              if (token) {
                console.log('🔑 JWT 토큰 확인됨 (처음 20자):', token.substring(0, 20) + '...');
              } else {
                console.log('⚠️ JWT 토큰이 쿠키에 설정되지 않았습니다.');
              }
            }, 100);
          }
        }
        
        return response;
      },
      (error) => {
        // 에러 로깅
        console.error('❌ Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.response?.data?.message || error.message,
        });

        // 에러 처리
        if (error.response?.status === 401) {
          // 인증 실패 시 JWT 토큰 쿠키 제거
          this.removeAuthToken();
          
          // 인증서 발급 API의 경우 자동 리다이렉트하지 않음
          const isCertificateApi = error.config?.url?.includes('/api/certificates/issue');
          
          if (!isCertificateApi && typeof window !== 'undefined') {
            console.log('🔄 로그인 페이지로 리다이렉트');
            window.location.href = '/login';
          }
        }

        return Promise.reject(this.handleError(error));
      }
    );
  }

  // JWT 토큰을 쿠키에서 가져오기 (스프링 부트 LoginSuccessHandler에서 설정된 쿠키)
  private getAuthToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
    return authCookie ? authCookie.split('=')[1] : null;
  }

  // JWT 토큰 쿠키 제거
  private removeAuthToken(): void {
    if (typeof document !== 'undefined') {
      // 쿠키 제거 (만료일을 과거로 설정)
      document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      // 개발 환경에서는 도메인도 제거
      if (process.env.NODE_ENV === 'development') {
        document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
      }
    }
  }

  // 에러 처리
  private handleError(error: unknown): Error {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
      
      if (axiosError.response?.data?.message) {
        return new Error(axiosError.response.data.message);
      }
      
      if (axiosError.response?.status) {
        const statusMessages: { [key: number]: string } = {
          400: '잘못된 요청입니다.',
          401: '인증이 필요합니다.',
          403: '접근 권한이 없습니다.',
          404: '요청한 리소스를 찾을 수 없습니다.',
          500: '서버 오류가 발생했습니다.',
          502: '서버가 일시적으로 사용할 수 없습니다.',
          503: '서비스가 일시적으로 사용할 수 없습니다.',
        };
        
        const message = statusMessages[axiosError.response.status] || '알 수 없는 오류가 발생했습니다.';
        return new Error(message);
      }
    }
    
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
      return new Error('요청 시간이 초과되었습니다.');
    }
    
    return new Error('네트워크 오류가 발생했습니다.');
  }

  // GET 요청
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  // POST 요청
  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  // PUT 요청
  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  // PATCH 요청
  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  // DELETE 요청
  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  // 파일 업로드
  async upload<T = unknown>(url: string, file: File, onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // 다중 파일 업로드
  async uploadMultiple<T = unknown>(url: string, files: File[], onProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append(`files`, file);
    });

    const response = await this.axiosInstance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // 인증 상태 확인 (JWT 토큰 쿠키 존재 여부)
  isAuthenticated(): boolean {
    return this.getAuthToken() !== null;
  }

  // 로그아웃 (JWT 토큰 쿠키 제거)
  logout(): void {
    this.removeAuthToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // 인증서 관련 API 메서드들
  async issueCertificate(data: unknown): Promise<unknown> {
    return this.post('/api/certificates/issue', data);
  }

  async downloadCertificate(certNumber: string): Promise<Blob> {
    try {
      console.log('📥 PDF 다운로드 API 호출:', `/api/certificates/download/${certNumber}`);
      
      const response = await this.axiosInstance.get(`/api/certificates/download/${certNumber}`, {
        responseType: 'blob',
        timeout: 30000, // PDF 다운로드는 30초 타임아웃
      });
      
      console.log('✅ PDF 다운로드 API 성공:', {
        status: response.status,
        size: response.data.size,
        type: response.data.type
      });
      
      // 응답이 실제로 blob인지 확인
      if (!(response.data instanceof Blob)) {
        throw new Error('서버에서 올바른 PDF 파일을 받지 못했습니다.');
      }
      
      // PDF 타입 확인
      if (response.data.type !== 'application/pdf' && response.data.size > 0) {
        console.warn('⚠️ 응답이 PDF 타입이 아닙니다:', response.data.type);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ PDF 다운로드 API 실패:', error);
      
      // blob 응답에서 에러 메시지 추출 시도
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: Blob; status?: number } };
        
        if (axiosError.response?.data instanceof Blob) {
          // blob을 텍스트로 변환하여 에러 메시지 확인
          try {
            const errorText = await axiosError.response.data.text();
            console.log('🔍 PDF 다운로드 에러 응답:', errorText);
            
            // JSON 에러 메시지 파싱 시도
            try {
              const errorJson = JSON.parse(errorText);
              if (errorJson.message) {
                throw new Error(errorJson.message);
              }
            } catch {
              // JSON 파싱 실패 시 기본 에러 메시지 사용
            }
          } catch (textError) {
            console.error('❌ 에러 응답 텍스트 변환 실패:', textError);
          }
        }
      }
      
      throw error;
    }
  }

  async getCertificateByVin(vin: string): Promise<unknown> {
    return this.get(`/api/certificates/vin/${vin}`);
  }

  async getCertificateByCertNumber(certNumber: string): Promise<unknown> {
    return this.get(`/api/certificates/${certNumber}`);
  }
}

// 싱글톤 인스턴스 생성
export const apiClient = new ApiClient();

// 타입 안전성을 위한 헬퍼 함수들
export const api = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => apiClient.get<T>(url, config),
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.post<T>(url, data, config),
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.put<T>(url, data, config),
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => apiClient.patch<T>(url, data, config),
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => apiClient.delete<T>(url, config),
  upload: <T = unknown>(url: string, file: File, onProgress?: (progress: number) => void) => 
    apiClient.upload<T>(url, file, onProgress),
  uploadMultiple: <T = unknown>(url: string, files: File[], onProgress?: (progress: number) => void) => 
    apiClient.uploadMultiple<T>(url, files, onProgress),
  isAuthenticated: () => apiClient.isAuthenticated(),
  logout: () => apiClient.logout(),
  // 인증서 관련 API
  issueCertificate: (data: unknown) => apiClient.issueCertificate(data),
  downloadCertificate: (certNumber: string) => apiClient.downloadCertificate(certNumber),
};

export default apiClient; 