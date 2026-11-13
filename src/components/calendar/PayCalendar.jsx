/*
 * 결제 캘린더 왼쪽 카드: 직접 만든 툴바 + FullCalendar 월간 달력
 * - controller: 페이지에서 만든 useCalendarController() (오늘/이전/다음 버튼으로 달력을 움직여요)
 * - events: FullCalendar 형식 일정 목록 (extendedProps에 icon, color)
 * - selectedDate / onSelect: 선택한 날짜와 날짜 클릭 처리
 * - onToday: "오늘" 버튼
 */
import { useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/react/daygrid"; // 월간 달력
import interactionPlugin from "@fullcalendar/react/interaction"; // 날짜 클릭(dateClick)에 필요
// 스타일(FullCalendar CSS + calendar.css)은 pages/Calendar.jsx에서 순서대로 불러와요

import { dateKey } from "@/utils/common/date";
import useChipsPerDay from "@/hooks/useChipsPerDay";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 날짜 칸에 붙일 class (앞뒤 달 / 오늘)
// 선택한 날 표시는 여기서 하지 않아요 → 아래 <style>에서 칠해요
// (여기서 선택한 날을 검사하면, 날짜를 누를 때마다 FullCalendar가 칸·칩을 전부 다시 그려서 느려져요)
const dayCellClass = (arg) =>
  ["paycal-day", arg.isOther && "paycal-day-other", arg.isToday && "paycal-day-today"]
    .filter(Boolean)
    .join(" ");

// 일정 칩 모양: [아이콘] 이름  (배경은 카테고리 연한 색 bg, 없으면 CSS의 연한 파랑)
const renderEvent = (arg) => {
  const { icon: Icon, color, bg } = arg.event.extendedProps;
  return (
    <div className="paycal-event-chip" style={{ background: bg }}>
      {Icon && <Icon className="paycal-event-icon" size={14} strokeWidth={2.5} color={color} />}
      <span className="paycal-event-title">{arg.event.title}</span>
    </div>
  );
};

/*
 * FullCalendar에 넘기는 설정은 "매번 같은 값"이어야 해요.
 * 함수·배열을 JSX 안에서 바로 만들면 그릴 때마다 새 값이 되고,
 * FullCalendar는 설정이 바뀐 줄 알고 달력(칸·칩)을 전부 다시 그려요 → 날짜 클릭이 느려져요.
 * 그래서 컴포넌트 밖에 한 번만 만들어 둬요.
 */
const PLUGINS = [dayGridPlugin, interactionPlugin]; // 테마는 안 써요 (모양은 calendar.css)
// 칩을 감싼 요소의 class: 칸이 좁으면 여백을 줄여요 (calendar.css .paycal-event-inner)
const rowEventInnerClass = (arg) => (arg.isNarrow ? "paycal-event-inner-narrow" : "paycal-event-inner");
// 날짜 숫자를 감싼 요소의 class: 칸이 좁으면 줄 높이를 줄여요 (calendar.css .paycal-day-top-inner)
const dayCellTopInnerClass = (arg) => (arg.isNarrow ? "paycal-day-top-inner-narrow" : "paycal-day-top-inner");
// 요일 헤더: 일 월 화 ...
const dayHeaderContent = (arg) => WEEK_DAYS[arg.dow];
// 날짜 숫자: "2일" 대신 "2"
const dayCellTopContent = (arg) => <span className="paycal-day-num">{arg.date.getDate()}</span>;

const PayCalendar = ({ controller, title, events, selectedDate, onSelect, onToday }) => {
  // 한 칸에 들어가는 칩 개수 (창 높이에 따라 바뀜, hooks/useChipsPerDay.js 설명 참고)
  const boxRef = useRef(null);
  const chipsPerDay = useChipsPerDay(boxRef, controller.getDate() ?? new Date());

  // 날짜 클릭 → 오른쪽 패널에 표시 (useCallback: onSelect가 그대로면 같은 함수를 다시 써요)
  const dateClick = useCallback((info) => onSelect(info.date), [onSelect]);

  return (
    <section className="paycal-card paycal-main">
      {/* 직접 만든 툴바 (FullCalendar 기본 툴바는 껐어요) */}
      <div className="paycal-toolbar">
        <h2 className="paycal-toolbar-title">{title}</h2>
        <div className="paycal-toolbar-btns">
          <button className="paycal-btn paycal-btn-today" onClick={onToday}>
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
      <div className="paycal-calendar" ref={boxRef}>
        {/* 선택한 날짜: 파란 테두리 (FullCalendar 날짜 칸에 붙은 data-date="2026-11-13"으로 찾아서 칠해요) */}
        <style>{`.paycal-calendar .paycal-day[data-date="${dateKey(selectedDate)}"] {
          box-shadow: inset 0 0 0 2px var(--paycal-blue);
          border-radius: 13px;
        }`}</style>
        <FullCalendar
          plugins={PLUGINS}
          initialView="dayGridMonth"
          controller={controller}
          headerToolbar={false} // 위의 직접 만든 툴바 사용
          height="100%"
          fixedWeekCount={false} // 그 달에 필요한 주만 표시
          events={events}
          eventColor="transparent" // FullCalendar 기본 일정 색 끄기 (칩 색은 CSS에서)
          eventClass="paycal-event"
          rowEventInnerClass={rowEventInnerClass}
          eventContent={renderEvent}
          eventOrder="title" // 한 칸 안에서 이름 순 (오른쪽 날짜 카드와 같은 순서)
          // ── 시안처럼 선 없는 달력: 바깥 테두리는 borderless, 안쪽 선은 아래 class + CSS로 지워요
          borderless={true}
          tableClass="paycal-table"
          dayHeaderRowClass="paycal-dayhead-row"
          dayHeaderClass="paycal-dayhead"
          dayRowClass="paycal-week"
          // 칩은 칸 높이에 들어가는 만큼만 (창이 낮으면 줄고, 큰 화면에선 더 많이)
          // → 어떤 창 높이에서도 달력 한 달이 한 화면에 다 보여요
          // (0개면 true: FullCalendar가 알아서 칸에 맞춰요. 숫자 0은 "제한 없음"으로 읽혀서 안 돼요)
          dayMaxEvents={chipsPerDay > 0 ? chipsPerDay : true}
          moreLinkClass="paycal-more" // 넘친 개수 표시("+n개")는 CSS에서 숨김 → 전체 목록은 오른쪽 날짜 카드에서
          // 요일 헤더 / 날짜 숫자 — 위의 dayHeaderContent, dayCellTopContent
          dayHeaderContent={dayHeaderContent}
          dayCellTopContent={dayCellTopContent}
          // 날짜 숫자 영역 (왼쪽 정렬용 class)
          dayCellTopClass="paycal-day-top"
          dayCellTopInnerClass={dayCellTopInnerClass}
          // 칸 너비가 100px 이하면 "좁은 칸"으로 봐요 (칩 여백·줄 높이를 줄여요. 테마를 쓸 때와 같은 기준)
          dayNarrowWidth={100}
          // 날짜 칸에 붙일 class (앞뒤 달 / 오늘) — 위의 dayCellClass
          dayCellClass={dayCellClass}
          // 날짜 클릭 → 오른쪽 패널에 표시
          dateClick={dateClick}
        />
      </div>
    </section>
  );
};

export default PayCalendar;
