import { useEffect } from "react";
import { createPortal } from "react-dom";

/** 항목을 추가하면 화면 아래에 잠깐 뜨는 안내 */
export default function SidebarToast({ text, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return createPortal(
    <div className="gk-sb-toast" role="status">
      <span className="gk-sb-toast__icon">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
      </span>
      {text}
    </div>,
    document.body
  );
}
