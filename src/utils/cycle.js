
export function getNextPaymentDate(data) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cycle = data.cycle;

  // 날짜 생성 시 월의 마지막 날짜 보정
  function createValidDate(year, month, day) {
    const lastDay = new Date(year, month, 0).getDate();
    return new Date(year, month - 1, Math.min(day, lastDay));
  }

  // 매일
  if (cycle === "매일") {
    const result = new Date(today);
    result.setDate(result.getDate() + 1);
    return result;
  }

  // 매주
  if (cycle === "매주") {
    const weekMap = {
      "일요일": 0,
      "월요일": 1,
      "화요일": 2,
      "수요일": 3,
      "목요일": 4,
      "금요일": 5,
      "토요일": 6
    };

    const targetDay = weekMap[data.week];

    if (targetDay === undefined) return null;

    let diff = (targetDay - today.getDay() + 7) % 7;

    // 오늘이 설정한 요일이면 다음 주
    if (diff === 0) diff = 7;

    const result = new Date(today);
    result.setDate(result.getDate() + diff);

    return result;
  }

  // 매달
  if (cycle === "매달") {
    const day = Number(data.day);

    if (!Number.isInteger(day) || day < 1 || day > 31) {
      return null;
    }

    let year = today.getFullYear();
    let month = today.getMonth() + 1;

    let result = createValidDate(year, month, day);

    if (result <= today) {
      month++;

      if (month > 12) {
        month = 1;
        year++;
      }

      result = createValidDate(year, month, day);
    }

    return result;
  }

  // 매년
  if (cycle === "매년") {
    const month = Number(data.month);
    const day = Number(data.day);

    if (
      !Number.isInteger(month) || month < 1 || month > 12 ||
      !Number.isInteger(day) || day < 1 || day > 31
    ) {
      return null;
    }

    let year = today.getFullYear();
    let result = createValidDate(year, month, day);

    if (result <= today) {
      year++;
      result = createValidDate(year, month, day);
    }

    return result;
  }

  // 사용자화
  if (cycle === "사용자화") {
    const number = Number(data["custom-number"]);
    const unit = data["custom-text"];

    if (!Number.isInteger(number) || number <= 0) {
      return null;
    }

    const result = new Date(today);

    // 일 단위
    if (unit === "일") {
      result.setDate(result.getDate() + number);
    }

    // 주 단위
    else if (unit === "주") {
      result.setDate(result.getDate() + number * 7);
    }

    // 개월 단위
    else if (unit === "개월") {
      const originalDay = result.getDate();

      result.setDate(1);
      result.setMonth(result.getMonth() + number);

      const lastDay = new Date(
        result.getFullYear(),
        result.getMonth() + 1,
        0
      ).getDate();

      result.setDate(Math.min(originalDay, lastDay));
    }

    // 년 단위
    else if (unit === "년") {
      const originalMonth = result.getMonth();
      const originalDay = result.getDate();

      result.setDate(1);
      result.setFullYear(result.getFullYear() + number);
      result.setMonth(originalMonth);

      const lastDay = new Date(
        result.getFullYear(),
        originalMonth + 1,
        0
      ).getDate();

      result.setDate(Math.min(originalDay, lastDay));
    }

    else {
      return null;
    }

    return result.toLocaleDateString("ko-KR");
  }

  return null;
}
