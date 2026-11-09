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
  id bigint generated always as identity primary key,   -- users id
  name text not null,                                   -- 회원 이름
  phone text not null unique,             -- 휴대폰 번호(중복 가입 방지를 위해 unique)
  email text not null unique, -- 이메일(로그인 아이디이자 설정 프로필에 보여줄 주소라 unique)

  -- 소셜 로그인(카카오/네이버/구글)로만 가입한 회원은 비밀번호가 없을 수 있음 -> password 가 null 이면 provider 가 local 이 아니어야 함
  password text, -- 비밀번호 해시 값으로 저장(원문 저장 금지)
  provider text not null default 'local' check (provider in ('local', 'kakao', 'naver', 'google')), -- [로그인 > 간편 로그인] "카카오 / 네이버 / 구글" 버튼, 직접 가입이면 'local'
  provider_user_id  text,                                     -- 소셜(예: 카카오)이 주는 회원 고유 id(같은 소셜 계정으로 다시 로그인하면 이 값으로 기존 회원 찾기)
  is_active boolean not null default true,                    -- [설정 > 계정 > 회원 탈퇴] 실제로 행을 지우지 않고 끄기만 하기(재가입 이력 보존용)
  created_at timestamptz not null default now(),              -- 가입 시각(문서화용. 화면에 직접 표시되지는 않음)
  constraint users_provider_ck check (                        -- 소셜 로그인 회원은 provider_user_id 가 반드시 있어야 함
    (provider = 'local' and password is not null)
    or (provider <> 'local' and provider_user_id is not null)
  ),
  unique (provider, provider_user_id)                         -- 소셜 id 는 같은 제공자 안에서만 중복 금지
);
alter table users enable row level security;


-- ############################################################################
-- 2. user_agreements - 회원가입 약관 동의 내역
--    화면 근거: [회원가입 화면] 체크박스 3종
--      · "[필수] 서비스 이용약관 동의"        (보기 > 링크 있음)
--      · "[필수] 개인정보 수집·이용 동의"      (보기 > 링크 있음)
--      · "[선택] 혜택·이벤트 알림 받기"        (보기 > 링크 있음)
--      · 상단 "전체 동의하기" 체크박스 = 3개를 한 번에 선택(별도 저장은 안 함)
-- ############################################################################
create table user_agreements (
  id bigint generated always as identity primary key,
  user_id bigint not null                            -- 어느 회원의 동의인지. 회원이 지워지면 동의 내역도 함께 지워짐
          references users(id) on delete cascade,
  agreement_type text not null                       -- 위 체크박스 3개 중 하나. 값 종류를 check 로 제한해 오타 입력을 막는다
                 check (agreement_type in ('서비스 이용약관', '개인정보 수집·이용', '혜택·이벤트 알림')),
  required boolean not null,                         -- 필수 동의인지(약관·개인정보 = true, 혜택·이벤트 = false), 필수,"[선택]" 라벨에 대응
  agreed boolean not null default false,             -- 실제로 체크했는지 (처음에는 false, 체크하면 true)
  agreed_at timestamptz,                             -- 동의한 시각(나중에 "언제 동의했나" 확인용)
  unique (user_id, agreement_type)                   -- 한 회원이 같은 약관을 중복 저장하지 않기
);
alter table user_agreements enable row level security;


-- ############################################################################
-- 3. user_sessions - 로그인 세션 (로그인 상태 유지)
--    화면 근거: [로그인 화면]
--      · "로그인 상태 유지" 체크박스 (체크 시 오래 유지되는 세션 발급)
--      · "비밀번호를 잊으셨나요?" 링크 (비밀번호 재설정 토큰도 여기에 저장)
--    ※ 접속 로그/보안 감사용이라 화면에 직접 그려지지는 않는 테이블
-- ############################################################################
create table user_sessions (
  id bigint generated always as identity primary key,
  user_id bigint not null                           -- 세션의 주인(회원 탈퇴 시 삭제)
          references users(id) on delete cascade,   
  token text not null unique,                       -- 세션/리프레시 토큰 값 (쿠키에 싣는 난수 문자열)
  expires_at timestamptz not null,                  -- [로그인 > 로그인 상태 유지] 체크 ON = 30일, OFF = 1일 등으로 만료 시각을 다르게 잡는다
  last_seen_at timestamptz not null default now(),  -- 마지막으로 접속한 시각 (보안 점검·"최근 접속" 표시용)
  user_agent text,                                  -- 접속 기기/브라우저 정보 (UA 문자열, 로그아웃 기기 구분용)
  created_at timestamptz not null default now()
);
alter table user_sessions enable row level security;
create index user_sessions_user_id_idx on user_sessions (user_id);


-- ############################################################################
-- 4. user_settings - 회원별 알림 설정
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
  user_id bigint not null unique                          -- 한 회원이 한 줄만 갖도록 user_id 를 고유 키로 사용
          references users(id) on delete cascade,
  payment_alert_enabled boolean not null default true,    -- [결제일 알림] 켜기/끄기 토글 (설정 화면 파란 스위치)
  -- 
  payment_alert_days_before integer not null default 3    -- [언제 알려드릴까요?] 결제일 기준 며칠 전에 보낼지(users.alert_days_before와 같은 역할)
                            check (payment_alert_days_before in (0, 1, 3, 7)),
  payment_alert_time text not null default '09:00'        -- [알림 시간] 발송 시각. 화면 선택지 3개만 허용
                     check (payment_alert_time in ('09:00', '12:00', '20:00')),
  budget_alert_enabled boolean not null default true,     -- [예산 초과 알림] 토글
  budget_alert_rate integer not null default 90           -- 예산의 몇 % 를 넘으면 보낼지 (화면 문구 기준 90%)
                    check (budget_alert_rate between 1 and 100),
  large_expense_alert_enabled boolean not null default true,    -- [큰 지출 알림] 토글
  large_expense_threshold integer not null default 100000   -- [큰 지출 알림] 기준 금액. 화면 문구 "한 번에 10만 원 넘게 나가는 결제"
                          check (large_expense_threshold >= 0),
  expiry_alert_enabled boolean not null default true        -- [약정·만기 알림] 토글. 설명문 "통신·가전 약정, 보험·적금 만기 한 달 전에"
);
alter table user_settings enable row level security;


-- ############################################################################
-- 5. categories - 고정지출 카테고리
--    화면 근거:
--      · [대시보드] "카테고리별 구성" 범례: 주거·통신·구독 서비스·가전·보험·금융/저축·교통
--      · [대시보드] "내 고정지출" 각 행: 아이콘 + 이름 + 설명(예: 월세·관리비·공과금)
--        + 건수(4건) + 금액(486,400원)
--      · [대시보드] "+ 카테고리 추가" 버튼 -> user_id 가 있는 사용자 정의 카테고리 생성
--      · [지출 리포트] 도넛 차트 범례와 "지난달과 비교" 표의 행 이름
-- ############################################################################
create table categories (
  id bigint generated always as identity primary key,
  user_id bigint references users(id) on delete cascade,   -- 비워 두면(app 제공 기본값) 이 컬럼은 null(값이 있으면 해당 회원이 직접 만든 카테고리 -> 유저가 직접 카테고리 만드는건 xx)
  name text not null,                      -- 카테고리 이름 (주거, 통신, 구독 서비스, 가전, 보험, 금융/저축, 교통 ...)
  example text,                            -- 이름 옆의 작은 설명 (예: "월세·관리비·공과금", "휴대폰·인터넷·IPTV")
  icon text,                               -- 아이콘 키 (home, phone, play, washer ...). 프론트에서 이미지로 매핑
  color text,                              -- 차트/범례 색상 (대시보드 스택 바, 리포트 도넛, 비교표 점 색)
  sort_order integer not null default 0,   -- 목록에 표시되는 순서 (대시보드 "내 고정지출" 정렬)
  unique (user_id, name)                   -- 한 회원이 같은 이름 카테고리를 두 번 만들지 않기
);
alter table categories enable row level security;

-- 기본 카테고리 7종 시드 데이터 (회원 가입과 무관하게 앱이 공유해서 씀)
-- user_id 가 null 인 행 = 앱 기본값 / 값이 있으면 사용자 추가분
insert into categories (user_id, name, example, icon, color, sort_order) values
  (null, '주거',       '월세·관리비·공과금',   'home',    '#4C7EF3', 1),
  (null, '통신',       '휴대폰·인터넷·IPTV',  'phone',   '#2DD4BF', 2),
  (null, '구독 서비스','OTT·음악·웹툰',       'play',    '#F472B6', 3),
  (null, '가전',       '정수기·안마의자·건조기','appliance','#22C55E', 4),
  (null, '보험',       '실손·자동차·운전자',   'shield',  '#A78BFA', 5),
  (null, '금융/저축',  '적금·청약·대출이자',  'wallet',  '#FBBF24', 6),
  (null, '교통',       '교통카드·주차',       'bus',     '#F87171', 7);


-- ############################################################################
-- 6. payment_methods - 결제 수단 (카드 / 계좌)
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
  user_id bigint not null                             -- 어느 회원의 카드/계좌인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,


  type text not null default '카드'                   -- 카드인지 계좌(이체)인지. 화면 문구 "카드 ••••" / "계좌 ••••" 구분
       check (type in ('카드', '계좌')),
  name text not null,                                 -- 결제 수단 이름 (국민카드, 신한 체크카드, 카카오뱅크 ...)
  last4 text not null                                 -- 카드/계좌 뒷 4자리. 화면의 "•••• 1234" 표시용
        check (last4 ~ '^[0-9]{4}$'),                 -- 숫자 4자리만 저장(전체 번호는 저장하지 않는다 - 보안)
  is_default  boolean not null default false,         -- [기본] 뱃지가 붙는 결제 수단 (신규 항목 등록 시 기본으로 선택됨)
  is_active   boolean not null default true,          -- [설정]에서 삭제하는 대신 끄기(이력 있는 항목이 가리키는 걸 보존)

  sort_order  integer not null default 0,             -- 목록 표시 순서
  created_at  timestamptz not null default now()
);
alter table payment_methods enable row level security;
create unique index payment_methods_one_default_uidx   -- 한 회원에게 "기본" 카드는 하나만 허용(partial unique: is_active = true 인 행에만 적용)
  on payment_methods (user_id) where is_default = true;


-- ############################################################################
-- 7. subscriptions - 고정지출 항목 (핵심 테이블)
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
  user_id bigint not null                             -- 어느 회원의 항목인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  category_id bigint not null                         -- 어느 카테고리인지. 대시보드 "카테고리별 구성", 리포트 도넛 차트가 여기를 group by
              references categories(id),
  name text not null,                                 -- 항목 이름(예: 넷플릭스, 월세, 적금). 대시보드 캘린더/다가오는 결제 카드, 리포트 비교표에 표시
  amount integer not null check (amount >= 0),        -- 매달(결제 주기마다) 나가는 금액(원). 음수 금지(대시보드 총합 "1,217,690원", 카테고리 금액 "486,400원" 은 이 값의 합)
  cycle text not null default '매월'                    -- [상세 > 결제 정보 > 주기] "매년"/ "매월" 등
        check (cycle in ('매월', '분기', '반기', '매년')),    -- ("1년에 한 번 결제 · 월로 나누면 60,000원" 안내문은 cycle 값으로 문구를 만든다)
  amount_type text not null default '고정'          -- [상세 > 결제 정보 > 금액 유형] "고정"
        check (amount_type in ('고정', '변동')),    -- "변동"(변동 금액(전기요금처럼 매달 다른 금액)은 payments.amount 에 실제액을 남긴다)
  payment_day integer not null default 1              -- 결제일: 매월 몇일에 나가는지 (대시보드 캘린더 날짜 배치, D-day 계산에 사용)
              check (payment_day between 1 and 31),   -- 31일 없는 달에는 그달 마지막 날로 결제하도록 앱에서 보정한다
  payment_method_id bigint                                                -- [상세 > 결제 정보 > 결제 수단] "신용카드 ···· 1234"
                    references payment_methods(id) on delete set null,    -- 카드를 삭제해도 과거 결제 기록은 남도록 set null
  start_date date not null,   -- [상세 > 결제 정보 > 시작일] "2024년 3월 4일"
  expiry_date date,   -- [상세 > 결제 정보 > 만기일] "2027년 3월 3일"("만기까지 121일" 진행바와 [약정·만기 알림] 에서 사용. 없으면 비워 둠)
  payment_alert_enabled boolean not null default true,   -- [상세 > 알림] "결제 30일 전" 토글 (회원 기본값 user_settings 를 덮어쓸 수 있음)
  expiry_alert_enabled boolean not null default false,   -- [상세 > 알림] "만기 30일 전" 토글
  is_large_expense boolean not null default false,       -- [상세] "큰 지출" 뱃지 -> 리포트/캘린더의 "큰 지출 미리 보기" 목록에 노출
  memo text,          -- [다가오는 결제 카드] 두 번째 줄 메모(예: "개인 결제·국민카드"), [상세] 좌측 하단 "메모" 상자와도 공용으로 사용
  is_active boolean not null default true,               -- 항목을 숨김/삭제하는 대신 끄기(과거 payments 이력 보존용)
  created_at timestamptz not null default now()
);
alter table subscriptions enable row level security;

create index subscriptions_user_id_idx      on subscriptions (user_id);
create index subscriptions_category_id_idx  on subscriptions (category_id);


-- ############################################################################
-- 8. subscription_amount_history - 항목별 금액 변경 이력
--    화면 근거: [내 고정지출 상세] 우측 "금액 변화" 막대 차트
--      예시: 자동차보험 2024년 68만 / 2025년 70만 / 2026년 72만
--    ※ 현재 amount(=subscriptions.amount)만으로는 과거 금액을 알 수 없어서
--      매년(금액이 바뀔 때) 한 줄씩 남긴다. 차트 x축은 연도, y축은 이 테이블의 amount
-- ############################################################################
create table subscription_amount_history (
  id bigint generated always as identity primary key,
  subscription_id bigint not null                      -- 어느 항목의 금액 이력인지. 항목 삭제 시 이력도 함께 삭제
                  references subscriptions(id) on delete cascade,
  effective_from date not null,                        -- 이 금액이 적용된 날 (연 단위 차트이므로 보통 1월 1일 또는 갱신일)                          
  amount integer not null check (amount >= 0),         -- 그 시점의 금액(원)
  unique (subscription_id, effective_from)             -- 같은 항목·같은 날짜에 중복 이력을 만들지 않기
);
alter table subscription_amount_history enable row level security;


-- ############################################################################
-- 9. payments - 결제 예정/완료 기록 (달력·차트의 원본 데이터)
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
  subscription_id bigint not null                        -- 어느 항목의 결제인지. 항목 삭제 시 기록도 삭제
                  references subscriptions(id) on delete cascade,
  due_date date not null,                                -- 결제 예정일 (예: 2026-11-10). 달력에 이 날짜로 표시된다
  amount integer not null check (amount >= 0),           -- 그 회차에 실제 나간(또는 나갈) 금액(subscriptions.amount_type = '변동' 일 때는 이 값이 매달 다르다)
  status text not null default '예정'                         -- 결제 상태. 달력 범례 "결제 예정(연한색) / 납부 완료(진한색)" 에 대응
         check (status in ('예정', '완료', '실패', '취소')),   --  예정 = 아직 안 나감, 완료 = 결제 성공, 실패 = 결제 실패, 취소 = 해지/환불
  paid_at timestamptz,                                        -- 실제로 결제된 시각. '예정' 이면 비워 둔다 (납부 완료 건에만 값이 생긴다)
  unique (subscription_id, due_date)                          -- 같은 항목을 같은 날짜에 두 번 기록하지 않기
);
alter table payments enable row level security;

-- 달력/대시보드는 "특정 월의 결제"를 자주 조회하므로 인덱스를 둔다
create index payments_due_date_idx on payments (due_date);
create index payments_status_idx   on payments (status);


-- ############################################################################
-- 10. budgets - 월별 예산
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
  user_id bigint not null                       -- 어느 회원의 예산인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  month date not null,                          -- 예산을 잡은 달의 1일 (예: 2026-11-01). month 는 "달"을 나타내는 날짜로 통일
  amount integer not null check (amount >= 0),  -- 그 달의 예산 금액(원). 설정 화면 프리셋은 1,000,000 / 1,300,000 / 1,500,000 / 2,000,000
  unique (user_id, month)                       -- 한 회원·한 달에 예산은 하나만 (재설정하면 update)
);
alter table budgets enable row level security;


-- ############################################################################
-- 11. savings - 자동 이체 저축(적금)
--     화면 근거: [지출 리포트] 상단 우측 3번째 카드
--         "자동으로 빠지는 저축 / 월 300,000원 / 적금 만기 2027년 6월"
--     ※ 지출(고정지출)과 구분해서 보여주기 위한 별도 테이블이다.
--       대시보드 "금융/저축 2건 300,000원" 처럼 카테고리로 집계할지,
--       아니면 이 테이블 값만 따로 보여줄지는 화면 정책에 따라 결정한다.
-- ############################################################################
create table savings (
  id bigint generated always as identity primary key,
  user_id bigint not null                               -- 어느 회원의 저축인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  name text not null,                                   -- 저축 이름 (예: "국민 자유적금", "청약통장")
  amount integer not null check (amount >= 0),          -- 매달 자동으로 빠지는 금액(원). 리포트 카드의 "월 300,000원"
  start_date date not null,                             -- 시작한 날
  maturity_date date,                                   -- 만기일. 리포트 카드의 "적금 만기 2027년 6월" (연-월만 표시)
  is_active boolean not null default true,              -- 중도 해지/정지 상태면 집계에서 뺀다
  created_at timestamptz not null default now()
);
alter table savings enable row level security;
create index savings_user_id_idx on savings (user_id);


-- ############################################################################
-- 12. notifications - 알림 (사이드바 종 아이콘)
--     화면 근거:
--       · [모든 화면] 사이드바 하단 종 아이콘의 노란 뱃지 숫자 "2" = 안 읽은 알림 수
--       · 알림 내용 예시: "넷플릭스 결제 D-3 / 11월 10일 14,500원이 나갑니다"
--         "예산의 90%를 넘었어요" / "자동차보험 만기 30일 전"
-- ############################################################################
create table notifications (
  id bigint generated always as identity primary key,
  user_id bigint not null                       -- 어느 회원에게 보낼 알림인지 (회원 탈퇴 시 삭제)
          references users(id) on delete cascade,
  subscription_id bigint                        -- 어떤 항목 때문인지. 항목이 삭제돼도 알림 자체는 남도록 set null
                  references subscriptions(id) on delete set null,
  title text not null,                          -- 알림 제목 (예: "넷플릭스 결제 D-3", "예산 90% 초과")
  body text,                                    -- 알림 본문 (예: "11월 10일 14,500원이 나갑니다"). 없으면 비워 둠
  is_read boolean not null default false,       -- 읽었는지. 안 읽은 개수를 세서 종 뱃지 숫자로 표시한다
  created_at timestamptz not null default now() -- 알림을 만든 시각 (최신순 정렬)
);
alter table notifications enable row level security;

-- 뱃지 숫자 = "내 회원의 안 읽은 알림 수" 를 자주 세므로 인덱스
create index notifications_user_read_idx on notifications (user_id, is_read);


-- ############################################################################
-- 13. report_notes - 월별 변동 코멘트
--     화면 근거: [지출 리포트] 하단 "지난달과 비교" 표의 "내용" 칸
--         주거      697,402원 -> 692,402원  -5,000원  "전기·가스 요금이 줄었어요"
--         기타      67,055원  -> 72,055원   +5,000원  "헬스장 요금이 올랐어요"
--         구독      65,229원  -> 57,419원   -7,810원  "왓챠 해지로 줄었어요"
--         금액(10월/11월/변화)은 payments 집계로 계산되지만,
--         사람이 읽는 한 줄 설명은 저장해 두는 편이 자연스러워서 별도 테이블로 분리
-- ############################################################################
create table report_notes (
  id bigint generated always as identity primary key,
  user_id bigint not null
          references users(id) on delete cascade,
  month date not null,                    -- 어느 달(=1일) 코멘트인지 (예: 2026-11-01)
  category_id bigint not null             -- 어떤 카테고리에 대한 코멘트인지
              references categories(id) on delete cascade,
  note text,                              -- 화면에 표시할 한 줄 (예: "전기·가스 요금이 줄었어요"). 없으면 계산된 금액만 표시
  unique (user_id, month, category_id)    -- 한 달·한 카테고리에 코멘트는 하나만
);
alter table report_notes enable row level security;


-- ############################################################################
--   [파생값 정리] 저장하지 않고 쿼리로 계산하는 화면 값
--     · 대시보드 "11월에 나갈 구독료 1,217,690원"
--         = payments (due_date 가 이번 달, status <> '취소') 의 amount 합계
--     · 대시보드 "10월보다 7,810원 줄었어요"
--         = 이번 달 합계 - 지난달 합계
--     · 대시보드/설정 "총 21건", "구독 서비스 5개", "고정지출 8건"
--         = subscriptions (is_active = true) 를 카테고리별로 count
--     · 캘린더 "D-5 / D-7 / D-122"
--         = payments.due_date - today (항목의 만기라면 expiry_date - today)
--     · 캘린더 "납부 완료 62,000원 / 남은 결제 1,279,690원"
--         = payments.status = '완료' 합계 / '예정' 합계
--     · 대시보드 "이번 달 예산 94% 사용 / 82,310원 남음"
--         = budgets.amount 대비 payments 합계 비율
--     · 상세 "1년에 한 번 결제 · 월로 나누면 60,000원"
--         = cycle('매년') 이면 amount ÷ 12
--     · 상세 "만기까지 121일" = expiry_date - today
--     · 리포트 "카테고리 비율 61.5% 692,402원"
--         = payments 합계를 categories 기준으로 group by 한 뒤 전체 대비 비율
-- ############################################################################
