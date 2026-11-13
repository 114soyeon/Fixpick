/*
 * 달력 한 칸에 칩이 몇 개 들어가는지 계산하는 훅 (PayCalendar에서 사용)
 *
 * 왜 직접 계산하나요?
 *   FullCalendar의 dayMaxEvents={true}(칸 높이에 맞추기)는 칩이 넘치면 "+n개" 링크 자리를
 *   한 줄 비워 둬요. 우리는 "+n개"를 숨기기 때문에 그 자리가 빈칸이 되고,
 *   1440×800 같은 흔한 화면에서도 칩이 0개로 보였어요.
 *   그래서 들어가는 개수를 여기서 계산해 숫자로 넘겨요 (숫자로 주면 그 개수까지 보여줘요).
 *
 * 계산: 칸 높이 = (달력 높이 − 요일 줄 높이) ÷ 주 수
 *       첫 칩 위치 + 칩 높이 + (개수−1) × 칩 한 줄 높이 ≤ 칸 높이 인 가장 큰 개수
 *
 * - boxRef: 달력을 감싼 div (.paycal-calendar)
 * - viewDate: 지금 보이는 달 (주 수 계산용: 그 달에 필요한 주만 그려요)
 */
import { useLayoutEffect, useState } from "react";

// 화면에서 잰 칩 크기 (styles/calendar.css의 칩 높이·여백이 바뀌면 같이 고쳐야 해요)
const SIZE = {
  desktop: { firstTop: 34, chip: 29, row: 33 }, // 칩 25px + 위아래 여백
  mobile: { firstTop: 32, chip: 22, row: 26 }, // 767px 이하: 아이콘만 있는 작은 칩
};

// FullCalendar가 칸 아래에 더 쓰는 높이(약 3px)만큼 여유 → 딱 맞을 때 줄이 늘어나 달력이 잘리지 않게
const SAFE = 3;

// 그 달을 그리는 데 필요한 주 수 (fixedWeekCount={false}와 같은 계산)
const weeksIn = (date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.ceil((firstDay + days) / 7);
};

export default function useChipsPerDay(boxRef, viewDate) {
  const [count, setCount] = useState(3);
  const weeks = weeksIn(viewDate);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    const update = () => {
      const head = box.querySelector(".paycal-dayhead-row")?.getBoundingClientRect().height ?? 0;
      const cellH = (box.clientHeight - head) / weeks;
      const s = window.matchMedia("(max-width: 767px)").matches ? SIZE.mobile : SIZE.desktop;
      const fit = Math.floor((cellH - SAFE - s.firstTop - s.chip) / s.row) + 1;
      setCount(Math.max(0, fit));
    };

    update();
    // 창 크기가 바뀌어 달력 높이가 바뀌면 다시 계산
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, [boxRef, weeks]);

  return count;
}
