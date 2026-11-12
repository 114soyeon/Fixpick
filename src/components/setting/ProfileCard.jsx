/*
 * 설정 맨 위 프로필: [동그라미 글자] 이름(연필로 바꾸기) / 이메일 ....... 등록 건수
 * - user: 로그인한 사람 (안 했으면 null → "게스트", 연필 버튼 없음)
 * - items: 내가 등록한 고정지출
 */
import { useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { updateUser } from "../../utils/auth";

// 이름 → 프로필 글자: 김민지 → 동그라미 "김", 제목 "민지님"
const firstChar = (name) => name.trim().slice(0, 1);
const callName = (name) => (/^[가-힣]{3,}$/.test(name.trim()) ? name.trim().slice(1) : name.trim());

const ProfileCard = ({ user, items }) => {
  const name = user?.name || "게스트";
  const email = user?.email || "로그인하지 않았어요";

  // 이름 바꾸기 (연필 버튼)
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  // 이미 끝냈는지 표시: Enter·Esc로 입력칸이 사라질 때 onBlur가 한 번 더 불려도 무시하려고
  const editDone = useRef(false);
  const startEdit = () => {
    setNewName(name);
    editDone.current = false;
    setEditing(true);
  };
  // save가 true면 저장 (Enter·바깥 클릭), false면 취소 (Esc)
  const finishEdit = (save) => {
    if (editDone.current) return;
    editDone.current = true;
    if (save && newName.trim()) updateUser({ name: newName.trim() });
    setEditing(false);
  };

  return (
    <section className="set-profile">
      <span className="set-avatar">{firstChar(name)}</span>
      <div className="set-profile-info">
        <div className="set-name-row">
          {editing ? (
            <input
              className="set-name-input"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={() => finishEdit(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") finishEdit(true);
                if (e.key === "Escape") finishEdit(false);
              }}
            />
          ) : (
            <h2 className="set-name">{user ? `${callName(name)}님` : name}</h2>
          )}
          {user && !editing && (
            <button type="button" className="set-edit" aria-label="이름 바꾸기" onClick={startEdit}>
              <Pencil size={14} strokeWidth={2} />
            </button>
          )}
        </div>
        <p className="set-email">{email}</p>
      </div>

      <div className="set-stats">
        <div className="set-stat">
          <p className="set-stat-label">등록한 고정지출</p>
          <p className="set-stat-value">{items.length}건</p>
        </div>
        <div className="set-stat">
          <p className="set-stat-label">구독 서비스</p>
          <p className="set-stat-value">{items.filter((it) => it.category === "sub").length}개</p>
        </div>
      </div>
    </section>
  );
};

export default ProfileCard;
