import type { Comment, Place, PlaceType } from "@/types/domain";

export const PLACE_CFG: Record<PlaceType, { label: string; color: string; bg: string; border: string; hex: string }> = {
  SMOKING_BOOTH: { label: "흡연부스", color: "#1E40AF", bg: "#EFF6FF", border: "#60A5FA", hex: "#2563EB" },
  SMOKING_AREA: { label: "흡연구역", color: "#14532D", bg: "#F0FDF4", border: "#22C55E", hex: "#16A34A" },
  IMPLICIT_SMOKING_AREA: { label: "암묵적 흡연구역", color: "#78350F", bg: "#FEFCE8", border: "#FCD34D", hex: "#FACC15" },
  NON_SMOKING_AREA: { label: "금연구역", color: "#7F1D1D", bg: "#FEF2F2", border: "#EF4444", hex: "#DC2626" },
};

export const INITIAL_PLACES: Place[] = [
  {
    id: "1",
    name: "홍익대 정문 앞 흡연구역",
    type: "SMOKING_AREA",
    description: "정문 왼쪽 벤치 근처. 유동인구가 많아 사람이 몰리는 시간대에는 주의 필요.",
    distance: "240m",
    likes: 18,
    dislikes: 3,
    commentCount: 5,
    x: 54,
    y: 55,
  },
  {
    id: "2",
    name: "와우산로 버스정류장 흡연부스",
    type: "SMOKING_BOOTH",
    description: "버스정류장 옆 공식 흡연부스. 지붕 있어 날씨 영향 없음.",
    distance: "380m",
    likes: 32,
    dislikes: 1,
    commentCount: 8,
    x: 26,
    y: 37,
    ownedByMe: true,
  },
  {
    id: "3",
    name: "홍대입구역 2번 출구 옆",
    type: "IMPLICIT_SMOKING_AREA",
    description: "공식 지정은 아니지만 흡연자들이 모이는 곳. 민원 발생 가능.",
    distance: "520m",
    likes: 9,
    dislikes: 12,
    commentCount: 3,
    x: 74,
    y: 29,
  },
  {
    id: "4",
    name: "홍익대학교 캠퍼스 내부",
    type: "NON_SMOKING_AREA",
    description: "캠퍼스 전체 금연구역. 위반 시 과태료 부과 가능.",
    distance: "150m",
    likes: 45,
    dislikes: 5,
    commentCount: 2,
    x: 50,
    y: 43,
  },
  {
    id: "5",
    name: "상수역 방면 골목",
    type: "SMOKING_AREA",
    description: "조용한 골목. 주민 통행 많으니 배려 필요.",
    distance: "780m",
    likes: 6,
    dislikes: 2,
    commentCount: 1,
    x: 17,
    y: 66,
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  { id: "c1", author: "피움러A", content: "여기 저녁에는 사람 꽤 많아요.", time: "2시간 전", isMine: false, isGuest: false },
  { id: "c2", author: "지나가던사람", content: "금연구역이랑 헷갈릴 수 있어서 조심해야 합니다.", time: "5시간 전", isMine: false, isGuest: false },
  { id: "c3", author: "guest123", content: "벤치 바로 옆이라 오래 있긴 애매해요.", time: "1일 전", isMine: true, isGuest: true },
];
