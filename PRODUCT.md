# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

가맹점 개발자와 운영자. 무통장 입금을 API로 연동한 뒤 대시보드에서 입금 상태를 확인하고, API 키와 Android 기기 연결을 관리하는 사람.

## Product Purpose

휴대폰에 도착한 입금 알림을 서버에 기록하고, 발급된 API 키로 조회할 수 있게 만든다. 성공은 복잡한 인증이나 웹훅 설정 없이 입금 확인 흐름을 끝까지 완주하는 것이다.

## Positioning

Android 앱이 감지한 은행 알림을 QR로 연결된 계정에 전달하고, `/api/rem/v1` 조회 API와 대시보드로 바로 확인할 수 있는 무료 단순 연동.

## Operating Context

Android 앱 설치 → 알림 접근 권한 허용 → 대시보드에서 API 키 발급 → QR 스캔으로 기기 연결 → 입금 알림 자동 기록 → API 조회 또는 대시보드 확인.

## Capabilities and Constraints

- API 원문은 발급 응답에서만 표시하고 목록에는 이름과 만료일만 표시한다.
- 입금 목록 API에 생성 시각과 은행명이 없으므로 상세 API를 호출해 보완한다.
- 만료된 키는 구분 표시하고 사용자가 직접 삭제한다.
- API 요청은 `https://api.easy-pg.xyz`로 직접 전송하며 `VITE_API_BASE_URL`로 재설정할 수 있다.
- Android 앱은 GitHub Releases `v1.0.0`으로 배포한다.

## Brand Commitments

제품명 EASY-PG. 한국어 중심의 실무적인 톤. 연한 회색 캔버스, 흰 카드, 남색 본문, 파란 강조색으로 정확하고 차분한 금융 도구 인상을 유지한다.

## Evidence on Hand

`README.md`, `src/pages/docs.tsx`의 실제 엔드포인트와 요청 예시, `src/lib/links.ts`의 실제 API/Android 링크. 가짜 통계, 고객 로고, 추천사는 사용하지 않는다.

## Product Principles

- 연동 단계는 키 발급과 QR 연결 두 가지만 남긴다.
- 화면은 실제 API 경로, 상태, 필드명을 그대로 보여준다.
- 데모 수치는 제품 증거가 아니라 흐름 설명으로만 취급하고 가능하면 제거한다.
- 같은 상태와 액션은 모든 화면에서 같은 이름과 스타일을 쓴다.
