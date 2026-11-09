import { useState } from "react";
import FullCalendar, { useCalendarController } from "@fullcalendar/react";
import themePlugin from "@fullcalendar/react/themes/monarch"; // 테마
import dayGridPlugin from "@fullcalendar/react/daygrid"; // 월간 달력
import interactionPlugin from "@fullcalendar/react/interaction"; // 날짜 클릭(dateClick)에 필요

// 스타일
import "@fullcalendar/react/skeleton.css"; // 항상 필요
import "@fullcalendar/react/themes/monarch/theme.css";
import "@fullcalendar/react/themes/monarch/palettes/purple.css";
import "../styles/calendar.css"; // 이 페이지 전용 스타일 (class는 모두 paycal- 로 시작)

import { bigPayments, paymentsInMonth, useItems } from "../utils/items";
import { toKey } from "../utils/date";
import { categoryStyle } from "../constants/categories";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

// Date → "11월 25일" 형태 문자열
const formatDay = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;

// 두 날짜가 같은 날인지
const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

// 숫자 → "859,900원"
const formatWon = (n) => `${n.toLocaleString("ko-KR")}원`;

// 목록 금액 합계
const sumAmount = (list) => list.reduce((sum, item) => sum + item.amount, 0);

// Date → "12월 16일"
const formatMonthDay = (date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;

// 오늘부터 며칠 남았는지 (D-day 숫자)
const dDay = (date) => {
  const t = new Date();
  const today = new Date(t.getFullYear(), t.getMonth(), t.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target - today) / 86400000);
};

// 변동 금액이면 앞에 "약"
const formatAmount = (item) =>
  `${item.amountType === "variable" ? "약 " : ""}${formatWon(item.amount)}`;

/* 오른쪽 목록의 결제 한 줄: [아이콘 박스] 이름(+보조 문구) ....... 금액
   아이콘·색은 카테고리(constants/categories.js)에서 가져와요 */
const PayItem = ({ item, sub }) => {
  const { icon: Icon, color, bg } = categoryStyle(item.category);
  return (
    <li className="paycal-item">
      <span className="paycal-item-icon" style={{ background: bg }}>
        {Icon && <Icon size={16} strokeWidth={2} color={color} />}
      </span>
      <div className="paycal-item-info">
        <p className="paycal-item-name">{item.name}</p>
        {sub && <p className="paycal-item-sub">{sub}</p>}
      </div>
      <strong className="paycal-item-amount">{formatAmount(item)}</strong>
    </li>
  );
};

const Calendar = () => {
  // 달력을 밖(직접 만든 버튼)에서 움직이게 해주는 컨트롤러
  const controller = useCalendarController();

  // 사용자가 클릭한 날짜 (처음엔 오늘)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // "오늘" 버튼: 달력을 이번 달로 옮기고, 선택한 날짜도 오늘로 (오른쪽 카드도 오늘 결제로 바뀜)
  const goToday = () => {
    controller.today();
    setSelectedDate(new Date());
  };

  // 지금 달력에 보이는 달 (제목 표시용)
  const viewDate = controller.getDate() ?? new Date();
  const title = `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  // 사용자가 등록한 고정지출 항목 (규칙만 있음: "매달 25일" 같은)
  const items = useItems();

  // 오늘 (시간 0시 기준)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };

  // ① 지금 보이는 달에 실제로 나가는 결제 (규칙 → 실제 날짜)
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth() + 1;
  const monthPayments = paymentsInMonth(items, viewYear, viewMonth);

  // ② 달력에 그릴 일정 (FullCalendar 형식으로 바꾸기)
  const events = monthPayments.map((p) => {
    const style = categoryStyle(p.category);
    return {
      id: String(p.id),
      title: p.name,
      date: toKey(viewYear, viewMonth, p.date.getDate()), // "2026-11-25"
      allDay: true,
      extendedProps: { icon: style.icon, color: style.color },
    };
  });

  // ③ 선택한 날짜의 결제 목록 (선택한 날짜가 속한 달 기준으로 계산)
  const dayPayments = paymentsInMonth(
    items,
    selectedDate.getFullYear(),
    selectedDate.getMonth() + 1
  )
    .filter((p) => isSameDay(p.date, selectedDate))
    .sort((a, b) => a.name.localeCompare(b.name, "ko")); // 이름 순 (달력 칩 순서와 같게)

  // ④ 큰 지출 미리 보기: 오늘부터 3개월 안 "매년" 결제 중 큰 순서로 최대 4개
  //    (5개는 카드 높이를 넘쳐서 4개로 정함)
  const bigList = bigPayments(items, today, 4);

  // ⑤ 요약: 결제일이 오늘보다 지났으면 "결제된" 것으로 봐요 (오늘은 아직 남은 결제)
  const paidList = monthPayments.filter((p) => p.date < todayStart);
  const paidAmount = sumAmount(paidList);
  const totalAmount = sumAmount(monthPayments);
  const progress = monthPayments.length ? (paidList.length / monthPayments.length) * 100 : 0;

  // 일정 칩 모양: [아이콘] 이름  (시안의 연한 파란 칩)
  const renderEvent = (arg) => {
    const { icon: Icon, color } = arg.event.extendedProps;
    return (
      <div className="paycal-event-chip">
        {Icon && <Icon className="paycal-event-icon" size={11} strokeWidth={2} color={color} />}
        <span className="paycal-event-title">{arg.event.title}</span>
      </div>
    );
  };

  return (
    <div className="paycal-page">
      {/* ───── 페이지 제목 ───── */}
      <header className="paycal-header">
        <h1 className="paycal-header-title">결제 캘린더</h1>
        <p className="paycal-header-desc">
          이번 달 결제 일정을 날짜별로 한눈에 확인해요
        </p>
      </header>

      <div className="paycal-body">
        {/* ───── 왼쪽: 달력 카드 ───── */}
        <section className="paycal-card paycal-main">
          {/* 직접 만든 툴바 (FullCalendar 기본 툴바는 껐어요) */}
          <div className="paycal-toolbar">
            <h2 className="paycal-toolbar-title">{title}</h2>
            <div className="paycal-toolbar-btns">
              <button className="paycal-btn paycal-btn-today" onClick={goToday}>
                오늘
              </button>
              <button className="paycal-btn paycal-btn-icon" onClick={() => controller.prev()} aria-label="이전 달">
                ‹
              </button>
              <button className="paycal-btn paycal-btn-icon" onClick={() => controller.next()} aria-label="다음 달">
                ›
              </button>
            </div>
          </div>

          {/* 이 div가 카드의 남은 높이를 채우고, 달력은 그 높이(100%)에 맞춰 늘어나요 */}
          <div className="paycal-calendar">
          <FullCalendar
            plugins={[themePlugin, dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            controller={controller}
            headerToolbar={false} // 위의 직접 만든 툴바 사용
            height="100%"
            fixedWeekCount={false} // 그 달에 필요한 주만 표시
            events={events}
            eventColor="transparent" // 테마 기본 색 끄기 (칩 색은 CSS에서)
            eventClass="paycal-event"
            eventContent={renderEvent}
            eventOrder="title" // 한 칸 안에서 이름 순 (오른쪽 날짜 카드와 같은 순서)
            // ── 시안처럼 선 없는 달력: 바깥 테두리는 borderless, 안쪽 선은 아래 class + CSS로 지워요
            borderless={true}
            tableClass="paycal-table"
            dayHeaderRowClass="paycal-dayhead-row"
            dayHeaderClass="paycal-dayhead"
            dayRowClass="paycal-week"
            dayMaxEvents={3} // 한 칸에 칩은 최대 3개
            moreLinkClass="paycal-more" // 넘친 개수 표시("+n개")는 CSS에서 숨김 → 전체 목록은 오른쪽 날짜 카드에서
            // 요일 헤더: 일 월 화 ...
            dayHeaderContent={(arg) => WEEK_DAYS[arg.dow]}
            // 날짜 숫자: "2일" 대신 "2"
            dayCellTopContent={(arg) => (
              <span className="paycal-day-num">{arg.date.getDate()}</span>
            )}
            // 날짜 숫자 영역 (왼쪽 정렬용 class)
            dayCellTopClass="paycal-day-top"
            // 날짜 칸에 붙일 class (오늘/선택된 날)
            dayCellClass={(arg) =>
              [
                "paycal-day",
                arg.isOther && "paycal-day-other", // 앞뒤 달 날짜
                arg.isToday && "paycal-day-today",
                isSameDay(arg.date, selectedDate) && "paycal-day-selected",
              ]
                .filter(Boolean)
                .join(" ")
            }
            // 날짜 클릭 → 오른쪽 패널에 표시
            dateClick={(info) => setSelectedDate(info.date)}
          />
          </div>
        </section>

        {/* ───── 오른쪽: 요약 / 상세 패널 ───── */}
        <aside className="paycal-side">
          {/* 이번 달 결제 요약 */}
          <div className="paycal-card paycal-summary">
            <p className="paycal-summary-label">{viewDate.getMonth() + 1}월에 남은 결제</p>
            <p className="paycal-summary-amount">{formatWon(totalAmount - paidAmount)}</p>

            {/* 결제 진행률 (결제된 건수 / 이번 달 전체 건수) */}
            <div className="paycal-progress">
              <div className="paycal-progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="paycal-progress-text">
              {paidList.length}/{monthPayments.length}건
            </p>

            <hr className="paycal-divider" />

            <div className="paycal-summary-row">
              <span>결제된 금액</span>
              <strong>{formatWon(paidAmount)}</strong>
            </div>
            <div className="paycal-summary-row">
              <span>이번 달 전체</span>
              <strong>{formatWon(totalAmount)}</strong>
            </div>
          </div>

          {/* 선택한 날짜의 결제 목록 (5개가 넘으면 스크롤) */}
          <div className="paycal-card paycal-detail">
            <div className="paycal-detail-head">
              <h3 className="paycal-detail-title">{formatDay(selectedDate)}</h3>
              <span className="paycal-detail-total">
                {dayPayments.length}건 · {formatWon(sumAmount(dayPayments))}
              </span>
            </div>
            {dayPayments.length > 0 ? (
              <ul className="paycal-list paycal-list-scroll">
                {dayPayments.map((item) => (
                  <PayItem key={item.id} item={item} />
                ))}
              </ul>
            ) : (
              <p className="paycal-empty">이 날은 결제 일정이 없어요</p>
            )}
          </div>

          {/* 큰 지출 미리 보기 (오늘부터 3개월 안, 금액 큰 순서) */}
          <div className="paycal-card paycal-detail">
            <div className="paycal-detail-head paycal-detail-head-col">
              <h3 className="paycal-detail-title">큰 지출 미리 보기</h3>
              <p className="paycal-detail-desc">자주 안 나가서 놓치기 쉬운 돈이에요</p>
            </div>
            {bigList.length > 0 ? (
              <ul className="paycal-list">
                {bigList.map((item) => (
                  <PayItem
                    key={`${item.id}-${item.date}`}
                    item={item}
                    sub={`${formatMonthDay(item.date)} · D-${dDay(item.date)}`}
                  />
                ))}
              </ul>
            ) : (
              <p className="paycal-empty">예정된 큰 지출이 없어요</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Calendar;
