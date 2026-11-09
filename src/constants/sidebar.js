/* 사이드바에서 쓰는 메뉴·알림 데이터 */

/** 메뉴 (key는 아이콘 이름과 같아요) */
export const MENU_ITEMS = [
  { key: "home", label: "홈" },
  { key: "expenses", label: "내 고정지출" },
  { key: "calendar", label: "결제 캘린더" },
  { key: "report", label: "지출 리포트" },
  { key: "settings", label: "설정" },
];

/* 알림 예시 데이터 (설정 페이지의 알림 종류와 맞춰져 있어요) */
const THIS_MONTH = new Date().getMonth() + 1;
const NEXT_MONTH = (THIS_MONTH % 12) + 1;
export const NOTIFICATIONS = [
  { id: 1, type: "pay", title: "넷플릭스 결제 예정", body: `${THIS_MONTH}월 10일에 14,500원이 국민카드로 결제돼요.`, time: "방금", unread: true, action: "캘린더 보기", to: "calendar" },
  { id: 2, type: "big", title: "큰 지출이 다가와요", body: `${THIS_MONTH}월 25일에 월세 486,400원이 빠져나가요.`, time: "1시간 전", unread: true, action: "캘린더 보기", to: "calendar" },
  { id: 3, type: "contract", title: "휴대폰 약정이 곧 끝나요", body: `${NEXT_MONTH}월 18일에 24개월 약정이 끝나요. 요금제를 확인해 보세요.`, time: "어제", unread: false, action: "내 고정지출", to: "expenses" },
  { id: 4, type: "budget", title: "예산의 90%를 넘었어요", body: `${THIS_MONTH}월 예산이 얼마 남지 않았어요. 리포트에서 확인해 보세요.`, time: "2일 전", unread: false, action: "리포트 보기", to: "report" },
  { id: 5, type: "done", title: "결제 완료", body: `${THIS_MONTH}월 1일에 관리비 182,400원이 결제됐어요.`, time: "4일 전", unread: false },
];
