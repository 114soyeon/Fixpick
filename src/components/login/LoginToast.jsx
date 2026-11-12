import { useEffect } from "react";

/** 화면 아래에 잠깐 뜨는 안내 (간편 로그인 준비 중 등) */
export default function LoginToast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="gk-toast" role="status">
      <span className="gk-login-toast__icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" aria-hidden="true"><path d="M12 7v6M12 17h.01" /></svg>
      </span>
      {text}
    </div>
  );
}
