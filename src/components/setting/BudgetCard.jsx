/*
 * 설정 오른쪽 위: 예산 카드
 * - 입력칸에 직접 쓰면 [저장] 버튼(또는 Enter)으로 저장
 * - "130만" 같은 칩은 누르면 바로 저장 (페이지 설명 "바꾸면 바로 저장돼요"와 맞추기)
 * - 페이지에서 key를 사람(이메일)마다 다르게 줘요 → 로그인/로그아웃하면 이 카드를 새로 만들어서
 *   입력칸이 이전 사람의 예산을 들고 있지 않아요
 */
import { useEffect, useRef, useState } from "react";
import { Wallet } from "lucide-react";
import { saveSetting } from "../../utils/setting";
import { comma } from "../../utils/format";
import { BUDGETS } from "../../constants/setting";
import CardHead from "./CardHead";

const BudgetCard = ({ initial }) => {
  const [budget, setBudget] = useState(initial);
  const [saved, setSaved] = useState(false);
  const timer = useRef(null);

  // 페이지를 떠나면 "저장됨" 타이머 정리
  useEffect(() => () => clearTimeout(timer.current), []);

  const save = (value) => {
    saveSetting({ budget: value });
    setSaved(true);
    clearTimeout(timer.current); // 빠르게 여러 번 눌러도 마지막 저장 기준으로 1.5초
    timer.current = setTimeout(() => setSaved(false), 1500);
  };

  const pick = (value) => {
    setBudget(value);
    save(value);
  };

  return (
    <section className="set-card">
      <CardHead icon={Wallet} tone="yellow" title="예산" desc="한 달에 고정지출로 쓸 금액" />
      <div className="set-budget">
        <label className="set-budget-box">
          <input
            className="set-budget-input"
            inputMode="numeric"
            aria-label="한 달 예산"
            value={budget ? comma(budget) : ""}
            onChange={(e) => setBudget(Number(e.target.value.replace(/[^0-9]/g, "")))}
            onKeyDown={(e) => e.key === "Enter" && save(budget)}
          />
          <span className="set-budget-unit">원</span>
        </label>
        <button type="button" className="set-btn-save" onClick={() => save(budget)}>
          {saved ? "저장됨" : "저장"}
        </button>
      </div>
      <div className="set-chips">
        {BUDGETS.map((b) => (
          <button key={b} type="button" className={`set-chip ${budget === b ? "is-on" : ""}`} onClick={() => pick(b)}>
            {b / 10000}만
          </button>
        ))}
      </div>
    </section>
  );
};

export default BudgetCard;
