-- Supabase SQL Editor에서 전체 실행
-- Netlify Function만 service_role 키로 DB에 접근합니다.
-- 브라우저에는 데이터베이스 비밀 키를 절대 넣지 않습니다.

create table if not exists public.students (
  student_id text primary key,
  name text not null,
  grade integer,
  class_no integer,
  student_no integer,
  gender text check (gender in ('남','여') or gender is null),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_records (
  student_id text not null references public.students(student_id) on delete cascade,
  event_name text not null,
  raw_value text,
  updated_at timestamptz not null default now(),
  primary key (student_id, event_name)
);

alter table public.students enable row level security;
alter table public.assessment_records enable row level security;

-- 브라우저의 anon/authenticated 역할에는 권한을 주지 않습니다.
revoke all on public.students from anon, authenticated;
revoke all on public.assessment_records from anon, authenticated;
grant all on public.students to service_role;
grant all on public.assessment_records to service_role;
