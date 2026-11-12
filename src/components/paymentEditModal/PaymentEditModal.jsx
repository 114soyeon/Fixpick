import { useState } from "react";
import "../../styles/PaymentEditModal.css";
import { Calendar } from "lucide-react";

// 날짜 입력칸 (달력 아이콘 + input)
// 모달 안에서 만들면 글자를 칠 때마다 새로 만들어져서 밖으로 뺐어요
function DateInput({ value, onChange }) {
  return (
    <div className="date-input">
      <Calendar size={16} />
      <input type="date" value={value} onChange={onChange} />
    </div>
  );
}

// 결제 정보 수정 모달
// props 설명
//  - info    : 현재 결제 정보 (모달 입력칸의 처음 값으로 사용)
//  - onClose : 모달을 닫을 때 실행할 함수
//  - onSave  : 저장 버튼을 눌렀을 때 실행할 함수 (수정된 값을 넘겨줌)
function PaymentEditModal({ info, onClose, onSave }) {
  // 입력칸마다 state를 하나씩 만들어요. (처음 값은 info에서 가져옴)
  const [cycle, setCycle] = useState(info.cycle); // 주기
  const [amountType, setAmountType] = useState(info.amountType); // 금액 유형
  const [amount, setAmount] = useState(info.amount); // 금액
  const [method, setMethod] = useState(info.method); // 결제 수단
  const [startDate, setStartDate] = useState(info.startDate); // 시작일
  const [endDate, setEndDate] = useState(info.endDate); // 만기일
  const [nextDate, setNextDate] = useState(info.nextDate); // 다음 결제일

  // 저장 버튼 클릭
  function handleSave() {
    onSave({ cycle, amountType, amount, method, startDate, endDate, nextDate });
    onClose();
  }

  return (
    // 어두운 배경: 바깥을 누르면 닫힘
    <div className="modal-overlay" onClick={onClose}>
      {/* 흰색 박스: 안쪽을 눌렀을 때는 닫히지 않게 막아줘요 */}
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>결제 정보 수정</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 주기 */}
        <div className="field">
          <label className="field-label">주기</label>
          <div className="toggle-group">
            {["매년", "매월", "매주"].map((item) => (
              <button
                key={item}
                className={cycle === item ? "toggle active" : "toggle"}
                onClick={() => setCycle(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 금액 유형 */}
        <div className="field">
          <label className="field-label">금액 유형</label>
          <div className="toggle-group">
            {["고정", "변동"].map((item) => (
              <button
                key={item}
                className={amountType === item ? "toggle active" : "toggle"}
                onClick={() => setAmountType(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* 금액 */}
        <div className="amount-box">
          <input
            type="number"
            placeholder="금액을 입력하세요"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <span>원</span>
        </div>

        {/* 결제 수단 */}
        <div className="field">
          <label className="field-label">결제 수단</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">선택하세요</option>
            <option value="신한카드 ****1234">신한카드 ****1234</option>
            <option value="국민카드 ****5678">국민카드 ****5678</option>
            <option value="계좌이체">계좌이체</option>
          </select>
        </div>

        {/* 날짜 3개 */}
        <div className="date-row">
          <label>시작일</label>
          <DateInput
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-row">
          <label>만기일</label>
          <DateInput
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="date-row">
          <label>다음 결제일</label>
          <DateInput
            value={nextDate}
            onChange={(e) => setNextDate(e.target.value)}
          />
        </div>

        {/* 하단 버튼 */}
        <div className="button-row">
          <button className="cancel-btn" onClick={onClose}>
            취소
          </button>
          <button className="save-btn" onClick={handleSave}>
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentEditModal;
