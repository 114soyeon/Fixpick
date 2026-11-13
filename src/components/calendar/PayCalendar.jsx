/*
 * 결제 캘린더 왼쪽 카드: 직접 만든 툴바 + FullCalendar 월간 달력
 * - controller: 페이지에서 만든 useCalendarController() (오늘/이전/다음 버튼으로 달력을 움직여요)
 * - events: FullCalendar 형식 일정 목록 (extendedProps에 icon, color)
 * - selectedDate / onSelect: 선택한 날짜와 날짜 클릭 처리
 * - onToday: "오늘" 버튼
 */
import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import themePlugin from "@fullcalendar/react/themes/monarch"; // 테마
import dayGridPlugin from "@fullcalendar/react/daygrid"; // 월간 달력
import interactionPlugin from "@fullcalendar/react/interaction"; // 날짜 클릭(dateClick)에 필요
// 스타일(FullCalendar CSS + calendar.css)은 pages/Calendar.jsx에서 순서대로 불러와요

import { isSameDay } from "@/utils/common/date";
import useChipsPerDay from "@/hooks/useChipsPerDay";

const WEEK_DAYS = ["일", "월", "화", "수", "목", "금", "토"];

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

const PayCalendar = ({ controller, title, events, selectedDate, onSelect, onToday }) => {
  // 한 칸에 들어가는 칩 개수 (창 높이에 따라 바뀜, hooks/useChipsPerDay.js 설명 참고)
  const boxRef = useRef(null);
  const chipsPerDay = useChipsPerDay(boxRef, controller.getDate() ?? new Date());

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
          // 칩은 칸 높이에 들어가는 만큼만 (창이 낮으면 줄고, 큰 화면에선 더 많이)
          // → 어떤 창 높이에서도 달력 한 달이 한 화면에 다 보여요
          // (0개면 true: FullCalendar가 알아서 칸에 맞춰요. 숫자 0은 "제한 없음"으로 읽혀서 안 돼요)
          dayMaxEvents={chipsPerDay > 0 ? chipsPerDay : true}
          moreLinkClass="paycal-more" // 넘친 개수 표시("+n개")는 CSS에서 숨김 → 전체 목록은 오른쪽 날짜 카드에서
          // 요일 헤더: 일 월 화 ...
          dayHeaderContent={(arg) => WEEK_DAYS[arg.dow]}
          // 날짜 숫자: "2일" 대신 "2"
          dayCellTopContent={(arg) => <span className="paycal-day-num">{arg.date.getDate()}</span>}
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
          dateClick={(info) => onSelect(info.date)}
        />
      </div>
    </section>
  );
};

export default PayCalendar;
