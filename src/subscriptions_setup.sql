/*
  ============================================================================
    Fixpick - "항목 추가" 값을 Supabase 에 로그인 유저별로 저장하기 위한 설정 SQL

    하는 일   : 기존 "subscriptions" 테이블을 앱에 맞게 다듬어요 (새 테이블은 만들지 않아요)
               1) categories 시드 — 항목 추가 창의 카테고리 9종 (있으면 건너뜀)
               2) categories 읽기 권한 — 앱이 카테고리 key ↔ id 를 알 수 있게
               3) subscriptions 새 컬럼 6개 추가
                    payment_month, weekday, every, unit, pay_method, remind
               4) subscriptions 제약 두 개 바꾸기
                    · cycle: '매일/매주/매달/매년/사용자화' 허용 (원래는 매월/분기/반기/매년)
                    · payment_day: null 허용 (매주·매일 결제는 결제일이 없어요)
               5) RLS 정책 — 로그인한 사람은 자기 항목만 읽고/고치고/지울 수 있어요
               6) 항목 id 를 1,000,000 부터 (예시 데이터 id 1~18 과 겹치지 않게)
  ============================================================================
*/

-- ############################################################################
-- 1. categories 시드 — 항목 추가 창의 9개 카테고리
--    이름은 src/constants/addItem.js 의 ADD_CATEGORIES 와 같아야 해요
--    (프론트는 이름으로 key 를 찾으므로 순서는 상관없어요)
-- ############################################################################
insert into public.categories (name, example, icon, color)
select v.name, v.example, v.icon, v.color
from (values
  ('주거',          '월세·관리비·공과금',      'Building2',      '#154A7D'),
  ('통신',          '휴대폰·인터넷·IPTV',      'Smartphone',     '#0A6480'),
  ('구독 서비스',    'OTT·음악·웹툰',           'CirclePlay',     '#9E2152'),
  ('가전',          '정수기·안마의자·건조기',   'WashingMachine', '#0C6B5E'),
  ('보험',          '실손·자동차·운전자',       'ShieldCheck',    '#5B3FC4'),
  ('금융/저축',     '적금·청약·대출이자',       'PiggyBank',      '#5E5300'),
  ('교통',          '교통카드·주차',            'BusFront',       '#A04508'),
  ('자동차',        '할부·유류비·주차비',       'CarFront',       '#536579'),
  ('기타',          '모임 회비·학원비·경조사비', 'Shapes',         '#4E433C')
) as v(name, example, icon, color)
where not exists (select 1 from public.categories c where c.name = v.name);

-- ############################################################################
-- 2. categories 읽기 권한 — 앱이 공유해서 쓰는 테이블이라 로그인 없이도 읽어요
-- ############################################################################
drop policy if exists "categories_select_all" on public.categories;
create policy "categories_select_all" on public.categories
  for select using (true);

-- ############################################################################
-- 3. subscriptions 제약 두 개 바꾸기
-- ############################################################################

-- 3-1. 결제 주기 제약: 앱은 매일/매주/매달/매년/사용자화 를 골라요
--      (제약 이름이 프로젝트마다 다를 수 있어서 cycle 컬럼의 check 를 모두 지우고 새로 걸어요)
do $$
declare c record;
begin
  for c in
    select conname from pg_constraint
     where conrelid = 'public.subscriptions'::regclass
       and contype = 'c'
       and pg_get_expr(conbin, conrelid) like '%cycle%'
  loop
    execute format('alter table public.subscriptions drop constraint %I', c.conname);
  end loop;
end $$;

alter table public.subscriptions add constraint subscriptions_cycle_check
  check (cycle in ('매일', '매주', '매달', '매년', '사용자화', '매월', '분기', '반기'));

-- 3-2. 매일·매주 결제는 "며칠"이 없으므로 비워 둘 수 있게
alter table public.subscriptions alter column payment_day drop not null;

-- ############################################################################
-- 4. subscriptions 새 컬럼 6개 (이미 있으면 건너뜀)
--   payment_month: 매년 결제 월 (1~12)
--   weekday      : 매주 결제 요일 (0=일 ~ 6=토)
--   every / unit : "사용자화" 반복 (예: 2개월마다 → every=2, unit='month')
--   pay_method   : 결제 수단 이름 문자열 (국민카드, 카카오뱅크 ...)
--   remind       : 결제 알림 받기 토글
-- ############################################################################
alter table public.subscriptions add column if not exists payment_month smallint
  check (payment_month is null or payment_month between 1 and 12);
alter table public.subscriptions add column if not exists weekday smallint
  check (weekday is null or weekday between 0 and 6);
alter table public.subscriptions add column if not exists every smallint;
alter table public.subscriptions add column if not exists unit text
  check (unit is null or unit in ('day', 'week', 'month', 'year'));
alter table public.subscriptions add column if not exists pay_method text;
alter table public.subscriptions add column if not exists remind boolean not null default true;

-- ############################################################################
-- 5. RLS 정책 — 로그인한 사람은 자기 항목만 읽고/고치고/지울 수 있어요
--    (enable row level security 만 되어 있으면 정책이 없는 테이블은 아무도 못 써요)
-- ############################################################################
drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own" on public.subscriptions
  for select using (auth.uid() = user_id);

drop policy if exists "subscriptions_insert_own" on public.subscriptions;
create policy "subscriptions_insert_own" on public.subscriptions
  for insert with check (auth.uid() = user_id);

drop policy if exists "subscriptions_update_own" on public.subscriptions;
create policy "subscriptions_update_own" on public.subscriptions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "subscriptions_delete_own" on public.subscriptions;
create policy "subscriptions_delete_own" on public.subscriptions
  for delete using (auth.uid() = user_id);

-- ############################################################################
-- 6. 항목 id 를 1,000,000 부터 발급
--    목록 페이지의 예시 데이터(expenses.js)가 id 1~18 을 쓰기 때문에 겹치면 안 돼요
-- ############################################################################
select setval(
  pg_get_serial_sequence('public.subscriptions', 'id'),
  greatest(1000000, coalesce((select max(id) from public.subscriptions), 0) + 1),
  false
);
