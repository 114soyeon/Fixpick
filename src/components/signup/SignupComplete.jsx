import { Check } from "lucide-react";
import { NEXT_STEPS } from "@/constants/signup";

/** 가입 완료 화면 */
export default function SignupComplete({ name, onHome, onAdd }) {
  return (
    <div className="gk-sign-rise gk-sign-done">
      <span className="gk-sign-pop gk-sign-done__badge"><Check size={44} strokeWidth={2.6} /></span>
      <div className="gk-sign-done__text">
        <h2 className="gk-sign-head__title">가입을 마쳤어요!</h2>
        <p className="gk-sign-done__desc">
          <b>{name}님</b>, 고정콕에 오신 걸 환영해요.<br />매달 나가는 돈을 하나씩 등록해 볼까요?
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
      <div className="gk-sign-done__btns">
        <button type="button" className="gk-sign-btn" onClick={onAdd}>첫 고정지출 등록하기</button>
        <button type="button" className="gk-sign-btn gk-sign-btn--light" onClick={onHome}>홈으로 가기</button>
      </div>
    </div>
  );
}
