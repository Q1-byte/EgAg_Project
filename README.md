<div align="center">

# EgAg
### Easy Graphic, Awesome Game

*AI와 함께하는 어린이 창작 놀이터*

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)](https://openjdk.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![AWS](https://img.shields.io/badge/AWS-EC2-FF9900?logo=amazonaws&logoColor=white)](https://aws.amazon.com/)
<br>
[![Website](https://img.shields.io/badge/EgAg-Visit%20Website-7C3AED?logo=google-chrome&logoColor=white)](http://43.203.93.46)

</div>

<br>

## 프로젝트 소개

EgAg는 AI 기술을 활용한 어린이 창작 활동 플랫폼입니다.

아이들이 직접 그린 그림을 GPT-4o Vision이 인식하고, DALL-E 3가 멋진 작품으로 변환해줍니다.
마법 그림판, 거울 그림판, 시간초 그림판 등 다양한 캔버스 모드와 갤러리 공유 기능, 카카오페이·토스페이 결제 기반 토큰 시스템을 갖춘 풀스택 서비스입니다.

<br>

## 목차

- [프로젝트 소개](#프로젝트-소개)
- [주요 기능](#주요-기능)
- [기술 스택](#기술-스택)
- [시스템 아키텍처](#시스템-아키텍처)
- [핵심 구현](#핵심-구현)
- [프로젝트 회고](#프로젝트-회고)
- [향후 개선 방향](#향후-개선-방향)
- [팀원 소개](#팀원-소개)

<br>

## 주요 기능

### AI 그림판 (3가지 모드)

**마법 그림판**
- React-Konva 기반 실시간 드로잉
- 완성 후 GPT-4o Vision이 그림 주제 인식
- DALL-E 3가 전문적인 작품으로 변환
- LangChain4j를 활용한 동화 자동 생성

**거울 그림판 (Decalcomania)**
- 좌우 대칭 실시간 반영 드로잉
- 데칼코마니 기법으로 독창적인 작품 생성

**시간초 그림판 (TimeAttack)**
- 제한 시간 내 그림 완성 미션
- 토큰 소모 방식으로 긴장감 있는 플레이

### 갤러리

- AI 변환 작품 공유 및 커뮤니티 기능
- 좋아요, 댓글, 팔로우 기능
- 인기 작품 및 팔로잉 피드

### 토큰 시스템

- 카카오페이 QR 결제 (모바일 직접 결제)
- 토스페이 QR 결제 (백엔드 콜백 처리)
- PC에서 QR 스캔 → 모바일 결제 → PC 자동 반영

### 회원 시스템

- 카카오 소셜 로그인 (OAuth2)
- JWT Access/Refresh Token 이중 구조
- 출석 체크 보상 시스템
- 관리자 페이지 (유저·갤러리·결제 관리)

<br>

## 기술 스택

<details>
<summary>Frontend</summary>

<br>

| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19.x | UI 컴포넌트 |
| TypeScript | 5.x | 타입 안정성 |
| Vite | 6.x | 빌드 도구 |
| Zustand | - | 전역 상태 관리 |
| React-Konva | - | 캔버스 드로잉 |
| React Router DOM | - | SPA 라우팅 |
| Axios | - | HTTP 통신 |
| qrcode.react | - | QR 코드 생성 |
| @tosspayments/tosspayments-sdk | - | 토스페이 결제 |

</details>

<details>
<summary>Backend</summary>

<br>

| 기술 | 버전 | 용도 |
|------|------|------|
| Java | 17 | 언어 |
| Spring Boot | 3.x | 웹 프레임워크 |
| Spring Data JPA | - | ORM |
| Spring Security | - | 인증/인가 |
| Spring RestClient | - | OpenAI API 직접 호출 |
| LangChain4j | - | 동화 텍스트 생성 |
| MySQL | 8.x | 데이터베이스 |
| Gradle | - | 빌드 도구 |

</details>

<details>
<summary>외부 API / 인프라</summary>

<br>

| 기술 | 용도 |
|------|------|
| OpenAI GPT-4o Vision | 그림 주제 인식 |
| OpenAI DALL-E 3 | 이미지 변환 생성 |
| Kakao OAuth2 | 소셜 로그인 |
| KakaoPay REST API | QR 결제 |
| TossPayments SDK | QR 결제 |
| Cloudinary | 이미지 스토리지 |
| Resend | 이메일 발송 |
| AWS EC2 | 서버 호스팅 |
| Nginx | 리버스 프록시 |
| GitHub Actions | CI/CD 자동 배포 |

</details>

<br>

## 시스템 아키텍처

```
[GitHub] → [GitHub Actions CI/CD]
                    ↓
              [AWS EC2 Ubuntu]
                    ↓
               [Nginx]
              /        \
    [React 정적파일]  [/api → Spring Boot :8080]
                              ↓
                          [MySQL DB]
                              ↓
                    [OpenAI / Kakao / Toss API]
```

**배포 흐름**
- `main` 브랜치 push → GitHub Actions 자동 트리거
- 프론트엔드: `npm run build` → EC2 `/var/www/egag` 배포
- 백엔드: Gradle 빌드 → EC2 systemd 서비스 재시작

<br>

## 핵심 구현

<details>
<summary>AI 파이프라인 (3단계)</summary>

<br>

```
[사용자 그림 (Base64)]
        ↓
1단계: GPT-4o Vision → 그림 주제 인식 (Spring RestClient)
        ↓
2단계: GPT-4o → DALL-E 3 프롬프트 생성 (Spring RestClient)
        ↓
3단계: DALL-E 3 → 고품질 이미지 생성 (Spring RestClient)
        ↓
[변환된 작품 Cloudinary 업로드 → 갤러리 저장]
```

**LangChain4j 동화 생성** (`@AiService` 활용)
```java
@AiService
public interface StoryTeller {
    String generateStory(String subject, String nickname);
}
```

</details>

<details>
<summary>카카오페이 QR 결제 흐름</summary>

<br>

```
[PC] 결제하기 클릭
        ↓
[Backend] KakaoPay Ready API → next_redirect_mobile_url 반환
        ↓
[Frontend] 모바일 URL로 QR 코드 생성 → 모달 표시
        ↓
[Mobile] QR 스캔 → 카카오페이 앱 직접 연결 → 결제 완료
        ↓
[Backend] approve 콜백 → 토큰 지급 트랜잭션
        ↓
[PC] 3초 폴링으로 결제 완료 자동 감지 → UI 업데이트
```

</details>

<details>
<summary>JWT 토큰 자동 갱신</summary>

<br>

```typescript
// useTokenRefresh.ts
// Access Token 만료 1분 전 자동 갱신
const delay = expiry - Date.now() - 60_000
setTimeout(() => refresh(), delay)
```

- Access Token: 15분
- Refresh Token: 7일 (DB 저장, 재발급 시 rotation)
- 사용자 개입 없이 백그라운드 자동 갱신

</details>

<details>
<summary>실시간 드로잉 최적화</summary>

<br>

```typescript
// React-Konva useRef + useCallback으로 불필요한 리렌더링 방지
const stageRef = useRef<Konva.Stage>(null)
const handleMouseMove = useCallback((e) => {
  // 좌표 계산 → 선 추가 → 상태 최소 업데이트
}, [isDrawing, tool])
```

- Flood Fill 알고리즘으로 페인트 채우기 구현
- 거울 그림판: 좌표 반전으로 실시간 대칭 드로잉

</details>

<br>

## 프로젝트 회고

<details>
<summary>잘한 점</summary>

<br>

**AI 파이프라인 직접 설계**
- Spring RestClient로 OpenAI API 3단계 파이프라인 직접 구현
- 단순 API 호출을 넘어 Vision → 프롬프트 생성 → 이미지 생성 흐름 설계

**실결제 시스템 구축**
- 카카오페이 / 토스페이 QR 결제 모달 구현
- 모바일 결제 후 백엔드 콜백 처리 및 PC 자동 감지 폴링

**운영 가능한 인프라 구축**
- AWS EC2 + Nginx + GitHub Actions CI/CD로 실제 배포 운영
- Elastic IP로 안정적인 서비스 주소 유지

**보안 설계**
- JWT Access/Refresh Token 이중 구조
- Spring Security USER/ADMIN 권한 분리
- 환경변수로 API 키 분리 관리

</details>

<details>
<summary>아쉬운 점</summary>

<br>

**캔버스 상태 유지 미흡**
- 그림 데이터가 프론트엔드 메모리에만 존재
- 브라우저 새로고침 시 작업 내용 유실

**에러 핸들링 부족**
- AI API 실패 시 기술적 에러 메시지 노출
- 사용자 친화적 예외 처리 설계 미흡

**테스트 자동화 부재**
- 결제·토큰 차감 등 핵심 로직 수동 테스트에만 의존
- 트랜잭션 처리로 운영 중 불일치는 방지했으나 자동화 테스트 필요

**LangChain4j 활용도**
- 동화 텍스트 생성에만 적용, 전체 AI 파이프라인 체이닝 미실현

</details>

<details>
<summary>배운 점</summary>

<br>

**풀스택 협업 경험**
- 프론트/백엔드 API 설계 협의 및 Git Flow 전략 운영

**외부 API 통합**
- OpenAI, Kakao OAuth2, KakaoPay, TossPay 등 다양한 외부 API 연동 경험

**배포 환경 이해**
- 로컬과 운영 환경의 차이(CORS, 환경변수, 파일 경로 등) 직접 체득

**상태 관리 설계**
- Zustand로 전역 상태 관리, JWT 토큰 자동 갱신 훅 설계

</details>

<br>

## 향후 개선 방향

| 분류 | 기능 | 설명 |
|------|------|------|
| 안정성 | 캔버스 자동저장 | IndexedDB 또는 Redis로 작업 내용 보호 |
| 품질 | 테스트 자동화 | JUnit 5 + Mockito + CI 연동 |
| UX | 에러 핸들링 개선 | Global Exception Handler 세분화, 재시도 UX |
| AI | LangChain4j 확장 | 전체 AI 파이프라인 체이닝으로 유지보수성 향상 |
| 보안 | HTTPS 적용 | SSL 인증서 발급 및 Nginx HTTPS 설정 |

<br>

## 팀원 소개

| 이름 | 역할 |
|------|------|
| 정규원 | 배포 환경 구축 (EC2/Nginx/CI CD), 결제 시스템, 헤더·홈·갤러리 UI |
| 이상준 | 백엔드 아키텍처 설계, AI 파이프라인, Spring Security |
| 이승찬 | 캔버스 기능 구현, React-Konva 드로잉 최적화 |
| A-leesong | 관리자 페이지, 사용자 관리, 알림 시스템 |

<br>

---

<div align="center">

**MIT License** © 2025 EgAg Team

[![GitHub](https://img.shields.io/badge/GitHub-EgAg-181717?logo=github)](https://github.com/A-leesong/EgAg_Project)
[![Website](https://img.shields.io/badge/Service-EgAg-7C3AED?logo=react)](http://43.203.93.46)

</div>
