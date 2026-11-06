const NEXT_STEPS = [
  ["1", "월세·통신비·구독료를 등록해요"],
  ["2", "결제일 캘린더에서 날짜를 확인해요"],
  ["3", "결제일 전에 알림을 받아요"],
];

/** 가입 완료 화면 */
export default function SignupComplete({ name, onHome, onAdd }) {
  return (
    <div className="gk-sign-rise gk-sign-done">
      <span className="gk-sign-pop gk-sign-done__icon">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      <div className="gk-sign-done__text">
        <h2 className="gk-sign-title">가입을 마쳤어요!</h2>
        <p className="gk-sign-done__desc">
          <b className="gk-sign-done__name">{name}님</b>, 고정콕에 오신 걸 환영해요.<br />매달 나가는 돈을 하나씩 등록해 볼까요?
        </p>
      </div>
      <div className="gk-sign-done__list">
        {NEXT_STEPS.map(([n, t]) => (
          <div key={n} className="gk-sign-done__item">
            <span className="gk-sign-done__num">{n}</span>
            {t}
          </div>
        ))}
      </div>
      <div className="gk-sign-done__actions">
        <button type="button" className="gk-sign-btn" onClick={onAdd}>첫 고정지출 등록하기</button>
        <button type="button" className="gk-sign-btn gk-sign-btn--light" onClick={onHome}>홈으로 가기</button>
      </div>
    </div>
  );
}
