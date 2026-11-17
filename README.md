# EASY-PG (easy-pg)

휴대폰 입금 알림으로 무통장 입금을 확인하는 서비스의 프론트엔드입니다.
Android 기기가 감지한 입금 알림을 서버에서 조회하고, 대시보드에서 입금 내역과
API 키를 관리합니다.

## 기술 스택

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + shadcn/ui (radix, neutral 테마)
- React Router, recharts, react-qr-code, sonner

## 실행

```bash
npm install
npm run dev
```

API 요청은 프록시 없이 `https://api.easy-pg.xyz`로 직접 전송됩니다.
다른 주소를 사용하려면 `VITE_API_BASE_URL` 환경 변수를 설정하세요.

## Android 앱

입금 알림을 서버로 보내는 앱은 GitHub Releases에서 배포합니다.

- 릴리스: <https://github.com/dsm-easy-pg/EPG-ANDROID/releases/tag/1.0.0>
- 버전: 1.0.0

설치 후 알림 접근 권한을 허용하고, 대시보드에서 키를 발급해 QR 코드를
스캔하면 기기가 연결됩니다.

## 페이지 구성

| 경로 | 설명 |
| --- | --- |
| `/` | 랜딩 페이지 (입금 알림 예시, 앱 설치 안내, 로그인/회원가입) |
| `/app` | 대시보드 (입금 통계, 일별 입금액 차트, 최근 입금) |
| `/app/transactions` | 입금 내역 (기간/최소 금액/확인 상태 필터, 페이지네이션, CSV 내려받기) |
| `/app/keys` | API 키 관리 (발급, QR 코드, 만료 표시, 삭제) |
| `/docs` | API 문서 (`/api/rem/v1` 명세와 Android 앱 설치 안내) |

## 주요 스펙

- 로그인은 백엔드 `POST /api/auth/login`을 사용하며, 액세스 토큰은
  `localStorage`, 리프레시 토큰은 HttpOnly 쿠키로 유지됩니다.
- 입금 목록 API는 생성 시각과 은행명을 제공하지 않으므로, 목록 표시 시
  각 거래의 상세 API를 호출해 생성 시각을 보완합니다.
- API 키 원문은 발급 응답에서만 확인할 수 있으며, 목록에는 이름과 만료일만
  표시됩니다. 만료된 키는 빨간색으로 표시되고 사용자가 직접 삭제할 수 있습니다.
- 발급 응답의 API 키 원문을 담은 QR 코드가 표시됩니다.
