/*
 * 지출 리포트: "10월보다" / "작년보다" 카드 값
 * - ↘ 7,810원 감소 / ↗ 5,000원 증가 / 그대로
 * - diff: 이번 금액 - 비교 금액
 */
import { won } from "@/utils/common/format";

const DiffValue = ({ diff }) => {
  if (diff === 0) return "그대로";
  return (
    <>
      <span className="rpt-arrow" aria-hidden>{diff < 0 ? "↘" : "↗"}</span>
      {won(Math.abs(diff))} {diff < 0 ? "감소" : "증가"}
    </>
  );
};

export default DiffValue;
