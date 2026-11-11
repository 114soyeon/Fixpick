/*
  ============================================================================
    고정콕(Fixpick) - 신규 페이지용 테이블 정의 (table.sql)
  ============================================================================
    DBMS      : PostgreSQL (Supabase 호환)
    작성 대상 : router.jsx 에 등록된 신규 화면 5종 + 인증 화면 2종

    ■ 대상 화면과 코드 위치
      - 회원가입 화면        (미구현, src/router.jsx 에 라우트 추가 예정)
      - 로그인 화면          (미구현)
      - 대시보드              src/pages/Dashboard.jsx
      - 내 고정지출(상세)     src/pages/Fix.jsx
      - 결제 캘린더           src/pages/Calendar.jsx
      - 지출 리포트           src/pages/Report.jsx
      - 설정                  src/pages/Setting.jsx

    ■ 테이블 → 화면 매핑 요약
      users                  회원가입(이름/휴대폰/이메일/비밀번호), 로그인(이메일·소셜),
                             대시보드 "00님", 설정 프로필 카드
      user_agreements        회원가입 약관 체크박스 3개(필수 2 + 선택 1)
      user_sessions          로그인 "로그인 상태 유지" 체크 (세션/토큰 관리)
      user_settings          설정 > 알림 카드 전체(결제일 알림·알림 시간·예산/큰지출/만기 알림)
      categories             대시보드 카테고리 범례, 내 고정지출 카테고리 목록, 리포트 도넛 차트
      payment_methods        설정 > 결제 수단 카드(국민카드·신한체크카드·카카오뱅크)
      subscriptions          내 고정지출 목록/상세, 대시보드 합계·건수, 결제 캘린더, D-day
      subscription_amount_history  상세 > 금액 변화 차트(2024/2025/2026 막대)
      payments               결제 캘린더 날짜 표시, 납부 현황, 월별 지출 차트, 리포트 비교표
      budgets                설정 > 예산 카드, 대시보드 "이번 달 예산" 사용률
      savings                리포트 > "자동으로 빠지는 저축" 카드(월 이체액·적금 만기)
      notifications          사이드바 종 아이콘 뱃지(안 읽은 개수), 결제 D-day 알림
      report_notes           리포트 > 지난달과 비교표의 "내용" 칸("전기·가스 요금이 줄었어요")

    ■ SQL 키워드 해설
      primary key  : 테이블마다 고유 번호(중복·재사용 불가)
      not null     : 반드시 값을 넣어야 저장됨
      unique       : 다른 행과 중복될 수 없음
      default      : 값을 안 넣으면 자동으로 정해진 값이 채워짐
      check        : 지정한 조건을 만족해야만 저장됨
      references   : 다른 테이블의 id를 가리킴(외래키)
      on delete    : 부모 행이 지워질 때 자식 행을 어떻게 처리할지
                     cascade = 같이 지움 / set null = 연결만 끊음
      generated always as identity : 자동 증가 번호
      timestamptz  : 시각(시간대 포함)
      enable row level security : 행 수준 보안 켜기(로그인한 회원이 자기 데이터만 읽게 함)
  ============================================================================
*/

-- ############################################################################
-- 1. users - 회원 정보
--    화면 근거:
--      · 회원가입 화면의 "이름 / 휴대폰 번호 / 이메일 / 비밀번호 / 비밀번호 확인"
--        (예시 placeholder: "예) 김민지", "010-1234-5678", "example@email.com",
--         "8자 이상, 영문 · 숫자 섞어서")
--      · 로그인 화면의 "이메일 / 비밀번호" 입력값 = email, password
--      · 로그인 화면의 소셜 버튼 "카카오 / 네이버 / 구글" = provider, provider_user_id
--      · 대시보드 상단 "00님, 11월 구독 현황이에요" = name
--      · 설정 프로필 카드 "소연님 / example@email.com" = name, email
-- ############################################################################
create table users (
  id uuid primary key references auth.users(id) on delete cascade,   -- users id
  name text not null,                                                -- 회원 이름
  phone text not null unique,                                        -- 휴대폰 번호(중복 가입 방지를 위해 unique)
  is_active boolean not null default true,                           -- [설정 > 계정 > 회원 탈퇴] 실제로 행을 지우지 않고 끄기만 하기(재가입 이력 보존용)
  is_alarm boolean not null default false                            -- [선택] 혜택, 이벤트 알림 받기
);
alter table users enable row level security;

-- ############################################################################
-- 2. user_settings - 회원별 알림 설정
--    화면 근거: [설정 화면] 좌측 "알림" 카드 ("결제일 전에 미리 알려드려요")
--      · "결제일 알림"            토글        -> payment_alert_enabled
--      · "언제 알려드릴까요?"     버튼 그룹 당일/1일 전/3일 전/7일 전
--                                      -> payment_alert_days_before (0/1/3/7)
--      · "알림 시간"              버튼 그룹 오전 9시/낮 12시/저녁 8시
--                                      -> payment_alert_time ('09:00'/'12:00'/'20:00')
--      · "예산 초과 알림"         토글        -> budget_alert_enabled
--        (설명문 "월 예산의 90%를 넘으면 알려드려요" -> budget_alert_rate)
--      · "큰 지출 알림"           토글        -> large_expense_alert_enabled
--        (설명문 "한 번에 10만 원 넘게 나가는 결제" -> large_expense_threshold)
--      · "약정·만기 알림"         토글        -> expiry_alert_enabled
-- ############################################################################
create table user_settings (
  user_id uuid not null unique                                        -- 한 회원이 한 줄만 갖도록 user_id 를 고유 키로 사용
               references users(id) on delete cascade,
  payment_alert_enabled boolean not null default true,                -- [결제일 알림] 켜기/끄기 토글 (설정 화면 파란 스위치)
  payment_alert_time text not null default '09:00'                    -- [알림 시간] 발송 시각. 화면 선택지 3개만 허용
                     check (payment_alert_time in ('09:00', '12:00', '20:00')),
  budget_alert_enabled boolean not null default true,                 -- [예산 초과 알림] 토글
  budget_alert_rate integer not null default 90                       -- 예산의 몇 % 를 넘으면 보낼지 (화면 문구 기준 90%)
                    check (budget_alert_rate between 1 and 100),
  large_expense_alert_enabled boolean not null default true,          -- [큰 지출 알림] 토글
  large_expense_threshold integer not null default 100000             -- [큰 지출 알림] 기준 금액. 화면 문구 "한 번에 10만 원 넘게 나가는 결제"
                          check (large_expense_threshold >= 0),
  expiry_alert_enabled boolean not null default true                  -- [약정·만기 알림] 토글. 설명문 "통신·가전 약정, 보험·적금 만기 한 달 전에"
);
alter table user_settings enable row level security;

-- ############################################################################
-- 3. categories - 고정지출 카테고리
--    화면 근거:
--      · [대시보드] "카테고리별 구성" 범례: 주거·통신·구독 서비스·가전·보험·금융/저축·교통
--      · [대시보드] "내 고정지출" 각 행: 아이콘 + 이름 + 설명(예: 월세·관리비·공과금)
--        + 건수(4건) + 금액(486,400원)
--      · [대시보드] "+ 카테고리 추가" 버튼 -> user_id 가 있는 사용자 정의 카테고리 생성
--      · [지출 리포트] 도넛 차트 범례와 "지난달과 비교" 표의 행 이름
-- ############################################################################
create table categories (
  id bigint generated always as identity primary key,
  name text not null,                                                 -- 카테고리 이름 (주거, 통신, 구독 서비스, 가전, 보험, 금융/저축, 교통 ...)
  example text,                                                       -- 이름 옆의 작은 설명 (예: "월세·관리비·공과금", "휴대폰·인터넷·IPTV")
  icon text,                                                          -- 아이콘 키 (home, phone, play, washer ...). 프론트에서 이미지로 매핑
  color text                                                          -- 차트/범례 색상 (대시보드 스택 바, 리포트 도넛, 비교표 점 색)
);
alter table categories enable row level security;

-- ############################################################################
-- 4. payment_categories - 카드 / 계좌 ->  카드사, 계좌 해당 아이콘 
-- ############################################################################
create table payment_categories (
  id bigint generated always as identity primary key,
  type text not null default '카드'                                   -- 카드인지 계좌(이체)인지. 화면 문구 "카드 ••••" / "계좌 ••••" 구분
       check (type in ('카드', '계좌')),
  icon text not null,
  name text not null                                                  -- 결제 수단 이름 (국민카드, 신한 체크카드, 카카오뱅크 ...)
);

-- ############################################################################
-- 5. payment_methods - 결제 수단 (카드 / 계좌)
--    화면 근거: [설정 화면] 우측 "결제 수단" 카드
--      · "고정지출이 빠져나가는 카드·계좌" 안내문
--      · 목록 한 줄 예시: "국민카드 [기본] / 카드 •••• 1234 · 고정지출 8건"
--                        "신한 체크카드 / 카드 •••• 5678 · 고정지출 6건"
--                        "카카오뱅크 / 계좌 •••• 9012 · 고정지출 7건"
--      · "+ 결제 수단 추가" 버튼
--      · [내 고정지출 상세] "결제 수단: 신용카드 ···· 1234"
-- ############################################################################
create table payment_methods (
  id bigint generated always as identity primary key,
  user_id uuid not null                                               -- 어느 회원의 카드/계좌인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  payment_id bigint not null references payment_categories(id),
  last4 text not null                                                 -- 카드/계좌 뒷 4자리. 화면의 "•••• 1234" 표시용
        check (last4 ~ '^[0-9]{4}$'),                                 -- 숫자 4자리만 저장(전체 번호는 저장하지 않는다 - 보안)
  created_at  timestamptz not null default now()
);
alter table payment_methods enable row level security;

-- ############################################################################
-- 6. subscriptions - 고정지출 항목 (핵심 테이블)
--    화면 근거:
--      · [대시보드] "내 고정지출" 각 행: 카테고리 아이콘/이름/설명 + 건수 + 금액
--        ("주거 월세·관리비·공과금 4건 486,400원" ... 총 21건 1,217,690원)
--        -> 이 테이블을 카테고리별로 group by 해서 계산
--      · [대시보드] 우측 "결제 예정" 카드: "넷플릭스 14,500원 / 가족 3명 분담 예정 D-5"
--        -> name, amount, memo(분담 메모), payments.due_date 로 D-day 계산
--      · [결제 캘린더] 날짜 칸의 항목 이름 ("넷플릭스", "월세", "적금" ...)
--      · [내 고정지출 상세] 페이지 전체:
--          큰 제목 "자동차보험" [보험] [큰 지출]      -> name, category_id, is_large_expense
--          "다음 결제일 · 2027년 3월 4일" D-122       -> payments.due_date 로 계산
--          "720,000 원"                              -> amount
--          "1년에 한 번 결제 · 월로 나누면 60,000원"  -> cycle 으로 계산(파생값)
--          결제 정보: 주기 "매년"                     -> cycle
--                     금액 유형 "고정"                -> amount_type
--                     결제 수단 "신용카드 ···· 1234"   -> payment_method_id
--                     시작일 "2024년 3월 4일"          -> start_date
--                     다음 결제일                     -> payments 로 계산
--                     만기일 "2027년 3월 3일"          -> expiry_date
--          알림: "결제 30일 전" / "만기 30일 전" 토글  -> payment/expiry_alert_enabled
--          메모: "갱신 전에 다른 보험사 견적 비교하기"  -> memo
--          [수정] [삭제] 버튼                         -> update / delete
-- ############################################################################ 
create table subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null                                             -- 어느 회원의 항목인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  category_id bigint not null                                       -- 어느 카테고리인지. 대시보드 "카테고리별 구성", 리포트 도넛 차트가 여기를 group by
              references categories(id),
  name text not null,                                               -- 항목 이름(예: 넷플릭스, 월세, 적금). 대시보드 캘린더/다가오는 결제 카드, 리포트 비교표에 표시
  amount integer not null check (amount >= 0),                      -- 매달(결제 주기마다) 나가는 금액(원). 음수 금지(대시보드 총합 "1,217,690원", 카테고리 금액 "486,400원" 은 이 값의 합)
  cycle text not null default '매월'                                 -- [상세 > 결제 정보 > 주기] "매일/매주/매달/매년/사용자화" 등
        check (cycle in ('매일', '매주', '매달', '매년', '사용자화 ')), -- ("1년에 한 번 결제 · 월로 나누면 60,000원" 안내문은 cycle 값으로 문구를 만든다)
  amount_type text not null default '고정'                           -- [상세 > 결제 정보 > 금액 유형] "고정"
        check (amount_type in ('고정', '변동')),                      -- "변동"(변동 금액(전기요금처럼 매달 다른 금액)은 payments.amount 에 실제액을 남긴다)
  payment_day integer not null default 1                             -- 결제일: 매월 몇일에 나가는지 (대시보드 캘린더 날짜 배치, D-day 계산에 사용)
             check (payment_day between 1 and 31),                   -- 31일 없는 달에는 그달 마지막 날로 결제하도록 앱에서 보정한다
  payment_method_id bigint                                           -- [상세 > 결제 정보 > 결제 수단] "신용카드 ···· 1234"
                    references payment_methods(id) on delete set null,    -- 카드를 삭제해도 과거 결제 기록은 남도록 set null
  start_date date not null,                                          -- [상세 > 결제 정보 > 시작일] "2024년 3월 4일"
  expiry_date date,                                                  -- [상세 > 결제 정보 > 만기일] "2027년 3월 3일"("만기까지 121일" 진행바와 [약정·만기 알림] 에서 사용. 없으면 비워 둠)
  payment_alert_days integer not null default 3 check (payment_alert_days in (30, 7, 3, 1)),    -- [상세 > 알림] "결제 30일 전" 토글 (회원 기본값 user_settings 를 덮어쓸 수 있음)
  expiry_alert_days integer not null default 3 check (payment_alert_days in (30, 7, 3, 1)),  -- [상세 > 알림] "만기 30일 전" 토글
  memo text,                                                         -- [다가오는 결제 카드] 두 번째 줄 메모(예: "개인 결제·국민카드"), [상세] 좌측 하단 "메모" 상자와도 공용으로 사용
  is_active boolean not null default true,                           -- 항목을 숨김/삭제하는 대신 끄기(과거 payments 이력 보존용), -- 중도 해지/정지 상태면 집계에서 뺀다
  created_at timestamptz not null default now()
);
alter table subscriptions enable row level security;

create index subscriptions_user_id_idx      on subscriptions (user_id);
create index subscriptions_category_id_idx  on subscriptions (category_id);

-- ############################################################################
-- 7. payments - 결제 예정/완료 기록 (달력·차트의 원본 데이터)
--    화면 근거:
--      · [결제 캘린더] 각 날짜 칸의 항목 뱃지 + 바텀 "결제 예정 / 납부 완료" 범례
--      · [결제 캘린더] 우측 상단 "11월에 남은 결제 1,279,690원 · 14건 · 적금 포함"
--      · [결제 캘린더] "11월 납부 현황 1 / 15건"
--          납부 완료 62,000원 / 남은 결제 1,279,690원 / 이번 달 전체 1,341,690원
--      · [결제 캘린더] 특정일 패널 "11월 25일 3건 · 859,900원" (월세/밀리의서재/적금)
--      · [대시보드] 우측 결제일 달력 + "다가오는 결제" D-5 / D-7 / D-10 카드
--      · [대시보드] "월별 지출" 막대 차트(최근 6개월), "10월보다 7,810원 줄었어요"
--      · [지출 리포트] "최근 6개월 흐름" 꺾은선, "지난달과 비교" 표의 10월/11월 금액
-- ############################################################################
create table payments (
  id bigint generated always as identity primary key,
  user_id uuid not null                                       -- 어느 회원의 예산인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  subscription_id bigint not null                             -- 어느 항목의 결제인지. 항목 삭제 시 기록도 삭제
                  references subscriptions(id) on delete cascade,
  due_date date not null,                                     -- 결제 예정일 (예: 2026-11-10). 달력에 이 날짜로 표시된다
  amount integer not null check (amount >= 0),                -- 그 회차에 실제 나간(또는 나갈) 금액(subscriptions.amount_type = '변동' 일 때는 이 값이 매달 다르다)
  unique (subscription_id, due_date)                          -- 같은 항목을 같은 날짜에 두 번 기록하지 않기
);
alter table payments enable row level security;

-- 달력/대시보드는 "특정 월의 결제"를 자주 조회하므로 인덱스를 둔다
create index payments_due_date_idx on payments (due_date);
create index payments_user_idx on payments(user_id);

-- ############################################################################
-- 8. notifications - 알림 (사이드바 종 아이콘)
--     화면 근거:
--       · [모든 화면] 사이드바 하단 종 아이콘의 노란 뱃지 숫자 "2" = 안 읽은 알림 수
--       · 알림 내용 예시: "넷플릭스 결제 D-3 / 11월 10일 14,500원이 나갑니다"
--         "예산의 90%를 넘었어요" / "자동차보험 만기 30일 전"
-- ############################################################################
create table notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null                                       -- 어느 회원에게 보낼 알림인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  subscription_id bigint                                      -- 어떤 항목 때문인지. 항목이 삭제돼도 알림 자체는 남도록 set null
                  references subscriptions(id) on delete set null,
  title text not null,                                        -- 알림 제목 (예: "넷플릭스 결제 D-3", "예산 90% 초과")
  body text,                                                  -- 알림 본문 (예: "11월 10일 14,500원이 나갑니다"). 없으면 비워 둠
  is_read boolean not null default false,                     -- 읽었는지. 안 읽은 개수를 세서 종 뱃지 숫자로 표시한다
  created_at timestamptz not null default now()               -- 알림을 만든 시각 (최신순 정렬)
);
alter table notifications enable row level security;

-- 뱃지 숫자 = "내 회원의 안 읽은 알림 수" 를 자주 세므로 인덱스
create index notifications_user_read_idx on notifications (user_id, is_read);

-- ############################################################################
-- 9. budgets - 월별 예산
--     화면 근거:
--       · [설정] 우측 "예산" 카드: "한 달에 고정지출로 쓸 금액" 입력창 "1,300,000원"
--         + 프리셋 버튼 100만 / 130만(선택됨) / 150만 / 200만 + [저장]
--       · [대시보드] "이번 달 예산" 카드:
--           "예산 130만 원 중 94%를 써요" 진행바,
--           "1,217,690원 사용 / 82,310원 남음", [예산 조정하기] 버튼
--         -> 사용률 = 그달 payments 합계 ÷ amount, 남은 금액 = amount - 합계
-- ############################################################################
create table budgets (
  id bigint generated always as identity primary key,
  user_id uuid not null                                      -- 어느 회원의 예산인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  category_id bigint not null                                -- 어떤 카테고리에 대한 코멘트인지
      references categories(id) on delete cascade,
  subscription_id bigint                                     -- 어떤 항목 때문인지. 항목이 삭제돼도 알림 자체는 남도록 set null
                  references subscriptions(id) on delete set null,
  month date not null,                                       -- 예산을 잡은 달의 1일 (예: 2026-11-01). month 는 "달"을 나타내는 날짜로 통일
  amount integer not null check (amount >= 0),               -- 그 달의 예산 금액(원). 설정 화면 프리셋은 1,000,000 / 1,300,000 / 1,500,000 / 2,000,000
  note text,                                                 -- 화면에 표시할 한 줄 (예: "전기·가스 요금이 줄었어요"). 없으면 계산된 금액만 표시
  unique (user_id, month)                                    -- 한 회원·한 달에 예산은 하나만 (재설정하면 update)
);
alter table budgets enable row level security;


-- 기본 카테고리 9종 시드 데이터 (회원 가입과 무관하게 앱이 공유해서 씀)
insert into categories (name, example, icon, color) values
  ('주거', '월세·관리비·공과금', 'Building2', '#154A7D'),
  ('통신', '휴대폰·인터넷·IPTV', 'Smartphone', '#0A6480'),
  ('구독','OTT·음악·웹툰', 'CirclePlay', '#9E2152'),
  ('가전 구독', '정수기·안마의자·건조기','WashingMachine','#0C6B5E'),
  ('보험', '실손·자동차·운전자', 'ShieldCheck', '#5B3FC4'),
  ('금융·저축', '적금·청약·대출이자', 'PiggyBank', '#5E5300'),
  ('교통', '교통카드·주차', 'BusFront', ' #A04508'),
  ('자동차', '교통카드·주차', 'CarFront', '#536579'),
  ('기타', '교통카드·주차', 'Shapes', '#4E433C'),

insert into payment_categories (type, icon, name) values
  ('계좌', '기업은행icon/image', '기업은행'),
  ('계좌', '국민은행icon/image', '국민은행'),
  ('계좌', '우리은행icon/image', '우리은행'),
  ('계좌', 'NH농협은행icon/image', 'NH농협은행'),
  ('계좌', '부산은행icon/image', '부산은행'),
  ('계좌', '신한은행icon/image', '신한은행'),
  ('계좌', '하나은행icon/image', '하나은행'),
  ('계좌', '광주은행icon/image', '광주은행'),
  ('계좌', '우체국icon/image', '우체국'),
  ('계좌', '대구은행icon/image', '대구은행'),
  ('계좌', '경남은행icon/image', '경남은행'),
  ('카드', 'KB카드icon/image', 'KB카드');
  ('카드', '신한카드icon/image', '신한카드');
  ('카드', '현대카드icon/image', '현대카드');
  ('카드', '삼성카드icon/image', '삼성카드');
  ('카드', 'NH카드icon/image', 'NH카드');
  ('카드', '카카오뱅크icon/image', '카카오뱅크');
  ('카드', 'BC카드icon/image', 'BC카드');
  ('카드', '하나카드icon/image', '하나카드');
  ('카드', '우리카드icon/image', '우리카드');
  ('카드', '롯데카드icon/image', '롯데카드');
  ('카드', '씨티카드icon/image', '씨티카드');
  ('카드', '광주비자icon/image', '광주비자');
  ('카드', '전북카드icon/image', '전북카드');
  ('카드', '수협카드icon/image', '수협카드');
  ('카드', '신협카드icon/image', '신협카드');
  