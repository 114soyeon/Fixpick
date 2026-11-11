// memo: 현재 메모 글자, onChange: 글자를 칠 때 실행할 함수
const MemoCard = ({ memo, onChange }) => {
  return (
    <section className="card">
      <h3>메모</h3>
      <textarea
        className="memo-box memo-input"
        rows={3}
        placeholder="메모를 입력하세요"
        value={memo || ""}
        onChange={onChange}
      />
    </section>
  );
};

export default MemoCard;