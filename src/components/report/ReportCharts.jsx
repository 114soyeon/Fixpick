/*
 * 지출 리포트 차트 (react-chartjs-2)
 * - CategoryDonut: 카테고리 비율 도넛 → CategoryCard.jsx 안에서 사용
 * - TrendLine: 꺾은선 (최근 6개월 / 월별 흐름) → TrendCard.jsx 안에서 사용
 * 모양(색·굵기·점 크기)은 시안 SVG 값 그대로예요.
 * 시안에 없는 마우스 효과(툴팁·확대)는 넣지 않았어요 → events: []
 */
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import { useCategoryOf } from "@/hooks/useCategoryOf";

// 쓰는 부품만 등록해요
ChartJS.register(ArcElement, LineElement, PointElement, CategoryScale, LinearScale);

// 차트 글자도 페이지와 같은 글꼴로
ChartJS.defaults.font.family = "'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif";

// 시안 색
const BLUE = "#5BB8F5";
const NAVY = "#0b2a45";
const GRAY = "#52637a";
const GRID = "#E3EAF0";

/* ═════════ 도넛 ═════════ */
// cats: [{ key, value }] (큰 순서)
export const CategoryDonut = ({ cats }) => {
  const catOf = useCategoryOf(); // DB 이름·색
  return (
    <Doughnut
      data={{
        labels: cats.map((c) => catOf(c.key).name),
        datasets: [
          {
            data: cats.map((c) => c.value),
            backgroundColor: cats.map((c) => catOf(c.key).chart),
            borderColor: "#fff", // 조각 사이 흰 틈
            borderWidth: 2,
          },
        ],
      }}
      options={{
        cutout: "65%", // 시안: 바깥 반지름 126 / 안쪽 82
        events: [],
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
      }}
    />
  );
};

/* ═════════ 꺾은선 ═════════ */

// 세로축 눈금: 4줄(3칸), 칸 크기는 1·2·3·5 × 만 단위로 보기 좋게
// 예) 140만~143만 → 138만·140만·142만·144만
const NICE = [1, 2, 3, 5];
function yRange(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  for (let unit = 10000; ; unit *= 10) {
    for (const n of NICE) {
      const step = n * unit;
      const lo = Math.max(0, Math.floor(((min + max) / 2 - step * 1.5) / step) * step);
      if (lo <= min && lo + step * 3 >= max) return { min: lo, max: lo + step * 3, step };
    }
  }
}

// 시안 간격(px): 세로축 글자 → 13 → 가로선 시작 → 16 → 첫 점
const LABEL_W = 31; // "210만" 글자 칸
const LABEL_GAP = 13;
const LEFT_GAP = 16;

// 시안처럼 직접 그리는 것들: 세로축 글자, 가로 눈금선, 이번 달 세로선, 평균 점선 + "평균" 글자
// (chart.js 기본 축은 자기 마음대로 여백을 잡아서 시안 간격과 달라져요)
const guides = {
  id: "rptGuides",
  beforeDatasetsDraw(chart, _args, opts) {
    const { ctx, chartArea, scales } = chart;
    const left = chartArea.left - LEFT_GAP;
    const right = chartArea.right;
    const font = ChartJS.defaults.font.family;
    ctx.save();

    // 가로 눈금선 + 왼쪽 "144만" 글자
    scales.y.ticks.forEach((t) => {
      const y = Math.round(scales.y.getPixelForValue(t.value));
      ctx.fillStyle = GRID;
      ctx.fillRect(left, y, right - left, 1);
      ctx.fillStyle = GRAY;
      ctx.font = `12px ${font}`;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(`${t.value / 10000}만`, left - LABEL_GAP, y);
    });
    ctx.fillStyle = GRID;

    // 이번 달 세로선 (맨 위 눈금 ~ 맨 아래 눈금)
    const x = Math.round(scales.x.getPixelForValue(opts.highlight));
    ctx.fillRect(x, scales.y.top, 1, scales.y.bottom - scales.y.top);

    // 평균 점선
    const ay = scales.y.getPixelForValue(opts.average);
    ctx.strokeStyle = BLUE;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(left, ay);
    ctx.lineTo(right, ay);
    ctx.stroke();

    // "평균" 글자: 시안은 점선 왼쪽 위.
    // 첫 점이 점선 바로 위에 있으면 글자와 겹쳐서 그때만 점선 아래로 내려요
    const first = chart.getDatasetMeta(0).data[0];
    const firstAbove = first && first.y < ay && ay - first.y < 22;
    ctx.globalAlpha = 1;
    ctx.fillStyle = GRAY;
    ctx.font = `11px ${font}`;
    ctx.textAlign = "left";
    ctx.textBaseline = firstAbove ? "top" : "bottom";
    ctx.fillText("평균", left + 8, firstAbove ? ay + 4 : ay - 4);
    ctx.restore();
  },
};

// points: [{ label, value|null }] (아직 안 온 달은 null → 점 없음)
// highlight: 이번 달 점 번호 / average: 평균 금액
export const TrendLine = ({ points, highlight, average }) => {
  const values = points.map((p) => p.value).filter((v) => v != null);
  const range = yRange([...values, average]);
  const isHi = (ctx) => ctx.dataIndex === highlight;

  return (
    <Line
      plugins={[guides]}
      data={{
        labels: points.map((p) => p.label),
        datasets: [
          {
            data: points.map((p) => p.value),
            borderColor: BLUE,
            borderWidth: 2.5,
            borderCapStyle: "round",
            borderJoinStyle: "round",
            tension: 0, // 곧은 선
            // 점: 보통 흰 점(반지름 5) / 이번 달은 파란 점(반지름 6)
            pointRadius: (ctx) => (isHi(ctx) ? 6 : 5),
            pointBackgroundColor: (ctx) => (isHi(ctx) ? BLUE : "#fff"),
            pointBorderColor: (ctx) => (isHi(ctx) ? "#fff" : BLUE),
            pointBorderWidth: 2,
          },
        ],
      }}
      options={{
        events: [],
        maintainAspectRatio: false,
        clip: false, // 맨 끝 점이 잘리지 않게
        // 시안: 위 6 (맨 위 글자 반), 오른쪽 10 (마지막 점 ~ 카드 안쪽 끝)
        layout: { padding: { top: 6, right: 10, left: LABEL_W + LABEL_GAP + LEFT_GAP } },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false },
          rptGuides: { highlight, average },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
              padding: 6,
              maxRotation: 0, // 좁은 화면에선 글자를 눕히지 않고 몇 개 건너뛰어요
              font: (ctx) => ({ size: 12, weight: ctx.index === highlight ? 700 : 400 }),
              color: (ctx) => (ctx.index === highlight ? NAVY : GRAY),
            },
          },
          y: {
            min: range.min,
            max: range.max,
            grid: { display: false }, // 눈금선·글자는 위 guides에서 그려요
            border: { display: false },
            ticks: { stepSize: range.step, display: false },
          },
        },
      }}
    />
  );
};
