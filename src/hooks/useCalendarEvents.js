import { useMemo } from "react";
import { isEnded, payDaysIn } from "@/utils/common/payment";
import { dateKey } from "@/utils/common/date";
import { categoryStyle } from "@/constants/categories";

/*
 * 결제 캘린더 달력에 그릴 일정 (FullCalendar 형식)
 * - 달력 첫 주·마지막 주에는 앞뒤 달 날짜도 보여서, 앞뒤 달 결제도 같이 넣어요
 *   (그 칸은 CSS에서 흐리게 보여요. 화면 밖 날짜의 일정은 FullCalendar가 알아서 안 그려요)
 * - 매주·매일 결제는 그 달에 여러 날이라 날짜마다 칩을 하나씩 만들어요
 * - useMemo: 데이터·보이는 달·색이 바뀔 때만 다시 만들어요
 *   (날짜를 클릭할 때마다 새로 만들면 FullCalendar가 칩을 전부 다시 그려서 느려져요)
 *
 * 사용법: const events = useCalendarEvents(dbItems, 2026, 11, colorOf);
 */
export function useCalendarEvents(dbItems, viewYear, viewMonth, colorOf) {
  return useMemo(
    () =>
      [-1, 0, 1]
        .flatMap((n) => {
          const d = new Date(viewYear, viewMonth - 1 + n, 1);
          const y = d.getFullYear();
          const m = d.getMonth() + 1;
          return dbItems.flatMap((it) =>
            payDaysIn(it, y, m) // 그 달에 결제하는 날짜들 (예: [2, 9, 16, 23, 30])
              .map((day) => ({ ...it, date: new Date(y, m - 1, day) }))
              .filter((p) => !isEnded(p, p.date)), // 만기일 지난 날은 빼요
          );
        })
        .map((p) => {
          const style = categoryStyle(p.category);
          const c = colorOf(p.category); // 이 카테고리 색 { chart, color, bg }
          const date = dateKey(p.date); // "2026-11-25"
          return {
            id: `${p.id}-${date}`, // 같은 항목이 여러 날에 나와서 날짜까지 붙여요
            title: p.name,
            date,
            allDay: true,
            extendedProps: { icon: style.icon, color: c.color, bg: c.bg },
          };
        }),
    [dbItems, viewYear, viewMonth, colorOf],
  );
}
