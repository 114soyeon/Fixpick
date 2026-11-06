/** 비밀번호 보기/숨기기 버튼 */
export default function EyeButton({ show, onClick }) {
  return (
    <button type="button" className="gk-sign-eye" aria-label={show ? "비밀번호 숨기기" : "비밀번호 보기"} onClick={onClick}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
        {show && <path d="M4 4l16 16" />}
      </svg>
    </button>
  );
}
