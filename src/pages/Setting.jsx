import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CreditCard, Pencil, Wallet } from "lucide-react";
import "../styles/setting.css"; // 이 페이지 전용 스타일 (class는 모두 set- 로 시작)

import { deleteAccount, logout, updateUser, useUser } from "../utils/auth";
import { useItems } from "../utils/items";
import { addMethod, saveSetting, useSetting } from "../utils/setting";
import { ALERTS, BUDGETS, TIMES } from "../constants/setting";
import PayModal from "../components/setting/PayModal";
import CardIcon from "../components/add-item/CardIcon"; // 카드사 로고 (없으면 첫 글자 배지)

// 숫자 → "1,300,000"
const comma = (n) => n.toLocaleString("ko-KR");

// 이름 → 프로필 글자: 김민지 → 동그라미 "김", 제목 "민지님"
const firstChar = (name) => name.trim().slice(0, 1);
const callName = (name) => (/^[가-힣]{3,}$/.test(name.trim()) ? name.trim().slice(1) : name.trim());

/** 카드 머리: [아이콘 박스] 제목 + 설명 */
const CardHead = ({ icon: Icon, color, bg, title, desc }) => (
  <div className="set-head">
    <span className="set-head-icon" style={{ background: bg }}>
      <Icon size={20} strokeWidth={1.7} color={color} />
    </span>
    <div>
      <h2 className="set-head-title">{title}</h2>
      <p className="set-head-desc">{desc}</p>
    </div>
  </div>
);

/** 켜고 끄는 스위치 */
const Switch = ({ on, onChange, label }) => (
  <input type="checkbox" className="set-switch" aria-label={label} checked={on} onChange={(e) => onChange(e.target.checked)} />
);

const Setting = () => {
  const navigate = useNavigate();
  const user = useUser(); // 로그인 안 했으면 null
  const items = useItems(); // 내가 등록한 고정지출
  const setting = useSetting(); // 알림·예산·결제 수단

  const name = user?.name || "게스트";
  const email = user?.email || "로그인하지 않았어요";

  // 이름 바꾸기 (연필 버튼)
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState("");
  const startEdit = () => {
    setNewName(name);
    setEditing(true);
  };
  const saveName = () => {
    if (newName.trim()) updateUser({ name: newName.trim() });
    setEditing(false);
  };

  // 예산 입력칸 (저장 버튼을 눌러야 저장)
  const [budget, setBudget] = useState(setting.budget);
  const [saved, setSaved] = useState(false);
  const saveBudget = () => {
    saveSetting({ budget });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  // 결제 수단 추가 창
  const [modal, setModal] = useState(false);

  const setAlert = (key, on) => saveSetting({ alerts: { ...setting.alerts, [key]: on } });

  // 알림 한 줄: 제목 + 설명 ....... 스위치
  const alertRow = ([key, title, desc]) => (
    <li key={key} className="set-row">
      <div>
        <p className="set-row-title">{title}</p>
        <p className="set-row-desc">{desc}</p>
      </div>
      <Switch label={title} on={setting.alerts[key]} onChange={(on) => setAlert(key, on)} />
    </li>
  );

  // 이 결제 수단을 쓰는 고정지출 개수
  const countOf = (m) => items.filter((it) => it.payMethod === m.name).length;

  const quit = () => {
    if (!window.confirm("정말 탈퇴할까요? 저장된 계정 정보가 지워져요.")) return;
    deleteAccount();
    navigate("/");
  };

  return (
    <div className="set-page">
      {/* ───── 페이지 제목 ───── */}
      <header className="set-header">
        <h1 className="set-header-title">설정</h1>
        <p className="set-header-desc">알림, 예산, 결제 수단을 내 방식대로 바꿔 보세요. 바꾸면 바로 저장돼요.</p>
      </header>

      {/* ───── 프로필 ───── */}
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
                onBlur={saveName}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") setEditing(false);
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

      <div className="set-body">
        {/* ───── 왼쪽: 알림 ───── */}
        <section className="set-card set-alert">
          <CardHead icon={Bell} color="#2F7FC0" bg="#DCEFFD" title="알림" desc="결제일 전에 미리 알려드려요" />
          <ul className="set-rows">
            {alertRow(ALERTS[0])}

            {/* 결제일 알림 바로 아래에 알림 시간 줄 */}
            <li className="set-row">
              <p className="set-row-title">알림 시간</p>
              <div className="set-seg" role="radiogroup" aria-label="알림 시간">
                {TIMES.map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={setting.time === value}
                    className={setting.time === value ? "is-on" : ""}
                    onClick={() => saveSetting({ time: value })}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </li>

            {ALERTS.slice(1).map(alertRow)}
          </ul>
        </section>

        {/* ───── 오른쪽: 예산 + 결제 수단 ───── */}
        <div className="set-side">
          <section className="set-card">
            <CardHead icon={Wallet} color="#B8891F" bg="#FFF8D6" title="예산" desc="한 달에 고정지출로 쓸 금액" />
            <div className="set-budget">
              <label className="set-budget-box">
                <input
                  className="set-budget-input"
                  inputMode="numeric"
                  aria-label="한 달 예산"
                  value={budget ? comma(budget) : ""}
                  onChange={(e) => setBudget(Number(e.target.value.replace(/[^0-9]/g, "")))}
                  onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                />
                <span className="set-budget-unit">원</span>
              </label>
              <button type="button" className="set-btn-save" onClick={saveBudget}>
                {saved ? "저장됨" : "저장"}
              </button>
            </div>
            <div className="set-chips">
              {BUDGETS.map((b) => (
                <button key={b} type="button" className={`set-chip ${budget === b ? "is-on" : ""}`} onClick={() => setBudget(b)}>
                  {b / 10000}만
                </button>
              ))}
            </div>
          </section>

          <section className="set-card set-pay">
            <CardHead icon={CreditCard} color="#7364C6" bg="#EDEAFE" title="결제 수단" desc="고정지출이 빠져나가는 카드·계좌" />
            {setting.methods.length > 0 ? (
              <ul className="set-methods">
                {setting.methods.map((m) => (
                  <li key={m.id} className="set-method">
                    <CardIcon name={m.name} />
                    <div>
                      <p className="set-method-name">{m.name}</p>
                      <p className="set-method-sub">
                        {m.type === "card" ? "카드" : "계좌"} •••• {m.last4} · 고정지출 {countOf(m)}건
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="set-empty">아직 등록한 결제 수단이 없어요</p>
            )}
            <button type="button" className="set-btn-addpay" onClick={() => setModal(true)}>
              + 결제 수단 추가
            </button>
          </section>
        </div>
      </div>

      {/* ───── 계정 ───── */}
      <section className="set-card set-account">
        <div>
          <h2 className="set-row-title">계정</h2>
          <p className="set-account-desc">
            {user ? `${user.email} 계정으로 로그인했어요` : "로그인하면 설정이 내 계정에 저장돼요"}
          </p>
        </div>
        {user ? (
          <div className="set-account-btns">
            <button type="button" className="set-btn-gray" onClick={() => { logout(); navigate("/"); }}>
              로그아웃
            </button>
            <button type="button" className="set-btn-red" onClick={quit}>
              회원 탈퇴
            </button>
          </div>
        ) : (
          <button type="button" className="set-btn-gray" onClick={() => navigate("/login")}>
            로그인
          </button>
        )}
      </section>

      {modal && (
        <PayModal
          onClose={() => setModal(false)}
          onAdd={(m) => {
            addMethod(m);
            setModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Setting;
