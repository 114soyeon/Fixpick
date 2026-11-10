/*
  ============================================================================
    Fixpick - 회원가입·로그인을 Supabase에 저장하기 위한 설정 SQL

    실행 방법 : Supabase 대시보드 → SQL Editor → New query → 아래 전체 붙여넣기 → Run
    하는 일   : 1) users 테이블 만들기 (이름·휴대폰·isActive)
               2) RLS 정책      — 로그인한 사람은 자기 줄만 읽고 쓸 수 있어요
               3) email_exists  — "이미 가입된 이메일?" 확인 (로그인·회원가입 화면)
               4) find_accounts — 이름 + 휴대폰으로 가입 이메일 찾기 (아이디 찾기)
               5) delete_account— 회원 탈퇴 (계정과 관련 데이터를 함께 삭제)

    전제 : Supabase 대시보드 → Authentication → Sign In / Providers(Email)
           에서 "Confirm email"(이메일 확인)을 OFF 로 둡니다.
           → 가입하면 바로 로그인되고, 중복 가입도 바로 알 수 있어요.

    ※ 이 파일만 실행하면 돼요. table_after.sql 전체를 실행할 필요는 없어요.
       (table_after.sql을 이미 실행했다면 users 테이블은 건너뛰고 나머지만 적용돼요)
  ============================================================================
*/

-- ############################################################################
-- 1. users - 회원 정보 (auth.users 와 id 로 연결)
-- ############################################################################
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade, -- Supabase Auth 사용자 id
  name text not null,                                              -- 회원 이름 (대시보드 "00님")
  phone text not null unique,                                      -- 휴대폰 번호 (중복 가입 방지)
  is_active boolean not null default true,                         -- 탈퇴한 계정 표시
  is_alarm boolean not null default false                          -- [선택] 혜택·이벤트 알림
);

alter table public.users enable row level security;

-- ############################################################################
-- 2. RLS 정책 - 로그인한 사람은 자기 줄만 읽고/고치고/지울 수 있어요
-- ############################################################################
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_insert_own" on public.users;
create policy "users_insert_own" on public.users
  for insert with check (auth.uid() = id);

drop policy if exists "users_update_own" on public.users;
create policy "users_update_own" on public.users
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "users_delete_own" on public.users;
create policy "users_delete_own" on public.users
  for delete using (auth.uid() = id);

-- ############################################################################
-- 3. email_exists - 가입돼 있는 이메일인지 확인
--    (보안상 클라이언트는 다른 사람의 이메일을 조회할 수 없어서 서버 함수로 만듦)
-- ############################################################################
create or replace function public.email_exists(p_email text)
returns boolean
language sql
security definer          -- 함수 주인 권한으로 auth.users 를 읽어요
set search_path = public
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(p_email)
  );
$$;

revoke all on function public.email_exists(text) from public;
grant execute on function public.email_exists(text) to anon, authenticated;

-- ############################################################################
-- 4. find_accounts - 아이디 찾기: 이름 + 휴대폰 번호로 가입 이메일 알려주기
--    ⚠️ 연습용이에요. 실서비스에서는 문자 인증 등 본인 확인을 거친 뒤 제공해야 해요.
-- ############################################################################
create or replace function public.find_accounts(p_name text, p_phone text)
returns table (email text, created_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select u.email::text as email,
         u.created_at
  from public.users pu
  join auth.users u on u.id = pu.id
  where pu.is_active
    and pu.name = trim(coalesce(p_name, ''))
    and regexp_replace(pu.phone, '\D', '', 'g') = regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')
  limit 5;
$$;

revoke all on function public.find_accounts(text, text) from public;
grant execute on function public.find_accounts(text, text) to anon, authenticated;

-- ############################################################################
-- 5. delete_account - 회원 탈퇴: auth.users 를 지우면 users 와 그 아래 데이터가
--    (subscriptions, payments, budgets ...) on delete cascade 로 함께 지워져요
-- ############################################################################
create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception '로그인한 상태에서만 탈퇴할 수 있어요.';
  end if;
  delete from auth.users where id = auth.uid();
  -- 위 방법이 막히면 이 줄로 바꿔 보세요: perform auth.admin.delete_user(auth.uid());
end;
$$;

revoke all on function public.delete_account() from public;
grant execute on function public.delete_account() to authenticated;
