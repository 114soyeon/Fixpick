
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AMOUNT_TYPES,
  CYCLE_OPTIONS,
  MONTH_OPTIONS,
  NAME_HINTS,
  UNIT_OPTIONS,
  WEEKDAY_OPTIONS,
} from "@/constants/addItem";
import { firstPayKey } from "@/utils/common/payment";
import { useAuthStore } from "@/store/authStore";
import DatePicker from "@/components/add-item/DatePicker";
import MiniSelect from "@/components/add-item/MiniSelect";
import PayPicker from "@/components/add-item/PayPicker";
import { useCategories, useAddSub } from "@/queries/subs";

/** 고정지출 항목 추가 창 (DB에 저장해요) */
export default function AddItemModal({ onClose, setToast, payMethods = [] }) {
  const { user } = useAuthStore();
  const { data: categories } = useCategories();
  const addSub = useAddSub();

  const [closing, setClosing] = useState(false);

  // form 상태
  const [form, setForm] = useState({
    category: null,
    name: "",
    amount: "",
    amountType: "fixed",

    cycle: "매달",

    // 매주
    week: new Date().getDay(),

    // 매달 / 매년
    day: "",
    month: new Date().getMonth() + 1,

    // 사용자화
    customNumber: "1",
    customText: "month",

    payMethod: "",
    endDate: "",
    remind: true,
  });

  const nameRef = useRef(null);

  const set = (k, v) =>
    setForm((f) => ({ ...f, [k]: v }));

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 180);
  };

  const amountNum = Number(form.amount.replace(/[^0-9]/g, ""));
  const dayNum = Number(form.day);
  const customNumberNum = Number(form.customNumber);

  // 선택한 결제 주기에 따른 단위
  const custom = form.cycle === "사용자화";

  const unit = custom
    ? form.customText
    : form.cycle === "매일"
      ? "day"
      : form.cycle === "매주"
        ? "week"
        : form.cycle === "매달"
          ? "month"
          : "year";

  const needDay = unit === "month" || unit === "year";
  const wide = unit === "year" || custom;
  const variable = form.amountType === "variable";

  // 카테고리는 DB id(숫자)를 골라야 저장할 수 있어요
  const valid =
    Number.isInteger(form.category) &&
    form.name.trim() &&
    amountNum > 0 &&
    (!needDay || (dayNum >= 1 && dayNum <= 31)) &&
    (!custom || (customNumberNum >= 1 && customNumberNum <= 99));

  const picked = categories?.find((c) => c.id === form.category);
  const hint = picked ? NAME_HINTS[picked.key] : null; // DB 카테고리 key로 예시 찾기

  useEffect(() => {
    nameRef.current?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("keydown", onKey);

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 항목 추가
  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;

    // 첫 결제일: 오늘이 아니라 고른 결제일(요일·월)에 맞는 가장 가까운 날
    const startDate = firstPayKey({
      cycle: form.cycle,
      day: dayNum,
      month: Number(form.month),
      weekday: Number(form.week),
      every: customNumberNum,
      unit,
    });

    addSub.mutate(
      {
        user_id: user.id,
        category_id: form.category,
        name: form.name.trim(),
        amount: amountNum,

        cycle: form.cycle,
        amount_type: variable ? "변동" : "고정",

        payment_method_id: null,

        start_date: startDate,
        expiry_date: form.endDate || null,
        memo: null,

        // 매주 / 사용자화 주 단위일 때 요일
        week:
          form.cycle === "매주" ||
          (custom && form.customText === "week")
            ? Number(form.week)
            : null,

        // 매달 / 매년 / 사용자화 월·년 단위일 때 날짜
        day: needDay ? dayNum : null,

        // 매년 / 사용자화 년 단위일 때 월
        month:
          form.cycle === "매년" ||
          (custom && form.customText === "year")
            ? Number(form.month)
            : null,

        // 사용자화
        custom_number: custom ? customNumberNum : null,
        custom_text: custom ? form.customText : null,

        pay_method: form.payMethod,
        remind: form.remind,
      },
      {
        onError: () => {
          setToast("항목을 추가하지 못했어요. 다시 시도해 주세요");
        },
      }
    );

    setToast(`'${form.name.trim()}' 항목을 추가했어요`);
    close();
  };

  return createPortal(
    <div
      className={`gk-add-modal ${closing ? "is-closing" : ""}`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <form
        className="gk-add-modal__box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gk-add-title"
        onSubmit={submit}
      >
        <div className="gk-add-modal__head">
          <div>
            <h2 id="gk-add-title" className="gk-add-modal__title">
              고정지출 항목 추가
            </h2>
            <p className="gk-add-modal__desc">
              매달 나가는 돈을 등록하면 결제일에 맞춰 알려드려요.
            </p>
          </div>

          <button
            type="button"
            className="gk-noti__close"
            aria-label="닫기"
            onClick={close}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <fieldset className="gk-add-cats">
          <legend className="gk-field-label gk-add-cats__legend">
            카테고리
          </legend>

          <div className="gk-add-cats__list">
            {categories?.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`gk-chip is-${c.key}`}
                style={{ "--chip-color": c.chart, "--chip-tint": c.bg }} // DB 색 (sidebar.css 의 칩 색을 덮어써요)
                aria-pressed={form.category === c.id}
                onClick={() => set("category", c.id)}
              >
                <span className="gk-chip__dot" />
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="gk-field">
          <span className="gk-field-label">항목 이름</span>
          <input
            id="gk-add-name"
            ref={nameRef}
            className="gk-input"
            placeholder={`예) ${hint || "넷플릭스, 월세, 휴대폰 요금"}`}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            maxLength={30}
          />
        </label>

        {/* 금액 */}
        <div className="gk-field">
          <div className="gk-field__head">
            <label htmlFor="gk-add-amount" className="gk-field-label">
              {variable ? "예상 금액" : "금액"}
            </label>

            <div className="gk-amt-seg" role="group" aria-label="금액 종류">
              {AMOUNT_TYPES.map(([v, t]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={form.amountType === v}
                  onClick={() => set("amountType", v)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="gk-unit-wrap">
            <input
              id="gk-add-amount"
              className="gk-input gk-input--amount"
              inputMode="numeric"
              placeholder={variable ? "예상 금액" : "0"}
              value={amountNum ? amountNum.toLocaleString("ko-KR") : ""}
              onChange={(e) => set("amount", e.target.value)}
            />
            <span className="gk-unit">원</span>
          </div>

          <p className={`gk-amt-hint ${variable ? "is-variable" : ""}`}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5M12 8h.01" />
            </svg>
            매달 금액이 달라지면 예상 금액으로 넣고, 결제 후에 실제 금액으로 고칠 수 있어요
          </p>
        </div>

        {/* 결제일 + 만기일 */}
        <div className="gk-add-dates">
          <div className={`gk-field gk-field--shrink ${wide ? "gk-field--wide" : ""}`}>
            <label htmlFor="gk-add-cycle" className="gk-field-label">
              결제일
            </label>

            <div className="gk-add-day-row">
              <MiniSelect
                id="gk-add-cycle"
                label="결제 주기"
                value={form.cycle}
                options={CYCLE_OPTIONS}
                onChange={(v) => set("cycle", v)}
                className="gk-mini--cycle"
              />

              {/* 사용자화: [2] [주] 마다 [수요일] */}
              {custom && (
                <>
                  <input
                    id="gk-add-every"
                    className="gk-input gk-input--every"
                    inputMode="numeric"
                    aria-label="반복 간격"
                    placeholder="1"
                    value={form.customNumber}
                    onChange={(e) =>
                      set(
                        "customNumber",
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 2)
                      )
                    }
                  />

                  <MiniSelect
                    id="gk-add-unit"
                    label="반복 단위"
                    value={form.customText}
                    options={UNIT_OPTIONS}
                    onChange={(v) => set("customText", v)}
                    className="gk-mini--unit"
                  />

                  <span className="gk-add-day-note">마다</span>
                </>
              )}

              {form.cycle === "매일" && (
                <span className="gk-add-day-note">매일 나가요</span>
              )}

              {unit === "week" && (
                <MiniSelect
                  id="gk-add-weekday"
                  label="결제 요일"
                  value={Number(form.week)}
                  options={WEEKDAY_OPTIONS}
                  onChange={(v) => set("week", v)}
                  className="gk-mini--weekday"
                />
              )}

              {unit === "year" && (
                <MiniSelect
                  id="gk-add-month"
                  label="결제 월"
                  value={Number(form.month)}
                  options={MONTH_OPTIONS}
                  onChange={(v) => set("month", v)}
                  className="gk-mini--month"
                  grid
                />
              )}

              {needDay && (
                <div className="gk-unit-wrap gk-unit-wrap--day">
                  <input
                    id="gk-add-day"
                    className="gk-input gk-input--day"
                    inputMode="numeric"
                    placeholder="10"
                    aria-label="결제일"
                    value={form.day}
                    onChange={(e) =>
                      set(
                        "day",
                        e.target.value.replace(/[^0-9]/g, "").slice(0, 2)
                      )
                    }
                  />
                  <span className="gk-unit gk-unit--day">일</span>
                </div>
              )}
            </div>
          </div>

          <div className={`gk-field gk-field--shrink ${wide ? "gk-field--wide" : ""}`}>
            <label htmlFor="gk-add-end" className="gk-field-label">
              만기일 <span className="gk-field-label__opt">(선택)</span>
            </label>
            <DatePicker
              value={form.endDate}
              onChange={(v) => set("endDate", v)}
            />
          </div>
        </div>

        <div className="gk-field">
          <label htmlFor="gk-add-pay" className="gk-field-label">
            결제 수단 <span className="gk-field-label__opt">(선택)</span>
          </label>
          <PayPicker
            value={form.payMethod}
            onChange={(v) => set("payMethod", v)}
            recent={payMethods}
          />
        </div>

        <label className="gk-toggle-row">
          <span className="gk-toggle-row__text">
            <span className="gk-field-label">결제 알림 받기</span>
            <span className="gk-toggle-row__desc">
              사이드바 알림으로 미리 알려드려요
            </span>
          </span>
          <input
            id="gk-add-remind"
            type="checkbox"
            checked={form.remind}
            onChange={(e) => set("remind", e.target.checked)}
            className="gk-switch"
          />
        </label>

        <div className="gk-add-modal__actions">
          <button
            type="button"
            className="gk-btn gk-btn--ghost"
            onClick={close}
          >
            취소
          </button>
          <button
            type="submit"
            className="gk-btn gk-btn--primary"
            disabled={!valid}
          >
            추가하기
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}
