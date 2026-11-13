import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { BANKS, CARD_COMPANIES } from "@/constants/setting";
import CardIcon from "@/components/add-item/CardIcon";

const onlyNum = (text) => text.replace(/[^0-9]/g, "");

/** 결제 수단 추가 창 (카드 / 계좌 탭) */
export default function PayModal({ onClose, onAdd }) {
  const [type, setType] = useState("card");
  const [name, setName] = useState("");
  const [card, setCard] = useState(["", "", "", ""]); // 카드번호 4칸
  const [account, setAccount] = useState("");
  const boxes = useRef([]);

  // Esc 누르면 닫기
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isCard = type === "card";

  // 탭을 바꾸면 입력한 내용 비우기
  const changeType = (t) => {
    setType(t);
    setName("");
    setCard(["", "", "", ""]);
    setAccount("");
  };

  // 카드번호 한 칸 입력 → 4자리 다 쓰면 다음 칸으로
  const typeCard = (i, value) => {
    const v = onlyNum(value).slice(0, 4);
    setCard((list) => list.map((c, n) => (n === i ? v : c)));
    if (v.length === 4 && i < 3) boxes.current[i + 1]?.focus();
  };

  const number = isCard ? card.join("") : account;
  const ready = name && (isCard ? number.length === 16 : number.length >= 10);

  const submit = (e) => {
    e.preventDefault();
    if (!ready) return;
    onAdd({ type, name, last4: number.slice(-4) }); // 끝 4자리만 저장
  };

  return (
    <div className="set-dim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="set-modal" role="dialog" aria-modal="true" aria-labelledby="set-modal-title" onSubmit={submit}>
        <button type="button" className="set-modal-close" aria-label="닫기" onClick={onClose}>
          <X size={18} strokeWidth={1.8} />
        </button>
        <h2 id="set-modal-title" className="set-modal-title">결제 수단 추가</h2>
        <p className="set-modal-desc">고정지출이 빠져나가는 카드나 계좌를 등록해요.</p>

        <p className="set-label">종류</p>
        <div className="set-tab">
          <button type="button" className={isCard ? "is-on" : ""} onClick={() => changeType("card")}>카드</button>
          <button type="button" className={!isCard ? "is-on" : ""} onClick={() => changeType("bank")}>계좌</button>
        </div>

        <label className="set-label" htmlFor="set-company">{isCard ? "카드사" : "은행"}</label>
        {/* 고르면 선택 상자 왼쪽에 카드사 로고가 나와요 */}
        <div className="set-select-box">
          {name && <CardIcon key={name} name={name} />}
          <select id="set-company" className={`set-field set-select ${name ? "has-icon" : "is-empty"}`} value={name} onChange={(e) => setName(e.target.value)}>
            <option value="" disabled>{isCard ? "카드사 선택" : "은행 선택"}</option>
            {(isCard ? CARD_COMPANIES : BANKS).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <label className="set-label" htmlFor={isCard ? "set-card-0" : "set-account"}>{isCard ? "카드번호" : "계좌번호"}</label>
        {isCard ? (
          <div className="set-card-num">
            {card.map((c, i) => (
              <input
                key={i}
                id={`set-card-${i}`}
                ref={(el) => (boxes.current[i] = el)}
                className="set-field"
                inputMode="numeric"
                placeholder="0000"
                aria-label={`카드번호 ${i + 1}번째 4자리`}
                value={c}
                onChange={(e) => typeCard(i, e.target.value)}
                onKeyDown={(e) => e.key === "Backspace" && !c && i > 0 && boxes.current[i - 1]?.focus()}
              />
            ))}
          </div>
        ) : (
          <input
            id="set-account"
            className="set-field"
            inputMode="numeric"
            placeholder="- 없이 숫자만 입력"
            value={account}
            onChange={(e) => setAccount(onlyNum(e.target.value).slice(0, 16))}
          />
        )}

        <div className="set-modal-btns">
          <button type="button" className="set-btn-cancel" onClick={onClose}>취소</button>
          <button type="submit" className="set-btn-add" disabled={!ready}>추가하기</button>
        </div>
      </form>
    </div>
  );
}
