/*
 * getNextPaymentDate(data) 가 읽는 subscriptions 컬럼
 *
 *   cycle          결제 주기 ("매일" | "매주" | "매달" | "매년" | "사용자화")
 *   week           매주: 결제 요일 (0~6, 0=일요일 ~ 6=토요일)
 *   day            매달/매년: 결제일 (1~31)
 *   month          매년: 결제 월 (1~12)
 *   custom_number  사용자화: 반복 간격 숫자 (1 이상의 정수)
 *   custom_text    사용자화: 반복 단위 ("day" | "week" | "month" | "year")
 *   start_date     첫 결제일 ("YYYY-MM-DD", 등록할 때 고른 결제일로 계산). 사용자화는 이 날부터 반복을 세요
 *   expiry_date    만기일 ("YYYY-MM-DD", 없으면 null). 다음 결제일이 만기 뒤면 null
 *
 * 반환값: Date (계산할 수 없거나 만기가 지났으면 null)
 */
export function getNextPaymentDate(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const y = today.getFullYear();
  const m = today.getMonth() + 1;
  const d = today.getDate();

  const inRange = (v, min, max) => Number.isInteger(v) && v >= min && v <= max;
  const addDays = (n) => new Date(y, m - 1, d + n);
  // 월말 보정 (31일이 없는 달이면 그 달 마지막 날), month가 13이어도 다음 해로 넘어가요
  const validDate = (year, month, day) =>
    new Date(year, month - 1, Math.min(day, new Date(year, month, 0).getDate()));
  // "YYYY-MM-DD" → [년, 월, 일]
  const parse = (s) => String(s).split("-").map(Number);

  const next = (() => {
    switch (data.cycle) {
      case "매일":
        return addDays(1);

      case "매주": {
        const week = Number(data.week);
        if (!inRange(week, 0, 6)) return null;
        return addDays((week - today.getDay() + 7) % 7 || 7); // 오늘이면 다음 주
      }

      case "매달": {
        const day = Number(data.day);
        if (!inRange(day, 1, 31)) return null;
        const result = validDate(y, m, day);
        return result > today ? result : validDate(y, m + 1, day);
      }

      case "매년": {
        const month = Number(data.month);
        const day = Number(data.day);
        if (!inRange(month, 1, 12) || !inRange(day, 1, 31)) return null;
        const result = validDate(y, month, day);
        return result > today ? result : validDate(y + 1, month, day);
      }

      case "사용자화": {
        const n = Number(data.custom_number);
        if (!inRange(n, 1, Infinity)) return null;

        // 시작일에서 n 단위씩 k번 더한 날 (시작일이 없으면 오늘부터 센다)
        const [sy, sm, sd] = data.start_date ? parse(data.start_date) : [y, m, d];
        const nth = {
          day: (k) => new Date(sy, sm - 1, sd + k * n),
          week: (k) => new Date(sy, sm - 1, sd + k * n * 7),
          month: (k) => validDate(sy, sm + k * n, sd),
          year: (k) => validDate(sy + k * n, sm, sd),
        }[data.custom_text];
        if (!nth) return null;

        // 시작일(= 첫 결제일)부터 세서, 오늘보다 뒤인 첫 날
        let k = 0;
        while (nth(k) <= today) k++;
        return nth(k);
      }

      default:
        return null;
    }
  })();

  // 만기일이 지난 결제는 없는 것으로
  if (next && data.expiry_date) {
    const [ey, em, ed] = parse(data.expiry_date);
    if (next > new Date(ey, em - 1, ed)) return null;
  }

  return next;
}