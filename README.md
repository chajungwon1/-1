# 체육 수행평가 클라우드 홈페이지

## 포함 파일
- `index.html`: 기존 수행평가 관리 화면 + 교사 로그인 + Supabase 클라우드 저장/실시간 동기화
- `supabase/schema.sql`: 공유 DB 테이블 및 로그인 사용자용 RLS 정책

## 설정 순서
1. https://supabase.com 에서 학교용 프로젝트 생성
2. Supabase SQL Editor에서 `supabase/schema.sql` 전체 실행
3. Project Settings → API에서 Project URL과 공개 `anon`/publishable key 복사
4. `index.html`의 `SUPABASE_URL`, `SUPABASE_ANON_KEY` 값을 실제 값으로 교체
   - `service_role` 또는 secret key는 절대 브라우저에 넣지 마세요.
5. Supabase Authentication에서 Email provider 활성화, 공개 회원가입 비활성화
6. Authentication → Users에서 교사들을 초대합니다. 초대된 모든 교사는 같은 학생 명단과 기록을 공유합니다.
7. 이 폴더를 GitHub 저장소에 올리고 https://vercel.com 에서 Import Project
   - Framework: Other, Build Command: 비움, Output Directory: `.`
8. 배포된 `https://....vercel.app` 주소를 Supabase Authentication → URL Configuration의 Site URL 및 Redirect URLs에 등록

## 현재 지원
- 학번·성별·성명 3개 열 엑셀 업로드
- 1·2학년 모두 성별 필터: 전체/남학생/여학생
- 기존 평가 항목 및 채점 로직, 엑셀 출력 양식 유지
- 명단/성별/측정 기록 클라우드 저장
- 다른 교사의 변경 실시간 반영
- 교사 이메일/비밀번호 로그인 및 로그아웃

## 운영 전 확인
- 이 버전은 **한 학교 공동 작업공간** 전용입니다. 다른 학교가 같은 프로젝트에 로그인하면 데이터가 분리되지 않습니다.
- 명단 업로드는 기존 학번을 갱신하고, 업로드 파일에 없는 기존 학생을 자동 삭제하지 않습니다.
- 실제 학생 개인정보를 올리기 전 학교의 개인정보 처리·보관·외부 클라우드 사용 승인 절차를 확인하세요.
- Supabase 백업/내보내기 정책을 별도로 설정하세요.
- 아직 실제 Supabase 프로젝트 생성, 교사 초대, Vercel 배포는 실행되지 않았습니다. 이 작업에는 소유자 계정의 권한이 필요합니다.
