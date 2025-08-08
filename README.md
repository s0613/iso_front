# ISO Frontend

자동차 품질 인증서 발급 시스템의 프론트엔드 애플리케이션입니다.

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- pnpm (권장) 또는 npm

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속하세요.

## 🔧 백엔드 API 연동 설정

### 1. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 백엔드 API URL 설정
NEXT_PUBLIC_API_URL=http://localhost:8080

# 개발 환경 설정
NODE_ENV=development
```

### 2. 백엔드 서버 실행

백엔드 서버가 실행 중인지 확인하세요. 기본 포트는 8080입니다.

## 🧪 인증서 발급 테스트

### 테스트 페이지 접속

- URL: `http://localhost:3000/cardetail/test`
- 더미 차량 데이터를 사용하여 인증서 발급 기능을 테스트할 수 있습니다.

### 테스트 시나리오

1. **백엔드 연결 확인**

   - 테스트 페이지에서 "연결 테스트" 버튼 클릭
   - 백엔드 서버 상태 확인

2. **인증서 발급 테스트**

   - "인증서 발급" 버튼 클릭
   - 차량 정보 확인 후 발급 진행
   - 실제 PDF 파일 다운로드

3. **API 모니터링**
   - 브라우저 개발자 도구 → Network 탭
   - API 호출 로그 확인

## 📁 프로젝트 구조

```
iso_front/
├── app/                    # Next.js App Router
│   ├── cardetail/         # 차량 상세 페이지
│   ├── login/             # 로그인 페이지
│   └── signup/            # 회원가입 페이지
├── components/            # 재사용 가능한 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   └── ui/               # UI 컴포넌트
├── features/             # 기능별 모듈
│   ├── car/              # 차량 관련 기능
│   └── user/             # 사용자 관련 기능
└── lib/                  # 유틸리티 및 설정
    ├── apiClient.tsx     # API 클라이언트
    └── auth.ts           # 인증 관련
```

## 🔌 API 엔드포인트

### 인증서 관련 API

- `POST /api/certificates/issue` - 인증서 발급
- `GET /api/certificates/download/{certNumber}` - PDF 다운로드
- `GET /api/certificates/vin/{vin}` - VIN으로 인증서 조회
- `GET /api/certificates/{certNumber}` - 인증번호로 인증서 조회

### 요청 예시

```typescript
// 인증서 발급 요청
const request: CertificateRequest = {
  vin: "KMHXX00XXXX000000",
  manufacturer: "현대",
  modelName: "아반떼",
  manufactureYear: 2020,
  firstRegisterDate: "2020-06-01",
  mileage: 45000,
  inspectDate: "2025-05-31",
  inspectorCode: "rnrnrkrk1234",
  inspectorName: "평가관",
};

const response = await CertificateService.issueCertificate(request);
```

## 🛠️ 개발 도구

### 사용 기술

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Package Manager**: pnpm

### 개발 명령어

```bash
# 개발 서버 실행
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start

# 린트 검사
pnpm lint

# 타입 검사
pnpm type-check
```

## 📝 주요 기능

- ✅ 사용자 인증 (로그인/회원가입)
- ✅ 차량 목록 조회
- ✅ 차량 상세 정보 조회
- ✅ 인증서 발급 및 PDF 다운로드
- ✅ 반응형 디자인
- ✅ JWT 토큰 기반 인증

## 🔒 보안

- JWT 토큰을 쿠키에 저장
- HTTPS 환경에서 secure 쿠키 사용
- API 요청 시 자동 인증 헤더 추가
- 인증 실패 시 자동 로그인 페이지 리다이렉트

## 🐛 문제 해결

### 백엔드 연결 오류

1. 백엔드 서버가 실행 중인지 확인
2. 포트 번호가 올바른지 확인 (기본: 8080)
3. CORS 설정 확인

### 인증서 발급 실패

1. 로그인 상태 확인
2. JWT 토큰 유효성 확인
3. 브라우저 개발자 도구에서 에러 로그 확인

### PDF 다운로드 실패

1. 백엔드에서 PDF 파일이 정상 생성되었는지 확인
2. 파일 권한 설정 확인
3. 네트워크 연결 상태 확인

## 📞 지원

문제가 발생하면 다음을 확인해주세요:

1. 브라우저 개발자 도구의 콘솔 로그
2. 네트워크 탭의 API 호출 상태
3. 백엔드 서버 로그
# iso_front
