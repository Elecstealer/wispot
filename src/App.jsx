import React, { useState, useRef, useEffect } from "react";
import {
  ChevronLeft, X, Heart, MapPin, Clock, Link2, Plus, Minus,
  Users, Home, Map as MapIcon, Calendar, User, Check, SlidersHorizontal,
  Share2, Copy, MoreVertical, Trash2, Pencil, ChevronDown, ChevronUp,
  RefreshCw, Sparkles, Send, ArrowRight, ArrowLeftRight
} from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";
import GoogleMap from "./components/GoogleMap";

/* ---------------------------------------------------------
   위스팟(wispot) 클릭 프로토타입
   - 백엔드 없음. 모든 데이터는 아래 더미데이터 + React state로만 시뮬레이션.
   - 새로고침하면 초기 상태로 리셋됨 (의도된 동작).
--------------------------------------------------------- */

const C = {
  coral: "#FF7A5C",
  coralDark: "#E85F43",
  cream: "#FFF3EC",
  mint: "#5BCDB5",
  mintSoft: "#E9FAF6",
  charcoal: "#222222",
  bg: "#FFFDFC",
  muted: "#6F6762",
  line: "#F0DCD2",
};

// 장소 사진: 저작권 문제 없는 무료 스톡 사진(Unsplash CDN)으로 바로 연결.
// 로컬 파일 준비 없이 바로 보이도록 구성.
const IMG = {
  cafe1: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=900&q=60&auto=format&fit=crop",   // 어니언 성수
  cafe2: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=900&q=60&auto=format&fit=crop",   // 블루보틀 성수
  cafe3: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=900&q=60&auto=format&fit=crop",   // 밀도 성수점 / 카페 포제
  gallery: "https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=900&q=60&auto=format&fit=crop",     // 뮤지엄 그라운드
  pasta: "https://images.unsplash.com/photo-1481931098730-318b6f776db0?w=900&q=60&auto=format&fit=crop",    // 파스타 하우스 성수
  popup: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&q=60&auto=format&fit=crop",    // 무신사 뷰티 스페이스
  bar: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=900&q=60&auto=format&fit=crop",      // 성수 조디악
};
const FALLBACK_IMG = IMG; // 동일 소스라 폴백은 그대로 유지 (혹시 모를 로드 실패 대비)

// 로고: 프로젝트에 있던 위스팟_로고 파일을 그대로 내장(따로 파일 안 넣어도 됨)
const LOGO_B64 = "iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAYAAAA8AXHiAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAADF1JREFUeAHtnT9sHMcVxt/sHRlLcGAKSGE30jEV5SakKwcQEJKFgajxyVXCMDAZuAsQyUASUEwQkUEgEwkQkAbSGdEFYRhXMd3YQAqTBoK4k6nGUadzGrswoHNDGxC543l7PPJ43L3dnTe7M7N8P+B0J/L+LHY/vu/NmzdzAhxBLv2oATAyDYFU9/IKSKHu1U3IMfXrMWD66ajz01HnqR09FvAADmAPZNgWf9raAwcQYIlISKLWVIfwsjqKSWDxmEKJTokM5LsgD7fF2tttsECpwpK3mmPw1NM3QYgFFYkawBSPjKLaRtkiK0VYcml+Wn3SHXWbBsYeEnbhEDbEHze3oWAKFRYLylEwikm5Kta2WlAQhQiLBeUJkcDEoljb3AXDGBVWlENdfPqeetgExiNkC8LDVZM5mDFhyV//uAn1GoqKR3c+YtgeycKKotSFbyvbk7eA8R8p1+GrkVWx3uoAAZKwjmpRO6p80ACmOkTR63CGYo0BaCKX5yYhqH/MoqogeE1VwJC/mpsETbSEJW//5FX10h3gfKq6oLhGgp3utdZ4OeQk+iAhWsCcH6RcEG/84295XpJLWCyqc0xOcWUWVpRTsf2dZzrwJJzJ2j2RSVg8+mOO6EB4MJVltJiavEd1KhYV0yXSgry1kOpa6aPCqPgpGsAwCGrhwpM7qU8b9ku5NLcAQXAPGGaQA7gxrP0mUVicVzEpdGC/Pp409ZNshaK2wqJihqDmiA8S3Sw2YkX9VAHsAMOkEcJMXD9XfMQSkvMqJhvY0BnDGWFFCTtbIJMVAdORww1wNmIJkTqUZJhTxEStU8KSt+ebHK2Y3MRErcGIdRMYRoeBqHU8KozqVkH9ETCMLvv1S7261knEqtV4ZQ1D4+LB8bqHE2GFbIMMFXncbRpZIdugRzQmAKauAXxX3Y99p/uzz/4P8NG/AR49VBMtX4BVwoNxbKupR/9BG5TAuMxTFwHmfgEwPnH2d89dBnjlNYDHSlQ7al744/+ANaIdhGC9a4WheBkYd7mkItPPfx8vqsHnocBmbKbLXS11hRWA9jIfpgRuvHZie1mYbaaLsCi6e51BEPWyS+5jdxbMp3REgmJE+yyfMczZA5BBAxh3mdW0NbTFhqWoFQTTQS90MQ6CSXkeCxzkhWtgh0BFLJAsLFehiAp59jLYQV5RViieAcZNqMK4RBSmNmIcrXAcGDf5eh/8BCOWAI5YrkIVFlbkrSDGAi41OAxO0VCwN70zpr0/FlMCKAyKuP53H2zBwnId3Xk/nDe0OGfIwnIdFIdO1HrnLbAJC8sHtt7Mly9hhwM1PyPCwvIBHB3+5Xfp1obPQxF+UPg3mqQi5PI8d2L5BBY9sS0Gi6f4GMWE+RQm6ig8R2pfLCymEOrgEtjm8f2XupOn/W23eMO8wXbbLZMZd4SFfUfX5872EOEMP96wJ+n9Lau1GSY7biTvGKVeSWlMw3wiqee7CDBiYh6DN+xrstM05y32IxYKJk8zG3ZG/vmXUAh4LC8eWXGckHAI/56Kmp/bmoPzB/vCwhFOnmiAFx+jluk6Ddrtz5aGHwt+Li5qwOH8TglDeoyUvdYXHPm17dam8mBfWDrWNnnNrLDw4qWJqh+MsDisx7V8RYCpwWzMH5wLy7syYjfH0m29ff4FMMoP5/LnULPNYvIuzDWvJxxPb3kX5pqO53x2hfUtzZODJ9VUEo8X66qGUPEYrhoWOKYFUxn61PFzUXwOY1dYlLrUhKGLSlnJMmVwsULeQYzusrCSsC8s3SkIUytQKOJAKzdlSToCt7rieTj261j3NRNRE3bYG2HqgsfwnKGVMDoCH3e3vmZfWA8JlXTqgkwTCzonDUROisCtrcQZjn1h4Tygrh1ScxwTybeJEWqDGDUdxL6wUFS683/416q7qNPUqM6EJVOO4zM3ZwHcmCukFDt1o5bJERVlhEoROJ43R9ceuiEsjFi6J0hXICZrUJQRKkXgDnd6uCEsFJVuSNcdGZkUFsUOKcfBwsoA5STltcMi2mAaJQsL5w0dbnx0R1iUidW8F6eI7X10cj2KwB1veHRHWGiHukl8XjssYipEZ4RKEfhDFlZ2KH+FWaNWY4K+71QSeaOWrsAff2F93WAa1RFW1ota5C53eYRCEbjjokLcEhZlE4ysE8JFdgTksWTKaHCPG/3yoyusLBPC1D09s5A1cj5PGA1yxNKA0tedNiE8YbB2lUSWSEQRuAeiQtyMWLr1mbQocLUEYWWxw0Y1q+39uLkpyCeaJ29YBRzLAaZ6p9JIE/BUdcsMPdwUFuXkJdldmZvpDxMOReAerQJ3U1iUWfukcsJUgWWGQYaNUM+BDSLu7o9lsmWZ2oKscwxJUYkicE8Sd8RdYZlsWbbxnTJxI1SKwF34ksscuCssky3LlCihewxxI1SKwD1Y/dyPu8Iy1bJM6ZXCKPFfzWX0cZ9LKXd4ZIOI23uQmmhZpjbSUQq2/SNUaguyZ5vOuS0sEy3L1NZfUyPUirYgJ+G2sEy0LOtGCfzcXpQwMUKtaAtyEu5vx005qWm7BA6j34ZNjFAr2oKchPvCKrNluZ/+1hSKHWKuV+EW5CTcFxalZVkXjBKDFkwZoc4SNu/woPcqDj++maLsv9o4IVMiJ6UF2dGVzmmwsOKIixKUgq0untWu+vFDWJ0SuyaTOjQpI1RdPLVBxA9hIWUJa9jnlDmt4kkLchL+CKusraiH2W6ZluyxqBC/IlbR9Ry0u2E1qzJHqJ5/tYs/wkI+KfhkZxFNGRc8TeAe4Jewij7ZWURTRp7luQ0ifgmr6I3GsgirDDuswDec+SUs5H5BESOPaFlYqfgnrKLsMI/FFWmHDm//mAf/hFXUic8ThToFdhx41oKchH/CQkxbhU4po0hLrgAsLN33K6Jg62ELchJ+Csu0HeoIqwhLrtD3XfspLJMTwv0tyHkxbYcsLAcwdREoOY3JESpF4A7ir7BMjZ4orSkm7bAiSXsPf4VlogJuokPTVOT0uPcqDn+FhVAvqokoYSJyetyCnITfwqJeVBNRwkTLcsVsEAlAQAd8hWKHpjo0TYxQK2aDik4AEr4En9EVh8koQYmcnrcgxyMjYT0Cn9Ed8pusGVHeq4I2CCA+xRzrU/AZtKG8VoRRwmQNimLJO9tQOUKMWALa4Dsf5dzDqoiLqRO18DgqVBQ9JhB7KmKJNvgO5jhZ8xwUYRGtKfieeUaHGDU/qGC0QiQoYYW1XagC/3orPXJhhHhvCwoBRYXHkPW5f12DynIQtgXey9/MP1YqG4MqgPsk4A4vz14GuHAR4KujFS84YVyG7eBnX59L3l0GI9U/36xcQbSPjri7eakePQxhT+Va01AFMIm2OdJCS8RerRdf6ooct+Xu1bowD8trmf7xAP/pCiuQ74IU08CYAaPS+wVZrutIGSWO3Smdw5GKZpFM6ciulsTx/5fn2+ruCjCMNqIt7v59HB/1T0K3gGEoyHCj9/BEWKP1dWAYCvIkpToWllhpdVTJYRcYRo8PxVqr3fvP6X4sCavAMDpIOOV44szvb8/vVKamxZTESdLe42wHKUctJj9nNCPinsVRi8nO2WiFxPe8c9RishLIxdgfx/1QrG3uqjuuxjMpiJb4Q6SVMySv0hmtL3q90IIpGNGGsJbobInCiupaISwCw8Sz2l+3GmToukLxxiba4QYwTD8hbKiEvTXsKekLVkfrK5VoX2YMobTwdX0l7VmpwupaYm2G8y3mKK+aEeutVC1kWmIfeakMWVznGSHUta/dGJZX9ZN57wZxd2sPDsXrwJxP5OHr4m5rL+vTBeRELv10QRXF7gFzjggXVWBp5XlF7t1mxJoaDYSCa1zngcj+8osqeiloIpfnJpXnvqMeNYCpHigqqRL1HPZ36uVAQC4tNCA43GFxVY2j0V/GRD0O0sZr0QeP1qaAi6jVQRU/Yb82RREVQopY/chlldQD3OHo5SlofaFcPJptob8dGCSyRnGwot71VWA8QmyrKLWYpfCZ+R2hAORv56fVyPEeRy/n+VAlQytJrS8UChFWD7ZHZylMUD0KFVYPFcGaKim8pR7+ABibFC6oHqUIq0eUg9UOmyDhJkex0sCtQFuwX183mUOlUaqw+jkRmWyqEcn31H019ueyTVTYlA/U/TaMPNkWK2+3wQLWhDVIVMkPgoayTFXRl+omUGhqlCmeYdEN0BUPbqPeBiHbILFfTt1Gn+zaEtIg3wDCQmv4vEl5oQAAAABJRU5ErkJggg==";

const ICONS = {
  카페: "☕", 맛집: "🍝", 전시: "🖼️", "전시/팝업": "🖼️", 술집: "🍸", 놀거리: "🎡", 쇼핑: "🛍️",
};

// 본문/UI, 브랜드 포인트 타이틀 모두 Pretendard로 통일
const FONT_SANS = "'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif";
const FONT_SERIF = "'Pretendard', -apple-system, 'Apple SD Gothic Neo', sans-serif";

/* ---------------- 더미데이터 ---------------- */

const DEMO_ME = { id: "u_sieun", name: "시은", emoji: "😎" };
const MEMBERS = [
  { id: "u_sieun", name: "시은", emoji: "😎", role: "그룹장" },
  { id: "u_dagyo", name: "다교", emoji: "🐥" },
  { id: "u_nahyun", name: "나현", emoji: "🎉" },
  { id: "u_seojin", name: "서진", emoji: "😊", pending: true },
];

const INITIAL_GROUPS = [
  { id: "g1", name: "대학 친구들", icon: "📘", color: "#DCEBFB", memberIds: ["u_sieun", "u_dagyo", "u_nahyun", "u_seojin"], inviteCode: "wispot.app/invite/ab3kx9" },
  { id: "g2", name: "직장 동료", icon: "🍔", color: "#FFE1D6", memberIds: ["u_sieun", "u_dagyo", "u_nahyun"], inviteCode: "wispot.app/invite/qz91mp" },
  { id: "g3", name: "기숙사즈", icon: "🏠", color: "#E4E2FB", memberIds: ["u_sieun", "u_dagyo", "u_nahyun", "u_seojin"], inviteCode: "wispot.app/invite/tt4c02" },
];

const INITIAL_PLACES = [
  { id: "p1", groupId: "g1", name: "어니언 성수", category: "카페", region: "성수", desc: "성수 · 공장 개조 스페셜티 카페", image: IMG.cafe1, hours: "오늘 22:00까지", closed: "월요일 휴무", open: true, savedBy: "시은", likes: 3, likedBy: ["u_dagyo", "u_nahyun", "u_seojin"], status: "confirmed", location: "서울시 성동구 아차산로 9길 8 · 성수역 2번출구 도보 5분",
    memos: [
      { user: "시은", emoji: "😎", text: "루프탑 있는 카페, 어니언 포카치아 빵 맛집" },
      { user: "다교", emoji: "🐥", text: "주말에는 웨이팅 있으니까 예약 필수" },
      { user: "나현", emoji: "🎉", text: "2층 테라스 자리가 뷰 좋음!" },
    ] },
  { id: "p2", groupId: "g1", name: "뮤지엄 그라운드", category: "전시", region: "성수", desc: "성수 · 미디어아트 상설 전시", image: IMG.gallery, hours: "오늘 20:00까지", closed: "월요일 휴무", open: true, savedBy: "시은", likes: 2, likedBy: ["u_dagyo"], status: "confirmed", location: "서울시 성동구 뚝섬로 3길 20",
    memos: [{ user: "다교", emoji: "🐥", text: "티켓 미리 예매하면 조금 더 싸요" }] },
  { id: "p3", groupId: "g1", name: "파스타 하우스 성수", category: "맛집", region: "성수", desc: "성수 · 수제 파스타 전문점", image: IMG.pasta, hours: "오늘 22:00까지", closed: "화요일 휴무", open: true, savedBy: "다교", likes: 2, likedBy: ["u_sieun"], status: "unconfirmed", location: "서울시 성동구 성수이로 20길 15",
    memos: [] },
  { id: "p4", groupId: "g1", name: "무신사 뷰티 스페이스", category: "전시/팝업", region: "성수", desc: "성수 · 뷰티 팝업 · 제품 체험 팝업", image: IMG.popup, hours: "오늘 19:00까지", closed: "연중무휴", open: true, savedBy: "나현", likes: 1, likedBy: [], status: "confirmed", location: "서울시 성동구 아차산로 11길 7",
    memos: [] },
  { id: "p5", groupId: "g1", name: "블루보틀 성수", category: "카페", region: "성수", desc: "성수 · 넓고 분위기 좋은 카페", image: IMG.cafe2, hours: "오늘 21:00까지", closed: "연중무휴", open: true, savedBy: "시은", likes: 1, likedBy: [], status: "confirmed", location: "서울시 성동구 연무장길 33",
    memos: [] },
  { id: "p6", groupId: "g1", name: "밀도 성수점", category: "카페", region: "성수", desc: "성수 · 고요한 시몬 베이커리 카페", image: IMG.cafe3, hours: "오늘 23:00까지", closed: "연중무휴", open: true, savedBy: "다교", likes: 1, likedBy: [], status: "confirmed", location: "서울시 성동구 서울숲2길 44",
    memos: [] },
  { id: "p7", groupId: "g1", name: "성수 조디악", category: "술집", region: "성수", desc: "성수 · 텔레타비 컨셉의 이색바", image: IMG.bar, hours: "새벽 2:00까지", closed: "연중무휴", open: true, savedBy: "나현", likes: 2, likedBy: ["u_dagyo", "u_seojin"], status: "confirmed", location: "서울시 성동구 성수일로4길 8",
    memos: [] },
  { id: "p8", groupId: "g2", name: "카페 포제", category: "카페", region: "홍대", desc: "홍대 · 분위기 좋은 베이커리 카페", image: IMG.cafe3, hours: "오늘 22:00까지", closed: "월요일 휴무", open: true, savedBy: "시은", likes: 1, likedBy: [], status: "confirmed", location: "서울시 마포구 와우산로 12" , memos: [] },
];

const INITIAL_VOTES = [
  { id: "v1", groupId: "g1", title: "성수 카페 어디로 갈까?", candidateIds: ["p1", "p5", "p6"], responses: { u_dagyo: "p5", u_nahyun: "p1" }, deadline: "오늘 23:00 마감", closed: false, linkedPlanId: "plan2" },
];

const INITIAL_PLANS = [
  { id: "plan1", groupId: "g1", title: "시골쥐의 서울 상경", pattern: "A", date: "2026년 7월 1일 (월)", area: "성수", start: "13:00", end: "19:00", status: "upcoming", members: ["시은", "다교", "서진"], fixedPlaceId: null },
  { id: "plan2", groupId: "g1", title: "우당탕탕 성수 탐험기", pattern: "B", date: "2026년 6월 29일 (일)", area: "성수", start: "14:00", end: "20:00", status: "ongoing", members: ["시은", "다교", "나현"], fixedPlaceId: "p2",
    items: [
      { time: "14:00 - 15:30", placeId: "p2", reason: "고정 장소 · 그룹 지정", itemLikes: ["u_dagyo"], wantChange: [] },
      { time: "16:00 - 17:45", placeId: "p1", reason: "도보 8분 · 좋아요 3개 · 오늘 22:00까지 영업", itemLikes: [], wantChange: ["u_dagyo"] },
      { time: "18:00 - 19:30", placeId: "p3", reason: "그룹 저장 맛집 · 예산 범위 내 · 오늘 영업 확인", itemLikes: ["u_nahyun"], wantChange: [] },
      { time: "20:00 - 22:00", placeId: "p7", reason: "좋아요 2개 · 동선 자연스러움 · 새벽 2시까지 영업", itemLikes: [], wantChange: [] },
    ] },
  { id: "plan3", groupId: "g1", title: "홍대 생일 모임", pattern: "A", date: "2026년 5월 16일 (토)", area: "홍대/합정", start: "18:00", end: "24:00", status: "done", members: ["시은", "다교", "나현", "서진"], fixedPlaceId: null },
];

const REGIONS = ["성수", "홍대/연남", "합정/망원", "한남/이태원", "신촌/이대", "강남/신논현", "잠실/송리단길", "을지로/종로", "압구정/도산", "여의도"];
const CATEGORIES = ["맛집", "카페", "술집", "전시/팝업", "놀거리", "쇼핑"];

// 그룹에 저장된 장소가 0개일 때(Cold Start) 그래도 코스를 만들 수 있도록 준비해둔 샘플 장소.
// groupId를 "sample"로 둬서 실제 그룹 피드에는 노출되지 않고, "지금 바로 코스 짜기" 흐름에서만 쓰임.
const SAMPLE_PLACES = [
  { id: "s1", groupId: "sample", name: "성수 연방", category: "맛집", region: "성수", desc: "성수 · 감성 브런치 맛집 (샘플)", image: IMG.pasta, hours: "오늘 21:00까지", closed: "월요일 휴무", open: true, savedBy: "위스팟 추천", likes: 0, likedBy: [], status: "confirmed", location: "위치 정보는 실제 방문 전 확인해주세요", memos: [] },
  { id: "s2", groupId: "sample", name: "카페 어라운드", category: "카페", region: "성수", desc: "성수 · 조용한 브루잉 카페 (샘플)", image: IMG.cafe3, hours: "오늘 22:00까지", closed: "연중무휴", open: true, savedBy: "위스팟 추천", likes: 0, likedBy: [], status: "confirmed", location: "위치 정보는 실제 방문 전 확인해주세요", memos: [] },
  { id: "s3", groupId: "sample", name: "성수 팩토리 전시관", category: "전시/팝업", region: "성수", desc: "성수 · 상설 아트 전시 (샘플)", image: IMG.gallery, hours: "오늘 20:00까지", closed: "월요일 휴무", open: true, savedBy: "위스팟 추천", likes: 0, likedBy: [], status: "confirmed", location: "위치 정보는 실제 방문 전 확인해주세요", memos: [] },
  { id: "s4", groupId: "sample", name: "야간 포차 성수", category: "술집", region: "성수", desc: "성수 · 이자카야 스타일 포차 (샘플)", image: IMG.bar, hours: "새벽 1:00까지", closed: "연중무휴", open: true, savedBy: "위스팟 추천", likes: 0, likedBy: [], status: "confirmed", location: "위치 정보는 실제 방문 전 확인해주세요", memos: [] },
];

/* ---------------- 공용 컴포넌트 ---------------- */

function PhoneFrame({ children }) {
  return (
    <div style={{ background: "#efe4de", minHeight: "100%", display: "flex", justifyContent: "center", padding: "20px 10px", fontFamily: FONT_SANS, textAlign: "left" }}>
      <style>{`
        @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css');
        #root, body { text-align: left !important; margin: 0 !important; padding: 0 !important; max-width: none !important; display: block !important; }
      `}</style>
      <div style={{ width: 390, maxWidth: "100%", height: 780, background: C.bg, borderRadius: 32, overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.18)", border: "8px solid #fff", position: "relative", display: "flex", flexDirection: "column", fontFamily: FONT_SANS, textAlign: "left" }}>
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px 4px", fontSize: 13, fontWeight: 700, color: C.charcoal, flexShrink: 0 }}>
      <span>9:41</span>
      <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
        <span>••••</span><span>📶</span><span>🔋</span>
      </span>
    </div>
  );
}

function Header({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "6px 12px 14px", flexShrink: 0, borderBottom: `1px solid ${C.line}` }}>
      {onBack ? (
        <button onClick={onBack} style={{ background: "none", border: "none", padding: 6, cursor: "pointer" }}>
          <ChevronLeft size={22} color={C.charcoal} />
        </button>
      ) : <div style={{ width: 34 }} />}
      <div style={{ flex: 1, textAlign: "center", fontSize: 17, fontWeight: 800, color: C.charcoal, marginRight: onBack ? 34 : 0 }}>{title}</div>
      {right}
    </div>
  );
}

function Chip({ active, children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      padding: "8px 14px", borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: "pointer",
      border: active ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`,
      background: active ? C.cream : "#fff", color: active ? C.coralDark : C.muted, whiteSpace: "nowrap", ...style,
    }}>{children}</button>
  );
}

function PrimaryButton({ children, onClick, disabled, style }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: "100%", padding: "15px", borderRadius: 14, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      background: disabled ? "#F3D9CE" : C.coral, color: "#fff", fontWeight: 800, fontSize: 15, ...style,
    }}>{children}</button>
  );
}

function SecondaryButton({ children, onClick, style }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "14px", borderRadius: 14, border: `1.5px solid ${C.line}`, cursor: "pointer",
      background: "#fff", color: C.charcoal, fontWeight: 700, fontSize: 14, ...style,
    }}>{children}</button>
  );
}

function BottomNav({ active, onNav }) {
  const items = [
    { id: "feed", label: "피드", icon: Home },
    { id: "map", label: "지도", icon: MapIcon },
    { id: "appointments", label: "약속", icon: Calendar },
    { id: "profile", label: "프로필", icon: User },
  ];
  return (
    <div style={{ display: "flex", borderTop: `1px solid ${C.line}`, background: "#fff", flexShrink: 0 }}>
      {items.map((it) => {
        const Icon = it.icon;
        const isActive = active === it.id;
        return (
          <button key={it.id} onClick={() => onNav(it.id)} style={{
            flex: 1, background: "none", border: "none", padding: "10px 0 12px", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            color: isActive ? C.coral : "#B7ADA6",
          }}>
            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
            <span style={{ fontSize: 10, fontWeight: isActive ? 800 : 500 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Sheet({ onClose, children, title }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(20,15,12,0.42)", zIndex: 50, display: "flex", alignItems: "flex-end" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: "100%", maxHeight: "82%", borderRadius: "22px 22px 0 0", padding: "10px 20px 20px", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: C.line, borderRadius: 4, margin: "2px auto 14px" }} />
        {title && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: C.charcoal }}>{title}</div>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} color={C.muted} /></button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ title, desc, onCancel, onConfirm, confirmLabel = "예", cancelLabel = "아니오", danger }) {
  return (
    <div style={{ position: "absolute", inset: 0, background: "rgba(20,15,12,0.42)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 30 }}>
      <div style={{ background: "#fff", borderRadius: 18, padding: "26px 22px", width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🙈</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.charcoal, marginBottom: 6 }}>{title}</div>
        {desc && <div style={{ fontSize: 12.5, color: C.muted, marginBottom: 18, lineHeight: 1.5 }}>{desc}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${C.line}`, background: "#fff", fontWeight: 700, cursor: "pointer" }}>{cancelLabel}</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: danger ? "#E85F43" : C.coral, color: "#fff", fontWeight: 700, cursor: "pointer" }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "rgba(34,34,34,0.92)", color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, zIndex: 80, whiteSpace: "nowrap" }}>
      {message}
    </div>
  );
}

// 이미지 로드에 실패하면(=PNG를 아직 안 넣었으면) 카테고리 이모지가 그려진 박스로 자동 대체됨
function SafeImg({ src, alt, style, category }) {
  const [stage, setStage] = useState("primary"); // primary -> fallback -> placeholder
  if (stage === "placeholder") {
    return (
      <div style={{ ...style, background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: (style?.height || 56) * 0.4, flexShrink: 0 }}>
        {ICONS[category] || "📍"}
      </div>
    );
  }
  const fallbackKey = Object.keys(IMG).find((k) => IMG[k] === src);
  return (
    <img
      src={stage === "primary" ? src : FALLBACK_IMG[fallbackKey] || src}
      alt={alt}
      style={style}
      onError={() => setStage((s) => (s === "primary" ? "fallback" : "placeholder"))}
    />
  );
}

function PlaceThumb({ place, size = 56 }) {
  return <SafeImg src={place.image} alt={place.name} category={place.category} style={{ width: size, height: size, borderRadius: 12, objectFit: "cover", flexShrink: 0 }} />;
}

/* ---------------- 메인 앱 ---------------- */

export default function WispotPrototype() {
  const [history, setHistory] = useState([{ screen: "login", params: {} }]);
  const [groups, setGroups] = useState(INITIAL_GROUPS);
  const [places, setPlaces] = useState([...INITIAL_PLACES, ...SAMPLE_PLACES]);
  const [votes, setVotes] = useState(INITIAL_VOTES);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [activeGroupId, setActiveGroupId] = useState("g1");
  const [feedMode, setFeedMode] = useState("feed"); // feed | map
  const [toast, setToastMsg] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [demoMode, setDemoMode] = useState(() => window.localStorage.getItem("wispot_demo_mode") === "true");
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const toastTimer = useRef(null);

  const current = history[history.length - 1];
  const userMetadata = session?.user?.user_metadata || {};
  const ME = session
    ? {
        id: session.user.id,
        name: profile?.display_name || userMetadata.name || userMetadata.full_name || session.user.email?.split("@")[0] || "위스팟 사용자",
        emoji: profile?.avatar_emoji || "😎",
      }
    : DEMO_ME;

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setToastMsg("로그인 상태를 확인하지 못했어요");
      setSession(data.session);
      if (data.session) {
        window.localStorage.removeItem("wispot_demo_mode");
        setDemoMode(false);
      }
      setAuthReady(true);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) {
        window.localStorage.removeItem("wispot_demo_mode");
        setDemoMode(false);
      }
      setAuthReady(true);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session?.user?.id) {
      setProfile(null);
      return undefined;
    }

    let active = true;
    supabase
      .from("profiles")
      .select("display_name, avatar_emoji, avatar_url")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setToastMsg("프로필을 불러오지 못했어요");
        setProfile(data || null);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (!authReady) return;
    if ((session || demoMode) && current.screen === "login") {
      setHistory([{ screen: "groupList", params: {} }]);
    } else if (!session && !demoMode && current.screen !== "login") {
      setHistory([{ screen: "login", params: {} }]);
    }
  }, [authReady, session, demoMode, current.screen]);

  function go(screen, params = {}, replace = false) {
    setHistory((h) => (replace ? [...h.slice(0, -1), { screen, params }] : [...h, { screen, params }]));
  }
  function back() {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }
  function reset(screen, params = {}) {
    setHistory([{ screen, params }]);
  }
  function toast_(msg) {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(""), 1800);
  }

  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const groupPlaces = places.filter((p) => p.groupId === activeGroupId);
  const groupPlans = plans.filter((p) => p.groupId === activeGroupId);
  const groupVotes = votes.filter((v) => v.groupId === activeGroupId);

  function toggleLike(placeId) {
    setPlaces((prev) => prev.map((p) => {
      if (p.id !== placeId) return p;
      const has = p.likedBy.includes(ME.id);
      return { ...p, likedBy: has ? p.likedBy.filter((id) => id !== ME.id) : [...p.likedBy, ME.id], likes: has ? p.likes - 1 : p.likes + 1 };
    }));
  }

  function addMemo(placeId, text) {
    setPlaces((prev) => prev.map((p) => p.id === placeId ? { ...p, memos: [...p.memos, { user: ME.name, emoji: ME.emoji, text }] } : p));
  }

  /* ---------- 로그인 ---------- */
  function LoginScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [authMessage, setAuthMessage] = useState("");

    async function signInWithEmail(event) {
      event.preventDefault();
      if (!supabase || !email.trim()) return;
      setLoading(true);
      setAuthMessage("");
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin },
      });
      setAuthMessage(error ? error.message : "로그인 링크를 이메일로 보냈어요.");
      setLoading(false);
    }

    function startDemoMode() {
      window.localStorage.setItem("wispot_demo_mode", "true");
      setDemoMode(true);
      reset("groupList");
    }

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: 40, textAlign: "center" }}>
        <img src={`data:image/png;base64,${LOGO_B64}`} alt="wispot 로고" style={{ width: 84, height: 84, borderRadius: 22, marginBottom: 24, objectFit: "cover" }} />
        <div style={{ fontSize: 22, fontWeight: 800, color: C.charcoal, lineHeight: 1.4, fontFamily: FONT_SERIF }}>우리가 저장한 곳을<br /><span style={{ color: C.coral }}>함께 가는 날</span>까지</div>
        <div style={{ fontSize: 13, color: C.muted, marginTop: 14, lineHeight: 1.6 }}>친구들과 인스타, 지도, 카톡에서 발견한 장소를<br />한 곳에 모아두고, 약속이 생기면<br />바로 코스로 만들어드려요.</div>
        <form onSubmit={signInWithEmail} style={{ width: "100%", display: "flex", gap: 8, marginTop: 40 }}>
          <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email@example.com" style={{ minWidth: 0, flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12.5, boxSizing: "border-box" }} />
          <button disabled={loading || !isSupabaseConfigured} type="submit" style={{ border: "none", borderRadius: 12, padding: "0 14px", background: C.coral, color: "#fff", fontWeight: 800, cursor: loading ? "wait" : "pointer" }}>{loading ? "전송 중..." : "로그인 링크 받기"}</button>
        </form>
        <div style={{ fontSize: 10.5, color: "#A49A94", marginTop: 10 }}>비밀번호 없이 이메일로 받은 링크를 눌러 로그인해요.</div>
        {authMessage && <div role="status" style={{ fontSize: 11, color: authMessage.includes("보냈어요") ? "#2A9D82" : "#B24A3A", marginTop: 12, lineHeight: 1.5 }}>{authMessage}</div>}
        {!isSupabaseConfigured && <div style={{ fontSize: 10.5, color: "#B24A3A", marginTop: 12 }}>.env.local의 Supabase 설정이 필요합니다.</div>}
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, margin: "22px 0 14px", color: "#C9BFB8", fontSize: 10.5 }}>
          <span style={{ flex: 1, height: 1, background: C.line }} /><span>또는</span><span style={{ flex: 1, height: 1, background: C.line }} />
        </div>
        <button onClick={startDemoMode} style={{ width: "100%", padding: "13px", borderRadius: 13, border: `1px solid ${C.line}`, background: "#fff", color: C.charcoal, fontWeight: 800, fontSize: 13.5, cursor: "pointer" }}>
          테스트 계정으로 둘러보기
        </button>
        <div style={{ fontSize: 10.5, color: "#A49A94", marginTop: 9 }}>이메일 발송 없이 더미 데이터로 바로 시작해요.</div>
      </div>
    );
  }

  /* ---------- 그룹 리스트(홈) ---------- */
  function GroupListScreen() {
    const [selected, setSelected] = useState(activeGroupId);
    return (
      <>
        <Header title="내 그룹 목록" />
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px 10px" }}>
          {groups.map((g) => {
            const isSel = selected === g.id;
            const placeCount = places.filter((p) => p.groupId === g.id).length;
            return (
              <div key={g.id} onClick={() => setSelected(g.id)} style={{
                display: "flex", alignItems: "center", gap: 14, padding: "16px", borderRadius: 16, marginBottom: 12, cursor: "pointer",
                border: isSel ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: isSel ? C.cream : "#fff",
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{g.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 800, color: C.charcoal }}>{g.name}</div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>멤버 {g.memberIds.length}명 · 장소 {placeCount}개 저장됨</div>
                </div>
                {isSel && <Check size={20} color={C.coral} />}
              </div>
            );
          })}
          <button onClick={() => go("groupCreateStart")} style={{ width: "100%", padding: "15px", borderRadius: 14, border: `1.5px dashed ${C.line}`, background: "none", color: C.muted, fontWeight: 700, fontSize: 13.5, cursor: "pointer", marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <Plus size={16} /> 새 그룹 만들기
          </button>
        </div>
        <div style={{ padding: 18, flexShrink: 0 }}>
          <PrimaryButton onClick={() => { setActiveGroupId(selected); setFeedMode("feed"); reset("feed"); }}>계속하기</PrimaryButton>
        </div>
      </>
    );
  }

  /* ---------- 그룹 생성 흐름 ---------- */
  function GroupCreateStartScreen() {
    return (
      <>
        <Header title="" onBack={back} />
        <div style={{ flex: 1, padding: "10px 20px" }}>
          <div style={{ fontSize: 19, fontWeight: 800, color: C.charcoal, marginBottom: 18, fontFamily: FONT_SERIF }}>어떻게 시작할까요?</div>
          <div onClick={() => go("groupCreateForm")} style={{ padding: 18, borderRadius: 16, border: `1.5px solid ${C.coral}`, background: C.cream, marginBottom: 12, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>⭐</span>
              <span style={{ fontWeight: 800, color: C.charcoal, fontSize: 15 }}>새 그룹 만들기</span>
              <ArrowRight size={16} style={{ marginLeft: "auto" }} color={C.coral} />
            </div>
            <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6 }}>친구들을 초대해서 함께 장소를 모아요</div>
          </div>
          <div style={{ textAlign: "center", fontSize: 12, color: "#C9BFB8", margin: "14px 0" }}>또는 초대 링크를 받았다면</div>
          <div onClick={() => go("groupJoinPreview")} style={{ padding: 16, borderRadius: 14, border: `1px solid ${C.line}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, color: C.charcoal, fontWeight: 700, fontSize: 14 }}>
            <Link2 size={16} /> 초대 링크로 참여하기
          </div>
        </div>
      </>
    );
  }

  function GroupCreateFormScreen() {
    const [name, setName] = useState("");
    const icons = ["📘", "🍔", "🏠", "🎒", "☂️", "💼", "🌵", "📌", "🎯", "☀️", "🍀"];
    const [icon, setIcon] = useState("📘");
    const colors = ["#DCEBFB", "#FFD8D8", "#E4E2FB", "#FFF0C2", "#DCF3D8"];
    const [color, setColor] = useState(colors[0]);
    return (
      <>
        <Header title="새 그룹 만들기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.muted, marginBottom: 8 }}>그룹 미리보기</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, border: `1px solid ${C.line}`, marginBottom: 22 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{name || "그룹 이름"}</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>멤버 1명 · 장소를 함께 모아보세요</div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>그룹 이름</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="대학 친구들" style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 14, marginBottom: 20, boxSizing: "border-box" }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>그룹 아이콘</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {icons.map((ic) => (
              <button key={ic} onClick={() => setIcon(ic)} style={{ width: 44, height: 44, borderRadius: 12, border: icon === ic ? `2px solid ${C.coral}` : `1px solid ${C.line}`, background: "#fff", fontSize: 18, cursor: "pointer" }}>{ic}</button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: C.charcoal, marginBottom: 8 }}>배경색</div>
          <div style={{ display: "flex", gap: 10 }}>
            {colors.map((cl) => (
              <button key={cl} onClick={() => setColor(cl)} style={{ width: 34, height: 34, borderRadius: "50%", background: cl, border: color === cl ? `2px solid ${C.coral}` : "1px solid #eee", cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton disabled={!name.trim()} onClick={() => {
            const id = "g" + (groups.length + 1);
            setGroups((gs) => [...gs, { id, name, icon, color, memberIds: ["u_sieun"], inviteCode: `wispot.app/invite/${Math.random().toString(36).slice(2, 8)}` }]);
            setActiveGroupId(id);
            go("groupInvite", { groupId: id });
          }}>그룹 만들기</PrimaryButton>
        </div>
      </>
    );
  }

  function GroupInviteScreen() {
    const g = groups.find((x) => x.id === current.params.groupId) || activeGroup;
    return (
      <>
        <Header title="친구 초대하기" onBack={back} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 24px", textAlign: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 20 }}>{g.icon}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.charcoal }}>{g.name} 그룹이<br />만들어졌어요</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>친구들을 초대해서<br />함께 가고 싶은 장소를 모아보세요.</div>
          <div style={{ width: "100%", marginTop: 26, padding: 16, borderRadius: 14, background: C.cream, border: `1px solid ${C.line}`, textAlign: "left" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{g.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>{g.name}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, background: "#fff", borderRadius: 10, padding: "10px 12px" }}>
              <span style={{ fontSize: 12, color: C.muted }}>{g.inviteCode}</span>
              <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(g.inviteCode).catch(() => {}); toast_("복사되었습니다"); }} style={{ background: "none", border: "none", color: C.coralDark, fontWeight: 700, fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><Copy size={13} />복사</button>
            </div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <button onClick={() => { toast_("카카오톡 공유 (시뮬레이션)"); go("groupManage", { groupId: g.id }); }} style={{ width: "100%", padding: "15px", borderRadius: 14, border: "none", background: "#FEE500", color: "#391B1B", fontWeight: 800, fontSize: 14.5, cursor: "pointer" }}>💬 카카오톡으로 공유하기</button>
        </div>
      </>
    );
  }

  function GroupJoinPreviewScreen() {
    const g = groups[0];
    return (
      <>
        <Header title="" onBack={back} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 24px", textAlign: "center" }}>
          <div style={{ width: 74, height: 74, borderRadius: 18, background: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, marginBottom: 18 }}>{g.icon}</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.charcoal }}>시은님이<br />‘{g.name}’ 그룹에 초대했어요</div>
          <div style={{ display: "flex", gap: 8, marginTop: 20, width: "100%" }}>
            {[["4명", "참여 중"], ["12개", "저장된 장소"], ["1개", "진행 투표"]].map(([v, l], i) => (
              <div key={i} style={{ flex: 1, background: C.cream, borderRadius: 12, padding: "10px 4px" }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{v}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton onClick={() => { setActiveGroupId(g.id); reset("feed"); toast_("그룹에 참여했어요"); }}>그룹 참여하기</PrimaryButton>
        </div>
      </>
    );
  }

  /* ---------- 그룹 관리 ---------- */
  function GroupManageScreen() {
    const g = activeGroup;
    const [confirmDelete, setConfirmDelete] = useState(null); // member id
    const [confirmGroupDelete, setConfirmGroupDelete] = useState(false);
    return (
      <>
        <Header title="그룹 관리하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ padding: 14, borderRadius: 14, border: `1px solid ${C.line}`, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: g.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{g.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{g.name}</div>
              <Pencil size={13} color={C.muted} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, background: C.cream, borderRadius: 10, padding: "9px 12px" }}>
              <span style={{ fontSize: 11.5, color: C.coralDark, fontWeight: 600 }}>{g.inviteCode}</span>
              <button onClick={() => toast_("복사되었습니다")} style={{ background: "none", border: "none", color: C.coralDark, fontWeight: 700, fontSize: 11.5, cursor: "pointer" }}>복사</button>
            </div>
          </div>
          {MEMBERS.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 4px", borderBottom: `1px solid #F5EDE8` }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{m.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{m.name}{m.id === "u_sieun" && <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 500 }}> (나)</span>}</div>
                <div style={{ fontSize: 11.5, color: C.muted }}>{m.pending ? "초대 수락 대기 중" : `${m.role || "멤버"} · 장소 저장`}</div>
              </div>
              {m.pending ? (
                <div style={{ display: "flex", gap: 6 }}>
                  <span style={{ fontSize: 11, padding: "4px 9px", borderRadius: 999, background: C.coral, color: "#fff", fontWeight: 700 }}>수락</span>
                  <span style={{ fontSize: 11, padding: "4px 9px", borderRadius: 999, background: "#F2EBE6", color: C.muted, fontWeight: 700 }}>거절</span>
                </div>
              ) : m.id !== "u_sieun" ? (
                <button onClick={() => setConfirmDelete(m)} style={{ width: 26, height: 26, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", fontSize: 14, color: C.muted }}>−</button>
              ) : <span style={{ fontSize: 11, fontWeight: 700, color: C.coral }}>나</span>}
            </div>
          ))}
        </div>
        <div style={{ padding: 18 }}>
          <SecondaryButton onClick={() => setConfirmGroupDelete(true)} style={{ color: "#B24A3A" }}>그룹 삭제하기</SecondaryButton>
        </div>
        {confirmDelete && (
          <ConfirmDialog title={`${confirmDelete.name}을(를) 그룹에서 삭제하시겠습니까?`} desc="해당 멤버가 저장한 장소와 약속이 모두 삭제됩니다." onCancel={() => setConfirmDelete(null)} onConfirm={() => { setConfirmDelete(null); toast_(`${confirmDelete.name}님을 삭제했어요`); }} />
        )}
        {confirmGroupDelete && (
          <ConfirmDialog title="정말 그룹을 삭제하시겠습니까?" desc="그룹의 모든 장소와 약속 데이터가 사라지고 되돌릴 수 없습니다." danger onCancel={() => setConfirmGroupDelete(false)} onConfirm={() => { setConfirmGroupDelete(false); reset("groupList"); }} />
        )}
      </>
    );
  }

  /* ---------- 장소 저장 ---------- */

  function DummyPlaceSaveScreen() {
    const [selected, setSelected] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(activeGroupId);
    const [memo, setMemo] = useState("");

    function saveDummyPlace() {
      if (!selected) return;
      const exists = places.some((place) => place.groupId === selectedGroupId && place.name === selected.name);
      if (!exists) {
        setPlaces((previous) => [...previous, {
          ...selected,
          id: `p_dummy_${Date.now()}`,
          groupId: selectedGroupId,
          savedBy: ME.name,
          status: "confirmed",
          memos: memo ? [{ user: ME.name, emoji: ME.emoji, text: memo }] : [],
        }]);
      }
      toast_(exists ? "이미 그룹에 있는 더미 장소예요" : "더미 장소를 그룹에 추가했어요");
      back();
    }

    return (
      <>
        <Header title="장소 저장하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 20px" }}>
          <div style={{ padding: 14, borderRadius: 14, background: C.cream, marginBottom: 18 }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, color: C.coralDark }}>프로토타입 더미 장소</div>
            <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.5, marginTop: 5 }}>외부 장소 정보는 요청하지 않습니다. 아래 준비된 더미 데이터만 사용해요.</div>
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>추가할 장소</div>
          {SAMPLE_PLACES.map((place) => (
            <div key={place.id} onClick={() => setSelected(place)} style={{ display: "flex", gap: 10, alignItems: "center", padding: 10, borderRadius: 12, border: selected?.id === place.id ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: selected?.id === place.id ? C.cream : "#fff", marginBottom: 8, cursor: "pointer" }}>
              <PlaceThumb place={place} size={46} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>{place.name}</div>
                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{place.category} · {place.region}</div>
              </div>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${selected?.id === place.id ? C.coral : C.line}`, background: selected?.id === place.id ? C.coral : "transparent" }} />
            </div>
          ))}

          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>어느 그룹에 저장할까요?</div>
          {groups.map((group) => (
            <div key={group.id} onClick={() => setSelectedGroupId(group.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, border: selectedGroupId === group.id ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: selectedGroupId === group.id ? C.cream : "#fff", marginBottom: 8, cursor: "pointer" }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: group.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{group.icon}</div>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{group.name}</span>
            </div>
          ))}

          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "14px 0 8px" }}>메모</div>
          <input value={memo} onChange={(event) => setMemo(event.target.value)} placeholder="더미 장소에 남길 메모" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box" }} />
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton disabled={!selected} onClick={saveDummyPlace}>더미 장소 추가하기</PrimaryButton>
        </div>
      </>
    );
  }

  /* ---------- 필터 시트 ---------- */
  function FilterSheet({ region, setRegion, category, setCategory, onClose }) {
    const [tab, setTab] = useState("region");
    return (
      <Sheet title="필터" onClose={onClose}>
        <div style={{ display: "flex", gap: 20 }}>
          <div style={{ width: 76, flexShrink: 0 }}>
            {[["region", "지역"], ["category", "카테고리"]].map(([id, label]) => (
              <div key={id} onClick={() => setTab(id)} style={{ padding: "12px 0", fontSize: 13, fontWeight: tab === id ? 800 : 500, color: tab === id ? C.coral : C.muted, borderLeft: tab === id ? `2px solid ${C.coral}` : "2px solid transparent", paddingLeft: 10 }}>{label}</div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {tab === "region" ? (
              <>
                <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 700, marginBottom: 10 }}>지역 &gt; 서울</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {REGIONS.map((r) => <Chip key={r} active={region === r} onClick={() => setRegion(region === r ? null : r)}>{r} {region === r && "✓"}</Chip>)}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 700, marginBottom: 10 }}>카테고리</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Chip active={!category} onClick={() => setCategory(null)}>전체</Chip>
                  {CATEGORIES.map((cVal) => <Chip key={cVal} active={category === cVal} onClick={() => setCategory(category === cVal ? null : cVal)}>{cVal}</Chip>)}
                </div>
              </>
            )}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
          <button onClick={() => { setRegion(null); setCategory(null); }} style={{ background: "none", border: "none", color: C.muted, fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><RefreshCw size={12} /> 초기화</button>
          <button onClick={onClose} style={{ background: C.coral, border: "none", color: "#fff", fontWeight: 800, fontSize: 13, padding: "10px 22px", borderRadius: 10, cursor: "pointer" }}>적용하기</button>
        </div>
      </Sheet>
    );
  }

  /* ---------- 그룹 장소 피드 (+ 지도형) ---------- */
  function FeedScreen() {
    const [region, setRegion] = useState("성수");
    const [category, setCategory] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [mapSelected, setMapSelected] = useState(null);
    const filtered = groupPlaces.filter((p) => (!region || p.region === region) && (!category || p.category === category));

    return (
      <>
        <div style={{ padding: "10px 18px 10px", flexShrink: 0, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div onClick={() => go("groupList")} style={{ width: 32, height: 32, borderRadius: 9, background: activeGroup.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer" }}>{activeGroup.icon}</div>
            <div style={{ flex: 1, cursor: "pointer" }} onClick={() => go("groupList")}>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{activeGroup.name}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>멤버 {activeGroup.memberIds.length}명 · 장소 {groupPlaces.length}개</div>
            </div>
            <button onClick={() => go("groupManage", { groupId: activeGroup.id })} style={{ fontSize: 11.5, fontWeight: 700, color: C.charcoal, background: "#fff", border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 12px", cursor: "pointer" }}>그룹 관리</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
            <button onClick={() => setShowFilter(true)} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><SlidersHorizontal size={14} color={C.charcoal} /></button>
            {region && <Chip active onClick={() => setRegion(null)}>지역 : {region} ✕</Chip>}
            {category && <Chip active onClick={() => setCategory(null)}>카테고리 : {category} ✕</Chip>}
            <div style={{ marginLeft: "auto", display: "flex", background: C.cream, borderRadius: 999, padding: 3 }}>
              {[["feed", "피드"], ["map", "지도"]].map(([id, label]) => (
                <button key={id} onClick={() => setFeedMode(id)} style={{ border: "none", cursor: "pointer", padding: "5px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, background: feedMode === id ? "#fff" : "none", color: feedMode === id ? C.coralDark : C.muted }}>{label}</button>
              ))}
            </div>
          </div>
        </div>

        {feedMode === "feed" ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
            <button onClick={() => go("placeSave")} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1.5px dashed ${C.line}`, background: "none", color: C.muted, fontWeight: 700, fontSize: 12.5, cursor: "pointer", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={14} /> 장소 추가하기
            </button>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", marginTop: 40 }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>📍</div>
                <div style={{ fontWeight: 800, fontSize: 15, fontFamily: FONT_SERIF }}>아직 저장된 장소가 없어요</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 6, lineHeight: 1.6 }}>인스타, 지도, 카카오톡에서 발견한 장소를<br />이 그룹에 모아보세요.</div>
                <div style={{ margin: "20px 24px 0", padding: 14, borderRadius: 14, background: C.cream, border: `1px solid ${C.line}`, textAlign: "left" }}>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: C.coralDark, display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={13} /> 저장된 장소가 없어도 괜찮아요</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 5, lineHeight: 1.5 }}>지역과 카테고리만 정하면 위스팟이 추천하는 장소로 코스 초안을 먼저 만들어드려요.</div>
                  <button onClick={() => go("emptyStart")} style={{ width: "100%", marginTop: 10, padding: "11px", borderRadius: 10, border: "none", background: C.coral, color: "#fff", fontWeight: 800, fontSize: 12.5, cursor: "pointer" }}>지금 바로 코스 짜기</button>
                </div>
              </div>
            ) : filtered.map((p) => {
              const liked = p.likedBy.includes(ME.id);
              return (
                <div key={p.id} style={{ borderRadius: 16, border: `1px solid ${C.line}`, overflow: "hidden", marginBottom: 14, background: "#fff" }}>
                  <div style={{ position: "relative" }}>
                    <SafeImg src={p.image} alt={p.name} category={p.category} style={{ width: "100%", height: 140, objectFit: "cover", display: "block" }} />
                    <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 5 }}>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.92)" }}>{p.category}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.92)" }}>{p.region}</span>
                      {p.open && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: C.mint, color: "#fff" }}>오늘 영업중</span>}
                    </div>
                  </div>
                  <div style={{ padding: 12 }}>
                    <div style={{ fontWeight: 800, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 11.5, color: C.muted, margin: "3px 0 8px" }}>{p.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                      <button onClick={() => toggleLike(p.id)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 3, color: liked ? C.coral : C.muted, fontWeight: 700 }}>
                        <Heart size={13} fill={liked ? C.coral : "none"} /> {p.likes}
                      </button>
                      <span style={{ color: C.muted }}>· {p.savedBy} 저장</span>
                      <button onClick={() => go("placeDetail", { placeId: p.id })} style={{ marginLeft: "auto", background: "none", border: "none", color: C.coralDark, fontWeight: 700, cursor: "pointer" }}>상세보기 ›</button>
                    </div>
                    <div style={{ fontSize: 10.5, color: C.muted, marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} /> {p.hours} · {p.closed}</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 320 }}>
            <div style={{ flex: 1, position: "relative", minHeight: 250 }}>
              <GoogleMap places={filtered} minHeight={250} onPlaceSelect={setMapSelected} />
            </div>
            {mapSelected && (
              <div style={{ padding: 16, borderTop: `1px solid ${C.line}`, background: C.bg, flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 10 }}>
                  <SafeImg src={mapSelected.image} alt={mapSelected.name} category={mapSelected.category} style={{ width: 64, height: 64, borderRadius: 12, objectFit: "cover" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ fontWeight: 800, fontSize: 14.5, flex: 1 }}>{mapSelected.name}</div>
                      <button onClick={() => setMapSelected(null)} aria-label="장소 정보 닫기" style={{ border: "none", background: "none", padding: 2, cursor: "pointer", color: C.muted }}><X size={15} /></button>
                    </div>
                    <div style={{ fontSize: 11, color: C.muted, margin: "2px 0" }}>{mapSelected.desc}</div>
                    <div style={{ display: "flex", gap: 6, fontSize: 10.5, color: C.muted, alignItems: "center" }}>
                      <span>{mapSelected.savedBy} 저장</span><Heart size={11} color={C.coral} fill={C.coral} /><span>{mapSelected.likes}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <SecondaryButton onClick={() => go("placeDetail", { placeId: mapSelected.id })}>상세 보기</SecondaryButton>
                  <PrimaryButton onClick={() => { toast_(`${mapSelected.name} 약속에 추가 준비`); go("appointments"); }}>약속에 넣기</PrimaryButton>
                </div>
              </div>
            )}
          </div>
        )}
        {showFilter && <FilterSheet region={region} setRegion={setRegion} category={category} setCategory={setCategory} onClose={() => setShowFilter(false)} />}
      </>
    );
  }

  /* ---------- 장소 상세보기 ---------- */
  function PlaceDetailScreen() {
    const place = places.find((p) => p.id === current.params.placeId);
    const [memoInput, setMemoInput] = useState("");
    const [expandPlan, setExpandPlan] = useState(false);
    if (!place) return null;
    const liked = place.likedBy.includes(ME.id);
    const ongoing = groupPlans.filter((pl) => pl.status !== "done");
    return (
      <>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <SafeImg src={place.image} alt={place.name} category={place.category} style={{ width: "100%", height: 210, objectFit: "cover", display: "block" }} />
          <button onClick={back} style={{ position: "absolute", top: 14, left: 14, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.85)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={18} /></button>
          <div style={{ position: "absolute", bottom: 10, left: 14, display: "flex", gap: 5 }}>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.92)" }}>{place.category}</span>
            <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: "rgba(255,255,255,0.92)" }}>{place.region}</span>
            {place.open && <span style={{ fontSize: 10, fontWeight: 800, padding: "3px 9px", borderRadius: 999, background: C.mint, color: "#fff" }}>오늘 영업중</span>}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 8px" }}>
          <div style={{ fontSize: 19, fontWeight: 800, fontFamily: FONT_SERIF }}>{place.name}</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>{place.desc}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => toggleLike(place.id)} style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${liked ? C.coral : C.line}`, background: liked ? C.cream : "#fff", borderRadius: 999, padding: "6px 12px", cursor: "pointer", color: liked ? C.coralDark : C.charcoal, fontWeight: 700, fontSize: 12 }}>
              <Heart size={13} fill={liked ? C.coral : "none"} color={liked ? C.coral : C.charcoal} /> 좋아요 {place.likes}
            </button>
            <span style={{ display: "flex", alignItems: "center", border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700, color: C.muted }}>{place.savedBy} 저장</span>
          </div>

          <div style={{ marginTop: 16, padding: 14, borderRadius: 14, border: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13 }}><Clock size={15} color={C.coral} /> 영업 시간</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>{place.hours} · {place.closed}</div>
          </div>
          <div style={{ marginTop: 10, padding: 14, borderRadius: 14, border: `1px solid ${C.line}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 13 }}><MapPin size={15} color={C.coral} /> 위치</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 5 }}>{place.location}</div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 13.5, marginBottom: 10 }}><Pencil size={13} color={C.coral} /> 그룹 메모</div>
            {place.memos.map((m, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{m.emoji}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 12.5 }}>{m.user}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{m.text}</div>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${C.line}`, borderRadius: 999, padding: "8px 8px 8px 14px", marginTop: 6 }}>
              <input value={memoInput} onChange={(e) => setMemoInput(e.target.value)} placeholder="그룹 메모 남기기" style={{ flex: 1, border: "none", outline: "none", fontSize: 12.5 }} />
              <button onClick={() => { if (memoInput.trim()) { addMemo(place.id, memoInput.trim()); setMemoInput(""); } }} style={{ width: 30, height: 30, borderRadius: "50%", background: C.coral, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Send size={13} color="#fff" /></button>
            </div>
          </div>
        </div>
        <div style={{ padding: "10px 18px 18px", borderTop: `1px solid ${C.line}` }}>
          <button onClick={() => setExpandPlan((v) => !v)} style={{ width: "100%", padding: "13px", borderRadius: 14, border: "none", background: expandPlan ? C.cream : C.coral, color: expandPlan ? C.coralDark : "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            약속에 넣기 {expandPlan ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
          {expandPlan && (
            <div style={{ marginTop: 10 }}>
              {ongoing.length > 0 && <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 6 }}>진행 중인 약속</div>}
              {ongoing.map((pl) => (
                <div key={pl.id} onClick={() => {
                  setPlans((ps) => ps.map((p) => {
                    if (p.id !== pl.id) return p;
                    const existing = p.items || [];
                    const lastEnd = existing.length ? existing[existing.length - 1].time.split(" - ")[1] : p.start;
                    return { ...p, items: [...existing, { time: `${lastEnd} - 추가됨`, placeId: place.id, reason: "그룹에서 이 장소를 추가했어요", itemLikes: [], wantChange: [] }] };
                  }));
                  toast_(`"${pl.title}"에 ${place.name}을(를) 추가했어요`);
                  go("courseResult", { planId: pl.id });
                }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 4px", borderBottom: `1px solid #F5EDE8`, cursor: "pointer" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12.5 }}>{pl.title}</div>
                    <div style={{ fontSize: 10.5, color: C.muted }}>{pl.date} · {pl.area} · {pl.start} → {pl.end}</div>
                  </div>
                  <ArrowRight size={14} color={C.muted} />
                </div>
              ))}
              <div onClick={() => go("patternB", { fixedPlaceId: place.id })} style={{ marginTop: 8, padding: "10px 4px", cursor: "pointer", color: C.coralDark, fontWeight: 700, fontSize: 12.5, display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={14} /> 새 약속 만들기 · 이 장소를 고정 장소로 시작
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  /* ---------- 투표 ---------- */
  function VoteCreateScreen() {
    const [title, setTitle] = useState("");
    const [selected, setSelected] = useState([]);
    function toggle(id) {
      setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : s.length < 4 ? [...s, id] : s);
    }
    return (
      <>
        <Header title="투표 만들기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>투표 제목</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="어디서 볼까?" style={{ width: "100%", padding: "13px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, marginBottom: 18, boxSizing: "border-box" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>후보 장소 선택</span>
            <span style={{ fontSize: 11.5, color: C.muted }}>{selected.length}/4</span>
          </div>
          {groupPlaces.map((p) => (
            <div key={p.id} onClick={() => toggle(p.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, border: selected.includes(p.id) ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: selected.includes(p.id) ? C.cream : "#fff", marginBottom: 8, cursor: "pointer" }}>
              <PlaceThumb place={p} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>저장 장소 · 좋아요 {p.likes}개</div>
              </div>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${selected.includes(p.id) ? C.coral : C.line}`, background: selected.includes(p.id) ? C.coral : "none" }} />
            </div>
          ))}
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton disabled={!title.trim() || selected.length < 2} onClick={() => {
            const id = "v" + (votes.length + 1);
            setVotes((vs) => [...vs, { id, groupId: activeGroupId, title, candidateIds: selected, responses: {}, deadline: "오늘 23:00 마감", closed: false }]);
            go("voteDetail", { voteId: id });
          }}>투표 생성하기</PrimaryButton>
        </div>
      </>
    );
  }

  function VoteDetailScreen() {
    const vote = votes.find((v) => v.id === current.params.voteId);
    const [chosen, setChosen] = useState(vote?.responses?.[ME.id] || null);
    if (!vote) return null;
    const myVote = vote.responses[ME.id];
    const totalVotes = Object.keys(vote.responses).length + (chosen && !myVote ? 1 : 0);
    const counts = {};
    vote.candidateIds.forEach((id) => (counts[id] = 0));
    Object.values(vote.responses).forEach((id) => (counts[id] = (counts[id] || 0) + 1));
    if (chosen && !myVote) counts[chosen] = (counts[chosen] || 0) + 1;
    const voted = !!chosen;
    const winnerId = voted ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] : null;

    function submitVote() {
      setVotes((vs) => vs.map((v) => v.id === vote.id ? { ...v, responses: { ...v.responses, [ME.id]: chosen } } : v));
    }

    return (
      <>
        <Header title="투표하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px" }}>
          <div style={{ padding: 14, borderRadius: 14, background: C.cream, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 800, fontSize: 14, color: C.coralDark }}>🗳 {vote.title}</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>{voted ? "투표가 종료되었어요" : "아래 후보 중 하나에 투표해주세요"} · {totalVotes}/{MEMBERS.filter(m=>!m.pending).length}명 참여 · {vote.deadline}</div>
          </div>
          {vote.candidateIds.map((pid) => {
            const p = places.find((x) => x.id === pid);
            const c = counts[pid] || 0;
            const pct = totalVotes ? Math.round((c / totalVotes) * 100) : 0;
            const isTop = voted && pid === winnerId;
            return (
              <div key={pid} onClick={() => !voted && setChosen(pid)} style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, border: chosen === pid ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, marginBottom: 10, cursor: voted ? "default" : "pointer" }}>
                {voted && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isTop ? "rgba(255,122,92,0.12)" : "rgba(34,34,34,0.05)", zIndex: 0 }} />}
                <div style={{ zIndex: 1, display: "flex", alignItems: "center", gap: 10, width: "100%" }}>
                  <PlaceThumb place={p} size={44} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 10.5, color: C.muted }}>저장 장소 · 좋아요 {p.likes}개</div>
                  </div>
                  {voted ? <div style={{ fontWeight: 800, fontSize: 13, color: isTop ? C.coral : C.muted }}>{c}표{isTop && " 🏆"}</div>
                    : <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${chosen === pid ? C.coral : C.line}`, background: chosen === pid ? C.coral : "none" }} />}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ padding: 18 }}>
          {!voted ? (
            <PrimaryButton disabled={!chosen} onClick={submitVote}>투표하기</PrimaryButton>
          ) : vote.linkedPlanId ? (
            <PrimaryButton onClick={() => {
              const linkedPlan = plans.find((p) => p.id === vote.linkedPlanId);
              setPlans((ps) => ps.map((p) => {
                if (p.id !== vote.linkedPlanId || !p.items) return p;
                const idx = p.items.findIndex((it) => vote.candidateIds.includes(it.placeId));
                if (idx === -1) return p;
                return { ...p, items: p.items.map((it, i) => i === idx ? { ...it, placeId: winnerId, reason: "투표 1위 결과 반영", itemLikes: [], wantChange: [] } : it) };
              }));
              setVotes((vs) => vs.map((v) => v.id === vote.id ? { ...v, closed: true } : v));
              toast_("투표 결과를 코스에 반영했어요");
              if (linkedPlan) go("courseResult", { planId: linkedPlan.id }); else back();
            }}>이 결과로 코스에 반영하기</PrimaryButton>
          ) : (
            <PrimaryButton onClick={() => go("patternB", { fixedPlaceId: winnerId })}>1위 장소로 약속 만들기</PrimaryButton>
          )}
        </div>
      </>
    );
  }

  /* ---------- 약속 리스트 ---------- */
  function AppointmentsScreen() {
    const upcoming = groupPlans.filter((p) => p.status === "upcoming");
    const ongoing = groupPlans.filter((p) => p.status === "ongoing");
    const done = groupPlans.filter((p) => p.status === "done");

    function PlanCard({ plan, dot }) {
      const linkedVote = groupVotes.find((v) => v.linkedPlanId === plan.id);
      return (
        <div style={{ borderRadius: 14, border: `1px solid ${C.line}`, padding: 14, marginBottom: 10 }} onClick={() => plan.items && go("courseResult", { planId: plan.id })}>
          <span style={{ fontSize: 10.5, fontWeight: 800, color: C.coralDark, background: C.cream, padding: "3px 9px", borderRadius: 999 }}>{plan.date} · {plan.start} → {plan.end}</span>
          <div style={{ fontWeight: 800, fontSize: 15, marginTop: 8 }}>{plan.title}</div>
          <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{plan.members.join(" · ")} 참여{plan.items ? ` · ${plan.items.length}곳 방문 예정` : ""}</div>
          {linkedVote && (
            <div onClick={(e) => { e.stopPropagation(); go("voteDetail", { voteId: linkedVote.id }); }} style={{ marginTop: 10, background: C.mintSoft, borderRadius: 10, padding: "8px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: 9.5, fontWeight: 800, color: "#2aaa92", background: "#fff", padding: "2px 7px", borderRadius: 999, marginRight: 6 }}>투표 · 이 약속에 연결됨</span>
                <div style={{ fontSize: 11.5, fontWeight: 700, marginTop: 4 }}>{linkedVote.title}</div>
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 800, background: "#2aaa92", color: "#fff", padding: "5px 10px", borderRadius: 999 }}>투표하기</span>
            </div>
          )}
        </div>
      );
    }

    return (
      <>
        <div style={{ padding: "14px 18px 10px", flexShrink: 0, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: activeGroup.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>{activeGroup.icon}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14.5 }}>{activeGroup.name}</div>
              <div style={{ fontSize: 10.5, color: C.muted }}>멤버 {activeGroup.memberIds.length}명</div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            <button onClick={() => go("patternSelect")} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${C.line}`, background: "#fff", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>+ 새 약속 만들기</button>
            <button onClick={() => go("voteCreate")} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${C.line}`, background: "#fff", color: "#2aaa92", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>🗳 새 투표 만들기</button>
          </div>

          {groupVotes.filter(v=>!v.linkedPlanId).length > 0 && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#E8B93F" }} /><span style={{ fontWeight: 800, fontSize: 13 }}>약속 전 투표</span>
              </div>
              {groupVotes.filter(v=>!v.linkedPlanId).map((v) => (
                <div key={v.id} onClick={() => go("voteDetail", { voteId: v.id })} style={{ borderRadius: 14, border: `1px solid ${C.line}`, padding: 14, marginBottom: 14, cursor: "pointer" }}>
                  <div style={{ fontSize: 9.5, fontWeight: 800, color: "#2aaa92", background: C.mintSoft, padding: "3px 9px", borderRadius: 999, display: "inline-block" }}>투표 · 아직 약속 없음</div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginTop: 8 }}>{v.title}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>{Object.keys(v.responses).length}/{MEMBERS.filter(m=>!m.pending).length}명 참여 · {v.deadline}</div>
                </div>
              ))}
            </>
          )}

          {ongoing.length > 0 && (<>
            <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "6px 0 8px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.coral }} /><span style={{ fontWeight: 800, fontSize: 13 }}>진행 중인 약속</span></div>
            {ongoing.map((p) => <PlanCard key={p.id} plan={p} />)}
          </>)}

          {upcoming.length > 0 && (<>
            <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "16px 0 8px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#B7ADA6" }} /><span style={{ fontWeight: 800, fontSize: 13 }}>예정된 약속</span></div>
            {upcoming.map((p) => <PlanCard key={p.id} plan={p} />)}
          </>)}

          {done.length > 0 && (<>
            <div style={{ display: "flex", alignItems: "center", gap: 6, margin: "16px 0 8px" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#D8CFC8" }} /><span style={{ fontWeight: 800, fontSize: 13 }}>지난 약속</span></div>
            {done.map((p) => <PlanCard key={p.id} plan={p} />)}
          </>)}
        </div>
      </>
    );
  }

  /* ---------- 저장 장소 0개 – 지금 바로 코스 짜기 ---------- */
  function EmptyStartScreen() {
    const [region, setRegion] = useState("성수");
    const [cats, setCats] = useState(["맛집", "카페"]);
    const [members, setMembers] = useState(["u_sieun"]);
    const [title, setTitle] = useState("일단 만나서 정하는 약속");
    const [date, setDate] = useState("2026년 7월 5일");
    const [start, setStart] = useState("13:00");
    const [end, setEnd] = useState("19:00");
    return (
      <>
        <Header title="지금 바로 코스 짜기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          <div style={{ padding: 12, borderRadius: 12, background: C.cream, marginBottom: 16, display: "flex", gap: 8 }}>
            <Sparkles size={16} color={C.coral} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 12.5, color: C.coralDark }}>저장된 장소가 없어도 괜찮아요</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3, lineHeight: 1.5 }}>지역과 카테고리만 정하면 위스팟이 추천하는 장소로 코스 초안을 먼저 만들어드려요. 마음에 들면 그대로 그룹에 저장할 수 있어요.</div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>약속 이름</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box", marginBottom: 16 }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>함께 가는 사람</div>
          <MemberChips selected={members} setSelected={setMembers} />
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>지역</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {REGIONS.slice(0, 6).map((r) => <Chip key={r} active={region === r} onClick={() => setRegion(r)}>{r}</Chip>)}
          </div>
          <div style={{ display: "flex", gap: 10, margin: "16px 0 8px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>날짜</div>
              <input value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12.5, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>시간</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input value={start} onChange={(e) => setStart(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
            <ArrowRight size={14} color={C.muted} />
            <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>방문하고 싶은 카테고리</span><span style={{ fontSize: 10.5, color: C.muted }}>복수 선택</span></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cVal) => <Chip key={cVal} active={cats.includes(cVal)} onClick={() => setCats((c) => c.includes(cVal) ? c.filter((x) => x !== cVal) : [...c, cVal])}>{cVal}</Chip>)}
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton disabled={cats.length === 0} onClick={() => go("courseLoading", { pattern: "EMPTY", sample: true, title, region, date, start, end, cats })}>샘플 장소로 코스 짜기</PrimaryButton>
        </div>
      </>
    );
  }


  function PatternSelectScreen() {
    const patterns = [
      { id: "A", dot: C.coral, title: "지역을 먼저 정할게요", desc: "지역과 날짜를 정하면 저장해둔 장소로 코스를 짜줘요.", ex: "이번주 토요일 홍대" },
      { id: "B", dot: "#8A7BE0", title: "꼭 가고 싶은 장소가 있어요", desc: "고정 장소를 중심으로 주변 저장 장소를 조합해줘요.", ex: "성수 팝업 먼저" },
      { id: "C", dot: "#8A7BE0", title: "첫 장소만 정할게요", desc: "첫 장소만 정하고 이후는 그때그때 제안받아요.", ex: "일단 저녁부터" },
      { id: "D", dot: "#E8B93F", title: "아직 다 같이 정해야 해요", desc: "지역이나 장소를 그룹 투표로 정하고, 그 결과로 코스를 만들어요.", ex: "아무것도 몰라" },
    ];
    const [sel, setSel] = useState("A");
    return (
      <>
        <Header title="약속 만들기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 20px" }}>
          <div style={{ fontSize: 18, fontWeight: 800, fontFamily: FONT_SERIF }}>어떻게 시작할까요?</div>
          <div style={{ fontSize: 12, color: C.muted, marginTop: 4, marginBottom: 16 }}>코스 생성 방식에 영향을 줘요.</div>
          {groupPlaces.length === 0 && (
            <div onClick={() => go("emptyStart")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderRadius: 14, background: C.cream, border: `1px solid ${C.line}`, marginBottom: 16, cursor: "pointer" }}>
              <Sparkles size={16} color={C.coral} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 12.5, color: C.coralDark }}>아직 저장된 장소가 없어요</div>
                <div style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>지역·카테고리만 정해도 바로 코스를 만들 수 있어요</div>
              </div>
              <ArrowRight size={14} color={C.coral} />
            </div>
          )}
          {patterns.map((p) => (
            <div key={p.id} onClick={() => setSel(p.id)} style={{ padding: 16, borderRadius: 16, border: sel === p.id ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: sel === p.id ? C.cream : "#fff", marginBottom: 12, cursor: "pointer" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, fontWeight: 800, color: C.muted }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: p.dot }} /> 패턴 {p.id}</div>
              <div style={{ fontWeight: 800, fontSize: 15.5, marginTop: 4 }}>{p.title}</div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 5, lineHeight: 1.5 }}>{p.desc}</div>
              <span style={{ display: "inline-block", marginTop: 10, fontSize: 10.5, fontWeight: 700, color: C.muted, background: "#F5EDE8", padding: "3px 10px", borderRadius: 999 }}>{p.ex}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton onClick={() => go({ A: "patternA", B: "patternB", C: "patternC", D: "patternD" }[sel])}>패턴 {sel}로 시작하기</PrimaryButton>
        </div>
      </>
    );
  }

  function MemberChips({ selected, setSelected }) {
    return (
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MEMBERS.filter(m=>!m.pending).map((m) => (
          <Chip key={m.id} active={selected.includes(m.id)} onClick={() => setSelected((s) => s.includes(m.id) ? s.filter((x) => x !== m.id) : [...s, m.id])}>
            {m.name}{m.id === "u_sieun" && " (나)"}
          </Chip>
        ))}
      </div>
    );
  }

  function CourseConfigStepper({ config, setConfig }) {
    const [open, setOpen] = useState(false);
    const total = Object.values(config).reduce((a, b) => a + b, 0);
    return (
      <div style={{ borderRadius: 14, border: `1px solid ${C.line}`, padding: 14, marginTop: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 13.5 }}>AI가 시간에 맞춰 추천했어요</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>일정에 맞춰 무리 없는 기본 구성을 만들었어요.</div>
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          {Object.entries(config).map(([cat, n]) => (
            <div key={cat} style={{ flex: 1, textAlign: "center", padding: "10px 0", borderRadius: 12, background: C.cream }}>
              <div style={{ fontSize: 16 }}>{ICONS[cat]}</div>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{n}곳</div>
              <div style={{ fontSize: 10, color: C.muted }}>{cat}</div>
            </div>
          ))}
        </div>
        <button onClick={() => setOpen((v) => !v)} style={{ width: "100%", background: "none", border: "none", color: C.muted, fontSize: 12, fontWeight: 700, marginTop: 10, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
          구성 직접 조정하기 {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {open && (
          <div style={{ marginTop: 6 }}>
            {Object.entries(config).map(([cat, n]) => (
              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 4px" }}>
                <span style={{ fontSize: 15 }}>{ICONS[cat]}</span>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>{cat}</span>
                <button onClick={() => setConfig((c) => ({ ...c, [cat]: Math.max(0, c[cat] - 1) }))} style={{ width: 24, height: 24, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer" }}>−</button>
                <span style={{ width: 16, textAlign: "center", fontWeight: 700 }}>{n}</span>
                <button onClick={() => setConfig((c) => ({ ...c, [cat]: c[cat] + 1 }))} style={{ width: 24, height: 24, borderRadius: "50%", border: `1px solid ${C.line}`, background: "#fff", cursor: "pointer" }}>+</button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ---------- 패턴 A: 지역 먼저 ---------- */
  function PatternAScreen() {
    const [members, setMembers] = useState(["u_sieun"]);
    const [title, setTitle] = useState("우당탕탕 성수 탐험기");
    const [region, setRegion] = useState("성수");
    const [showRegionSheet, setShowRegionSheet] = useState(false);
    const [date, setDate] = useState("2026년 6월 29일");
    const [start, setStart] = useState("13:00");
    const [end, setEnd] = useState("19:00");
    const [cats, setCats] = useState(["맛집", "카페", "전시/팝업"]);
    const [config, setConfig] = useState({ 맛집: 1, 카페: 1, "전시/팝업": 2 });
    const regionOptions = [{ name: "성수", n: 4, likes: 8 }, { name: "한남/이태원", n: 2, likes: 3 }, { name: "강남/신논현", n: 1, likes: 2 }, { name: "합정/망원", n: 1, likes: 1 }];

    return (
      <>
        <Header title="약속 조건 선택하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          <div style={{ padding: 12, borderRadius: 12, background: C.mintSoft, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, color: "#2aaa92" }}>패턴 A · 지역 먼저</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>고정 장소 없이 지역에 저장된 장소를 조합해 전체코스를 만들어요.</div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>함께 가는 사람</div>
          <MemberChips selected={members} setSelected={setMembers} />
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>약속 이름</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box" }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>지역</div>
          <div onClick={() => setShowRegionSheet(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.coral}`, background: C.cream, cursor: "pointer" }}>
            <div><span style={{ fontWeight: 800, fontSize: 13.5 }}>{region}</span><ChevronDown size={13} style={{ marginLeft: 4, verticalAlign: -1 }} /><div style={{ fontSize: 10.5, color: C.muted }}>저장 장소 4개 · 좋아요 8개</div></div>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: C.coral, padding: "3px 9px", borderRadius: 999 }}>추천</span>
          </div>
          <div style={{ display: "flex", gap: 10, margin: "16px 0" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>날짜</div>
              <input value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12.5, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>시간</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input value={start} onChange={(e) => setStart(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
            <ArrowRight size={14} color={C.muted} />
            <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>방문하고 싶은 카테고리</span><span style={{ fontSize: 10.5, color: C.muted }}>복수 선택</span></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cVal) => <Chip key={cVal} active={cats.includes(cVal)} onClick={() => setCats((c) => c.includes(cVal) ? c.filter((x) => x !== cVal) : [...c, cVal])}>{cVal}</Chip>)}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "18px 0 4px" }}>코스 구성</div>
          <CourseConfigStepper config={config} setConfig={setConfig} />
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton onClick={() => go("courseLoading", { pattern: "A", title, region, date, start, end })}>약속 저장하고 코스 만들기</PrimaryButton>
        </div>
        {showRegionSheet && (
          <Sheet title="" onClose={() => setShowRegionSheet(false)}>
            <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 10 }}>성수</div>
            {regionOptions.map((r) => (
              <div key={r.name} onClick={() => { setRegion(r.name); setShowRegionSheet(false); }} style={{ padding: "12px 10px", borderRadius: 10, cursor: "pointer", background: region === r.name ? C.cream : "none" }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, display: "flex", justifyContent: "space-between" }}>{r.name}{region === r.name && <span style={{ fontSize: 10, color: "#fff", background: C.coral, padding: "2px 8px", borderRadius: 999 }}>추천</span>}</div>
                <div style={{ fontSize: 11, color: C.muted }}>저장 장소 {r.n}개 · 좋아요 {r.likes}개</div>
              </div>
            ))}
            <div style={{ padding: "12px 10px", color: C.muted, fontSize: 12.5 }}>직접 입력 — 원하는 지역명을 직접 입력할 수 있어요</div>
          </Sheet>
        )}
      </>
    );
  }

  /* ---------- 패턴 B: 장소 먼저 ---------- */
  function PatternBScreen() {
    const presetId = current.params.fixedPlaceId;
    const [fixed, setFixed] = useState(presetId ? [presetId] : ["p2"]);
    const [members, setMembers] = useState(["u_sieun"]);
    const [date, setDate] = useState("2026년 6월 29일");
    const [start, setStart] = useState("14:00");
    const [end, setEnd] = useState("20:00");
    const [showAddSheet, setShowAddSheet] = useState(false);
    const [title, setTitle] = useState("우당탕탕 성수 탐험기");
    return (
      <>
        <Header title="약속 조건 선택하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          <div style={{ padding: 12, borderRadius: 12, background: "#F1EEFB", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, color: "#5B4FC4" }}>패턴 B · 장소 먼저</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>고정 장소를 중심으로 전체코스를 만들어요.</div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>약속 이름</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box", marginBottom: 16 }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>고정 장소</div>
          {fixed.map((fid) => {
            const p = places.find((x) => x.id === fid);
            if (!p) return null;
            return (
              <div key={fid} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, border: `1px solid ${C.line}`, marginBottom: 8 }}>
                <PlaceThumb place={p} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>{p.category} · 좋아요 {p.likes}개 · {p.hours}</div>
                </div>
                <button onClick={() => setFixed((f) => f.filter((x) => x !== fid))} style={{ fontSize: 11, fontWeight: 800, color: C.coralDark, background: "none", border: "none", cursor: "pointer" }}>삭제</button>
              </div>
            );
          })}
          <button onClick={() => setShowAddSheet(true)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1.5px dashed ${C.line}`, background: "none", color: C.coralDark, fontWeight: 700, fontSize: 12.5, cursor: "pointer", marginBottom: 18 }}>+ 고정 장소 추가하기</button>

          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>함께 가는 사람</div>
          <MemberChips selected={members} setSelected={setMembers} />

          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>추천 지역</div>
          <div style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>고정 장소를 기준으로 자동 설정했어요.</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.coral}`, background: C.cream }}>
            <span style={{ fontWeight: 800, fontSize: 13.5 }}>성수 <span style={{ fontSize: 10.5, color: C.muted, fontWeight: 500 }}>· 저장 장소 4개 · 좋아요 8개</span></span>
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: C.coral, padding: "3px 9px", borderRadius: 999 }}>추천</span>
          </div>

          <div style={{ display: "flex", gap: 10, margin: "16px 0 8px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>날짜</div>
              <input value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12.5, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>시간</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input value={start} onChange={(e) => setStart(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
            <ArrowRight size={14} color={C.muted} />
            <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton disabled={fixed.length === 0} onClick={() => go("courseLoading", { pattern: "B", title, date, start, end })}>약속 저장하고 코스 만들기</PrimaryButton>
        </div>
        {showAddSheet && (
          <Sheet title="고정 장소 추가하기" onClose={() => setShowAddSheet(false)}>
            {groupPlaces.filter((p) => !fixed.includes(p.id)).map((p) => (
              <div key={p.id} onClick={() => { setFixed((f) => [...f, p.id]); setShowAddSheet(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, cursor: "pointer", borderBottom: `1px solid #F5EDE8` }}>
                <PlaceThumb place={p} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>{p.category} · 좋아요 {p.likes}개 · {p.hours}</div>
                </div>
                <Plus size={16} color={C.coral} />
              </div>
            ))}
          </Sheet>
        )}
      </>
    );
  }

  /* ---------- 패턴 C: 첫 장소만 ---------- */
  function PatternCScreen() {
    const [fixed, setFixed] = useState("p2");
    const [showSheet, setShowSheet] = useState(false);
    const [members, setMembers] = useState(["u_sieun"]);
    const [title, setTitle] = useState("우당탕탕 성수 탐험기");
    const [cats, setCats] = useState(["맛집", "카페"]);
    const [looseness, setLooseness] = useState("loose"); // loose | full
    const [startTime, setStartTime] = useState("16:00");
    const p = places.find((x) => x.id === fixed);
    return (
      <>
        <Header title="약속 조건 선택하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          <div style={{ padding: 12, borderRadius: 12, background: "#F1EEFB", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, color: "#5B4FC4" }}>패턴 C · 첫 장소만</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>첫 장소만 정하고, 이후 코스는 첫 장소의 주변 장소와 영업시간을 기준으로 이어서 제안해요.</div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>약속 이름</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box", marginBottom: 16 }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>고정 장소</div>
          {p && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, border: `1px solid ${C.line}`, marginBottom: 16 }}>
              <PlaceThumb place={p} size={44} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>{p.category} · 좋아요 {p.likes}개 · {p.hours}</div>
              </div>
              <button onClick={() => setShowSheet(true)} style={{ fontSize: 11, fontWeight: 800, color: "#5B4FC4", background: "#F1EEFB", border: "none", borderRadius: 999, padding: "5px 10px", cursor: "pointer" }}>변경</button>
            </div>
          )}
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>함께 가는 사람</div>
          <MemberChips selected={members} setSelected={setMembers} />
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>첫 장소 기준 지역</div>
          <div style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.coral}`, background: C.cream }}>
            <div style={{ fontWeight: 800, fontSize: 13.5 }}>성수 주변</div>
            <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3 }}>첫 장소를 기준으로 자동 설정했어요. 이 주변의 저장 장소를 이어서 추천할게요.</div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", margin: "16px 0 8px" }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>이후 방문하고 싶은 카테고리</span><span style={{ fontSize: 10.5, color: C.muted }}>복수 선택</span></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cVal) => <Chip key={cVal} active={cats.includes(cVal)} onClick={() => setCats((c) => c.includes(cVal) ? c.filter((x) => x !== cVal) : [...c, cVal])}>{cVal}</Chip>)}
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>코스를 얼마나 짜드릴까요?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div onClick={() => setLooseness("loose")} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: looseness === "loose" ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: looseness === "loose" ? C.cream : "#fff", cursor: "pointer" }}>
              <div style={{ fontWeight: 800, fontSize: 12.5, color: looseness === "loose" ? C.coralDark : C.charcoal }}>느슨하게</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>다음 1~2곳만 추천받고, 나머지는 그때그때 정해요</div>
            </div>
            <div onClick={() => setLooseness("full")} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: looseness === "full" ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: looseness === "full" ? C.cream : "#fff", cursor: "pointer" }}>
              <div style={{ fontWeight: 800, fontSize: 12.5, color: looseness === "full" ? C.coralDark : C.charcoal }}>시간 채워서</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>일정 끝날 때까지 전체 코스를 미리 짜줘요</div>
            </div>
          </div>

          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>날짜</div>
          <input defaultValue="2026년 6월 29일" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box", marginBottom: 16 }} />
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>시간</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
            <ArrowRight size={14} color={C.muted} />
            <div style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", color: C.muted, background: "#FAFAFA" }}>{looseness === "loose" ? "자유롭게" : "22:00"}</div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton onClick={() => go("courseLoading", { pattern: "C", title, looseCount: looseness === "loose" ? 2 : 4 })}>첫 장소로 약속 만들기</PrimaryButton>
        </div>
        {showSheet && (
          <Sheet title="첫 장소 변경하기" onClose={() => setShowSheet(false)}>
            {groupPlaces.map((pl) => (
              <div key={pl.id} onClick={() => { setFixed(pl.id); setShowSheet(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, cursor: "pointer", borderBottom: `1px solid #F5EDE8` }}>
                <PlaceThumb place={pl} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{pl.name}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>{pl.category} · 좋아요 {pl.likes}개</div>
                </div>
              </div>
            ))}
          </Sheet>
        )}
      </>
    );
  }

  /* ---------- 패턴 D: 투표 기반 ---------- */
  function PatternDScreen() {
    const [step, setStep] = useState("setup");
    const [members, setMembers] = useState(["u_sieun"]);
    const [title, setTitle] = useState("시골쥐의 서울 상경");
    const [voteBy, setVoteBy] = useState("region");
    const [selected, setSelected] = useState(["성수", "홍대/연남", "한남/이태원"]);
    const [deadline, setDeadline] = useState("오늘 22:00");
    const [pickMode, setPickMode] = useState("single"); // single | multi
    const [chosen, setChosen] = useState(null);
    const [date, setDate] = useState("2026년 7월 1일");
    const [start, setStart] = useState("13:00");
    const [end, setEnd] = useState("19:00");
    const [cats, setCats] = useState(["맛집", "카페", "전시/팝업"]);
    const [config, setConfig] = useState({ 맛집: 1, 카페: 1, "전시/팝업": 1 });
    const memberCount = MEMBERS.filter((m) => !m.pending).length;
    const options = voteBy === "region"
      ? [{ id: "성수", n: 8, likes: 14 }, { id: "홍대/연남", n: 5, likes: 12 }, { id: "한남/이태원", n: 4, likes: 9 }]
      : groupPlaces.slice(0, 3).map((p) => ({ id: p.id, n: p.likes, likes: p.likes, place: p }));

    if (step === "setup") return (
      <>
        <Header title="약속 조건 선택하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          <div style={{ padding: 12, borderRadius: 12, background: "#FEF6E4", marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, color: "#B8860B" }}>패턴 D · 투표 먼저</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>투표를 통해 결정된 지역·장소로 약속을 만들어요.</div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>함께 가는 사람</div>
          <MemberChips selected={members} setSelected={setMembers} />
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>약속 이름</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 10, margin: "16px 0 8px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>날짜 (대략)</div>
              <input value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12.5, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>시간</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input value={start} onChange={(e) => setStart(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
            <ArrowRight size={14} color={C.muted} />
            <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>뭘 투표로 정할까요?</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip active={voteBy === "region"} onClick={() => setVoteBy("region")} style={{ flex: 1, textAlign: "center" }}>지역</Chip>
            <Chip active={voteBy === "place"} onClick={() => setVoteBy("place")} style={{ flex: 1, textAlign: "center" }}>장소</Chip>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton onClick={() => setStep("vote")}>투표 만들기</PrimaryButton>
        </div>
      </>
    );

    if (step === "vote" && !chosen) return (
      <>
        <Header title="투표 만들기" onBack={() => setStep("setup")} />
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>후보 {voteBy === "region" ? "지역" : "장소"} 선택 <span style={{ color: C.muted, fontWeight: 500 }}>{selected.length}/4</span></div>
          {options.map((o) => (
            <div key={o.id} onClick={() => setSelected((s) => s.includes(o.id) ? s.filter((x) => x !== o.id) : s.length < 4 ? [...s, o.id] : s)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, border: selected.includes(o.id) ? `1.5px solid ${C.coral}` : `1px solid ${C.line}`, background: selected.includes(o.id) ? C.cream : "#fff", marginBottom: 8, cursor: "pointer" }}>
              {o.place && <PlaceThumb place={o.place} size={40} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{o.id}</div>
                <div style={{ fontSize: 10.5, color: C.muted }}>저장 장소 {o.n}개 · 좋아요 {o.likes}개</div>
              </div>
              <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${selected.includes(o.id) ? C.coral : C.line}`, background: selected.includes(o.id) ? C.coral : "none" }} />
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>마감</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["오늘 22:00", "내일 오전", "약속 12시간 전"].map((d) => <Chip key={d} active={deadline === d} onClick={() => setDeadline(d)}>{d}</Chip>)}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700 }}>선택 방식</span>
            <div style={{ display: "flex", gap: 6 }}>
              <Chip active={pickMode === "single"} onClick={() => setPickMode("single")}>단일 선택</Chip>
              <Chip active={pickMode === "multi"} onClick={() => setPickMode("multi")}>복수 선택</Chip>
            </div>
          </div>
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton disabled={selected.length < 2} onClick={() => setStep("voting")}>투표 생성하기</PrimaryButton>
        </div>
      </>
    );

    if (step === "voting" && !chosen) {
      const counts = { [selected[0]]: 2, [selected[1]]: 1 };
      const totalVotes = Object.values(counts).reduce((a, b) => a + b, 0);
      const leader = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
      return (
        <>
          <Header title="투표하기" onBack={() => setStep("vote")} />
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            <div style={{ padding: 14, borderRadius: 14, background: C.cream, marginBottom: 16 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>🗳 {title} · 어디서 볼까?</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>아래 후보 중 {pickMode === "single" ? "하나" : "원하는 만큼"} 투표해주세요 · {totalVotes}/{memberCount}명 참여 · {deadline} 마감</div>
            </div>
            {selected.map((id) => {
              const c = counts[id] || 0;
              const pct = totalVotes ? Math.round((c / totalVotes) * 100) : 0;
              const isLeader = c > 0 && id === leader;
              return (
                <div key={id} onClick={() => setChosen(id)} style={{ position: "relative", overflow: "hidden", display: "flex", alignItems: "center", gap: 10, padding: 12, borderRadius: 12, border: `1px solid ${C.line}`, marginBottom: 10, cursor: "pointer" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isLeader ? "rgba(255,122,92,0.12)" : "rgba(34,34,34,0.05)" }} />
                  <div style={{ zIndex: 1, display: "flex", alignItems: "center", width: "100%", gap: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{id}{isLeader && " 👑"}</div>
                      <div style={{ fontSize: 10.5, color: C.muted }}>{c}표 · {pct}%</div>
                    </div>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${C.line}` }} />
                  </div>
                </div>
              );
            })}
            <div style={{ textAlign: "center", fontSize: 11, color: "#C9BFB8", marginTop: 10 }}>* 프로토타입에서는 후보를 탭하면 바로 투표가 마감돼요</div>
          </div>
        </>
      );
    }

    // 결과: 투표 1위를 조건으로 확정하고, A(지역)/B(장소) 스타일 폼으로 마무리
    const winnerPlace = voteBy === "place" ? places.find((x) => x.id === chosen) : null;
    return (
      <>
        <Header title="약속 조건 선택하기" onBack={back} />
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          <div style={{ padding: 12, borderRadius: 12, background: C.cream, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, color: C.coralDark }}>패턴 D · 투표 결과로 완성</div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>투표가 종료됐어요. 나머지 조건만 확인하고 코스를 만들어요.</div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>함께 가는 사람</div>
          <MemberChips selected={members} setSelected={setMembers} />
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>약속 이름</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, boxSizing: "border-box" }} />

          {voteBy === "region" ? (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>지역</div>
              <div style={{ padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${C.coral}`, background: C.cream, display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>{chosen}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: C.coral, padding: "3px 9px", borderRadius: 999 }}>투표 1위</span>
              </div>
            </>
          ) : winnerPlace && (
            <>
              <div style={{ fontSize: 12.5, fontWeight: 700, margin: "16px 0 8px" }}>고정 장소</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 12, border: `1.5px solid ${C.coral}`, background: C.cream }}>
                <PlaceThumb place={winnerPlace} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{winnerPlace.name}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>{winnerPlace.category} · {winnerPlace.hours}</div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: C.coral, padding: "3px 9px", borderRadius: 999 }}>투표 1위</span>
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 10, margin: "16px 0 8px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>날짜</div>
              <input value={date} onChange={(e) => setDate(e.target.value)} style={{ width: "100%", padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12.5, boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 8 }}>시간</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <input value={start} onChange={(e) => setStart(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
            <ArrowRight size={14} color={C.muted} />
            <input value={end} onChange={(e) => setEnd(e.target.value)} style={{ flex: 1, padding: "12px 10px", borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 13, textAlign: "center", boxSizing: "border-box" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12.5, fontWeight: 700 }}>방문하고 싶은 카테고리</span><span style={{ fontSize: 10.5, color: C.muted }}>복수 선택</span></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CATEGORIES.map((cVal) => <Chip key={cVal} active={cats.includes(cVal)} onClick={() => setCats((c) => c.includes(cVal) ? c.filter((x) => x !== cVal) : [...c, cVal])}>{cVal}</Chip>)}
          </div>
          <div style={{ fontSize: 12.5, fontWeight: 700, margin: "18px 0 4px" }}>코스 구성</div>
          <CourseConfigStepper config={config} setConfig={setConfig} />
        </div>
        <div style={{ padding: 18 }}>
          <PrimaryButton onClick={() => go("courseLoading", { pattern: "D", title, region: voteBy === "region" ? chosen : winnerPlace?.region, date, start, end })}>약속 저장하고 코스 만들기</PrimaryButton>
        </div>
      </>
    );
  }

  /* ---------- 코스 생성 로딩 & 결과 ---------- */
  function CourseLoadingScreen() {
    const [i, setI] = useState(0);
    const isSample = !!current.params.sample;
    const msgs = isSample
      ? ["지역·카테고리 조건을 확인하고 있어요…", "위스팟 추천 장소를 고르고 있어요…", "영업시간을 확인하고 있어요…", "동선을 계산해서 코스를 짜고 있어요…"]
      : ["저장된 장소를 모으고 있어요…", "영업시간·휴무일을 확인하고 있어요…", "좋아요·투표 결과를 반영하고 있어요…", "동선을 계산해서 코스를 짜고 있어요…"];
    useEffect(() => {
      const t = setInterval(() => setI((v) => (v + 1 < msgs.length ? v + 1 : v)), 550);
      const done = setTimeout(() => {
        const id = "plan" + (plans.length + 1);
        let items;
        if (isSample) {
          const wantedCats = current.params.cats && current.params.cats.length ? current.params.cats : ["맛집", "카페"];
          const picks = SAMPLE_PLACES.filter((sp) => wantedCats.includes(sp.category)).slice(0, 3);
          const finalPicks = picks.length ? picks : SAMPLE_PLACES.slice(0, 3);
          const startHour = parseInt((current.params.start || "13:00").split(":")[0], 10) || 13;
          items = finalPicks.map((sp, idx) => ({
            time: `${String(startHour + idx * 2).padStart(2, "0")}:00 - ${String(startHour + idx * 2 + 1).padStart(2, "0")}:30`,
            placeId: sp.id,
            reason: "위스팟 추천 샘플 장소 · " + sp.hours,
            itemLikes: [], wantChange: [],
          }));
        } else {
          items = [
            { time: "14:00 - 15:30", placeId: "p2", reason: "고정 장소 · 좋아요 2개 · 오늘 20:00까지 영업", itemLikes: [], wantChange: [] },
            { time: "16:00 - 17:45", placeId: "p1", reason: "도보 8분 · 좋아요 3개 · 오늘 22:00까지 영업", itemLikes: [], wantChange: [] },
            { time: "18:00 - 19:30", placeId: "p3", reason: "그룹 저장 맛집 · 예산 범위 내 · 오늘 영업 확인", itemLikes: [], wantChange: [] },
          ];
        }
        const newPlan = { id, groupId: activeGroupId, title: current.params.title || "새 약속", pattern: current.params.pattern, date: current.params.date || "2026년 6월 29일", area: current.params.region || "성수", start: current.params.start || "14:00", end: current.params.end || "20:00", status: "ongoing", members: ["시은", "다교", "나현"], fixedPlaceId: null, sample: isSample, items };
        setPlans((ps) => [...ps, newPlan]);
        go("courseResult", { planId: id }, true);
      }, 2300);
      return () => { clearInterval(t); clearTimeout(done); };
    }, []);
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", border: `4px solid ${C.cream}`, borderTopColor: C.coral, animation: "spin 0.9s linear infinite", marginBottom: 24 }} />
        <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
        <div style={{ fontWeight: 800, fontSize: 15 }}>AI가 코스 초안을 만들고 있어요</div>
        <div style={{ fontSize: 12.5, color: C.muted, marginTop: 10 }}>{msgs[i]}</div>
      </div>
    );
  }


  function CourseResultScreen() {
    const plan = plans.find((p) => p.id === current.params.planId);
    const [mode, setMode] = useState("view"); // view | edit
    const [savedDone, setSavedDone] = useState(false);
    const [swapFor, setSwapFor] = useState(null); // index of item being swapped
    const [showAddItemSheet, setShowAddItemSheet] = useState(false);
    if (!plan) return null;
    const items = plan.items || [];
    const routePlaces = items.map((item) => places.find((place) => place.id === item.placeId)).filter(Boolean);

    function replaceItem(idx, newPlaceId) {
      setPlans((ps) => ps.map((p) => p.id !== plan.id ? p : { ...p, items: p.items.map((it, i) => i === idx ? { ...it, placeId: newPlaceId, reason: "새 추천 · 동선 반영", itemLikes: [], wantChange: [] } : it) }));
      setSwapFor(null);
    }
    function removeItem(idx) {
      setPlans((ps) => ps.map((p) => p.id !== plan.id ? p : { ...p, items: p.items.filter((_, i) => i !== idx) }));
    }
    const memberCount = MEMBERS.filter((m) => !m.pending).length;
    const majorityNeeded = Math.ceil(memberCount / 2);
    function toggleItemReaction(idx, field) {
      setPlans((ps) => ps.map((p) => {
        if (p.id !== plan.id) return p;
        return { ...p, items: p.items.map((it, i) => {
          if (i !== idx) return it;
          const arr = it[field] || [];
          const has = arr.includes(ME.id);
          return { ...it, [field]: has ? arr.filter((x) => x !== ME.id) : [...arr, ME.id] };
        }) };
      }));
    }
    function startSlotVote(idx) {
      const it = items[idx];
      const p = places.find((x) => x.id === it.placeId);
      if (!p) return;
      const alternatives = groupPlaces.filter((gp) => gp.category === p.category && gp.id !== p.id).slice(0, 2);
      const candidateIds = [p.id, ...alternatives.map((a) => a.id)];
      if (candidateIds.length < 2) { toast_("같은 카테고리의 다른 저장 장소가 부족해요"); return; }
      const id = "v" + (votes.length + 1);
      setVotes((vs) => [...vs, { id, groupId: activeGroupId, title: `${p.category} 어디로 바꿀까?`, candidateIds, responses: {}, deadline: "오늘 23:00 마감", closed: false, linkedPlanId: plan.id }]);
      go("voteDetail", { voteId: id });
    }

    function saveSamplesToGroup() {
      const idMap = {};
      const newPlaces = items.map((it) => {
        const sp = places.find((x) => x.id === it.placeId);
        const newId = "p" + Math.random().toString(36).slice(2, 8);
        idMap[it.placeId] = newId;
        return { ...sp, id: newId, groupId: activeGroupId, savedBy: ME.name, status: "confirmed" };
      });
      setPlaces((prev) => [...prev, ...newPlaces]);
      setPlans((ps) => ps.map((p) => p.id !== plan.id ? p : { ...p, sample: false, items: p.items.map((it) => ({ ...it, placeId: idMap[it.placeId] || it.placeId })) }));
      toast_("샘플 장소를 그룹에 저장했어요");
    }

    if (savedDone) {
      return (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 46, marginBottom: 16 }}>📅</div>
          <div style={{ fontWeight: 800, fontSize: 16, fontFamily: FONT_SERIF }}>“{plan.title}” 코스를 저장했어요</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>친구들과 공유하고 의견을 받아보세요.</div>
          <div style={{ width: "100%", marginTop: 30 }}>
            <PrimaryButton onClick={() => setSavedDone(false)} style={{ marginBottom: 10 }}>코스 상세보기</PrimaryButton>
            <SecondaryButton onClick={() => reset("feed")}>피드로 돌아가기</SecondaryButton>
          </div>
        </div>
      );
    }

    return (
      <>
        <Header title={mode === "edit" ? "코스 편집하기" : plan.title} onBack={back} right={
          <span style={{ fontSize: 12, fontWeight: 700, color: C.coralDark, cursor: "pointer" }} onClick={() => setMode(mode === "edit" ? "view" : "edit")}>{mode === "edit" ? "완료" : "편집하기"}</span>
        } />
        <div style={{ padding: "10px 18px 0", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 6, fontSize: 10.5, fontWeight: 700 }}>
            <span style={{ background: C.cream, color: C.coralDark, padding: "4px 10px", borderRadius: 999 }}>📅 {plan.date}</span>
            <span style={{ background: C.cream, color: C.coralDark, padding: "4px 10px", borderRadius: 999 }}>📍 {plan.area}</span>
            <span style={{ background: C.cream, color: C.coralDark, padding: "4px 10px", borderRadius: 999 }}>🕐 {plan.start} → {plan.end}</span>
          </div>
          <div style={{ marginTop: 10, height: 150, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.line}` }}>
            <GoogleMap places={routePlaces} showRoute height={150} minHeight={150} />
          </div>
          {plan.sample && (
            <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 12, background: C.cream, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles size={14} color={C.coral} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, fontSize: 10.5, color: C.muted, lineHeight: 1.4 }}>그룹에 저장된 장소가 없어서 <b style={{ color: C.coralDark }}>위스팟 추천 샘플 장소</b>로 만든 코스예요.</div>
              <button onClick={saveSamplesToGroup} style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: C.coral, border: "none", borderRadius: 999, padding: "6px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>그룹에 저장</button>
            </div>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
          {items.map((it, idx) => {
            const p = places.find((x) => x.id === it.placeId);
            if (!p) return null;
            return (
              <React.Fragment key={idx}>
                <div style={{ display: "flex", gap: 12, padding: 12, borderRadius: 14, border: `1px solid ${C.line}`, marginBottom: 4 }}>
                  <PlaceThumb place={p} size={54} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 700 }}>{it.time}</div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{p.name}</div>
                    <div style={{ fontSize: 10.5, color: C.muted }}>{p.category} · {p.desc}</div>
                    <div style={{ fontSize: 10, marginTop: 5, display: "inline-block", background: C.mintSoft, color: "#2aaa92", fontWeight: 700, padding: "2px 8px", borderRadius: 999 }}>추천 이유 · {it.reason}</div>
                    {mode === "view" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                        <button onClick={() => toggleItemReaction(idx, "itemLikes")} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 700, color: (it.itemLikes || []).includes(ME.id) ? C.coralDark : C.muted, background: (it.itemLikes || []).includes(ME.id) ? C.cream : "#F5EDE8", border: "none", borderRadius: 999, padding: "4px 9px", cursor: "pointer" }}><Heart size={10} fill={(it.itemLikes || []).includes(ME.id) ? C.coral : "none"} /> {(it.itemLikes || []).length}</button>
                        <button onClick={() => toggleItemReaction(idx, "wantChange")} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10.5, fontWeight: 700, color: (it.wantChange || []).includes(ME.id) ? "#B8860B" : C.muted, background: (it.wantChange || []).includes(ME.id) ? "#FEF6E4" : "#F5EDE8", border: "none", borderRadius: 999, padding: "4px 9px", cursor: "pointer" }}>🔄 변경하고 싶어요 {(it.wantChange || []).length}</button>
                        {(it.wantChange || []).length >= majorityNeeded && (
                          <button onClick={() => startSlotVote(idx)} style={{ marginLeft: "auto", fontSize: 10.5, fontWeight: 800, color: "#fff", background: "#E8B93F", border: "none", borderRadius: 999, padding: "5px 10px", cursor: "pointer", whiteSpace: "nowrap" }}>🗳 투표 만들기</button>
                        )}
                      </div>
                    )}
                    {mode === "edit" && (
                      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                        <button onClick={() => setSwapFor(idx)} style={{ fontSize: 11, fontWeight: 700, color: C.coralDark, background: C.cream, border: "none", borderRadius: 999, padding: "5px 10px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><ArrowLeftRight size={11} /> 다른 {p.category}로 바꾸기</button>
                        <button onClick={() => removeItem(idx)} style={{ fontSize: 11, fontWeight: 700, color: "#B24A3A", background: "#FBEAE6", border: "none", borderRadius: 999, padding: "5px 10px", cursor: "pointer" }}>삭제</button>
                      </div>
                    )}
                  </div>
                </div>
                {idx < items.length - 1 && <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0 8px 14px", fontSize: 10.5, color: C.muted }}>🚶 도보 {5 + idx * 3}분</div>}
              </React.Fragment>
            );
          })}
          <button onClick={() => setShowAddItemSheet(true)} style={{ width: "100%", padding: "11px", borderRadius: 12, border: `1.5px dashed ${C.line}`, background: "none", color: C.coralDark, fontWeight: 700, fontSize: 12, cursor: "pointer", marginTop: 6 }}>+ 장소 추가하기</button>
        </div>
        <div style={{ padding: 18 }}>
          {mode === "edit" ? (
            <PrimaryButton onClick={() => setMode("view")}>저장하기</PrimaryButton>
          ) : (
            <>
              <button onClick={() => go("courseLoading", { pattern: plan.pattern, title: plan.title, date: plan.date, region: plan.area, start: plan.start, end: plan.end })} style={{ width: "100%", padding: "13px", borderRadius: 14, border: `1px solid ${C.line}`, background: "#fff", color: C.charcoal, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><RefreshCw size={13} /> 코스 전체 다시 생성하기</button>
              <PrimaryButton onClick={() => setSavedDone(true)}>코스 저장하기</PrimaryButton>
            </>
          )}
        </div>
        {swapFor !== null && (
          <Sheet title={`다른 ${places.find(x=>x.id===items[swapFor]?.placeId)?.category || ""}로 바꾸기`} onClose={() => setSwapFor(null)}>
            {groupPlaces.filter((p) => p.category === places.find(x=>x.id===items[swapFor]?.placeId)?.category && p.id !== items[swapFor]?.placeId).map((p) => (
              <div key={p.id} onClick={() => replaceItem(swapFor, p.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, cursor: "pointer", borderBottom: `1px solid #F5EDE8` }}>
                <PlaceThumb place={p} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>좋아요 {p.likes}개 · {p.hours}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, color: C.coralDark }}>선택</span>
              </div>
            ))}
          </Sheet>
        )}
        {showAddItemSheet && (
          <Sheet title="코스에 장소 추가하기" onClose={() => setShowAddItemSheet(false)}>
            {groupPlaces.filter((p) => !items.some((it) => it.placeId === p.id)).map((p) => (
              <div key={p.id} onClick={() => {
                const lastEnd = items.length ? items[items.length - 1].time.split(" - ")[1] : plan.start;
                setPlans((ps) => ps.map((pl) => pl.id !== plan.id ? pl : { ...pl, items: [...(pl.items || []), { time: `${lastEnd} - 추가됨`, placeId: p.id, reason: "직접 추가한 장소", itemLikes: [], wantChange: [] }] }));
                setShowAddItemSheet(false);
                toast_(`${p.name}을(를) 코스에 추가했어요`);
              }} style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, cursor: "pointer", borderBottom: `1px solid #F5EDE8` }}>
                <PlaceThumb place={p} size={44} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, color: C.muted }}>{p.category} · 좋아요 {p.likes}개 · {p.hours}</div>
                </div>
                <Plus size={16} color={C.coral} />
              </div>
            ))}
            {groupPlaces.filter((p) => !items.some((it) => it.placeId === p.id)).length === 0 && (
              <div style={{ padding: 20, textAlign: "center", fontSize: 12, color: C.muted }}>추가할 수 있는 저장 장소가 더 없어요.</div>
            )}
          </Sheet>
        )}
      </>
    );
  }

  /* ---------- 프로필 (간단 스텁) ---------- */
  async function signOut() {
    if (demoMode && !session) {
      window.localStorage.removeItem("wispot_demo_mode");
      setDemoMode(false);
      reset("login");
      return;
    }
    if (!supabase) {
      window.localStorage.removeItem("wispot_demo_mode");
      setDemoMode(false);
      reset("login");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast_("로그아웃하지 못했어요");
      return;
    }
    setProfile(null);
    reset("login");
  }

  function ProfileScreen() {
    const providerLabel = demoMode ? "테스트" : session?.user?.app_metadata?.provider === "kakao" ? "카카오" : "이메일";
    return (
      <>
        <Header title="프로필" />
        <div style={{ flex: 1, padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.cream, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{ME.emoji}</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{ME.name}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{providerLabel} 계정 연동됨</div>
              {session?.user?.email && <div style={{ fontSize: 10.5, color: "#A49A94", marginTop: 2 }}>{session.user.email}</div>}
            </div>
          </div>
          {["온보딩 취향 다시 설정하기", "알림 설정", "그룹 관리", "로그아웃"].map((t) => (
            <div key={t} onClick={() => t === "로그아웃" ? signOut() : t === "그룹 관리" ? go("groupManage") : toast_("프로토타입 범위 밖이에요")} style={{ padding: "14px 4px", borderBottom: `1px solid #F5EDE8`, fontSize: 13.5, fontWeight: 700, color: C.charcoal, cursor: "pointer" }}>{t}</div>
          ))}
        </div>
      </>
    );
  }

  /* ---------- 라우팅 ---------- */
  const NO_NAV_SCREENS = ["login", "groupList", "groupCreateStart", "groupCreateForm", "groupInvite", "groupJoinPreview", "groupManage", "placeSave", "placeDetail", "voteCreate", "voteDetail", "patternSelect", "patternA", "patternB", "patternC", "patternD", "courseLoading", "courseResult"];

  function renderScreen() {
    switch (current.screen) {
      case "login": return <LoginScreen />;
      case "groupList": return <GroupListScreen />;
      case "groupCreateStart": return <GroupCreateStartScreen />;
      case "groupCreateForm": return <GroupCreateFormScreen />;
      case "groupInvite": return <GroupInviteScreen />;
      case "groupJoinPreview": return <GroupJoinPreviewScreen />;
      case "groupManage": return <GroupManageScreen />;
      case "placeSave": return <DummyPlaceSaveScreen />;
      case "placeDetail": return <PlaceDetailScreen />;
      case "emptyStart": return <EmptyStartScreen />;
      case "voteCreate": return <VoteCreateScreen />;
      case "voteDetail": return <VoteDetailScreen />;
      case "patternSelect": return <PatternSelectScreen />;
      case "patternA": return <PatternAScreen />;
      case "patternB": return <PatternBScreen />;
      case "patternC": return <PatternCScreen />;
      case "patternD": return <PatternDScreen />;
      case "courseLoading": return <CourseLoadingScreen />;
      case "courseResult": return <CourseResultScreen />;
      case "feed": return <FeedScreen />;
      case "appointments": return <AppointmentsScreen />;
      case "profile": return <ProfileScreen />;
      default: return <FeedScreen />;
    }
  }

  const showBottomNav = ["feed", "appointments", "profile"].includes(current.screen);
  const navActive = current.screen === "feed" ? feedMode === "map" ? "map" : "feed" : current.screen;

  function handleNav(id) {
    if (id === "map") { setFeedMode("map"); go("feed", {}, current.screen === "feed"); }
    else if (id === "feed") { setFeedMode("feed"); go("feed", {}, current.screen === "feed"); }
    else go(id, {}, ["feed", "appointments", "profile"].includes(current.screen));
  }

  if (!authReady) {
    return (
      <PhoneFrame>
        <StatusBar />
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, fontSize: 13, fontWeight: 700 }}>
          로그인 상태를 확인하고 있어요...
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame>
      <StatusBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, position: "relative" }}>
        {renderScreen()}
        <Toast message={toast} />
      </div>
      {showBottomNav && <BottomNav active={navActive} onNav={handleNav} />}
    </PhoneFrame>
  );
}
