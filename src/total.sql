/*
  ============================================================================
    Fixpick (고정콕) - Supabase 전체 테이블/컬럼 정리 문서 (total.sql)
  ============================================================================
    ■ 작성 기준 (3개 소스를 대조해서 맞춤)
      1) table_after.sql        : 신규 테이블 DDL + 시드  (테이블 골격의 1차 기준)
      2) subscriptions_setup.sql: subscriptions/ategories를 앱에 맞게 수정
                                  (제약 변경, 새 컬럼 6개, RLS 정책, id 시퀀스)
      3) supabase.txt (메모)     : 실제 Supabase 에 "지금 있는" 테이블·컬럼 목록
                                  = 진짜 DB 상태. 메모가 실제 상태의 기준이에요.
      4) 참고) 프론트 코드가 실제로 읽는/쓰는 컬럼
                                  - src/api/subs.js, src/api/payment.js, src/api/auth.js
                                  - src/utils/common/dbItem.js, src/components/add-item/AddItemModal.jsx

    ■ 결론 요약 (먼저 읽기)
      · 테이블은 총 9개: users, user_settings, categories, payment_categories,
        payment_methods, subscriptions, payments, budgets, notifications
      · 메모에는 있는데 table_after.sql 에 "정의"가 없는 컬럼:
          - categories : chart, key, bg      (시드 INSERT 에만 나오는 것 → Supabase에서 수동 추가)
          - subscriptions : day, month, week, custom_number, custom_text
                            (어느 SQL 에도 없음 → Supabase에서 수동 추가, 지금 프론트가 쓰는 핵심 컬럼)
      · subscriptions 에 "이중/중복 후보" 컬럼이 많아요 (정리 필요 지점):
          day/month/week/custom_number/custom_text ← 프론트가 실제 사용 (현행)
          payment_day/payment_month/weekday/every/unit ← 이전 방식 (subscriptions_setup 쪽), 프론트 미사용
          payment_method_id(FK) ← 프론트 미사용 / pay_method(문자열) ← 프론트 사용
      · 상세한 표는 아래 [1]~[9] 테이블별 정리, 정리가 필요한 항목은 [10] 참고란.
  ============================================================================
*/

-- ###########################################################################
-- [0] 테이블 전체 목록 (한눈에)
-- ###########################################################################
--
--   테이블                용도                          사용 화면/코드        상태
--   --------------------  ----------------------------  -------------------  --------
--   users                 회원 정보(이름·전화·탈퇴처리)  회원가입/로그인/설정   사용 중
--   user_settings         회원별 알림 설정(7종 토글)     설정 > 알림 카드       DDL만 존재(프론트 미연결)
--   categories            고정지출 카테고리 9종(공유)    대시보드/추가창/리포트  사용 중
--   payment_categories    카드사·은행 "사전"(공유)       설정 > 결제 수단 추가   사용 중
--   payment_methods       내가 등록한 카드/계좌(뒷4자리)  설정 > 결제 수단 카드   사용 중
--   subscriptions         고정지출 항목 (핵심 테이블)     내 고정지출/추가창/달력  사용 중
--   payments              회차별 결제 예정·완료 기록      달력/차트(예정)        DDL만 존재(프론트 미연결)
--   budgets               월별 예산                      설정/대시보드(예정)     DDL만 존재(프론트 미연결)
--   notifications         알림 발송 기록                 사이드바 종 뱃지(예정)  DDL만 존재(프론트 미연결)
--
--   ※ table_after.sql 머리말 주석에만 나오고 실제로는 "없는" 테이블:
--     user_agreements, user_sessions, subscription_amount_history, savings, report_notes
--     (메모에도 없어요 → 아직 안 만듦. 필요해지면 새로 만들어야 해요)


-- ###########################################################################
-- [1] users - 회원 정보            (메모 표기: [user] → 실제 테이블명은 users)
-- ###########################################################################
--   화면: 회원가입(이름/휴대폰), 로그인, 대시보드 "00님", 설정 프로필 카드
--   코드: src/api/auth.js 가 insert/select 함
--   출처: table_after.sql 100% (메모와 컬럼 완전 일치)
--
--   컬럼              타입          의미
--   ----------------  ------------  --------------------------------------------------
--   id                uuid PK       auth.users(id) 에 연동된 회원 식별자 (Supabase Auth ID)
--   name              text          회원 이름 ("김민지")
--   phone             text          휴대폰 번호 (unique - 중복 가입 방지)
--   is_active         boolean       계정 활성 여부. false = 탈퇴 처리(행은 지우지 않고 끔)
--   is_alarm          boolean       혜택·이벤트 마케팅 알림 수신 여부 (기본 false)


-- ###########################################################################
-- [2] user_settings - 회원별 알림 설정   (메모 표기: [user_settings])
-- ###########################################################################
--   화면: 설정 > 알림 카드 (결제일/예산/큰지출/만기 알림)
--   출처: table_after.sql (메모와 컬럼 일치)
--
--   컬럼                          타입        의미
--   ----------------------------  ----------  ------------------------------------------------
--   user_id                       uuid PK/FK  users(id) 참조. 한 회원 = 한 줄 (unique)
--                                 (메모엔 "userid"로 적혀 있음 → 오타 의심, 실제는 user_id)
--   payment_alert_enabled         boolean     [결제일 알림] 켜기/끄기 (기본 true)
--   payment_alert_time            text        [알림 시간] 발송 시각. '09:00'/'12:00'/'20:00' 만 허용
--   budget_alert_enabled          boolean     [예산 초과 알림] 켜기/끄기 (기본 true)
--   budget_alert_rate             integer     예산의 몇 % 를 넘으면 알릴지 (기본 90, 1~100)
--   large_expense_alert_enabled   boolean     [큰 지출 알림] 켜기/끄기 (기본 true)
--   large_expense_threshold       integer     "큰 지출" 기준 금액 (기본 100,000원)
--   expiry_alert_enabled          boolean     [약정·만기 알림] 켜기/끄기 (기본 true)
--
--   ※ 주의: table_after.sql 주석에는 "payment_alert_days_before (당일/1/3/7일 전)" 이
--     언급되지만 DDL 에는 없고 메모에도 없어요 → 만들지 않은 기능 (주석만 존재).


-- ###########################################################################
-- [3] categories - 고정지출 카테고리 (앱 전체가 공유하는 공용 테이블)
-- ###########################################################################
--   화면: 대시보드 카테고리 범례, 내 고정지출 목록, 추가창 카테고리 선택, 리포트 도넛
--   코드: src/api/subs.js getCategories(), hooks/useCategoryOf.js (key 로 아이콘·색 찾음)
--
--   컬럼      타입         의미
--   --------  -----------  --------------------------------------------------------
--   id        bigint PK    카테고리 식별자 (subscriptions.category_id 가 이걸 참조)
--   name      text         카테고리 이름 ("주거·공과", "통신", "구독 서비스" ...)
--   example   text         이름 옆 작은 설명 ("월세·관리비·공과금")
--   icon      text         Lucide 아이콘 이름 (Building2, Smartphone, CirclePlay ...)
--   color     text         대표 색상 (텍스트/아이콘 색, 예: '#154A7D')
--   chart     text         차트 전용 색 (대시보드 스택 바, 리포트 도넛)  ← 메모에만 있음(수동 추가)
--   key       text         프론트 매핑 키 (home/phone/sub/rental/insure/saving/transit/car/etc)
--   bg        text         배경색 (카드·범례 점 배경, 예: '#E1EEF9')     ← 메모에만 있음(수동 추가)
--
--   ※ 출처 정리: id/name/example/icon/color 는 table_after.sql DDL.
--     chart/key/bg 는 DDL 에 없고 table_after.sql 시드 INSERT 에만 나와요.
--     → Supabase 에서 컬럼을 따로 추가한 것 (메모로 확인).
--   ※ 시드 충돌 주의: 두 파일의 카테고리 이름이 달라요!
--       table_after.sql      : '주거·공과', '구독', '가전 구독', '금융·저축'
--       subscriptions_setup  : '주거',     '구독 서비스', '가전',  '금융/저축'
--     → 같은 카테고리가 두 번 들어가지 않도록 (이름 기준 exists 검사) 관리 필요.
--     ※ subscriptions_setup 시드는 name/example/icon/color 만 넣고 chart/key/bg 는 안 넣어요.


-- ###########################################################################
-- [4] payment_categories - 카드사/은행 "사전" (전체 공유)
-- ###########################################################################
--   화면: 설정 > "+ 결제 수단 추가" 창의 셀렉트박스 (국민카드, 카카오뱅크 ...)
--   코드: src/api/payment.js getPayCategories()
--   출처: table_after.sql (메모와 일치) / RLS 없음(공용 테이블)
--
--   컬럼   타입      의미
--   -----  --------  --------------------------------------------------
--   id     bigint PK 카테고리(사전) 식별자 → payment_methods.payment_id 가 참조
--   type   text      '카드' / '계좌' (설정창 탭 구분)
--   icon   text      카드사/은행 아이콘 경로
--   name   text      카드사·은행 이름 ("국민카드", "카카오뱅크")
--
--   ※ 버그 주의: table_after.sql 맨 아래 시드가
--       insert into payment_methods (type, icon, name) values ...
--     로 되어 있는데 type/icon/name 은 payment_categories 컬럼이에요!
--     → payment_categories 에 넣어야 하는 시드 (payment_methods 에 넣으면 실패).


-- ###########################################################################
-- [5] payment_methods - 내가 등록한 결제 수단 (카드/계좌)
-- ###########################################################################
--   화면: 설정 > 결제 수단 카드 ("국민카드 •••• 1234"), 추가창의 결제 수단 선택
--   코드: src/api/payment.js (addMyMethod / getMyMethods / deleteMyMethod)
--   출처: table_after.sql (메모와 일치)
--
--   컬럼        타입       의미
--   ----------  ---------  -------------------------------------------------
--   id          bigint PK  결제 수단 식별자
--   user_id     uuid FK    어느 회원의 카드/계좌인지 → users(id) (cascade)
--   payment_id  bigint FK  카드사/은행 사전 참조 → payment_categories(id)
--                          ("국민카드" 같은 이름은 이 FK 로 연결, 문자열로 안 저장)
--   last4       text       카드/계좌 뒷 4자리 ('1234'). 전체 번호는 저장 안 함(보안)
--   created_at  timestamptz 등록 시각 (정렬 기준)


-- ###########################################################################
-- [6] subscriptions - 고정지출 항목 (핵심 테이블) ★ 컬럼이 제일 많아요
-- ###########################################################################
--   화면: 내 고정지출 목록/상세, 대시보드 합계, 결제 캘린더, 항목 추가/수정 창
--   코드: src/api/subs.js (addSubs/updateSubs/getMySubs), AddItemModal.jsx, dbItem.js
--
--   출처 구분 표시:
--     [기본] = table_after.sql 에 정의
--     [설정] = subscriptions_setup.sql 이 나중에 추가/변경
--     [수동] = 어느 SQL 파일에도 없고 Supabase 에서 직접 추가 (메모로 확인)
--
--   ── 기본 정보 ──────────────────────────────────────────────────────────
--   컬럼                출처   의미
--   ------------------  -----  --------------------------------------------------------
--   id                  [기본] bigint PK (시퀀스 1,000,000 부터 발급 - 예시 데이터 id 충돌 방지)
--   user_id             [기본] uuid FK → users(id). 어느 회원의 항목인지 (cascade)
--   category_id         [기본] bigint FK → categories(id). 카테고리별 집계 기준
--   name                [기본] 항목 이름 ("넷플릭스", "월세", "적금")
--   amount              [기본] 결제 주기당 금액 (원, >= 0). 대시보드/리포트 합계의 원본
--   amount_type         [기본] '고정' / '변동'. '변동'이면 실제 금액은 payments.amount 에
--                              남김 (전기요금처럼 매달 다른 금액)
--   memo                [기본] 메모 ("갱신 전에 견적 비교하기")
--                        (메모 파일에는 "meno" 로 적혀 있음 → 오타 의심. 코드는 memo 를 씀)
--   is_active           [기본] false = 중도 해지/숨김 (행 삭제 대신, payments 이력 보존용)
--   created_at          [기본] 등록 시각 (목록 정렬 기준)
--
--   ── 결제 주기 (cycle) ──────────────────────────────────────────────────
--   컬럼                출처   의미
--   ------------------  -----  --------------------------------------------------------
--   cycle               [기본] 결제 주기. 허용값이 두 번 바뀌었어요!
--                              · table_after      : '매일','매주','매달','매년','사용자화 '
--                                                   ('사용자화 ' 뒤에 공백 실수 - 버그)
--                              · subscriptions_setup 이 교체 → '매일','매주','매달','매년',
--                                                   '사용자화','매월','분기','반기'
--                              · 프론트 저장값: '매일','매주','매달','매년','사용자화'
--                                (구 데이터 '매월' 은 '매달' 로 보정해서 읽음 - AddItemModal)
--
--   cycle별 날짜/단위 컬럼이 "두 세트"로 존재해요 → 정리가 필요한 핵심 부분!
--
--   ◆ 현행 세트 (프론트가 실제로 읽고 씀 - getMySubs / AddItemModal / dbItem.js)
--   컬럼              출처   의미
--   ----------------  -----  --------------------------------------------------------
--   day               [수동] 매달·매년 결제일 (며칠, 1~31). '매주'·'매일' 이면 null
--   month             [수동] 매년 결제 월 (1~12). 매년/사용자화-년 단위일 때만 값
--   week              [수동] 매주 결제 요일 (0=일 ~ 6=토). '매주'·사용자화-주 단위일 때만
--   custom_number     [수동] 사용자화 주기의 "N" (예: 2개월마다 → 2). 아니면 null
--   custom_text       [수동] 사용자화 주기의 단위 'day'|'week'|'month'|'year'
--                            (UNIT_OPTIONS = 일/주/개월/년)
--
--   ◆ 이전 세트 (subscriptions_setup.sql 이 추가 - 프론트가 안 씀 → 삭제 후보)
--   컬럼              출처   의미 / 상태
--   ----------------  -----  --------------------------------------------------------
--   payment_day       [기본] 결제일(1~31). [설정] 에서 null 허용으로 바꿈.
--                            프론트는 day 를 쓰므로 사실상 미사용
--   payment_month     [설정] 매년 결제 월(1~12). **메모에 없음!**
--                            → Supabase 에 없거나 'month' 로 이름이 바뀐 것 (확인 필요)
--   weekday           [설정] 매주 요일(0~6). 프론트는 week 를 씀 → 미사용
--   every             [설정] 사용자화 "N마다". 프론트는 custom_number 를 씀 → 미사용
--   unit              [설정] 사용자화 단위 'day|week|month|year'. 프론트는 custom_text 를 씀
--
--   ── 결제 수단 ──────────────────────────────────────────────────────────
--   컬럼                출처   의미
--   ------------------  -----  --------------------------------------------------------
--   payment_method_id   [기본] bigint FK → payment_methods(id), on delete set null
--                              [상세] "신용카드 ···· 1234" 표시용. **프론트는 안 씀**
--   pay_method          [설정] 결제 수단 "이름 문자열" ("국민카드", "카카오뱅크")
--                              프론트가 실제로 읽고 씀 (FK 가 아니라 그냥 문자열)
--                              → payment_method_id 와 기능이 겹침 (정리 후보)
--
--   ── 기간 / 알림 ────────────────────────────────────────────────────────
--   컬럼                  출처   의미
--   --------------------  -----  ------------------------------------------------------
--   start_date            [기본] 시작일 ("2024-03-04"). 결제 스케줄 계산 기준
--   expiry_date           [기본] 만기일 ("2027-03-03"). 없으면 null. D-day/진행바/만기 알림
--   payment_alert_days    [기본] 결제 며칠 전 알림 (30/7/3/1 중 하나, 기본 3)
--   expiry_alert_days     [기본] 만기 며칠 전 알림 (30/7/3/1 중 하나, 기본 3)
--                              ※ 버그: table_after 의 check 가 payment_alert_days 를
--                                검사하도록 되어 있음 (expiry_alert_days 아님) - 복붙 실수
--   remind                [설정] 결제 알림 받기 토글 (기본 true).
--                              프론트: utils/sidebar/notifications.js 에서 "끄면 그 항목
--                              알림은 안 뜬다"는 규칙으로 사용


-- ###########################################################################
-- [7] payments - 회차별 결제 예정/완료 기록 (달력·차트 원본)
-- ###########################################################################
--   화면: 결제 캘린더 날짜 뱃지, 납부 현황, 월별 지출 차트, 리포트 비교표 (예정)
--   출처: table_after.sql (메모와 일치) / 프론트 코드에서 아직 안 씀 (미연결)
--
--   컬럼            타입          의미
--   --------------  ------------  --------------------------------------------------
--   id              bigint PK     기록 식별자
--   user_id         uuid FK       users(id) 참조 (cascade)
--   subscription_id bigint FK     subscriptions(id) 참조 (cascade) - 어느 항목의 결제인지
--   due_date        date          결제 예정일 (예: 2026-11-10). 달력에 이 날짜로 표시
--   amount          integer       그 회차에 실제로 나간(나갈) 금액.
--                                 amount_type='변동' 일 때 매달 달라지는 값이 여기 저장
--   unique(subscription_id, due_date)  같은 항목을 같은 날짜에 두 번 기록하지 않기


-- ###########################################################################
-- [8] budgets - 월별 예산
-- ###########################################################################
--   화면: 설정 > 예산 카드(프리셋 100/130/150/200만), 대시보드 "이번 달 예산" 사용률
--   출처: table_after.sql / 프론트 코드에서 아직 안 씀 (미연결)
--
--   컬럼            타입          의미
--   --------------  ------------  --------------------------------------------------
--   id              bigint PK     예산 식별자
--   user_id         uuid FK       users(id) 참조 (cascade)
--   category_id     bigint FK     categories(id) 참조 (cascade) - 카테고리별 예산
--                                 (메모에는 "cateogry_id" 로 적혀 있음 → 오타 의심)
--   subscription_id bigint FK     subscriptions(id) 참조, set null - 특정 항목 관련 예산
--   month           date          예산을 잡은 달의 1일 (예: 2026-11-01)
--   amount          integer       그 달 예산 금액 (원, >= 0)
--   note            text          화면에 표시할 한 줄 ("전기·가스 요금이 줄었어요")
--   unique(user_id, month)        한 회원·한 달 예산 하나만 (재설정은 update)


-- ###########################################################################
-- [9] notifications - 알림 기록
-- ###########################################################################
--   화면: 사이드바 종 아이콘 뱃지(안 읽은 개수), 결제 D-day 알림
--   출처: table_after.sql (메모와 일치) / 프론트 코드에서 아직 안 씀 (미연결)
--
--   컬럼            타입          의미
--   --------------  ------------  --------------------------------------------------
--   id              bigint PK     알림 식별자
--   user_id         uuid FK       users(id) 참조 (cascade) - 받는 회원
--   subscription_id bigint FK     subscriptions(id) 참조, set null - 항목이 지워져도 알림 유지
--   title           text          알림 제목 ("넷플릭스 결제 D-3")
--   body            text          알림 본문 ("11월 10일 14,500원이 나갑니다")
--   is_read         boolean       읽음 여부 (기본 false). 안 읽은 수 = 종 뱃지 숫자
--   created_at      timestamptz   발송 시각 (최신순 정렬)


-- ###########################################################################
-- [10] 정리가 필요한 항목 (TODO / 확인 필요)
-- ###########################################################################
--
--  A. subscriptions 이중 컬럼 정리 (가장 시급)
--     · 현행(프론트 사용) : day, month, week, custom_number, custom_text
--     · 이전(setup 추가)  : payment_day, payment_month, weekday, every, unit
--     → 프론트 코드는 현행 세트만 써요. 이전 세트는 데이터가 비어 있으면 DROP 후보.
--       (단, 기존 데이터가 이전 세트에만 들어 있다면 현행 세트로 마이그레이션 먼저!)
--
--  B. payment_month 존재 여부 확인
--     · subscriptions_setup.sql 은 payment_month 를 추가하지만 메모에는 없고
--       'month' 만 있어요 → (1) 추가를 안 함 (2) month 로 이름을 바꿈 중 하나.
--       Supabase SQL Editor 에서 확인:
--         select column_name from information_schema.columns
--          where table_name='subscriptions' order by ordinal_position;
--
--  C. 결제 수단 표현 이중화
--     · payment_method_id (FK → payment_methods) : 프론트 미사용
--     · pay_method (문자열)                      : 프론트 사용
--     → FK 쪽으로 통일할지 문자열로 둘지 결정 필요. (FK 가 데이터 무결성에 좋아요)
--
--  D. 메모 오타로 보이는 것 (실제 DB 에선 정상일 가능성 - SQL Editor 로 확인)
--     · [budgets] cateogry_id   → 실제는 category_id
--     · [user_settings] userid  → 실제는 user_id
--     · [subscriptions] meno    → 실제는 memo
--     · [user]                  → 실제 테이블명은 users
--       확인 쿼리:
--         select table_name, column_name from information_schema.columns
--          where table_name in ('budgets','user_settings','subscriptions','users')
--          order by table_name, ordinal_position;
--
--  E. SQL 파일 자체의 버그 (나중에 고칠 때)
--     · table_after.sql 하단 시드: insert into payment_methods (type, icon, name)
--       → payment_categories 에 넣어야 정상
--     · table_after.sql subscriptions: expiry_alert_days 의 check 가
--       payment_alert_days 를 검사 (복붙 실수)
--     · table_after.sql cycle 제약 '사용자화 ' (뒤 공백) → setup 파일이 교체하면서 해소됨
--     · 두 파일의 카테고리 시드 이름이 서로 다름 (주거·공과 vs 주거 등) → 중복 시드 주의
--
--  F. RLS(행 수준 보안) 상태
--     · enable row level security 만 설정: users, user_settings, categories,
--       payment_methods, subscriptions, payments, notifications, budgets
--     · 실제 정책(policy)이 있는 곳: categories (전체 읽기), subscriptions (본인 CRUD)
--       → 나머지(users/user_settings/payment_methods/payments/budgets/notifications)는
--         정책이 없으면 "아무도 못 읽는" 상태일 수 있어요. Supabase 대시보드에서 확인 필요.
--     · payment_categories 는 enable 자체가 없음 (공용 테이블 - 정책 없이 통과).
--
--  G. 아직 안 만든 테이블 (table_after 머리말에만 언급)
--     user_agreements(약관), user_sessions(로그인 유지),
--     subscription_amount_history(금액 변화 차트), savings(저축), report_notes(리포트 코멘트)
*/
