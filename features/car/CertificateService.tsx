import { api } from '@/lib/apiClient';

// 인증서 발급 요청 타입 (Java CertificateRequest와 일치)
export interface CertificateRequest {
  certNumber?: string;            // 인증번호 (선택, 없으면 자동 생성)
  issueDate?: string;             // 발급일자 (선택, 없으면 현재 날짜)
  expireDate?: string;            // 만료일자 (선택, 없으면 발급일 + 1년)
  inspectDate: string;            // 검사일자 (필수)
  manufacturer: string;           // 제조사 (필수)
  modelName: string;              // 모델명 (필수)
  vin: string;                    // 차대번호 (필수)
  manufactureYear?: number;       // 제조연도
  firstRegisterDate?: string;     // 최초등록일
  mileage?: number;               // 주행거리
  inspectorCode: string;          // 평가사 코드 (필수)
  inspectorName: string;          // 평가사 성명 (필수)
  signaturePath?: string;         // 서명 이미지 경로 (선택)
  issuedBy?: string;              // 발급자 (선택)
}

// 인증서 발급 응답 타입 (Java CertificateResponse와 일치)
export interface CertificateResponse {
  id: number;
  certNumber: string;             // 인증번호
  issueDate: string;              // 발급일자
  expireDate: string;             // 만료일자
  inspectDate: string;            // 검사일자
  
  // 자동차 정보
  manufacturer: string;           // 제조사
  modelName: string;              // 모델명
  vin: string;                    // 차대번호
  manufactureYear?: number;       // 제조연도
  firstRegisterDate?: string;     // 최초등록일
  mileage?: number;               // 주행거리
  
  // 평가사 정보
  inspectorCode: string;          // 평가사 코드
  inspectorName: string;          // 평가사 성명
  
  issuedBy: string;               // 발급자
  pdfFilePath: string;            // 생성된 PDF 파일 경로 (CloudFront URL)
}

// 인증서 서비스 클래스
export class CertificateService {
  /**
   * 쿠키 상태 확인 (디버깅용)
   */
  private static checkCookieStatus(): void {
    if (typeof document !== 'undefined') {
      const cookies = document.cookie;
      console.log('🍪 현재 쿠키:', cookies);
      
      const authCookie = cookies.split(';').find(cookie => 
        cookie.trim().startsWith('auth-token=')
      );
      
      if (authCookie) {
        console.log('✅ JWT 토큰 쿠키 발견:', authCookie.trim());
      } else {
        console.log('❌ JWT 토큰 쿠키를 찾을 수 없습니다.');
      }
    }
  }

  /**
   * 인증서 발급
   */
  static async issueCertificate(request: CertificateRequest): Promise<CertificateResponse> {
    try {
      // 쿠키 상태 확인
      this.checkCookieStatus();
      
      console.log('🚀 인증서 발급 요청 시작:', {
        url: '/api/certificates/issue',
        data: request,
        withCredentials: true
      });
      
      const response = await api.post<CertificateResponse>('/api/certificates/issue', request);
      
      console.log('✅ 인증서 발급 성공:', response);
      return response;
    } catch (error) {
      console.error('❌ 인증서 발급 실패:', error);
      
      // 더 구체적인 에러 메시지 제공
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        
        console.log('🔍 CertificateService 에러 처리:', {
          status: axiosError.response?.status,
          message: axiosError.response?.data?.message
        });
        
        if (axiosError.response?.status === 401) {
          throw new Error('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else if (axiosError.response?.status === 403) {
          throw new Error('인증서 발급 권한이 없습니다. 관리자에게 문의해주세요.');
        } else if (axiosError.response?.status === 404) {
          throw new Error('인증서 발급 서비스를 찾을 수 없습니다.');
        } else if (axiosError.response?.status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
      // 네트워크 에러나 기타 에러
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
        throw new Error('요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
      }
      
      throw new Error('인증서 발급에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * PDF 다운로드
   */
  static async downloadCertificate(certNumber: string): Promise<Blob> {
    try {
      // 쿠키 상태 확인
      this.checkCookieStatus();
      
      console.log('📥 PDF 다운로드 요청:', certNumber);
      
      const response = await api.downloadCertificate(certNumber);
      
      console.log('✅ PDF 다운로드 성공');
      return response;
    } catch (error) {
      console.error('❌ PDF 다운로드 실패:', error);
      
      // 더 구체적인 에러 메시지 제공
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
        
        console.log('🔍 PDF 다운로드 에러 처리:', {
          status: axiosError.response?.status,
          message: axiosError.response?.data?.message
        });
        
        if (axiosError.response?.status === 401) {
          throw new Error('로그인이 필요합니다. 로그인 후 다시 시도해주세요.');
        } else if (axiosError.response?.status === 403) {
          throw new Error('PDF 다운로드 권한이 없습니다.');
        } else if (axiosError.response?.status === 404) {
          throw new Error('인증서 파일을 찾을 수 없습니다.');
        } else if (axiosError.response?.status === 500) {
          throw new Error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }
      
      // 네트워크 에러나 기타 에러
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ECONNABORTED') {
        throw new Error('요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.');
      }
      
      throw new Error('PDF 다운로드에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * VIN으로 인증서 조회
   */
  static async getCertificateByVin(vin: string): Promise<CertificateResponse> {
    try {
      console.log('🔍 VIN으로 인증서 조회:', vin);
      
      const response = await api.get<CertificateResponse>(`/api/certificates/vin/${vin}`);
      
      console.log('✅ 인증서 조회 성공:', response);
      return response;
    } catch (error) {
      console.error('❌ 인증서 조회 실패:', error);
      throw new Error('인증서 조회에 실패했습니다.');
    }
  }

  /**
   * 인증번호로 인증서 조회
   */
  static async getCertificateByCertNumber(certNumber: string): Promise<CertificateResponse> {
    try {
      console.log('🔍 인증번호로 인증서 조회:', certNumber);
      
      const response = await api.get<CertificateResponse>(`/api/certificates/${certNumber}`);
      
      console.log('✅ 인증서 조회 성공:', response);
      return response;
    } catch (error) {
      console.error('❌ 인증서 조회 실패:', error);
      throw new Error('인증서 조회에 실패했습니다.');
    }
  }
}
