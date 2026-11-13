/*
 * 결제 캘린더 페이지
 * - 이 파일은 "데이터 준비 + 화면 배치"만 해요. 각 카드는 components/calendar/ 에 있어요
 *   PayCalendar(왼쪽 달력) / SummaryCard(요약) / DayCard(선택한 날) / BigCard(큰 지출)
 * - class는 다른 페이지와 겹치지 않게 모두 "paycal-" 로 시작 (styles/calendar.css)
 * - 데이터: 왼쪽 달력만 리액트 쿼리 useMySub(queries/subs.js)로 DB의 내 고정지출을 읽어요
 *   → utils/dbItem.js fromDbRow 로 계산하기 좋은 모양으로 바꿔요 (리포트 페이지와 같은 방식)
 *   오른쪽 카드들(요약·선택한 날·큰 지출)은 아직 예전 데이터(hooks/useItems)예요
 */
import { useMemo, useState } from "react";
import { useCalendarController } from "@fullcalendar/react";

// 스타일 — 순서가 중요해요! FullCalendar CSS 먼저, 이 페이지 CSS(calendar.css)는 맨 뒤 (그래야 덮어써요)
// FullCalendar 테마(monarch)는 쓰지 않아요 (빼면 클릭·달 이동이 더 빨라요). 모양은 calendar.css에서 직접 맞춰요
import "@fullcalendar/react/skeleton.css"; // 항상 필요
import "@/styles/calendar.css"; // 이 페이지 전용 스타일 (class는 모두 paycal- 로 시작)

import { bigPayments, paymentsInMonth } from "@/utils/common/payment";
import { useItems } from "@/hooks/useItems";
import { useMySub } from "@/queries/subs";
import { fromDbRow } from "@/utils/common/dbItem";
import { useCategoryColors } from "@/hooks/useCategoryColors";
import { getToday, isSameDay } from "@/utils/common/date";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import PayCalendar from "@/components/calendar/PayCalendar";
import SummaryCard from "@/components/calendar/SummaryCard";
import DayCard from "@/components/calendar/DayCard";
import BigCard from "@/components/calendar/BigCard";

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

  // 지금 달력에 보이는 달
  const viewDate = controller.getDate() ?? new Date();
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth() + 1;

  // 사용자가 등록한 고정지출 항목 (규칙만 있음: "매달 25일" 같은)
  const items = useItems();

  // 달력에 그릴 DB 데이터 (리액트 쿼리) — 지금은 왼쪽 달력에만 써요
  const { data: rows } = useMySub();
  // DB 한 줄 → 계산용 항목 (rows가 바뀔 때만 다시 바꿔요)
  const dbItems = useMemo(() => (rows ?? []).map(fromDbRow), [rows]);
  const colorOf = useCategoryColors(); // 칩 아이콘 색 (DB categories)

  // 오늘 (시간 0시 기준)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const today = getToday();

  // ① 지금 보이는 달에 실제로 나가는 결제 (규칙 → 실제 날짜)
  const monthPayments = paymentsInMonth(items, viewYear, viewMonth);

  // ② 달력에 그릴 일정 (FullCalendar 형식, 앞뒤 달 포함) — hooks/useCalendarEvents.js
  //    데이터·보이는 달이 바뀔 때만 다시 만들어요 (날짜 클릭 때는 그대로 → 빨라요)
  const events = useCalendarEvents(dbItems, viewYear, viewMonth, colorOf);

  // ③ 선택한 날짜의 결제 목록 (선택한 날짜가 속한 달 기준으로 계산)
  const dayPayments = paymentsInMonth(items, selectedDate.getFullYear(), selectedDate.getMonth() + 1)
    .filter((p) => isSameDay(p.date, selectedDate))
    .sort((a, b) => a.name.localeCompare(b.name, "ko")); // 이름 순 (달력 칩 순서와 같게)

  // ④ 큰 지출 미리 보기: 오늘부터 3개월 안 "매년" 결제 중 큰 순서로 최대 4개
  //    (5개는 카드 높이를 넘쳐서 4개로 정함)
  const bigList = bigPayments(items, today, 4);

  return (
    <div className="paycal-page">
      {/* ───── 페이지 제목 ───── */}
      <header className="paycal-header">
        <h1 className="paycal-header-title">결제 캘린더</h1>
        <p className="paycal-header-desc">이번 달 결제 일정을 날짜별로 한눈에 확인해요</p>
      </header>

      <div className="paycal-body">
        {/* ───── 왼쪽: 달력 카드 ───── */}
        <PayCalendar
          controller={controller}
          title={`${viewYear}년 ${viewMonth}월`}
          events={events}
          selectedDate={selectedDate}
          onSelect={setSelectedDate}
          onToday={goToday}
        />

        {/* ───── 오른쪽: 요약 / 선택한 날 / 큰 지출 ───── */}
        <aside className="paycal-side">
          <SummaryCard month={viewMonth} payments={monthPayments} todayStart={todayStart} />
          <DayCard date={selectedDate} payments={dayPayments} />
          <BigCard list={bigList} />
        </aside>
      </div>
      <span className="gk-paycal-copy">Copyright © 2026. Fixpick All rights reserved.</span>
    </div>
  );
};

export default Calendar;
