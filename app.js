(function () {
  "use strict";

  // 과목 태그 이름은 시험 종류마다 다르게 (키 t/s/m/c/r 은 공통)
  var TAG_SETS = {
    itp: { t: "이론", s: "SQL", m: "계산식", c: "코드", r: "복습·기출" },
    aws: { t: "컴퓨팅", s: "스토리지·DB", m: "네트워킹", c: "보안·IAM", r: "모의고사·복습" },
    custom: { t: "이론", s: "실습", m: "문제풀이", c: "암기", r: "복습" }
  };
  var EXAM_KINDS = {
    itp: { name: "정보처리기사 실기", date: "2026-10-25" },
    aws: { name: "AWS SAA-C03", date: "" },
    custom: { name: "", date: "" }
  };
  var TAGS = TAG_SETS.itp;
  var TAG_ORDER = ["t", "s", "m", "c", "r"];
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  var ITP_DATE = "2026-10-25";
  var EXAM_ISO = ITP_DATE;
  var EXAM_UTC = Date.UTC(2026, 9, 25);
  var STORE_KEY = "itp-app-v2";   // { users: [...], exams: { id: {...} } }
  var OLD_KEY = "itp-app-v1";     // 예전 단일 사용자 정처기 기록. 옮긴 뒤에도 백업으로 남겨 둔다.
  var SESSION_KEY = "itp-session";

  // 캐릭터 3종. 단계 이름·대사는 캐릭터별, 성장 기준 시간은 시험 계획 총량의 비율(STAGE_FRAC).
  var CHARS = {
    chick: {
      name: "병아리", sound: "삐약",
      stages: ["말랑 알", "금 간 알", "갓 부화 삐약이", "아기 병아리", "중병아리", "늠름한 합격 닭"],
      lines: ["쿨쿨… 공부하면 깨어나요", "톡톡! 안에서 꿈틀거려요", "껍질 모자 쓰고 세상 구경 중", "두 발로 씩씩하게 섰어요", "연필 들고 열공 모드 돌입", "머리띠 질끈! 시험장 갈 준비 완료"]
    },
    monkey: {
      name: "아기 원숭이", sound: "끼끼",
      stages: ["바나나 알", "금 간 알", "갓 부화 꼬마 몽이", "아기 원숭이", "개구쟁이 원숭이", "합격 원숭이 대장"],
      lines: ["쿨쿨… 공부하면 깨어나요", "톡톡! 안에서 꼬리가 살랑", "껍질 모자 쓰고 두리번두리번", "동그란 귀 쫑긋! 씩씩하게 섰어요", "연필 들고 열공 모드 돌입", "머리띠 질끈! 합격 바나나 먹으러 가자"]
    },
    bear: {
      name: "핑크곰", sound: "곰곰",
      stages: ["딸기 알", "금 간 알", "갓 부화 아기곰", "꼬마 핑크곰", "씩씩한 핑크곰", "합격 핑크곰"],
      lines: ["쿨쿨… 공부하면 깨어나요", "톡톡! 안에서 꼼지락꼼지락", "껍질 모자 쓰고 꾸벅 인사", "말랑한 발로 아장아장", "연필 들고 열공 모드 돌입", "머리띠 질끈! 시험장 갈 준비 완료"]
    }
  };
  var CHAR_ORDER = ["chick", "monkey", "bear"];
  var STAGE_FRAC = [0, 0.043, 0.128, 0.3, 0.55, 0.85];
  var STAGES = [];
  var CHEERS = [], DONE_CHEERS = [];

  var $screen = document.getElementById("screen");
  var $sheetRoot = document.getElementById("sheet-root");
  var $toast = document.getElementById("toast");
  var $tabs = document.querySelector(".tabs");
  var store = { users: [], exams: {} };
  var USER = null, EXAM = null, CHAR = "chick";
  var state = emptyState();
  var dayBy = {}, phaseBy = {}, DAYS = [], PHASES = [], PARTS = [];
  var ui = {};
  var route = "today";
  var TODAY, sel;
  var cheerIdx = 0, bubbleTimer = 0, toastTimer = 0, sheetClose = null;

  PLAN.days.forEach(function (d) {
    d.items.forEach(function (it, i) { it.id = d.iso + "-" + i; });
  });

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function btn(cls, text, label) {
    var b = el("button", cls, text);
    b.type = "button";
    if (label) b.setAttribute("aria-label", label);
    return b;
  }
  function svgIcon(path, sw) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 2.4) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
  }
  var IC = {
    prev: svgIcon('<path d="M15 5l-7 7 7 7"/>', 2.8),
    next: svgIcon('<path d="M9 5l7 7-7 7"/>', 2.8),
    x: svgIcon('<path d="M6 6l12 12M18 6L6 18"/>', 2.6),
    check: svgIcon('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 3.4),
    plus: svgIcon('<path d="M12 5v14M5 12h14"/>', 2.8),
    down: svgIcon('<path d="M7 10l5 5 5-5"/>', 2.6),
    back: svgIcon('<path d="M15 5l-7 7 7 7"/>', 2.8),
    del: svgIcon('<path d="M20 7H9l-5 5 5 5h11z"/><path d="M13 10l4 4M17 10l-4 4"/>', 2)
  };
  function pad(n) { return String(n).padStart(2, "0"); }
  function obj(o) { return o && typeof o === "object" && !Array.isArray(o) ? o : {}; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function actOf(id) { var v = state.act[id]; return typeof v === "number" ? v : 0; }
  function fmtMin(m) {
    m = Math.round(m);
    if (m < 60) return m + "분";
    var h = Math.floor(m / 60), r = m % 60;
    return h + "시간" + (r ? " " + r + "분" : "");
  }
  function fmtH(m) { var h = m / 60; return (h >= 10 ? Math.round(h) : Math.round(h * 10) / 10) + "h"; }
  function isoParts(iso) { return iso.split("-").map(Number); }
  function wdOf(iso) { var p = isoParts(iso); return WD[new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay()]; }
  function mdLabel(iso) { var p = isoParts(iso); return p[1] + "월 " + p[2] + "일 (" + wdOf(iso) + ")"; }
  function uid(iso) { return iso + "-u" + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36); }
  function buzz() { if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} } }

  function todayInfo() {
    var o = new URLSearchParams(location.search).get("today");
    var y, m, d;
    if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) {
      var p = isoParts(o);
      y = p[0]; m = p[1] - 1; d = p[2];
    } else {
      var n = new Date();
      y = n.getFullYear(); m = n.getMonth(); d = n.getDate();
    }
    return { iso: y + "-" + pad(m + 1) + "-" + pad(d), diff: Math.round((EXAM_UTC - Date.UTC(y, m, d)) / 864e5) };
  }
  function defaultSel() {
    if (dayBy[TODAY.iso]) return TODAY.iso;
    return TODAY.iso < DAYS[0] ? DAYS[0] : DAYS[DAYS.length - 1];
  }
  function ddText() {
    return TODAY.diff > 0 ? "D-" + TODAY.diff : TODAY.diff === 0 ? "D-DAY" : "시험 끝";
  }

  /* ---------- state ---------- */
  function emptyState() { return { done: {}, act: {}, memo: {}, plan: {}, extra: {}, lv: 0 }; }
  function cleanItem(it, iso) {
    if (!it || typeof it !== "object") return null;
    var min = Number(it.min);
    return {
      id: typeof it.id === "string" && it.id ? it.id : uid(iso),
      slot: typeof it.slot === "string" ? it.slot : "",
      min: isFinite(min) ? clamp(Math.round(min), 0, 600) : 0,
      tag: TAGS[it.tag] ? it.tag : "r",
      parts: Array.isArray(it.parts) ? it.parts.filter(function (x) { return typeof x === "string"; }) : [],
      pages: typeof it.pages === "string" ? it.pages : "",
      title: typeof it.title === "string" && it.title.trim() ? it.title : "공부",
      detail: typeof it.detail === "string" ? it.detail : ""
    };
  }
  function cleanList(o, fn) {
    var out = {};
    Object.keys(obj(o)).forEach(function (iso) {
      if (!dayBy[iso] || !Array.isArray(o[iso])) return;
      out[iso] = o[iso].map(function (x) { return fn(x, iso); }).filter(Boolean);
    });
    return out;
  }
  function cleanExtra(x, iso) {
    if (!x || typeof x !== "object") return null;
    var min = Number(x.min);
    if (!isFinite(min) || min <= 0) return null;
    return {
      id: typeof x.id === "string" && x.id ? x.id : uid(iso),
      title: typeof x.title === "string" && x.title.trim() ? x.title : "추가 공부",
      min: clamp(Math.round(min), 1, 900),
      tag: TAGS[x.tag] ? x.tag : "r"
    };
  }
  function normalize(src) {
    src = obj(src);
    return {
      done: obj(src.done), act: obj(src.act), memo: obj(src.memo),
      plan: cleanList(src.plan, cleanItem),
      extra: cleanList(src.extra, cleanExtra),
      lv: typeof src.lv === "number" ? src.lv : 0
    };
  }
  function loadStore() {
    try {
      var o = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (o && Array.isArray(o.users)) store = { users: o.users, exams: obj(o.exams) };
    } catch (e) {}
  }
  function loadOld() {
    try { return JSON.parse(localStorage.getItem(OLD_KEY) || "null"); } catch (e) { return null; }
  }
  function save() {
    if (EXAM) EXAM.state = state;
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  }

  /* ---------- users & exams ---------- */
  function newId(p) { return p + Date.now().toString(36) + Math.floor(Math.random() * 1e6).toString(36); }
  // 4자리 비밀번호는 이 기기 안에서 사용자를 나누는 '잠금 화면'용. 원문 대신 해시만 저장한다.
  function hashPin(id, pin) {
    var h = 0x811c9dc5, s = "itp:" + id + ":" + pin;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h.toString(16);
  }
  function isoAdd(iso, n) {
    var p = isoParts(iso), d = new Date(Date.UTC(p[0], p[1] - 1, p[2] + n));
    return d.getUTCFullYear() + "-" + pad(d.getUTCMonth() + 1) + "-" + pad(d.getUTCDate());
  }
  function isoDiff(a, b) {
    var x = isoParts(a), y = isoParts(b);
    return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 864e5);
  }
  function mdShort(iso) { var p = isoParts(iso); return p[1] + "/" + p[2]; }
  function isWeekend(iso) { var w = wdOf(iso); return w === "토" || w === "일"; }
  function realToday() {
    var o = new URLSearchParams(location.search).get("today");
    if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) return o;
    var n = new Date();
    return n.getFullYear() + "-" + pad(n.getMonth() + 1) + "-" + pad(n.getDate());
  }
  function userById(id) { return store.users.filter(function (u) { return u.id === id; })[0] || null; }
  function examsOf(u) { return (u.exams || []).map(function (id) { return store.exams[id]; }).filter(Boolean); }
  function ddOf(exam) {
    var n = isoDiff(realToday(), exam.date);
    return n > 0 ? "D-" + n : n === 0 ? "D-DAY" : "끝";
  }

  // 기본 계획이 없는 시험: 시작일~시험일 날짜를 만들고, fill 이면 공부 가능 시간만큼 '내용 정하기' 칸을 넣는다
  function skeletonDays(start, end, wk, we, fill) {
    var out = [];
    for (var iso = start; iso <= end; iso = isoAdd(iso, 1)) {
      var min = iso === end ? 0 : isWeekend(iso) ? we : wk;
      var items = [];
      if (fill && min > 0) {
        items.push({ slot: isWeekend(iso) ? "주말" : "평일", min: min, tag: "t", parts: [], pages: "", title: "공부할 내용 정하기", detail: "'계획 수정'을 눌러 이 날 할 일을 적어 주세요." });
      }
      out.push({ iso: iso, items: items });
    }
    return out;
  }
  function planTotal(days) {
    var t = 0;
    days.forEach(function (d) { d.items.forEach(function (it) { t += it.min; }); });
    return t;
  }

  function openExam(exam) {
    EXAM = exam;
    CHAR = CHARS[USER.char] ? USER.char : "chick";
    TAGS = TAG_SETS[exam.kind] || TAG_SETS.custom;
    EXAM_ISO = exam.date;
    var ep = isoParts(exam.date);
    EXAM_UTC = Date.UTC(ep[0], ep[1] - 1, ep[2]);
    dayBy = {}; phaseBy = {}; DAYS = []; PHASES = []; PARTS = [];
    if (exam.base === "itp") {
      PHASES = PLAN.phases; PARTS = PLAN.parts;
      PLAN.days.forEach(function (d) { dayBy[d.iso] = d; DAYS.push(d.iso); });
    } else {
      var days = Array.isArray(exam.days) ? exam.days : [];
      var first = days.length ? days[0].iso : exam.date;
      days.forEach(function (d) {
        var key = "w" + Math.floor(isoDiff(first, d.iso) / 7);
        if (!phaseBy[key]) {
          phaseBy[key] = { key: key, name: (PHASES.length + 1) + "주차", first: d.iso, last: d.iso, desc: "" };
          PHASES.push(phaseBy[key]);
        }
        phaseBy[key].last = d.iso;
        d.items.forEach(function (it, i) { it.id = d.iso + "-" + i; });
        dayBy[d.iso] = { iso: d.iso, phase: key, hol: d.iso === exam.date ? "시험일" : "", wd: wdOf(d.iso), md: mdShort(d.iso), items: d.items };
        DAYS.push(d.iso);
      });
      PHASES.forEach(function (p) { p.range = mdShort(p.first) + " ~ " + mdShort(p.last); });
    }
    PHASES.forEach(function (p) { phaseBy[p.key] = p; });
    TODAY = todayInfo();
    state = normalize(exam.state);
    // 성장 기준은 처음 정한 계획 총량으로 고정 (계획을 고쳐도 단계가 흔들리지 않게)
    if (!exam.goalMin) exam.goalMin = Math.max(600, DAYS.reduce(function (n, iso) {
      return n + dayBy[iso].items.reduce(function (m, it) { return m + it.min; }, 0);
    }, 0));
    var c = CHARS[CHAR], s = c.sound;
    STAGES = STAGE_FRAC.map(function (f, i) {
      return { min: Math.round((exam.goalMin * f) / 10) * 10, name: c.stages[i], line: c.lines[i] };
    });
    CHEERS = ["오늘도 " + s + "! 10분만 해도 한 발 앞이야", "틀린 문제는 점수로 바뀌는 중이야 " + s, "물 한 잔 마시고 다시 가보자 " + s,
      "네가 공부하면 나도 쑥쑥 커!", "짧게라도 좋아, 끊기지만 않으면 돼", "오늘 한 칸이 시험날 한 문제야"];
    if (exam.kind === "itp") CHEERS.push("SQL은 손으로 써봐야 내 거가 돼", "코드 문제는 변수 표 그리기!", "60점만 넘기면 돼. 할 수 있어!");
    if (exam.kind === "aws") CHEERS.push("서비스 이름보다 쓰임새로 외우자", "'가장 비용 효율적인'이 나오면 한 번 더 읽기!", "720점만 넘기면 합격! 할 수 있어");
    DONE_CHEERS = ["오늘도 " + s + "!", "잘했어 " + s + "!", "한 칸 클리어!", "쑥쑥 크는 중!", "최고야 " + s + "!"];
    state.lv = stageOf(totals().act);
    sel = defaultSel();
    USER.lastExam = exam.id;
    save();
  }

  function itemsOf(iso) { return Array.isArray(state.plan[iso]) ? state.plan[iso] : dayBy[iso].items; }
  function isEdited(iso) { return Array.isArray(state.plan[iso]); }
  function extrasOf(iso) { return Array.isArray(state.extra[iso]) ? state.extra[iso] : []; }
  function ownPlan(iso) {
    if (!isEdited(iso)) {
      state.plan[iso] = dayBy[iso].items.map(function (it) { return cleanItem(it, iso); });
    }
    return state.plan[iso];
  }

  function dayStat(iso) {
    var s = { plan: 0, act: 0, done: 0, total: 0, ex: 0 };
    itemsOf(iso).forEach(function (it) {
      s.plan += it.min; s.act += actOf(it.id); s.total++;
      if (state.done[it.id]) s.done++;
    });
    extrasOf(iso).forEach(function (x) { s.ex += x.min; });
    s.act += s.ex;
    return s;
  }
  function dayStatus(s) {
    if (!s.total) return s.act > 0 ? "full" : "rest";
    if (s.done === s.total) return "full";
    if (s.done > 0 || s.act > 0) return "part";
    return "none";
  }
  function totals() {
    var t = { done: 0, total: 0, plan: 0, act: 0, planNow: 0, actNow: 0, partDone: {}, partTotal: {} };
    DAYS.forEach(function (iso) {
      var s = dayStat(iso);
      t.done += s.done; t.total += s.total; t.plan += s.plan; t.act += s.act;
      if (iso <= TODAY.iso) { t.planNow += s.plan; t.actNow += s.act; }
      itemsOf(iso).forEach(function (it) {
        (it.parts || []).forEach(function (k) {
          t.partTotal[k] = (t.partTotal[k] || 0) + 1;
          if (state.done[it.id]) t.partDone[k] = (t.partDone[k] || 0) + 1;
        });
      });
    });
    return t;
  }
  function stageOf(min) {
    var s = 0;
    STAGES.forEach(function (st, i) { if (min >= st.min) s = i; });
    return s;
  }
  function checkLevel(act) {
    var st = stageOf(act);
    if (st > state.lv) {
      state.lv = st; save();
      toast("🎉 레벨 업! '" + STAGES[st].name + "' 등장!");
      hop();
      celebrate();
    } else if (st < state.lv) {
      state.lv = st; save();
    }
    checkItems();
  }

  /* ---------- character ---------- */
  // 오리지널 병아리 (viewBox 120x120, 바닥 y≈110). .body는 통통 튀는 idle, .eyes는 눈 깜빡임.
  var INK = "#4A3B32";
  function chickSVG(st) {
    var s = '<svg viewBox="0 0 120 120" aria-hidden="true">';
    s += '<ellipse cx="60" cy="111" rx="28" ry="4.5" fill="rgba(74,59,50,.13)"/><g class="body">';
    function eyes(y, dx, r) {
      dx = dx || 10; r = r || 4.3;
      return '<g class="eyes"><ellipse cx="' + (60 - dx) + '" cy="' + y + '" rx="' + r + '" ry="' + (r + 0.6) + '" fill="' + INK + '"/><ellipse cx="' + (60 + dx) + '" cy="' + y + '" rx="' + r + '" ry="' + (r + 0.6) + '" fill="' + INK + '"/>' +
        '<circle cx="' + (61.5 - dx) + '" cy="' + (y - 1.8) + '" r="1.6" fill="#fff"/><circle cx="' + (61.5 + dx) + '" cy="' + (y - 1.8) + '" r="1.6" fill="#fff"/></g>';
    }
    function beak(y) { return '<path d="M54 ' + y + 'Q60 ' + (y - 3.5) + ' 66 ' + y + 'Q60 ' + (y + 6.5) + ' 54 ' + y + 'Z" fill="#FF9F45"/>'; }
    function cheeks(y, dx) {
      return '<ellipse cx="' + (60 - dx) + '" cy="' + y + '" rx="5.5" ry="3.3" fill="#FFA99A" opacity=".75"/><ellipse cx="' + (60 + dx) + '" cy="' + y + '" rx="5.5" ry="3.3" fill="#FFA99A" opacity=".75"/>';
    }
    function feet(y, gap) {
      return '<path d="M' + (60 - gap) + ' ' + y + 'v6m-5 0h10M' + (60 + gap) + ' ' + y + 'v6m-5 0h10" stroke="#FF9F45" stroke-width="3.4" stroke-linecap="round"/>';
    }
    var EGG = '<path d="M60 18c20 0 34 30 34 54s-15 38-34 38-34-14-34-38 14-54 34-54z" fill="#FFFDF4" stroke="#EED9A4" stroke-width="2.5"/>' +
      '<ellipse cx="45" cy="44" rx="5" ry="4" fill="#FCEFC8"/><ellipse cx="78" cy="93" rx="6.5" ry="4" fill="#FCEFC8"/><ellipse cx="80" cy="45" rx="3" ry="2.5" fill="#FCEFC8"/>';
    var SHELL = '#FFFDF4', SHELL_LINE = '#EED9A4', BODY = '#FFD23F', BELLY = '#FFE68A', WING = '#F5C020';

    if (st === 0) { // 말랑 알: 쿨쿨 자는 중
      s += EGG + cheeks(84, 15);
      s += '<path d="M44 75q5 4.5 10 0M66 75q5 4.5 10 0" stroke="' + INK + '" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>';
      s += '<text x="88" y="30" font-size="13" fill="#C9B58A" font-family="sans-serif" font-weight="800">z</text><text x="97" y="19" font-size="9" fill="#D8C8A4" font-family="sans-serif" font-weight="800">z</text>';
      return s + '</svg>';
    }
    if (st === 1) { // 금 간 알: 눈 뜨고 들썩
      s += EGG + eyes(74, 10, 3.8) + '<ellipse cx="60" cy="84" rx="3" ry="2.6" fill="' + INK + '"/>' + cheeks(83, 17);
      s += '<path d="M28 58l8 5 7-6 7 7 6-6 7 6 7-5 9 4" stroke="#CDAE6E" stroke-width="2.4" fill="none" stroke-linejoin="round" stroke-linecap="round"/></g>';
      s += '<path d="M18 52l-7-3M21 43l-5-6M102 52l7-3M99 43l5-6" stroke="#FFC43D" stroke-width="2.6" stroke-linecap="round"/>';
      return s + '</svg>';
    }
    if (st === 2) { // 부화: 껍질 모자
      s += '<circle cx="60" cy="64" r="27" fill="' + BODY + '"/>' + eyes(60, 10) + beak(66) + cheeks(69, 17);
      s += '<path d="M28 80l8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8c1 19-13 30-32 30s-33-11-32-30z" fill="' + SHELL + '" stroke="' + SHELL_LINE + '" stroke-width="2.5" stroke-linejoin="round"/>';
      s += '<ellipse cx="45" cy="97" rx="5" ry="3.5" fill="#FCEFC8"/><ellipse cx="77" cy="93" rx="4" ry="3" fill="#FCEFC8"/>';
      s += '<path d="M42 42q18-24 36 0l-6 4-6-4-6 4-6-4-6 4z" fill="' + SHELL + '" stroke="' + SHELL_LINE + '" stroke-width="2.5" stroke-linejoin="round" transform="rotate(-14 60 36)"/>';
      return s + '</g></svg>';
    }
    if (st === 3) { // 아기 병아리
      s += feet(101, 11);
      s += '<ellipse cx="31" cy="79" rx="7" ry="10" fill="' + WING + '" transform="rotate(25 31 79)"/><ellipse cx="89" cy="79" rx="7" ry="10" fill="' + WING + '" transform="rotate(-25 89 79)"/>';
      s += '<circle cx="60" cy="72" r="31" fill="' + BODY + '"/><ellipse cx="60" cy="85" rx="18" ry="13" fill="' + BELLY + '"/>';
      s += '<path d="M55 43q1-10 5.5-3.5q3-8 6.5 1.5" fill="none" stroke="' + WING + '" stroke-width="3.4" stroke-linecap="round"/>';
      s += eyes(67, 10) + beak(74) + cheeks(77, 18);
      return s + '</g></svg>';
    }
    if (st === 4) { // 중병아리: 볏이 나고 연필을 번쩍
      s += feet(102, 12);
      s += '<ellipse cx="28" cy="76" rx="8" ry="13" fill="' + WING + '" transform="rotate(22 28 76)"/>';
      s += '<path d="M52 37q-1-9 5-7q2-7 7-2q5-4 6 4z" fill="#FF8A7A"/>';
      s += '<ellipse cx="60" cy="71" rx="33" ry="36" fill="' + BODY + '"/><ellipse cx="60" cy="86" rx="20" ry="17" fill="' + BELLY + '"/>';
      s += eyes(61, 11) + beak(68) + cheeks(72, 19);
      s += '<g transform="rotate(-30 98 60)"><rect x="94" y="30" width="8" height="30" rx="2" fill="#7ED9A6"/><path d="M94 60h8l-4 8z" fill="#FFE0B0"/><path d="M97 65.5h2l-1 2.5z" fill="' + INK + '"/><rect x="94" y="26" width="8" height="5" rx="1.5" fill="#FF9FB0"/></g>';
      s += '<ellipse cx="91" cy="70" rx="8" ry="13" fill="' + WING + '" transform="rotate(-40 91 70)"/>';
      return s + '</g></svg>';
    }
    // 5: 늠름한 합격 닭 — 꼬리깃, 볏, 합격 머리띠
    s += '<path d="M30 74q-20-6-18-30q10 10 22 16z" fill="#FF9F45"/><path d="M31 68q-16-14-6-34q6 14 14 22z" fill="#FFB86B"/><path d="M32 80q-22 2-26-18q12 6 26 8z" fill="' + BODY + '"/>';
    s += feet(103, 12);
    s += '<path d="M48 39q-2-12 7-9q2-10 10-4q7-5 10 5q3 8-7 10z" fill="#FF6B6B"/>';
    s += '<ellipse cx="62" cy="71" rx="32" ry="35" fill="' + BODY + '"/><ellipse cx="64" cy="87" rx="20" ry="16" fill="' + BELLY + '"/>';
    s += '<path d="M34 49q30-10 58 0v8q-28-9-58 0z" fill="#fff"/><circle cx="63" cy="49.5" r="3.6" fill="#FF6B6B"/>';
    s += '<path d="M35 51q-10 0-14 6M35 54q-8 4-10 11" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>';
    s += '<path d="M60 76q0 9 3.5 10q3.5-1 3.5-10z" fill="#FF6B6B"/>';
    s += eyes(64, 11) + beak(71) + cheeks(75, 19);
    s += '<ellipse cx="93" cy="80" rx="8" ry="13" fill="' + WING + '" transform="rotate(-18 93 80)"/></g>';
    s += '<path d="M14 26l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5zM106 26l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFC43D"/>';
    return s + '</svg>';
  }

  // 오리지널 아기 원숭이·핑크곰. 알 단계(0·1)는 병아리 알에 점 색만 바꿔 쓰고, 2단계부터 동물 머리·몸을 그린다.
  var FUR = {
    monkey: { fur: "#B57C49", dark: "#8A5A30", face: "#F8DEBB", spot: "#EBCB9F" },
    bear: { fur: "#FFB5C8", dark: "#F48AA8", face: "#FFE7EF", spot: "#FFD0DD" }
  };
  function r1(n) { return Math.round(n * 10) / 10; }
  function circ(cx, cy, r, fill) { return '<circle cx="' + r1(cx) + '" cy="' + r1(cy) + '" r="' + r1(r) + '" fill="' + fill + '"/>'; }
  function ell(cx, cy, rx, ry, fill, rot) {
    return '<ellipse cx="' + r1(cx) + '" cy="' + r1(cy) + '" rx="' + r1(rx) + '" ry="' + r1(ry) + '" fill="' + fill + '"' + (rot ? ' transform="rotate(' + rot + " " + r1(cx) + " " + r1(cy) + ')"' : "") + "/>";
  }
  function faceParts(cx, ey, dx, er, cy, cdx) {
    return '<g class="eyes">' + ell(cx - dx, ey, er, er + 0.6, INK) + ell(cx + dx, ey, er, er + 0.6, INK) +
      circ(cx - dx + 1.4, ey - 1.7, 1.5, "#fff") + circ(cx + dx + 1.4, ey - 1.7, 1.5, "#fff") + "</g>" +
      ell(cx - cdx, cy, 5, 3.1, "rgba(255,140,140,.55)") + ell(cx + cdx, cy, 5, 3.1, "rgba(255,140,140,.55)");
  }
  function animalHead(kind, cx, cy, r) {
    var f = FUR[kind], s = "";
    if (kind === "monkey") {
      s += circ(cx - r * 0.98, cy + r * 0.05, r * 0.36, f.fur) + circ(cx + r * 0.98, cy + r * 0.05, r * 0.36, f.fur);
      s += circ(cx - r * 0.98, cy + r * 0.05, r * 0.21, f.face) + circ(cx + r * 0.98, cy + r * 0.05, r * 0.21, f.face);
      s += circ(cx, cy, r, f.fur);
      s += '<path d="M' + r1(cx - 6) + " " + r1(cy - r + 3) + "q2-9 6-2q3-8 6 2" + '" fill="none" stroke="' + f.fur + '" stroke-width="4" stroke-linecap="round"/>';
      s += circ(cx - r * 0.3, cy - r * 0.08, r * 0.4, f.face) + circ(cx + r * 0.3, cy - r * 0.08, r * 0.4, f.face) + ell(cx, cy + r * 0.3, r * 0.62, r * 0.46, f.face);
      s += faceParts(cx, cy - r * 0.08, r * 0.3, 3.9, cy + r * 0.3, r * 0.58);
      s += circ(cx - 2.2, cy + r * 0.2, 1.3, f.dark) + circ(cx + 2.2, cy + r * 0.2, 1.3, f.dark);
      s += '<path d="M' + r1(cx - 5) + " " + r1(cy + r * 0.38) + "q5 4.5 10 0" + '" stroke="' + INK + '" stroke-width="2" fill="none" stroke-linecap="round"/>';
    } else {
      s += circ(cx - r * 0.72, cy - r * 0.72, r * 0.34, f.fur) + circ(cx + r * 0.72, cy - r * 0.72, r * 0.34, f.fur);
      s += circ(cx - r * 0.72, cy - r * 0.72, r * 0.19, f.dark) + circ(cx + r * 0.72, cy - r * 0.72, r * 0.19, f.dark);
      s += circ(cx, cy, r, f.fur);
      s += ell(cx, cy + r * 0.32, r * 0.4, r * 0.29, f.face);
      s += faceParts(cx, cy - r * 0.06, r * 0.36, 4, cy + r * 0.22, r * 0.64);
      s += ell(cx, cy + r * 0.2, r * 0.13, r * 0.09, "#7A4050");
      s += '<path d="M' + r1(cx - 4) + " " + r1(cy + r * 0.36) + "q2 2.5 4 0q2 2.5 4 0" + '" stroke="#7A4050" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
    }
    return s;
  }
  function animalSVG(kind, st) {
    var f = FUR[kind];
    if (st <= 1) return chickSVG(st).split("#FCEFC8").join(f.spot);
    var s = '<svg viewBox="0 0 120 120" aria-hidden="true"><ellipse cx="60" cy="111" rx="28" ry="4.5" fill="rgba(74,59,50,.13)"/><g class="body">';
    if (st === 2) {
      s += animalHead(kind, 60, 60, 25);
      s += '<path d="M28 80l8-8 8 8 8-8 8 8 8-8 8 8 8-8 8 8c1 19-13 30-32 30s-33-11-32-30z" fill="#FFFDF4" stroke="#EED9A4" stroke-width="2.5" stroke-linejoin="round"/>';
      s += ell(45, 97, 5, 3.5, f.spot) + ell(77, 93, 4, 3, f.spot);
      s += '<path d="M44 38q16-22 32 0l-5.3 4-5.3-4-5.4 4-5.3-4-5.4 4z" fill="#FFFDF4" stroke="#EED9A4" stroke-width="2.5" stroke-linejoin="round" transform="rotate(-14 60 32)"/>';
      return s + "</g></svg>";
    }
    var big = st >= 4, hy = big ? 55 : 60, hr = big ? 27 : 25;
    var by = big ? 93 : 94, brx = big ? 23 : 20, bry = big ? 17 : 15;
    if (kind === "monkey") s += '<path d="M' + (60 + brx - 4) + " " + (by + 4) + 'q20 4 17-13q-2-9-9-5q-5 4 1 7" fill="none" stroke="' + f.fur + '" stroke-width="5" stroke-linecap="round"/>';
    else s += circ(60 + brx - 2, by + 6, 4.5, f.fur);
    s += ell(50, 108, 7, 4, f.dark) + ell(70, 108, 7, 4, f.dark);
    s += ell(60, by, brx, bry, f.fur) + ell(60, by + 3, brx * 0.58, bry * 0.62, f.face);
    s += ell(60 - brx + 1, by - 2, 5.5, 9, f.fur, 25);
    var front = "";
    if (st === 4) {
      front = '<g transform="rotate(-25 98 76)"><rect x="94" y="48" width="8" height="28" rx="2" fill="#7ED9A6"/><path d="M94 76h8l-4 8z" fill="#FFE0B0"/><path d="M97 81.5h2l-1 2.5z" fill="' + INK + '"/><rect x="94" y="44" width="8" height="5" rx="1.5" fill="#FF9FB0"/></g>' + ell(88, 84, 5.5, 10, f.fur, -40);
    } else {
      s += ell(60 + brx - 1, by - 2, 5.5, 9, f.fur, -25);
    }
    s += animalHead(kind, 60, hy, hr) + front;
    if (st === 5) {
      s += '<path d="M34 ' + (hy - 15) + "q26-9 52 0v7q-26-9-52 0z" + '" fill="#fff"/>' + circ(60, hy - 16.5, 3.4, "#FF6B6B");
      s += '<path d="M35 ' + (hy - 12) + "q-10 0-14 6M35 " + (hy - 9) + 'q-8 4-10 11" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/>';
      s += circ(60, by + 1, 6, "#FFD23F") + '<path d="M56 ' + (by - 6) + "l4 5 4-5" + '" stroke="#FF6B6B" stroke-width="3" fill="none"/>';
      s += '</g><path d="M14 26l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5zM106 26l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFC43D"/></svg>';
      return s;
    }
    return s + "</g></svg>";
  }
  function charSVG(kind, st) { return kind === "monkey" || kind === "bear" ? animalSVG(kind, st) : chickSVG(st); }

  /* ---------- 꾸미기 아이템 ---------- */
  // 출석·연속 출석·계획 달성률로 얻는 아이템. 한 번 얻으면 사용자에게 계속 남고, 머리·얼굴·등 부위마다 하나씩 착용.
  var SLOTS = [["head", "머리"], ["face", "얼굴"], ["back", "등"]];
  var ITEMS = [
    { id: "sprout", slot: "head", name: "새싹", cond: "첫 출석", test: function (a) { return a.days >= 1; }, prog: function () { return "하루만 공부하면 받아요"; } },
    { id: "ribbon", slot: "head", name: "리본", cond: "연속 5일 출석", test: function (a) { return a.best >= 5; }, prog: function (a) { return "최고 연속 " + a.best + "일"; } },
    { id: "flower", slot: "head", name: "꽃핀", cond: "연속 10일 출석", test: function (a) { return a.best >= 10; }, prog: function (a) { return "최고 연속 " + a.best + "일"; } },
    { id: "starpin", slot: "head", name: "별 핀", cond: "연속 15일 출석", test: function (a) { return a.best >= 15; }, prog: function (a) { return "최고 연속 " + a.best + "일"; } },
    { id: "crown", slot: "head", name: "왕관", cond: "계획 80% 달성", test: function (a) { return a.pct >= 80; }, prog: function (a) { return "지금 " + a.pct + "%"; } },
    { id: "glasses", slot: "face", name: "동글 안경", cond: "계획 30% 달성", test: function (a) { return a.pct >= 30; }, prog: function (a) { return "지금 " + a.pct + "%"; } },
    { id: "halo", slot: "back", name: "반짝 후광", cond: "계획 60% 달성", test: function (a) { return a.pct >= 60; }, prog: function (a) { return "지금 " + a.pct + "%"; } },
    { id: "wings", slot: "back", name: "날개", cond: "연속 20일 출석", test: function (a) { return a.best >= 20; }, prog: function (a) { return "최고 연속 " + a.best + "일"; } }
  ];
  var ITEM_BY = {};
  ITEMS.forEach(function (it) { ITEM_BY[it.id] = it; });

  // 캐릭터·단계별 부착 위치: hx/hy 정수리, ey/edx 눈 높이·간격, by/bw 몸통 중심·반폭
  function anchorOf(kind, st) {
    var egg = { hx: 60, hy: 19, ey: 74.5, edx: 10, by: 72, bw: 34 };
    if (st <= 1) return egg;
    var animal = kind === "monkey" || kind === "bear", bear = kind === "bear";
    if (!animal) return [null, null,
      { hx: 60, hy: 27, ey: 60, edx: 10, by: 86, bw: 32 },
      { hx: 60, hy: 40, ey: 67, edx: 10, by: 76, bw: 31 },
      { hx: 60, hy: 32, ey: 61, edx: 11, by: 72, bw: 33 },
      { hx: 60, hy: 28, ey: 64, edx: 11, by: 72, bw: 32 }][st];
    if (st === 2) return { hx: 60, hy: 24, ey: 58, edx: bear ? 9 : 7.5, by: 88, bw: 32 };
    if (st === 3) return { hx: 60, hy: bear ? 33 : 34, ey: 58, edx: bear ? 9 : 7.5, by: 94, bw: 21 };
    return { hx: 60, hy: bear ? 29 : 28, ey: bear ? 53.4 : 52.8, edx: bear ? 9.7 : 8.1, by: 93, bw: 24 };
  }
  var STAR = "M0-6l1.8 3.8 4.2.5-3.1 2.9.8 4.2L0 3.4l-3.7 2 .8-4.2-3.1-2.9 4.2-.5z";
  var ITEM_ART = {
    sprout: function (a) {
      return '<g transform="translate(' + a.hx + " " + (a.hy + 1) + ')"><path d="M0 2V-9" stroke="#4FA764" stroke-width="2.4" stroke-linecap="round"/><path d="M0-5q-9-7-13 0q7 5 13 0z" fill="#7ED9A6"/><path d="M0-8q8-8 13-1q-6 6-13 1z" fill="#95E3B0"/></g>';
    },
    ribbon: function (a) {
      return '<g transform="translate(' + (a.hx + 11) + " " + (a.hy + 5) + ') rotate(-18)"><path d="M0 0L-10-7v14z" fill="#FF8FB0"/><path d="M0 0l10-7v14z" fill="#FF8FB0"/><path d="M0 0l-6 11M0 0l6 11" stroke="#FF8FB0" stroke-width="2.4" stroke-linecap="round"/><circle r="3.4" fill="#FF6E98"/></g>';
    },
    flower: function (a) {
      var g = '<g transform="translate(' + (a.hx - 12) + " " + (a.hy + 6) + ')">';
      for (var i = 0; i < 5; i++) { var r = (i * 72 - 90) * Math.PI / 180; g += circ(Math.cos(r) * 4, Math.sin(r) * 4, 3.4, "#FFB3C7"); }
      return g + circ(0, 0, 2.6, "#FFD23F") + "</g>";
    },
    starpin: function (a) {
      return '<g transform="translate(' + (a.hx + 12) + " " + (a.hy + 6) + ') rotate(12) scale(1.25)"><path d="' + STAR + '" fill="#FFD23F" stroke="#E0A800" stroke-width="1.1" stroke-linejoin="round"/></g>';
    },
    crown: function (a) {
      return '<g transform="translate(' + a.hx + " " + (a.hy + 2) + ')"><path d="M-12 0l-2-12 7.5 5.5L0-16l6.5 9.5L14-12l-2 12z" fill="#FFD23F" stroke="#E0A800" stroke-width="1.6" stroke-linejoin="round"/>' + circ(0, -5, 2, "#FF6B6B") + circ(-7, -3, 1.4, "#7ED9A6") + circ(7, -3, 1.4, "#8FD0FA") + "</g>";
    },
    glasses: function (a) {
      var r = Math.max(5.5, a.edx * 0.72), y = a.ey;
      return '<g fill="rgba(255,255,255,.28)" stroke="#4A3B32" stroke-width="2">' +
        '<circle cx="' + r1(a.hx - a.edx) + '" cy="' + y + '" r="' + r1(r) + '"/><circle cx="' + r1(a.hx + a.edx) + '" cy="' + y + '" r="' + r1(r) + '"/>' +
        '<path d="M' + r1(a.hx - a.edx + r) + " " + y + "H" + r1(a.hx + a.edx - r) + '" fill="none"/></g>';
    },
    halo: function (a) {
      return '<ellipse cx="' + a.hx + '" cy="' + (a.hy - 9) + '" rx="14" ry="4.2" fill="none" stroke="#FFD23F" stroke-width="3.2"/>' +
        '<g transform="translate(' + (a.hx - 22) + " " + (a.hy - 2) + ') scale(.7)"><path d="' + STAR + '" fill="#FFE27A"/></g><g transform="translate(' + (a.hx + 23) + " " + (a.hy + 4) + ') scale(.55)"><path d="' + STAR + '" fill="#FFE27A"/></g>';
    },
    wings: function (a) {
      var w = function (sx) {
        return '<g transform="translate(' + r1(a.hx + sx * (a.bw - 2)) + " " + (a.by - 8) + ") scale(" + sx + ' 1)"><path d="M0 0q14-18 26-10q-2 6-8 7q7 3 4 9q-5 3-10 0q2 7-6 8q-6-4-6-14z" fill="#fff" stroke="#BFE0F5" stroke-width="2" stroke-linejoin="round"/></g>';
      };
      return w(1) + w(-1);
    }
  };
  // 캐릭터 + 착용 아이템. 등 아이템은 몸 뒤, 머리·얼굴은 앞. 몸과 같은 통통 애니메이션을 받도록 class="body".
  function dressSVG(kind, st, equip) {
    var svg = charSVG(kind, st), a = anchorOf(kind, st), back = "", front = "";
    equip = obj(equip);
    if (equip.back && ITEM_ART[equip.back]) back = ITEM_ART[equip.back](a);
    if (equip.face && ITEM_ART[equip.face]) front += ITEM_ART[equip.face](a);
    if (equip.head && ITEM_ART[equip.head]) front += ITEM_ART[equip.head](a);
    if (back) svg = svg.replace('<g class="body">', '<g class="body acc">' + back + '</g><g class="body">');
    if (front) svg = svg.replace(/<\/svg>$/, '<g class="body acc">' + front + "</g></svg>");
    return svg;
  }
  function itemStats() {
    var days = 0;
    DAYS.forEach(function (iso) { if (iso <= TODAY.iso && dayStat(iso).act > 0) days++; });
    var t = totals();
    return { days: days, best: streakInfo().best, pct: t.total ? Math.floor((t.done / t.total) * 100) : 0 };
  }
  function newItemCount() {
    var seen = Array.isArray(USER.seenItems) ? USER.seenItems : [];
    return Object.keys(obj(USER.items)).filter(function (id) { return seen.indexOf(id) < 0; }).length;
  }
  function checkItems() {
    if (!USER || !EXAM) return;
    USER.items = obj(USER.items);
    var a = itemStats(), got = [];
    ITEMS.forEach(function (it) {
      if (!USER.items[it.id] && it.test(a)) { USER.items[it.id] = TODAY.iso; got.push(it); }
    });
    if (!got.length) return;
    save();
    if (ui.dressDot) ui.dressDot.hidden = false;
    if (ui.itemCard) paintItemCard();
    toast(got.length === 1 ? "🎁 새 아이템 '" + got[0].name + "' 획득! (" + got[0].cond + ")" : "🎁 아이템 " + got.length + "개 획득! 꾸미기에서 달아 보세요");
    celebrate();
  }

  function celebrate() {
    var host = ui.pet;
    if (!host || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
    var glow = el("div", "glow");
    var box = el("div", "confetti");
    var cols = ["#FFD23F", "#FF9F45", "#7ED9A6", "#8FD0FA", "#FFA99A", "#B6A4F5"];
    for (var i = 0; i < 28; i++) {
      var p = el("i", i % 3 === 0 ? "s" : "");
      var a = Math.random() * Math.PI * 2, d = 70 + Math.random() * 90;
      p.style.setProperty("--c", cols[i % cols.length]);
      p.style.setProperty("--x", Math.round(Math.cos(a) * d) + "px");
      p.style.setProperty("--y", Math.round(Math.sin(a) * d - 30) + "px");
      p.style.setProperty("--r", Math.round(Math.random() * 720 - 360) + "deg");
      p.style.animationDelay = (Math.random() * 0.12).toFixed(2) + "s";
      box.append(p);
    }
    host.append(glow, box);
    setTimeout(function () { box.remove(); glow.remove(); }, 1500);
  }
  // 연속 공부일: 실제 공부 기록이 있는 날이 이어진 수. 계획 없는 쉬는 날은 끊지 않고 건너뛰고,
  // 오늘은 아직 안 했어도 끊지 않는다(하루가 끝나지 않았으니까).
  function streakInfo() {
    var run = 0, best = 0, today = false;
    DAYS.forEach(function (iso) {
      if (iso > TODAY.iso) return;
      var s = dayStat(iso);
      if (s.act > 0) { run++; if (iso === TODAY.iso) today = true; }
      else if (s.total && iso !== TODAY.iso) run = 0;
      if (run > best) best = run;
    });
    return { cur: run, best: best, today: today };
  }
  function setChar(node, st) {
    var key = st + JSON.stringify(obj(USER && USER.equip));
    if (!node || node.dataset.st === key) return;
    node.dataset.st = key;
    node.innerHTML = dressSVG(CHAR, st, USER && USER.equip);
  }
  function hop() {
    var c = ui.char;
    if (!c) return;
    c.classList.remove("hop");
    void c.offsetWidth;
    c.classList.add("hop");
  }
  function say(text, ms) {
    if (!ui.bubble) return;
    clearTimeout(bubbleTimer);
    ui.bubble.textContent = text;
    ui.bubble.classList.remove("pop");
    void ui.bubble.offsetWidth;
    ui.bubble.classList.add("pop");
    ui.hold = true;
    bubbleTimer = setTimeout(function () { ui.hold = false; if (route === "today") updateToday(); else updateTotal(); }, ms || 3500);
  }
  function toast(text) {
    clearTimeout(toastTimer);
    $toast.textContent = text;
    $toast.classList.add("show");
    toastTimer = setTimeout(function () { $toast.classList.remove("show"); }, 2800);
  }
  function moodLine(s, total) {
    var n = isoParts(sel)[2];
    if (sel === EXAM_ISO && sel === TODAY.iso) return "시험 날! 지금까지 " + fmtMin(total) + " 공부했어. 믿고 가자!";
    if (sel > TODAY.iso) return "미리 보는 " + mdLabel(sel) + " 계획이야";
    var past = sel < TODAY.iso;
    var st = dayStatus(s);
    if (st === "rest") return past ? "쉬는 날이었어. 공부했으면 아래에 기록해줘" : "오늘은 쉬는 날~ 푹 쉬고 내일 또 보자";
    if (st === "full") return past ? "이 날은 계획을 다 끝냈어! 최고" : (s.done === s.total && s.total ? "오늘 계획 끝! 🎉 더 하면 보너스 성장!" : "오늘 " + fmtMin(s.act) + " 공부 완료!");
    if (past) return "지난 날도 체크하고 기록할 수 있어";
    if (st === "part") {
      var left = s.total - s.done;
      return n % 2 ? left + "개만 더 하면 오늘 끝!" : "벌써 " + fmtMin(s.act) + " 했어! 이 기세로 가자";
    }
    var starts = ["오늘도 같이 해보자! 첫 번째부터 톡!", "시작이 반! 10분만 먼저 해볼까?", ddText() + "! 오늘 한 칸만 채워보자"];
    return starts[n % starts.length];
  }

  /* ---------- actions ---------- */
  function toggle(it) {
    var before = totals().act;
    if (state.done[it.id]) {
      delete state.done[it.id];
      if (state.act[it.id] === it.min) delete state.act[it.id];
    } else {
      state.done[it.id] = 1;
      if (it.min > 0 && state.act[it.id] === undefined) state.act[it.id] = it.min;
    }
    save(); buzz();
    var after = totals().act;
    updateToday();
    if (state.done[it.id]) {
      hop();
      var cheer = DONE_CHEERS[cheerIdx++ % DONE_CHEERS.length];
      say(after > before ? cheer + " +" + fmtMin(after - before) : cheer);
    }
    checkLevel(after);
  }
  function setAct(id, n) {
    n = clamp(Math.round(n), 0, 600);
    if (n === 0) delete state.act[id]; else state.act[id] = n;
    save();
    updateToday();
    checkLevel(totals().act);
  }

  /* ---------- 오늘 ---------- */
  function cloud(style) {
    return '<svg class="cloud" style="' + style + '" viewBox="0 0 80 36" aria-hidden="true"><path d="M16 34a14 14 0 0 1 2-28 18 18 0 0 1 33 2 12 12 0 0 1 13 26z"/></svg>';
  }
  var ICON_FLAME = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c.6 3.2 4 5 4.9 8.6A6.2 6.2 0 0 1 12 21.5 6.2 6.2 0 0 1 6 14c0-2.6 1.6-4 2.6-5.2.3 1.6 1 2.6 2.1 3.1C10.4 8.4 10.9 5 12 2.5z" fill="#FF9F45"/><path d="M12 12.5c1.9 1.6 2.8 3 2.8 4.6A2.8 2.8 0 0 1 12 20a2.8 2.8 0 0 1-2.8-2.9c0-1.6 1.2-3 2.8-4.6z" fill="#FFD23F"/></svg>';
  var ICON_CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#BFE6FF"/><path d="M12 7v5l3 2" stroke="#4A3B32" stroke-width="2.2" fill="none" stroke-linecap="round"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="6" fill="#7ED9A6"/><path d="M7.5 12.5l3 3 6-6.5" stroke="#1F6B45" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_PACE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="6" fill="#FFD23F"/><path d="M7 16l3.5-4 3 2.5L17 9" stroke="#4A3B32" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_BOW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 12L3 6.5v11z" fill="#FF8FB0"/><path d="M12 12l9-5.5v11z" fill="#FF8FB0"/><circle cx="12" cy="12" r="3.2" fill="#FF6E98"/></svg>';
  var ICON_PENCIL ='<svg viewBox="0 0 80 80" aria-hidden="true"><g transform="rotate(-38 40 40)"><rect x="30" y="4" width="20" height="54" rx="4" fill="#FFF3C9"/><rect x="30" y="4" width="20" height="10" rx="4" fill="#FF9FB0"/><path d="M30 58h20l-10 18z" fill="#FFE0B0"/><path d="M36.5 70h7l-3.5 6z" fill="#4A3B32"/></g></svg>';

  // 누구의 어떤 시험인지 보여주고, 누르면 시험 고르기(다른 시험·사용자 바꾸기) 화면으로
  function topbar() {
    var t = el("div", "topbar");
    var b = btn("brand", null, "시험 바꾸기 또는 사용자 바꾸기");
    var av = ui.topAv = el("span", "avatar");
    av.innerHTML = dressSVG(CHAR, 3, USER.equip);
    var txt = el("span", "who");
    txt.append(el("b", null, USER.name), el("small", null, EXAM.name));
    b.append(av, txt);
    b.insertAdjacentHTML("beforeend", IC.down);
    b.addEventListener("click", function () { location.hash = "#exams"; });
    ui.lvChip = el("span", "lv-chip");
    t.append(b, ui.lvChip);
    return t;
  }
  function examDateLabel(iso) {
    var p = isoParts(iso);
    return p[0] + ". " + p[1] + ". " + p[2] + " (" + wdOf(iso) + ")";
  }
  function miniCard(cls, icon, label, key) {
    var c = el("div", "card b-mini" + (cls ? " " + cls : ""));
    var sm = el("small");
    sm.innerHTML = icon;
    sm.append(document.createTextNode(label));
    ui[key] = el("div", "val");
    ui[key + "Sub"] = el("div", "sub");
    c.append(sm, ui[key], ui[key + "Sub"]);
    return c;
  }
  function bentoTop(timeLabel) {
    var g = el("section", "bento");
    var dd = el("div", "card b-dday");
    var deco = el("div", "deco");
    deco.innerHTML = ICON_PENCIL;
    ui.ddn = el("div", "big");
    dd.append(el("small", null, EXAM.name + "까지"), ui.ddn, el("div", "date", examDateLabel(EXAM_ISO)), deco);
    ui.streakCard = miniCard("b-streak", ICON_FLAME, "연속 공부", "stk");
    g.append(dd, ui.streakCard, miniCard("", ICON_CLOCK, timeLabel, "tm"));
    return g;
  }
  function petCard(big) {
    var p = el("section", "card pet" + (big ? " big" : ""));
    p.innerHTML = cloud("left:5%;top:30px;width:70px") + cloud("right:5%;top:84px;width:56px;opacity:.75") + cloud("right:30%;top:12px;width:36px;opacity:.6") + '<div class="hill"></div>';
    ui.pet = p;
    ui.bubble = el("div", "bubble");
    ui.bubble.setAttribute("aria-live", "polite");
    ui.char = btn("char", null, CHARS[CHAR].name + " 쓰다듬고 응원 듣기");
    ui.char.addEventListener("click", function () {
      hop();
      say(CHEERS[cheerIdx++ % CHEERS.length]);
    });
    var meta = el("div", "pet-meta");
    var nm = el("div", "pet-name");
    ui.stName = el("span");
    ui.expNum = el("small");
    nm.append(ui.stName, ui.expNum);
    var tr = el("div", "exp-track");
    ui.expFill = el("i");
    tr.append(ui.expFill);
    ui.expTxt = el("div", "exp-txt");
    meta.append(nm, tr, ui.expTxt);
    var dress = btn("dress-btn", null, "캐릭터 꾸미기");
    dress.innerHTML = ICON_BOW;
    dress.append(el("span", null, "꾸미기"));
    ui.dressDot = el("i", "new-dot");
    ui.dressDot.hidden = !newItemCount();
    dress.append(ui.dressDot);
    dress.addEventListener("click", openDressSheet);
    p.append(ui.bubble, ui.char, dress, meta);
    return p;
  }
  function bigNum(node, num, unit) {
    node.textContent = String(num);
    if (unit) node.append(el("span", null, unit));
  }
  function timeNum(node, min) {
    if (min < 60) bigNum(node, Math.round(min), "분");
    else bigNum(node, Math.round((min / 60) * 10) / 10, "시간");
  }
  // 두 화면 공통 상단(D-day, 레벨, 캐릭터, 경험치, 연속 공부) 갱신
  function updateHeader(t) {
    var st = stageOf(t.act);
    ui.ddn.textContent = ddText();
    ui.ddn.classList.toggle("long", ui.ddn.textContent.length > 5);
    ui.lvChip.textContent = "";
    ui.lvChip.append(el("b", null, "Lv." + (st + 1)), document.createTextNode(STAGES[st].name));
    setChar(ui.char, st);
    ui.stName.textContent = STAGES[st].name;
    ui.expNum.textContent = st < STAGES.length - 1 ? fmtH(t.act) + " / " + fmtH(STAGES[st + 1].min) : fmtH(t.act);
    expUpdate(ui.expFill, ui.expTxt, t.act, st);
    var sk = streakInfo();
    bigNum(ui.stk, sk.cur, "일");
    ui.stkSub.textContent = sk.today ? "오늘도 " + CHARS[CHAR].sound + "! 최고 " + sk.best + "일" : sk.cur ? "오늘 하면 " + (sk.cur + 1) + "일째!" : "오늘부터 시작!";
    ui.streakCard.classList.toggle("on", sk.today);
    return st;
  }

  function mountToday() {
    var nav = el("div", "datenav");
    ui.prev = btn("nav-btn", null, "이전 날");
    ui.prev.innerHTML = IC.prev;
    ui.next = btn("nav-btn", null, "다음 날");
    ui.next.innerHTML = IC.next;
    ui.prev.addEventListener("click", function () { move(-1); });
    ui.next.addEventListener("click", function () { move(1); });
    var mid = el("div", "dn-mid");
    ui.dTitle = el("h1");
    ui.dSub = el("small");
    mid.append(ui.dTitle, ui.dSub);
    nav.append(ui.prev, mid, ui.next);
    ui.back = btn("link back-today", "오늘로 돌아가기");
    ui.back.addEventListener("click", function () { selectDay(defaultSel()); });
    ui.body = el("div", "day-body");

    $screen.textContent = "";
    $screen.append(topbar(), bentoTop("오늘 공부"), petCard(false), nav, ui.back, ui.body);
    fillDay();
    updateToday();
  }

  function move(step) {
    var i = DAYS.indexOf(sel) + step;
    if (i >= 0 && i < DAYS.length) selectDay(DAYS[i]);
  }
  function selectDay(iso) {
    sel = iso;
    ui.hold = false;
    fillDay();
    updateToday();
  }

  function taskCard(it) {
    var card = el("article", "tcard");
    var top = el("div", "t-top");
    var info = btn("t-info");
    var meta = el("span", "t-meta");
    var tag = el("span", "tag", TAGS[it.tag]);
    tag.dataset.t = it.tag;
    meta.append(tag);
    if (it.slot) meta.append(el("span", null, it.slot));
    if (it.pages) meta.append(el("span", null, "· 교재 " + it.pages));
    info.append(meta, el("span", "t-ttl", it.title));
    var chk = btn("chk");
    chk.innerHTML = IC.check;
    chk.setAttribute("role", "checkbox");
    chk.setAttribute("aria-label", it.title + " 완료");
    info.addEventListener("click", function () { toggle(it); });
    chk.addEventListener("click", function () { toggle(it); });
    top.append(info, chk);
    card.append(top);
    if (it.detail) {
      var det = btn("t-det", it.detail);
      det.addEventListener("click", function () { det.classList.toggle("open"); });
      card.append(det);
    }
    var rec = { card: card, chk: chk, inp: null };
    if (it.min > 0) {
      var foot = el("div", "t-foot");
      var inp = document.createElement("input");
      inp.type = "number"; inp.min = "0"; inp.max = "600"; inp.step = "5";
      inp.id = "act-" + it.id;
      inp.setAttribute("inputmode", "numeric");
      inp.placeholder = String(it.min);
      var lab = el("label", "lab", "실제");
      lab.htmlFor = inp.id;
      var minus = btn(null, "−", "5분 줄이기");
      var plus = btn(null, "+", "5분 늘리기");
      minus.addEventListener("click", function () { setAct(it.id, actOf(it.id) - 5); });
      plus.addEventListener("click", function () { setAct(it.id, actOf(it.id) + 5); });
      inp.addEventListener("input", function () {
        var raw = inp.value.trim();
        if (raw === "") { delete state.act[it.id]; save(); updateToday(); return; }
        var n = Number(raw);
        if (!isFinite(n)) return;
        state.act[it.id] = clamp(Math.round(n), 0, 600);
        save(); updateToday();
      });
      inp.addEventListener("change", function () { checkLevel(totals().act); });
      var step = el("div", "step");
      step.append(minus, inp, plus);
      foot.append(lab, step, el("span", null, "분"), el("span", "pl", "계획 " + it.min + "분"));
      card.append(foot);
      rec.inp = inp;
    }
    ui.tasks[it.id] = rec;
    return card;
  }

  function extraRow(iso, x) {
    var r = btn("extra-row");
    r.dataset.t = x.tag;
    r.append(el("i", "dot"), el("span", "x-ttl", x.title), el("span", "x-min", "+" + fmtMin(x.min)));
    r.setAttribute("aria-label", x.title + " " + fmtMin(x.min) + " 기록 수정");
    r.addEventListener("click", function () { openExtraSheet(iso, x); });
    return r;
  }

  function fillDay() {
    var iso = sel;
    var items = itemsOf(iso);
    ui.body.textContent = "";
    ui.tasks = {};

    var sum = el("section", "card sum");
    var row = el("div", "sum-row");
    ui.sumDone = el("div", "big");
    var tm = el("div", "tm");
    ui.sumTime = el("b");
    ui.sumPlan = el("div");
    tm.append(ui.sumTime, ui.sumPlan);
    row.append(ui.sumDone, tm);
    var bar = el("div", "pbar");
    ui.bar = el("i");
    bar.append(ui.bar);
    sum.append(row, bar);
    ui.body.append(sum);

    var lh = el("div", "list-h");
    lh.append(el("h2", null, iso === TODAY.iso ? "오늘의 계획" : "이 날의 계획"));
    var edit = btn("link", "계획 수정");
    edit.addEventListener("click", function () { openDaySheet(iso); });
    lh.append(edit);
    ui.body.append(lh);

    if (items.length) {
      items.forEach(function (it) { ui.body.append(taskCard(it)); });
    } else {
      var rest = el("section", "card rest-card");
      rest.append(el("h2", null, "계획 없는 날이에요"), el("p", null, "쉬어도 좋고, 공부했다면 아래에 기록하면 캐릭터가 자라요."));
      ui.body.append(rest);
    }

    var xh = el("div", "list-h");
    xh.append(el("h2", null, "추가 공부 기록"));
    ui.body.append(xh);
    extrasOf(iso).forEach(function (x) { ui.body.append(extraRow(iso, x)); });
    var add = btn("btn primary add-btn block");
    add.innerHTML = IC.plus;
    add.append(document.createTextNode(" 공부 기록 추가하기"));
    add.addEventListener("click", function () { openExtraSheet(iso, null); });
    ui.body.append(add);

  }

  function updateToday() {
    var d = dayBy[sel];
    var i = DAYS.indexOf(sel);
    ui.dTitle.textContent = "";
    if (sel === TODAY.iso) ui.dTitle.append(el("span", "today-badge", "오늘"));
    ui.dTitle.append(document.createTextNode(mdLabel(sel)));
    ui.dSub.textContent = [d.hol, phaseBy[d.phase].name].filter(Boolean).join(" · ");
    ui.prev.disabled = i <= 0;
    ui.next.disabled = i >= DAYS.length - 1;
    ui.back.hidden = sel === defaultSel();

    var t = totals();
    updateHeader(t);
    var ts = dayBy[TODAY.iso] ? dayStat(TODAY.iso) : { act: 0, plan: 0 };
    timeNum(ui.tm, ts.act);
    ui.tmSub.textContent = ts.plan ? "계획 " + fmtMin(ts.plan) : "계획 없는 날";

    var s = dayStat(sel);
    ui.sumDone.textContent = s.total ? s.done + " / " + s.total + "개" : "기록 " + extrasOf(sel).length + "개";
    if (s.total && s.done === s.total) ui.sumDone.append(el("em", null, "완료!"));
    ui.sumTime.textContent = "실제 " + fmtMin(s.act);
    ui.sumPlan.textContent = s.plan ? "계획 " + fmtMin(s.plan) : "계획 없음";
    ui.bar.style.width = (s.plan ? Math.min(100, (s.act / s.plan) * 100) : (s.act ? 100 : 0)) + "%";

    itemsOf(sel).forEach(function (it) {
      var r = ui.tasks[it.id];
      if (!r) return;
      var on = !!state.done[it.id];
      r.card.classList.toggle("on", on);
      if (on && r.on === false) {
        r.card.classList.remove("pop");
        void r.card.offsetWidth;
        r.card.classList.add("pop");
      }
      r.on = on;
      r.chk.setAttribute("aria-checked", on ? "true" : "false");
      if (r.inp && document.activeElement !== r.inp) {
        var v = state.act[it.id];
        r.inp.value = typeof v === "number" ? String(v) : "";
      }
    });
    if (!ui.hold) ui.bubble.textContent = moodLine(s, t.act);
  }

  function expUpdate(fill, txt, act, st) {
    if (st >= STAGES.length - 1) {
      fill.style.width = "100%";
      txt.textContent = "최종 단계 달성! 이제 합격만 남았어요";
      return;
    }
    var cur = STAGES[st], nx = STAGES[st + 1];
    fill.style.width = Math.round(((act - cur.min) / (nx.min - cur.min)) * 100) + "%";
    txt.textContent = "'" + nx.name + "'까지 " + fmtMin(nx.min - act) + " 남았어요";
  }

  /* ---------- bottom sheet ---------- */
  function openSheet(title, build) {
    closeSheet(true);
    var back = el("div", "sh-back");
    var panel = el("div", "sh-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", title);
    var head = el("div", "sh-head");
    var h = el("h2", null, title);
    var x = btn("sh-x", null, "닫기");
    x.innerHTML = IC.x;
    head.append(h, x);
    var body = el("div", "sh-body");
    panel.append(head, body);
    $sheetRoot.append(back, panel);
    document.body.classList.add("noscroll");
    back.addEventListener("click", function () { closeSheet(); });
    x.addEventListener("click", function () { closeSheet(); });
    var api = { body: body, title: h, close: function () { closeSheet(); } };
    build(api);
    requestAnimationFrame(function () { $sheetRoot.classList.add("open"); });
    return api;
  }
  function closeSheet(silent) {
    if (!$sheetRoot.firstChild) return;
    $sheetRoot.classList.remove("open");
    $sheetRoot.textContent = "";
    document.body.classList.remove("noscroll");
    var cb = sheetClose;
    sheetClose = null;
    if (cb && !silent) cb();
  }
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

  function field(label, input) {
    var f = el("label", "field");
    f.append(el("span", null, label), input);
    return f;
  }
  function textInput(val, ph) {
    var i = document.createElement("input");
    i.type = "text"; i.value = val || ""; i.placeholder = ph || "";
    i.maxLength = 80;
    return i;
  }
  function picker(opts, cur, cls, onPick) {
    var w = el("div", "pick" + (cls ? " " + cls : ""));
    w.setAttribute("role", "group");
    var btns = [];
    opts.forEach(function (o) {
      var b = btn(null, o.label);
      if (o.t) b.dataset.t = o.t;
      b.setAttribute("aria-pressed", String(o.value === cur));
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
        onPick(o.value);
      });
      btns.push(b);
      w.append(b);
    });
    w.sync = function (v) { btns.forEach(function (x, k) { x.setAttribute("aria-pressed", String(opts[k].value === v)); }); };
    return w;
  }
  function tagPicker(cur, onPick) {
    return picker(TAG_ORDER.map(function (k) { return { label: TAGS[k], value: k, t: k }; }), cur, "tags", onPick);
  }
  function minutePicker(cur, presets, onChange) {
    var wrap = el("div");
    wrap.style.display = "grid"; wrap.style.gap = "8px";
    var num = document.createElement("input");
    num.type = "number"; num.min = "0"; num.max = "900"; num.step = "5";
    num.setAttribute("inputmode", "numeric");
    num.value = cur ? String(cur) : "";
    num.placeholder = "0";
    var pk = picker(presets.map(function (m) { return { label: m >= 60 ? (m / 60) + "시간" : m + "분", value: m }; }), cur, "", function (v) {
      num.value = String(v); onChange(v);
    });
    num.addEventListener("input", function () { var n = Number(num.value) || 0; pk.sync(n); onChange(n); });
    var row = el("div", "min-row");
    row.append(num, el("span", null, "분"));
    wrap.append(pk, row);
    return wrap;
  }

  // 추가 공부 기록 (계획에 없던 공부)
  function openExtraSheet(iso, rec) {
    var draft = { title: rec ? rec.title : "", min: rec ? rec.min : 30, tag: rec ? rec.tag : "r" };
    openSheet(rec ? "공부 기록 수정" : mdLabel(iso) + " 공부 기록", function (sh) {
      var ti = textInput(draft.title, "예: 기출 2024년 2회 코드 문제");
      sh.body.append(field("무엇을 공부했나요?", ti));
      var mp = minutePicker(draft.min, [15, 30, 45, 60, 90, 120], function (v) { draft.min = v; });
      sh.body.append(fieldBlock("얼마나 했나요?", mp));
      sh.body.append(fieldBlock("과목", tagPicker(draft.tag, function (v) { draft.tag = v; })));
      var msg = el("p", "note");
      msg.style.color = "var(--danger)";
      var ok = btn("btn primary block", rec ? "저장하기" : "기록하기");
      ok.addEventListener("click", function () {
        var min = Math.round(Number(draft.min) || 0);
        if (min <= 0) { msg.textContent = "공부한 시간을 1분 이상 적어 주세요."; return; }
        var before = totals().act;
        var list = state.extra[iso] = extrasOf(iso).slice();
        var item = { id: rec ? rec.id : uid(iso), title: ti.value.trim() || TAGS[draft.tag] + " 공부", min: clamp(min, 1, 900), tag: draft.tag };
        if (rec) list[list.findIndex(function (x) { return x.id === rec.id; })] = item; else list.push(item);
        save();
        var gained = totals().act - before;
        sh.close();
        afterDataChange();
        if (route === "today" && gained > 0) { hop(); say("+" + fmtMin(gained) + "! 추가 공부 최고야"); }
      });
      sh.body.append(msg, ok);
      if (rec) {
        var del = btn("btn danger block", "이 기록 지우기");
        del.addEventListener("click", function () {
          if (del.dataset.arm !== "1") { del.dataset.arm = "1"; del.textContent = "한 번 더 누르면 지워요"; return; }
          state.extra[iso] = extrasOf(iso).filter(function (x) { return x.id !== rec.id; });
          if (!state.extra[iso].length) delete state.extra[iso];
          save(); sh.close(); afterDataChange();
        });
        sh.body.append(del);
      }
      if (!rec) setTimeout(function () { ti.focus(); }, 280);
    });
  }
  function fieldBlock(label, node) {
    var f = el("div", "field");
    f.append(el("span", null, label), node);
    return f;
  }

  // 날짜별 계획 보기·수정
  function openDaySheet(iso) {
    openSheet(mdLabel(iso), function (sh) {
      function list() {
        sh.title.textContent = mdLabel(iso) + (dayBy[iso].hol ? " " + dayBy[iso].hol : "");
        sh.body.textContent = "";
        var s = dayStat(iso);
        sh.body.append(el("p", "sh-sum", phaseBy[dayBy[iso].phase].name + " · 계획 " + fmtMin(s.plan) + " · 실제 " + fmtMin(s.act)));
        if (isEdited(iso)) {
          var fl = el("div", "ed-flag");
          fl.append(el("span", null, "직접 수정한 계획이에요"));
          var rv = btn("btn small", "원래대로");
          rv.addEventListener("click", function () {
            if (rv.dataset.arm !== "1") { rv.dataset.arm = "1"; rv.textContent = "정말 되돌릴까요?"; return; }
            delete state.plan[iso];
            save(); list(); afterDataChange();
          });
          fl.append(rv);
          sh.body.append(fl);
        }
        var items = itemsOf(iso);
        if (!items.length) sh.body.append(el("p", "note", "계획이 없는 날이에요. 아래에서 추가할 수 있어요."));
        items.forEach(function (it) {
          var c = el("div", "ed-item");
          var meta = el("span", "t-meta");
          var tag = el("span", "tag", TAGS[it.tag]);
          tag.dataset.t = it.tag;
          meta.append(tag, el("span", null, it.slot || (it.min ? it.min + "분" : "")));
          if (state.done[it.id]) meta.append(el("span", null, "· 완료"));
          c.append(meta, el("div", "t-ttl", it.title));
          if (it.detail) c.append(el("p", "note", it.detail));
          var acts = el("div", "acts");
          var e = btn("btn small", "수정");
          var d = btn("btn small danger", "삭제");
          e.addEventListener("click", function () { form(it); });
          d.addEventListener("click", function () {
            if (d.dataset.arm !== "1") { d.dataset.arm = "1"; d.textContent = "삭제 확인"; return; }
            var own = ownPlan(iso);
            state.plan[iso] = own.filter(function (x) { return x.id !== it.id; });
            delete state.done[it.id]; delete state.act[it.id];
            save(); list(); afterDataChange();
          });
          acts.append(e, d);
          c.append(acts);
          sh.body.append(c);
        });
        var add = btn("btn block");
        add.innerHTML = IC.plus;
        add.append(document.createTextNode(" 계획 추가"));
        add.addEventListener("click", function () { form(null); });
        sh.body.append(add);
        if (route !== "today" || sel !== iso) {
          var go = btn("btn primary block", "이 날 체크·기록하러 가기");
          go.addEventListener("click", function () { sh.close(); openDay(iso); });
          sh.body.append(go);
        }
      }
      function form(it) {
        var draft = it ? cleanItem(it, iso) : { id: uid(iso), slot: "", min: 30, tag: "t", parts: [], pages: "", title: "", detail: "" };
        sh.title.textContent = it ? "계획 수정" : "계획 추가";
        sh.body.textContent = "";
        var ti = textInput(draft.title, "예: PART 02 정규화 복습");
        var sl = textInput(draft.slot, "예: 점심, 퇴근 후, 1교시");
        var dt = document.createElement("textarea");
        dt.value = draft.detail;
        dt.placeholder = "무엇을 할지 메모 (선택)";
        sh.body.append(field("할 일", ti), field("언제", sl));
        sh.body.append(fieldBlock("계획 시간", minutePicker(draft.min, [30, 60, 90, 120], function (v) { draft.min = v; })));
        sh.body.append(fieldBlock("과목", tagPicker(draft.tag, function (v) { draft.tag = v; })));
        sh.body.append(field("메모", dt));
        var msg = el("p", "note");
        msg.style.color = "var(--danger)";
        var row = el("div", "btnrow");
        var cancel = btn("btn", "취소");
        var ok = btn("btn primary", "저장");
        ok.style.flex = "1";
        cancel.addEventListener("click", list);
        ok.addEventListener("click", function () {
          if (!ti.value.trim()) { msg.textContent = "할 일을 적어 주세요."; ti.focus(); return; }
          draft.title = ti.value.trim();
          draft.slot = sl.value.trim();
          draft.detail = dt.value.trim();
          draft.min = clamp(Math.round(Number(draft.min) || 0), 0, 600);
          var own = ownPlan(iso);
          var k = own.findIndex(function (x) { return x.id === draft.id; });
          if (k >= 0) own[k] = draft; else own.push(draft);
          save(); list(); afterDataChange();
        });
        row.append(cancel, ok);
        sh.body.append(msg, row);
        setTimeout(function () { ti.focus(); }, 50);
      }
      list();
    });
  }

  function afterDataChange() {
    if (route === "today") { fillDay(); updateToday(); } else updateTotal();
    checkLevel(totals().act);
  }

  /* ---------- 꾸미기 시트 · 아이템 카드 ---------- */
  function itemTile(it, a, cls) {
    var own = !!obj(USER.items)[it.id];
    var eq = {};
    eq[it.slot] = it.id;
    var t = btn("dress-item" + (own ? "" : " locked") + (cls ? " " + cls : ""));
    var art = el("span", "dress-art");
    art.innerHTML = dressSVG(CHAR, 3, eq);
    t.append(art, el("b", null, it.name), el("small", null, own ? it.cond : it.cond + " · " + it.prog(a)));
    if (!own) t.append(el("span", "lock", "🔒"));
    t.setAttribute("aria-label", it.name + (own ? " (" + it.cond + ")" : " 잠김: " + it.cond + ", " + it.prog(a)));
    return t;
  }
  function refreshDressed() {
    if (ui.char) setChar(ui.char, stageOf(totals().act));
    if (ui.topAv) ui.topAv.innerHTML = dressSVG(CHAR, 3, USER.equip);
  }
  function openDressSheet() {
    USER.items = obj(USER.items);
    USER.equip = obj(USER.equip);
    USER.seenItems = Object.keys(USER.items);
    save();
    if (ui.dressDot) ui.dressDot.hidden = true;
    var st = stageOf(totals().act), a = itemStats();
    openSheet("캐릭터 꾸미기", function (sh) {
      var pv = el("div", "dress-preview");
      function paint() { pv.innerHTML = dressSVG(CHAR, st, USER.equip); }
      paint();
      var own = Object.keys(USER.items).length;
      sh.body.append(pv, el("p", "sh-sum center", "모은 아이템 " + own + " / " + ITEMS.length + " · 부위마다 하나씩 달 수 있어요"));
      SLOTS.forEach(function (sl) {
        var slot = sl[0];
        var sec = el("div", "dress-sec");
        sec.append(el("h3", null, sl[1]));
        var g = el("div", "dress-grid");
        ITEMS.filter(function (it) { return it.slot === slot; }).forEach(function (it) {
          var t = itemTile(it, a);
          var mine = !!USER.items[it.id];
          t.setAttribute("aria-pressed", String(USER.equip[slot] === it.id));
          if (!mine) t.setAttribute("aria-disabled", "true");
          t.addEventListener("click", function () {
            if (!mine) { toast("🔒 " + it.cond + "하면 받을 수 있어요"); return; }
            USER.equip[slot] = USER.equip[slot] === it.id ? null : it.id;
            save();
            [].forEach.call(g.children, function (x) { x.setAttribute("aria-pressed", "false"); });
            t.setAttribute("aria-pressed", String(USER.equip[slot] === it.id));
            paint();
            refreshDressed();
          });
          g.append(t);
        });
        sec.append(g);
        sh.body.append(sec);
      });
    });
  }
  function paintItemCard() {
    var c = ui.itemCard, a = itemStats();
    c.grid.textContent = "";
    ITEMS.forEach(function (it) {
      var t = itemTile(it, a, "mini");
      t.addEventListener("click", openDressSheet);
      c.grid.append(t);
    });
    c.count.textContent = Object.keys(obj(USER.items)).length + " / " + ITEMS.length + "개";
  }

  /* ---------- 계획·성장 ---------- */
  function card(title, sub) {
    var c = el("section", "card");
    var h = el("div", "sec-h");
    h.append(el("h2", null, title));
    if (sub) h.append(el("span", null, sub));
    c.append(h);
    return c;
  }

  function mountTotal() {
    ui.cells = {}; ui.rows = {}; ui.dex = [];
    var b4 = el("section", "bento4");
    b4.append(miniCard("", ICON_CHECK, "완료한 계획", "stDone"), miniCard("", ICON_PACE, "계획 대비", "stPace"));
    var head = [topbar(), bentoTop("총 공부"), petCard(true), b4];

    var body = el("div", "body2");

    // 도감
    var dx = card("성장 도감", "공부 시간만큼 자라요");
    var grid = el("div", "dex");
    STAGES.forEach(function (st, i) {
      var t = el("div", "dex-tile");
      var art = el("div");
      art.innerHTML = charSVG(CHAR, i);
      var name = el("b");
      t.append(art, name, el("small", null, st.min ? fmtMin(st.min) : "시작"));
      grid.append(t);
      ui.dex.push({ tile: t, name: name });
    });
    dx.append(grid);
    body.append(dx);

    // 아이템 모으기
    var ic = card("아이템 모으기", "출석·연속 출석·계획 달성으로 받아요");
    var ig = el("div", "dress-grid");
    var icount = el("p", "sh-sum");
    var go = btn("btn primary block", "캐릭터 꾸미러 가기");
    go.style.marginTop = "12px";
    go.addEventListener("click", openDressSheet);
    ic.append(icount, ig, go);
    ui.itemCard = { grid: ig, count: icount };
    paintItemCard();
    body.append(ic);

    // 달력
    var cc = card("공부 달력", "날짜를 누르면 계획을 보고 고칠 수 있어요");
    cc.classList.add("cal-card");
    var lg = el("div", "legend");
    lg.innerHTML = '<span><i class="lg-full"></i>다 했어요</span><span><i class="lg-part"></i>조금 했어요</span><span><i class="lg-none"></i>못 했어요</span><span><i class="lg-future"></i>남은 날</span>';
    var wdh = el("div", "cal-wd");
    ["월", "화", "수", "목", "금", "토", "일"].forEach(function (w) { wdh.append(el("span", null, w)); });
    var cal = el("div", "cal");
    var fp = isoParts(DAYS[0]), lp = isoParts(DAYS[DAYS.length - 1]);
    var start = Date.UTC(fp[0], fp[1] - 1, fp[2]), end = Date.UTC(lp[0], lp[1] - 1, lp[2]);
    start -= ((new Date(start).getUTCDay() + 6) % 7) * 864e5;
    end += ((7 - new Date(end).getUTCDay()) % 7) * 864e5;
    for (var t = start; t <= end; t += 864e5) {
      var dt = new Date(t);
      var iso = dt.getUTCFullYear() + "-" + pad(dt.getUTCMonth() + 1) + "-" + pad(dt.getUTCDate());
      var dnum = dt.getUTCDate() === 1 ? (dt.getUTCMonth() + 1) + "/1" : String(dt.getUTCDate());
      if (!dayBy[iso]) {
        var o = el("div", "cell out");
        o.append(el("span", "n", dnum));
        cal.append(o);
        continue;
      }
      (function (iso, dnum) {
        var c = btn("cell");
        var n = el("span", "n" + (dayBy[iso].hol || wdOf(iso) === "일" ? " hol" : ""), dnum);
        var v = el("span", "v");
        c.append(n, v);
        c.addEventListener("click", function () { openDaySheet(iso); });
        cal.append(c);
        ui.cells[iso] = { cell: c, v: v };
      })(iso, dnum);
    }
    cc.append(lg, wdh, cal, el("p", "cal-cap", "칸의 숫자: 지난 날은 실제 공부시간, 남은 날은 계획 시간이에요. 보라 점은 직접 고친 날."));
    body.append(cc);

    // 전체 계획
    var pc = card("전체 공부 계획", "눌러서 보기·수정");
    PHASES.forEach(function (p, pi) {
      var ph = el("div", "phase");
      var t2 = el("div", "phase-t");
      t2.append(el("span", "num", String(pi + 1)), el("b", null, p.name), el("span", "r", p.range));
      ph.append(t2);
      if (p.desc) ph.append(el("p", "phase-d", p.desc));
      DAYS.filter(function (iso) { return dayBy[iso].phase === p.key; }).forEach(function (iso) {
        var r = btn("lrow");
        var dc = el("span", "d", dayBy[iso].md);
        dc.append(el("small", null, dayBy[iso].wd + (dayBy[iso].hol ? " " + dayBy[iso].hol : "")));
        var mid = el("span", "m");
        var st = el("span", "s");
        var stt = el("span");
        st.append(stt, el("i", "sdot"));
        r.append(dc, mid, st);
        r.addEventListener("click", function () { openDaySheet(iso); });
        ph.append(r);
        ui.rows[iso] = { row: r, mid: mid, txt: stt };
      });
      pc.append(ph);
    });
    ui.resetAll = btn("btn small", "직접 고친 계획 모두 원래대로");
    ui.resetAll.style.marginTop = "12px";
    ui.resetAll.addEventListener("click", function () {
      var b = ui.resetAll;
      if (b.dataset.arm !== "1") { b.dataset.arm = "1"; b.textContent = "정말 모두 되돌릴까요? (한 번 더)"; return; }
      state.plan = {};
      save();
      b.dataset.arm = ""; b.textContent = "직접 고친 계획 모두 원래대로";
      afterDataChange();
    });
    pc.append(ui.resetAll);
    body.append(pc);

    // PART
    var pt = card("교재 PART별 진도", "완료한 블록 / 전체");
    var pg = el("div", "parts");
    ui.pbar = {}; ui.pn = {};
    PARTS.forEach(function (p) {
      var c = el("div", "part");
      var mini = el("div", "mini"), bar = el("i");
      mini.append(bar);
      var n = el("div", "pc");
      ui.pbar[p.k] = bar; ui.pn[p.k] = n;
      c.append(el("span", "pk", "PART " + p.k), el("span", "pn", p.name), mini, n);
      pg.append(c);
    });
    pt.append(pg);
    if (PARTS.length) body.append(pt);

    // 백업
    var bk = card("기록 백업", "이 기기에만 저장돼요");
    bk.append(el("p", "note", "폰과 PC 기록은 따로 저장돼요. 기기를 바꾸거나 브라우저 기록을 지우기 전에 내보내기로 백업해 두세요."));
    var br = el("div", "btnrow");
    br.style.marginTop = "12px";
    var bExp = btn("btn small primary", "파일로 내보내기");
    var bCopy = btn("btn small", "복사");
    var bImp = btn("btn small", "가져오기");
    var bRst = btn("btn small danger", "기록 지우기");
    var file = document.createElement("input");
    file.type = "file"; file.accept = "application/json,.json"; file.hidden = true;
    br.append(bExp, bCopy, bImp, bRst, file);
    ui.msg = el("div", "msg");
    ui.msg.setAttribute("aria-live", "polite");
    ui.msgBtns = el("div", "btnrow");
    ui.msgBtns.style.marginTop = "8px";
    bk.append(br, ui.msg, ui.msgBtns);
    body.append(bk);
    bExp.addEventListener("click", exportFile);
    bCopy.addEventListener("click", copyJson);
    bImp.addEventListener("click", function () { file.value = ""; file.click(); });
    file.addEventListener("change", function () { if (file.files && file.files[0]) readImport(file.files[0]); });
    bRst.addEventListener("click", askReset);

    $screen.textContent = "";
    head.forEach(function (n) { $screen.append(n); });
    $screen.append(body);
    updateTotal();
  }

  function updateTotal() {
    var t = totals();
    var st = updateHeader(t);
    if (!ui.hold) ui.bubble.textContent = STAGES[st].line;

    timeNum(ui.tm, t.act);
    ui.tmSub.textContent = "계획 " + fmtMin(t.plan);
    bigNum(ui.stDone, t.done, "/" + t.total);
    ui.stDoneSub.textContent = "남은 계획 " + (t.total - t.done) + "개";
    if (t.planNow > 0) {
      bigNum(ui.stPace, Math.round((t.actNow / t.planNow) * 100), "%");
      ui.stPaceSub.textContent = "오늘까지 기준";
    } else {
      ui.stPace.textContent = "-";
      ui.stPaceSub.textContent = "시작 전";
    }

    ui.dex.forEach(function (d, i) {
      var open = i <= st;
      d.tile.className = "dex-tile" + (open ? "" : " locked") + (i === st ? " cur" : "");
      d.name.textContent = open ? STAGES[i].name : "???";
      var old = d.tile.querySelector(".now");
      if (old) old.remove();
      if (i === st) d.tile.append(el("span", "now", "지금!"));
    });

    var anyEdited = false;
    DAYS.forEach(function (iso) {
      var s = dayStat(iso);
      var status = dayStatus(s);
      var future = iso > TODAY.iso;
      var edited = isEdited(iso);
      if (edited) anyEdited = true;

      var c = ui.cells[iso];
      var cls = "cell";
      if (iso === EXAM_ISO) cls += " exam";
      else if (future) cls += status === "rest" ? " rest" : "";
      else cls += " " + status;
      if (iso === TODAY.iso) cls += " today";
      c.cell.className = cls;
      var vtxt;
      if (iso === EXAM_ISO) vtxt = "시험";
      else if (future) vtxt = s.plan ? fmtH(s.plan) : (s.act ? fmtH(s.act) : "휴식");
      else vtxt = s.act ? fmtH(s.act) : (status === "rest" ? "휴식" : "0");
      c.v.textContent = vtxt;
      var dot = c.cell.querySelector(".edited");
      if (edited && !dot) c.cell.append(el("i", "edited"));
      if (!edited && dot) dot.remove();
      c.cell.setAttribute("aria-label", mdLabel(iso) + " 계획 " + fmtMin(s.plan) + " 실제 " + fmtMin(s.act));

      var r = ui.rows[iso];
      var items = itemsOf(iso);
      r.row.className = "lrow " + status + (iso === TODAY.iso ? " today" : "");
      r.mid.textContent = "";
      if (edited) r.mid.append(el("span", "ed", "수정"));
      r.mid.append(document.createTextNode(items[0] ? items[0].title : "쉬는 날"));
      if (items.length > 1) r.mid.append(el("small", null, " 외 " + (items.length - 1) + "개"));
      r.txt.textContent = s.plan || s.act ? s.act + "/" + s.plan + "분" : "휴식";
    });
    ui.resetAll.hidden = !anyEdited;

    PARTS.forEach(function (p) {
      var tt = t.partTotal[p.k] || 0, dn = t.partDone[p.k] || 0;
      ui.pbar[p.k].style.width = (tt ? Math.round((dn / tt) * 100) : 0) + "%";
      ui.pn[p.k].textContent = dn + " / " + tt + " 블록";
    });
  }

  function openDay(iso) {
    sel = iso;
    if (location.hash === "#today") render(); else location.hash = "#today";
  }

  /* ---------- backup ---------- */
  function backupJson() {
    return JSON.stringify({ app: "itp-checklist", version: 2, exportedAt: new Date().toISOString(), state: state }, null, 1);
  }
  function msg(text, ok) {
    ui.msg.textContent = text;
    ui.msg.style.color = ok === false ? "var(--danger)" : "var(--ink)";
    ui.msgBtns.textContent = "";
  }
  function exportFile() {
    try {
      var blob = new Blob([backupJson()], { type: "application/json" });
      var a = document.createElement("a");
      var d = new Date();
      a.href = URL.createObjectURL(blob);
      a.download = "itp-progress-" + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + ".json";
      document.body.append(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      msg("백업 파일을 저장했어요. 저장이 안 되면 '복사'를 써 보세요.");
    } catch (e) {
      msg("파일 저장에 실패했어요. '복사'를 써 보세요.", false);
    }
  }
  function copyJson() {
    var text = backupJson();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { msg("백업 내용을 복사했어요. 메모 앱에 붙여 넣어 보관하세요."); },
        function () { msg("복사가 막혀 있어요. '파일로 내보내기'를 써 주세요.", false); }
      );
    } else {
      msg("이 브라우저에서는 복사를 쓸 수 없어요. '파일로 내보내기'를 써 주세요.", false);
    }
  }
  function readImport(f) {
    var rd = new FileReader();
    rd.onload = function () {
      var data;
      try { data = JSON.parse(String(rd.result)); } catch (e) { msg("JSON 파일이 아니에요.", false); return; }
      var next = normalize(data && data.state && typeof data.state === "object" ? data.state : data);
      var nd = Object.keys(next.done).length, na = Object.keys(next.act).length, nx = Object.keys(next.extra).length;
      if (!nd && !na && !nx && !Object.keys(next.memo).length && !Object.keys(next.plan).length) { msg("가져올 기록이 없는 파일이에요.", false); return; }
      msg("완료 " + nd + "개, 실제 시간 " + na + "개, 추가 기록 " + nx + "일치가 들어 있어요. 지금 기록을 이 내용으로 바꿀까요?");
      var ok = btn("btn small primary", "바꾸기");
      var no = btn("btn small", "취소");
      ok.addEventListener("click", function () { state = next; save(); render(); });
      no.addEventListener("click", function () { msg("취소했어요."); });
      ui.msgBtns.append(ok, no);
    };
    rd.onerror = function () { msg("파일을 읽지 못했어요.", false); };
    rd.readAsText(f);
  }
  function askReset() {
    msg("체크, 실제 시간, 추가 기록, 메모, 고친 계획을 모두 지워요. 되돌릴 수 없어요.", false);
    var ok = btn("btn small danger", "모두 지우기");
    var no = btn("btn small", "취소");
    ok.addEventListener("click", function () { state = emptyState(); save(); render(); });
    no.addEventListener("click", function () { msg("취소했어요."); });
    ui.msgBtns.append(ok, no);
  }

  /* ---------- routing ---------- */
  /* ---------- 사용자 · 시험 화면 ---------- */
  var keyHandler = null;
  function setKeys(fn) {
    if (keyHandler) document.removeEventListener("keydown", keyHandler);
    keyHandler = fn;
    if (fn) document.addEventListener("keydown", fn);
  }
  function sessionUser() { try { return sessionStorage.getItem(SESSION_KEY); } catch (e) { return null; } }
  function setSession(id) {
    try { if (id) sessionStorage.setItem(SESSION_KEY, id); else sessionStorage.removeItem(SESSION_KEY); } catch (e) {}
  }
  function go(h) { if (location.hash === "#" + h) render(); else location.hash = "#" + h; }
  function hasOldData() {
    var o = loadOld();
    return !!(o && typeof o === "object" && (Object.keys(obj(o.done)).length || Object.keys(obj(o.act)).length || Object.keys(obj(o.extra)).length || Object.keys(obj(o.memo)).length || Object.keys(obj(o.plan)).length));
  }
  // 시험별 공부 총량(분)과 캐릭터 단계: 시험을 열지 않고 목록에서 보여줄 때 쓴다
  function examAct(ex) {
    var st = obj(ex.state), t = 0;
    Object.keys(obj(st.act)).forEach(function (k) { if (typeof st.act[k] === "number") t += st.act[k]; });
    Object.keys(obj(st.extra)).forEach(function (k) {
      (Array.isArray(st.extra[k]) ? st.extra[k] : []).forEach(function (x) { t += Number(x.min) || 0; });
    });
    return t;
  }
  function examStage(ex) {
    var goal = ex.goalMin || 2820, a = examAct(ex), s = 0;
    STAGE_FRAC.forEach(function (f, i) { if (a >= Math.round((goal * f) / 10) * 10) s = i; });
    return s;
  }
  function avatar(kind, st, cls, equip) {
    var a = el("span", "avatar" + (cls ? " " + cls : ""));
    a.innerHTML = dressSVG(kind, st == null ? 3 : st, equip);
    return a;
  }
  function screenHead(title, sub, backTo) {
    var h = el("header", "screen-h");
    if (backTo) {
      var b = btn("nav-btn", null, "뒤로");
      b.innerHTML = IC.back;
      b.addEventListener("click", function () { go(backTo); });
      h.append(b);
    }
    var t = el("div", "sh-txt");
    t.append(el("h1", null, title));
    if (sub) t.append(el("p", null, sub));
    h.append(t);
    return h;
  }

  function usersScreen() {
    $screen.textContent = "";
    $screen.append(screenHead("누가 공부하나요?", "이름을 누르고 비밀번호 4자리를 입력해요"));
    var grid = el("section", "user-grid");
    store.users.forEach(function (u) {
      var c = btn("ucard");
      var ex = examsOf(u);
      var best = ex.reduce(function (m, e) { return Math.max(m, examStage(e)); }, 0);
      c.append(avatar(u.char, Math.max(best, 2), "lg", u.equip), el("b", null, u.name), el("small", null, ex.length ? ex.map(function (e) { return e.name; }).join(" · ") : "시험 없음"));
      c.addEventListener("click", function () { go("lock/" + u.id); });
      grid.append(c);
    });
    var add = btn("ucard add");
    add.innerHTML = '<span class="plus">' + IC.plus + "</span>";
    add.append(el("b", null, "새 사용자"), el("small", null, "이름·시험·캐릭터 정하기"));
    add.addEventListener("click", function () { go("new"); });
    grid.append(add);
    $screen.append(grid, el("p", "note center", "기록은 이 기기에만 저장돼요. 비밀번호는 다른 사람이 실수로 들어오지 않게 막는 잠금이에요."));
  }

  function pinScreen(u) {
    var pin = "";
    $screen.textContent = "";
    var wrap = el("section", "pin-wrap");
    var head = screenHead(u.name + "님", "비밀번호 4자리를 눌러 주세요", "users");
    var dots = el("div", "pin-dots");
    dots.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 4; i++) dots.append(el("i"));
    var msg = el("p", "pin-msg");
    msg.setAttribute("aria-live", "polite");
    var pad4 = el("div", "keypad");
    function paint() { [].forEach.call(dots.children, function (d, k) { d.classList.toggle("on", k < pin.length); }); }
    function press(k) {
      if (k === "del") { pin = pin.slice(0, -1); paint(); return; }
      if (pin.length >= 4) return;
      pin += k; paint(); buzz();
      if (pin.length < 4) return;
      if (hashPin(u.id, pin) === u.pin) {
        setSession(u.id);
        setKeys(null);
        var ex = examsOf(u);
        go(!ex.length ? "add-exam" : ex.length > 1 ? "exams" : "today");
      } else {
        msg.textContent = "비밀번호가 달라요. 다시 눌러 주세요.";
        wrap.classList.remove("shake"); void wrap.offsetWidth; wrap.classList.add("shake");
        setTimeout(function () { pin = ""; paint(); }, 250);
      }
    }
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"].forEach(function (k) {
      if (!k) { pad4.append(el("span")); return; }
      var b = btn("key", k === "del" ? null : k, k === "del" ? "지우기" : k);
      if (k === "del") b.innerHTML = IC.del;
      b.addEventListener("click", function () { press(k); });
      pad4.append(b);
    });
    setKeys(function (e) {
      if (/^\d$/.test(e.key)) press(e.key);
      else if (e.key === "Backspace") press("del");
    });
    wrap.append(avatar(u.char, 3, "xl", u.equip), dots, msg, pad4);
    $screen.append(head, wrap);
  }

  function examsScreen() {
    var u = USER;
    $screen.textContent = "";
    $screen.append(screenHead(u.name + "님, 어떤 공부 할까요?", "시험을 누르면 그 시험의 계획과 캐릭터로 들어가요"));
    var list = el("section", "exam-list");
    examsOf(u).forEach(function (ex) {
      var row = el("div", "exam-card");
      var main = btn("exam-main");
      var info = el("span", "exam-info");
      info.append(el("b", null, ex.name), el("small", null, examDateLabel(ex.date) + " · 공부 " + fmtMin(examAct(ex))));
      main.append(avatar(u.char, examStage(ex), null, u.equip), info, el("span", "dd-pill", ddOf(ex)));
      main.addEventListener("click", function () { openExam(ex); go("today"); });
      var del = btn("link small-del", "삭제", ex.name + " 삭제");
      del.addEventListener("click", function () {
        if (del.dataset.arm !== "1") { del.dataset.arm = "1"; del.textContent = "기록까지 지워요. 한 번 더"; return; }
        u.exams = u.exams.filter(function (id) { return id !== ex.id; });
        delete store.exams[ex.id];
        if (EXAM && EXAM.id === ex.id) EXAM = null;
        save(); render();
      });
      row.append(main, del);
      list.append(row);
    });
    var add = btn("btn primary block add-btn");
    add.innerHTML = IC.plus;
    add.append(document.createTextNode(" 시험 추가하기"));
    add.addEventListener("click", function () { go("add-exam"); });
    list.append(add);
    $screen.append(list);

    var more = card("내 설정");
    var row2 = el("div", "btnrow");
    var ch = btn("btn small", "캐릭터 바꾸기");
    ch.addEventListener("click", function () {
      openSheet("캐릭터 바꾸기", function (sh) {
        sh.body.append(charPicker(u.char, function (k) { u.char = k; EXAM = null; save(); sh.close(); render(); }));
      });
    });
    var sw = btn("btn small", "사용자 바꾸기");
    sw.addEventListener("click", function () { setSession(null); EXAM = null; go("users"); });
    var rm = btn("btn small danger", "이 사용자 삭제");
    rm.addEventListener("click", function () {
      if (rm.dataset.arm !== "1") { rm.dataset.arm = "1"; rm.textContent = "모든 시험 기록이 지워져요. 한 번 더"; return; }
      examsOf(u).forEach(function (ex) { delete store.exams[ex.id]; });
      store.users = store.users.filter(function (x) { return x.id !== u.id; });
      EXAM = null; setSession(null); save(); go("users");
    });
    row2.append(ch, sw, rm);
    more.append(row2);
    $screen.append(more);
  }

  function charPicker(cur, onPick) {
    var g = el("div", "char-pick");
    g.setAttribute("role", "radiogroup");
    CHAR_ORDER.forEach(function (k) {
      var b = btn("char-opt");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(k === cur));
      b.append(avatar(k, 3, "lg"), el("b", null, CHARS[k].name), el("small", null, CHARS[k].stages[5] + "까지 성장"));
      b.addEventListener("click", function () {
        [].forEach.call(g.children, function (x) { x.setAttribute("aria-checked", String(x === b)); });
        onPick(k);
      });
      g.append(b);
    });
    return g;
  }
  function optCards(opts, cur, onPick) {
    var g = el("div", "opt-list");
    g.setAttribute("role", "radiogroup");
    opts.forEach(function (o) {
      var b = btn("opt-card");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", String(o.value === cur));
      b.append(el("b", null, o.label));
      if (o.desc) b.append(el("small", null, o.desc));
      b.addEventListener("click", function () {
        [].forEach.call(g.children, function (x) { x.setAttribute("aria-checked", String(x === b)); });
        onPick(o.value);
      });
      g.append(b);
    });
    return g;
  }
  function dateInput(val) {
    var i = document.createElement("input");
    i.type = "date"; i.value = val || "";
    return i;
  }

  function aiPrompt(d) {
    var tags = TAG_SETS[d.kind] || TAG_SETS.custom;
    var last = isoAdd(d.date, -1);
    return "나는 " + d.examName + " 시험을 " + d.date + "(" + wdOf(d.date) + ")에 봐. " + d.start + "부터 공부를 시작해.\n" +
      "평일에는 하루 " + d.wk + "분, 주말에는 하루 " + d.we + "분 공부할 수 있어.\n" +
      "(여기에 교재 목차나 공부 범위를 붙여 넣으면 더 정확해져요)\n\n" +
      d.start + "부터 " + last + "까지 날짜별 공부 계획을 짜 줘.\n" +
      "- 하루 계획 시간(min)의 합이 그날 공부 가능 시간을 넘지 않게\n" +
      "- 시험 1~2주 전부터는 모의고사와 오답 복습 위주로\n" +
      "- 시험 전날은 가볍게 정리만\n\n" +
      "결과는 설명 없이 아래 형식의 JSON 배열만 출력해 줘.\n" +
      '[{"date":"YYYY-MM-DD","items":[{"slot":"퇴근 후","min":60,"tag":"t","title":"할 일","detail":"한 줄 설명"}]}]\n' +
      "tag는 다음 중 하나: " + TAG_ORDER.map(function (k) { return k + "=" + tags[k]; }).join(", ");
  }
  // AI 답변(JSON)을 시작일~시험일 날짜표에 채운다. 범위 밖 날짜는 버린다.
  function parseAiPlan(text, d) {
    var a = text.indexOf("["), b = text.lastIndexOf("]");
    if (a < 0 || b <= a) throw new Error("JSON 배열([ ... ])을 찾지 못했어요.");
    var arr = JSON.parse(text.slice(a, b + 1));
    if (!Array.isArray(arr)) throw new Error("배열 형식이 아니에요.");
    var tags = TAG_SETS[d.kind] || TAG_SETS.custom;
    var days = skeletonDays(d.start, d.date, 0, 0, false), byIso = {}, n = 0, skipped = 0;
    days.forEach(function (x) { byIso[x.iso] = x; });
    arr.forEach(function (x) {
      var iso = x && (x.date || x.iso);
      if (typeof iso !== "string" || !byIso[iso] || !Array.isArray(x.items)) { skipped++; return; }
      x.items.forEach(function (it) {
        if (!it || typeof it !== "object") return;
        var min = Number(it.min);
        byIso[iso].items.push({
          slot: typeof it.slot === "string" ? it.slot.slice(0, 30) : "",
          min: isFinite(min) ? clamp(Math.round(min), 0, 600) : 0,
          tag: tags[it.tag] ? it.tag : "t", parts: [], pages: "",
          title: typeof it.title === "string" && it.title.trim() ? it.title.slice(0, 80) : "공부",
          detail: typeof it.detail === "string" ? it.detail.slice(0, 300) : ""
        });
        n++;
      });
    });
    if (!n) throw new Error("시작일~시험일 사이에 들어갈 계획이 없어요.");
    return { days: days, items: n, skipped: skipped };
  }

  function createExam(u, d) {
    var ex = {
      id: newId("e"), kind: d.kind, name: d.examName, date: d.date, start: d.start,
      wk: d.wk, we: d.we, base: d.planMode === "itp" ? "itp" : "none", state: emptyState(), created: realToday()
    };
    if (ex.base !== "itp") {
      ex.days = d.planMode === "ai" ? d.aiDays : skeletonDays(d.start, d.date, d.wk, d.we, true);
      ex.goalMin = Math.max(600, planTotal(ex.days));
    }
    store.exams[ex.id] = ex;
    u.exams = (u.exams || []).concat(ex.id);
    u.lastExam = ex.id;
    return ex;
  }

  function setupScreen(mode) {
    var migrate = mode === "user" && !store.users.length && hasOldData();
    var steps = mode === "exam" ? ["exam", "time", "plan"] : migrate ? ["name", "char"] : ["name", "char", "exam", "time", "plan"];
    var d = {
      name: "", pin: "", pin2: "", char: "chick", kind: "itp", examName: EXAM_KINDS.itp.name,
      date: ITP_DATE, start: realToday(), wk: 60, we: 180, planMode: "itp", aiDays: null, aiText: ""
    };
    var step = 0;

    function draw() {
      $screen.textContent = "";
      var key = steps[step];
      var back = step > 0 ? null : mode === "exam" ? "exams" : store.users.length ? "users" : null;
      var head = screenHead(
        { name: migrate ? "기존 정처기 기록 옮기기" : "반가워요! 누구예요?", char: "함께 공부할 친구를 골라요", exam: "어떤 시험을 준비하나요?", time: "하루에 얼마나 공부할 수 있어요?", plan: "계획은 어떻게 세울까요?" }[key],
        { name: migrate ? "이 기기에 있던 정처기 기록을 쓸 사용자를 만들어요" : "이름과 비밀번호 4자리를 정해요", char: "공부한 시간만큼 알에서 깨어나 자라요", exam: "시험 이름과 날짜를 정해요", time: "이 시간으로 날짜별 계획 칸을 만들어요", plan: "나중에 '계획 수정'으로 언제든 고칠 수 있어요" }[key],
        back
      );
      if (step > 0) head.querySelector(".nav-btn") || head.prepend(prevBtn());
      var dots = el("div", "steps");
      steps.forEach(function (_, i) { dots.append(el("i", i === step ? "on" : i < step ? "done" : "")); });
      var body = el("section", "card wiz");
      var msg = el("p", "note err");
      msg.setAttribute("aria-live", "polite");
      var next = btn("btn primary block add-btn", step === steps.length - 1 ? "시작하기" : "다음");
      var check = STEP[key](body, msg);
      next.addEventListener("click", function () {
        var err = check();
        if (err) { msg.textContent = err; return; }
        if (step < steps.length - 1) { step++; draw(); window.scrollTo(0, 0); return; }
        finish();
      });
      $screen.append(head, dots, body, msg, next);
    }
    function prevBtn() {
      var b = btn("nav-btn", null, "이전 단계");
      b.innerHTML = IC.back;
      b.addEventListener("click", function () { step--; draw(); });
      return b;
    }

    var STEP = {
      name: function (body) {
        var ni = textInput(d.name, "예: 지민");
        ni.maxLength = 12;
        var p1 = pinInput(d.pin), p2 = pinInput(d.pin2);
        body.append(field("이름", ni), field("비밀번호 4자리", p1), field("비밀번호 한 번 더", p2));
        return function () {
          d.name = ni.value.trim(); d.pin = p1.value; d.pin2 = p2.value;
          if (!d.name) return "이름을 적어 주세요.";
          var dup = store.users.some(function (u) { return u.name.toLowerCase() === d.name.toLowerCase(); });
          if (dup) return "'" + d.name + "'은(는) 이미 있는 이름이에요. 다른 이름을 써 주세요.";
          if (!/^\d{4}$/.test(d.pin)) return "비밀번호는 숫자 4자리예요.";
          if (d.pin !== d.pin2) return "비밀번호 두 개가 서로 달라요.";
          return "";
        };
      },
      char: function (body) {
        body.append(charPicker(d.char, function (k) { d.char = k; }));
        return function () { return ""; };
      },
      exam: function (body) {
        var nameF = field("시험 이름", textInput(d.kind === "custom" ? d.examName : "", "예: 컴활 1급 필기"));
        var nameI = nameF.querySelector("input");
        var di = dateInput(d.date), si = dateInput(d.start);
        nameF.hidden = d.kind !== "custom";
        body.append(optCards([
          { label: "정보처리기사 실기", desc: "10/25 시험 · 교재 기반 기본 계획 있음", value: "itp" },
          { label: "AWS SAA-C03", desc: "솔루션스 아키텍트 어소시에이트", value: "aws" },
          { label: "직접 등록", desc: "다른 시험 이름을 적어요", value: "custom" }
        ], d.kind, function (v) {
          if (v !== d.kind) di.value = EXAM_KINDS[v].date;
          d.kind = v;
          nameF.hidden = v !== "custom";
          if (v !== "custom") d.examName = EXAM_KINDS[v].name;
        }), nameF, field("시험 날짜", di), field("공부 시작일", si));
        return function () {
          if (d.kind === "custom") d.examName = nameI.value.trim();
          d.date = di.value; d.start = si.value;
          if (!d.examName) return "시험 이름을 적어 주세요.";
          if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date)) return "시험 날짜를 골라 주세요.";
          if (!/^\d{4}-\d{2}-\d{2}$/.test(d.start)) return "공부 시작일을 골라 주세요.";
          if (d.start > d.date) return "공부 시작일이 시험 날짜보다 늦어요.";
          if (isoDiff(d.start, d.date) > 400) return "계획 기간은 400일까지 만들 수 있어요.";
          if (!(d.kind === "itp" && d.date === ITP_DATE) && d.planMode === "itp") d.planMode = "blank";
          if (d.kind === "itp" && d.date === ITP_DATE) d.planMode = "itp";
          return "";
        };
      },
      time: function (body) {
        var total = el("p", "note");
        function est() {
          var t = 0;
          for (var iso = d.start; iso < d.date; iso = isoAdd(iso, 1)) t += isWeekend(iso) ? d.we : d.wk;
          total.textContent = "시험까지 " + isoDiff(d.start, d.date) + "일, 최대 약 " + fmtMin(t) + " 공부할 수 있어요.";
        }
        body.append(fieldBlock("평일 (월~금)", minutePicker(d.wk, [30, 60, 90, 120, 180], function (v) { d.wk = clamp(Math.round(v) || 0, 0, 900); est(); })));
        body.append(fieldBlock("주말 (토·일)", minutePicker(d.we, [60, 120, 180, 240, 300], function (v) { d.we = clamp(Math.round(v) || 0, 0, 900); est(); })));
        body.append(total);
        est();
        return function () { return d.wk + d.we > 0 ? "" : "평일이나 주말 중 하루는 공부 시간을 정해 주세요."; };
      },
      plan: function (body) {
        var canItp = d.kind === "itp" && d.date === ITP_DATE;
        var opts = [];
        if (canItp) opts.push({ label: "정처기 기본 계획 쓰기", desc: "교재 PART 01~08 기준 9/29~10/25 계획 (약 47시간)", value: "itp" });
        opts.push({ label: "빈 계획표 만들기", desc: "공부 가능 시간만큼 날짜별 칸을 만들고, 내용은 '계획 수정'에서 직접 적어요", value: "blank" });
        opts.push({ label: "AI랑 같이 세우기", desc: "프롬프트를 복사해 ChatGPT·Claude 등에 붙여 넣고, 답변을 다시 붙여 넣어요", value: "ai" });
        var ai = el("div", "ai-box");
        var pr = document.createElement("textarea");
        pr.readOnly = true; pr.className = "prompt";
        pr.value = aiPrompt(d);
        var cp = btn("btn small", "프롬프트 복사");
        var cpMsg = el("span", "note");
        cp.addEventListener("click", function () {
          var done = function () { cpMsg.textContent = " 복사했어요!"; };
          if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(pr.value).then(done, function () { pr.select(); cpMsg.textContent = " 길게 눌러 직접 복사해 주세요."; });
          else { pr.select(); cpMsg.textContent = " 길게 눌러 직접 복사해 주세요."; }
        });
        var ans = document.createElement("textarea");
        ans.placeholder = "AI 답변(JSON)을 여기에 붙여 넣어요";
        ans.value = d.aiText;
        var ld = btn("btn small primary", "불러오기");
        var res = el("p", "note");
        res.setAttribute("aria-live", "polite");
        ld.addEventListener("click", function () {
          d.aiText = ans.value;
          try {
            var r = parseAiPlan(ans.value, d);
            d.aiDays = r.days;
            res.textContent = "계획 " + r.items + "개를 불러왔어요." + (r.skipped ? " (기간 밖 날짜 " + r.skipped + "개는 뺐어요)" : "");
            res.style.color = "var(--mint-ink)";
          } catch (e) {
            d.aiDays = null;
            res.textContent = "불러오지 못했어요: " + e.message;
            res.style.color = "var(--danger)";
          }
        });
        var r1row = el("div", "btnrow"); r1row.append(cp, cpMsg);
        var r2row = el("div", "btnrow"); r2row.append(ld);
        ai.append(fieldBlock("1. 프롬프트 복사", pr), r1row, fieldBlock("2. AI 답변 붙여 넣기", ans), r2row, res);
        ai.hidden = d.planMode !== "ai";
        if (!canItp && d.planMode === "itp") d.planMode = "blank";
        body.append(optCards(opts, d.planMode, function (v) { d.planMode = v; ai.hidden = v !== "ai"; }), ai);
        return function () {
          if (d.planMode === "ai" && !d.aiDays) return "AI 답변을 붙여 넣고 '불러오기'를 눌러 주세요. 아니면 빈 계획표로 시작해도 돼요.";
          return "";
        };
      }
    };

    function finish() {
      var u = USER;
      if (mode !== "exam") {
        u = { id: newId("u"), name: d.name, char: d.char, exams: [], created: realToday() };
        u.pin = hashPin(u.id, d.pin);
        store.users.push(u);
        if (migrate) {
          var ex = { id: newId("e"), kind: "itp", name: EXAM_KINDS.itp.name, date: ITP_DATE, start: PLAN.days[0].iso, base: "itp", state: loadOld(), created: realToday() };
          store.exams[ex.id] = ex;
          u.exams = [ex.id]; u.lastExam = ex.id;
        }
      }
      if (!migrate) createExam(u, d);
      USER = u;
      EXAM = null;
      setSession(u.id);
      save();
      toast("🎉 준비 완료! 오늘부터 같이 공부해요");
      go("today");
    }
    draw();
  }
  function pinInput(v) {
    var i = document.createElement("input");
    i.type = "password"; i.inputMode = "numeric"; i.maxLength = 4; i.autocomplete = "off";
    i.pattern = "[0-9]*"; i.placeholder = "••••"; i.value = v || "";
    i.className = "pin-input";
    i.addEventListener("input", function () { i.value = i.value.replace(/\D/g, "").slice(0, 4); });
    return i;
  }

  /* ---------- routing ---------- */
  function showTabs(on) { $tabs.hidden = !on; }
  function render() {
    closeSheet(true);
    clearTimeout(bubbleTimer);
    setKeys(null);
    ui = {};
    window.scrollTo(0, 0);
    var h = location.hash.replace(/^#/, "");
    USER = userById(sessionUser());
    if (!store.users.length && h !== "new") return go("new");
    showTabs(false);
    if (h === "new") return setupScreen("user");
    if (h.indexOf("lock/") === 0) {
      var lu = userById(h.slice(5));
      return lu ? pinScreen(lu) : go("users");
    }
    if (!USER || h === "users") return h === "users" ? usersScreen() : go("users");
    if (h === "add-exam") return setupScreen("exam");
    if (h === "exams") return examsScreen();
    var list = examsOf(USER);
    if (!list.length) return go("add-exam");
    if (!EXAM || USER.exams.indexOf(EXAM.id) < 0 || store.exams[EXAM.id] !== EXAM || CHAR !== USER.char) {
      openExam(store.exams[USER.lastExam] && USER.exams.indexOf(USER.lastExam) >= 0 ? store.exams[USER.lastExam] : list[0]);
    }
    route = h === "total" ? "total" : "today";
    showTabs(true);
    var tt = document.getElementById("tab-today"), tl = document.getElementById("tab-total");
    if (route === "today") { tt.setAttribute("aria-current", "page"); tl.removeAttribute("aria-current"); }
    else { tl.setAttribute("aria-current", "page"); tt.removeAttribute("aria-current"); }
    if (route === "today") mountToday(); else mountTotal();
    checkItems();
  }

  TODAY = todayInfo();
  loadStore();
  window.addEventListener("hashchange", render);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible" || !EXAM) return;
    var t = todayInfo();
    if (t.iso !== TODAY.iso) { TODAY = t; sel = defaultSel(); render(); }
  });
  render();

  if ("serviceWorker" in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("./sw.js").catch(function () {});
    });
  }
})();
