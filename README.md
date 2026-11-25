# 체육 수행평가 관리 홈페이지 — 무료 배포판

이 패키지는 **Netlify 무료 플랜(홈페이지·서버 함수) + Supabase 무료 플랜(공유 데이터베이스)** 조합입니다.
교사들은 하나의 공통 비밀번호를 입력해 접속하고, 학생 명단과 수행평가 기록을 함께 사용합니다.

## 파일 구성
- `index.html`: 수행평가 관리 화면
- `netlify/functions/api.mjs`: 비밀번호 확인 및 데이터베이스 중계 서버
- `netlify.toml`: Netlify 배포 설정
- `supabase/schema.sql`: 데이터베이스 테이블 생성 SQL
- `package.json`: 프로젝트 설정

## 1. Supabase 데이터베이스 만들기
1. https://supabase.com 에 접속해 무료 계정을 만듭니다.
2. 새 프로젝트를 생성합니다. 데이터베이스 비밀번호는 안전한 곳에 따로 보관합니다.
3. 프로젝트가 준비되면 왼쪽 메뉴의 **SQL Editor**를 엽니다.
4. 이 패키지의 `supabase/schema.sql` 파일을 열어 전체 내용을 복사하고 SQL Editor에 붙여넣은 뒤 **Run**을 누릅니다.
5. **Project Settings → API**(또는 API Keys)에서 다음 값을 확인합니다.
   - Project URL
   - `service_role` 또는 Secret 키
6. 이 키는 데이터베이스 전체 권한을 가질 수 있으므로 절대로 `index.html`, GitHub 저장소, 교사에게 공유하는 문서에 넣지 않습니다. 다음 단계의 Netlify 환경변수에만 입력합니다.

## 2. GitHub에 소스 올리기
1. https://github.com 에 로그인합니다.
2. 새 저장소(repository)를 만듭니다. 예: `pe-assessment`
3. 이 ZIP을 압축 해제한 뒤 폴더 안의 파일과 폴더를 저장소 최상위에 업로드합니다.
   - `index.html`
   - `netlify.toml`
   - `package.json`
   - `netlify/`
   - `supabase/`
4. 저장소는 가능하면 **Private**로 설정합니다. 코드에 비밀번호와 DB 비밀 키는 들어 있지 않지만 비공개 저장소가 관리에 더 안전합니다.

## 3. Netlify에 배포하기
1. https://app.netlify.com 에 접속해 무료 계정을 만듭니다.
2. **Add new site → Import an existing project**를 선택합니다.
3. GitHub를 연결하고 방금 만든 저장소를 선택합니다.
4. 배포 설정은 다음과 같이 둡니다.
   - Build command: 비워 둠
   - Publish directory: `.`
   - Functions directory: `netlify/functions` (netlify.toml에 설정되어 있음)
5. Deploy를 누릅니다. 완료되면 `https://사이트이름.netlify.app` 주소가 생성됩니다.

## 4. Netlify 환경변수 설정하기 — 매우 중요
Netlify 사이트 관리 화면에서 **Site configuration → Environment variables**(또는 Project configuration → Environment variables)를 열고 아래 네 변수를 추가합니다.

| 변수 이름 | 입력할 값 |
|---|---|
| `APP_PIN` | 교사가 정한 공통 비밀번호 |
| `SESSION_SECRET` | 직접 만든 길고 임의의 비밀 문자열(최소 32자 권장) |
| `SUPABASE_URL` | Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase의 service_role/Secret 키 |

`SESSION_SECRET` 예시는 다음과 같은 무작위 문자열 형태입니다. 예시를 그대로 쓰지 말고 직접 새로 만드세요.
`v9Qm...` (영문 대소문자·숫자·기호를 섞은 40자 이상)

환경변수를 저장한 뒤 **Deploys → Trigger deploy → Deploy site**로 다시 배포합니다. 환경변수 변경은 새 배포 이후 적용됩니다.

## 5. 접속 및 사용
1. Netlify가 발급한 `https://...netlify.app` 주소를 교사들에게 전달합니다.
2. 교사들은 Netlify 환경변수 `APP_PIN`에 설정한 공통 비밀번호를 입력합니다.
3. 학생 명단 엑셀을 업로드합니다. 열 제목은 `학번`, `성별`, `성명`이어야 합니다.
4. 교사들이 입력한 평가 기록은 클라우드 DB에 저장됩니다. 다른 교사의 화면에는 약 12초 간격으로 새로 반영됩니다.
5. 사용을 마치면 화면 오른쪽 위의 **나가기**를 누릅니다. 로그인 세션은 해당 브라우저 탭 세션 동안 유지되고, 서버 인증 토큰은 8시간 후 만료됩니다.

## 무료 플랜과 주의사항
- Supabase Free는 현재 DB 500MB, 월간 활성 사용자 50,000명, 파일 저장 1GB 등을 제공합니다. 다만 7일 동안 활동이 적으면 프로젝트가 일시 중지될 수 있고, 무료 플랜에는 자동 백업이 없습니다.
- Netlify Free는 월 300 credits 한도가 있으며, 한도에 도달하면 사이트/기능 사용이 중지될 수 있습니다. 사용량과 현재 요금제 조건을 대시보드에서 확인하세요.
- 이 홈페이지는 공통 비밀번호 방식입니다. 개인별 교사 계정, 교사별 권한, 누가 어떤 점수를 수정했는지에 대한 감사 기록은 제공하지 않습니다.
- 공통 비밀번호는 네 자리로 설정되어 있어 강도가 낮습니다. 서버 함수에서 확인하고 실패 횟수를 제한하지만, 민감한 학생 정보를 다룰 때는 학교의 정보보호 담당자 승인과 더 강한 인증 방식을 권장합니다.
- 학생 명단과 점수는 개인정보일 수 있습니다. 학교의 개인정보 처리·보관·외부 클라우드 이용 승인 여부를 먼저 확인하세요.
- 업로드는 기존 학번을 갱신하며, 새 파일에 없는 기존 학생을 자동 삭제하지 않습니다.
- 삭제 기능과 자동 백업은 이 버전에 포함되지 않습니다. 정기적으로 데이터베이스에서 내보내기 백업을 하세요.
- 무료 서비스의 한도·기능은 변경될 수 있습니다. 배포 전에 공식 요금 페이지를 확인하세요.

## 문제 해결
- **비밀번호가 맞는데 접속되지 않음:** Netlify 환경변수 `APP_PIN`에 지정한 비밀번호가 정확한지 확인하고 다시 배포합니다.
- **서버 환경변수 오류:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`이 정확히 입력됐는지 확인합니다.
- **DB 오류:** Supabase SQL Editor에서 `schema.sql`을 전체 실행했는지 확인합니다.
- **다른 교사 데이터가 늦게 보임:** 화면 자동 동기화는 약 12초 간격입니다. 페이지 새로고침도 시도해 보세요.

공식 안내:
- Netlify 요금제: https://www.netlify.com/pricing/
- Supabase 요금제: https://supabase.com/pricing
- Supabase 무료 프로젝트 일시 중지: https://supabase.com/docs/guides/platform/free-project-pausing
