-- Supabase SQL Editor에서 전체 실행
-- 이 데이터베이스는 한 학교의 초대된 교사들이 함께 사용하는 공유 공간입니다.
create table if not exists public.students (
 student_id text primary key, name text not null, grade integer, class_no integer,
 student_no integer, gender text check (gender in ('남','여') or gender is null),
 updated_at timestamptz not null default now()
);
create table if not exists public.assessment_records (
 student_id text not null references public.students(student_id) on delete cascade,
 event_name text not null, raw_value text, updated_at timestamptz not null default now(),
 primary key(student_id,event_name)
);
alter table public.students enable row level security;
alter table public.assessment_records enable row level security;
drop policy if exists "authenticated shared students" on public.students;
create policy "authenticated shared students" on public.students for all to authenticated using (true) with check (true);
drop policy if exists "authenticated shared records" on public.assessment_records;
create policy "authenticated shared records" on public.assessment_records for all to authenticated using (true) with check (true);
do $$ begin alter publication supabase_realtime add table public.students; exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin alter publication supabase_realtime add table public.assessment_records; exception when duplicate_object then null; when undefined_object then null; end $$;

grant select, insert, update, delete on public.students to authenticated;
grant select, insert, update, delete on public.assessment_records to authenticated;
