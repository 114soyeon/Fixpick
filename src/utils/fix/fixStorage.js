/*
 * 상세 페이지 메모를 브라우저(localStorage)에 저장해요.
 *   "memo-<id>" : 메모 글자
 * (수정·삭제는 DB에 저장해요 → queries/subs.js useUpdateSub, useDeleteSub)
 */
const memoKey = (id) => `memo-${id}`;

/** 메모 저장 */
export const saveMemo = (id, memo) => localStorage.setItem(memoKey(id), memo);
