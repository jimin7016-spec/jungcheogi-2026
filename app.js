(function () {
  "use strict";

  var TAGS = { t: "이론", s: "SQL", m: "계산식", c: "코드", r: "복습·기출" };
  var TAG_ORDER = ["t", "s", "m", "c", "r"];
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  var EXAM_ISO = "2026-10-25";
  var EXAM_UTC = Date.UTC(2026, 9, 25);
  var LS_KEY = "itp-app-v1";

  // 실제 공부시간(분)이 쌓일수록 자라는 캐릭터 단계. 전체 계획이 약 47시간이라 40시간에 마지막 단계.
  var STAGES = [
    { min: 0, name: "말랑 알", line: "쿨쿨… 공부하면 깨어나요" },
    { min: 120, name: "금 간 알", line: "톡톡! 안에서 꿈틀거려요" },
    { min: 360, name: "갓 부화 삐약이", line: "껍질 모자 쓰고 세상 구경 중" },
    { min: 840, name: "아기 병아리", line: "두 발로 씩씩하게 섰어요" },
    { min: 1560, name: "중병아리", line: "연필 들고 열공 모드 돌입" },
    { min: 2400, name: "늠름한 합격 닭", line: "머리띠 질끈! 시험장 갈 준비 완료" }
  ];
  var CHEERS = [
    "오늘도 삐약! 10분만 해도 한 발 앞이야",
    "틀린 문제는 점수로 바뀌는 중이야 삐약",
    "60점만 넘기면 돼. 할 수 있어!",
    "SQL은 손으로 써봐야 내 거가 돼",
    "물 한 잔 마시고 다시 가보자 삐약",
    "코드 문제는 변수 표 그리기!",
    "네가 공부하면 나도 쑥쑥 커!",
    "짧게라도 좋아, 끊기지만 않으면 돼"
  ];
  var DONE_CHEERS = ["오늘도 삐약!", "잘했어 삐약!", "한 칸 클리어!", "쑥쑥 크는 중!", "최고야 삐약!"];

  var $screen = document.getElementById("screen");
  var $sheetRoot = document.getElementById("sheet-root");
  var $toast = document.getElementById("toast");
  var state = emptyState();
  var dayBy = {}, phaseBy = {}, DAYS = [];
  var ui = {};
  var route = "today";
  var TODAY, sel;
  var cheerIdx = 0, bubbleTimer = 0, toastTimer = 0, sheetClose = null;

  PLAN.phases.forEach(function (p) { phaseBy[p.key] = p; });
  PLAN.days.forEach(function (d) {
    dayBy[d.iso] = d;
    DAYS.push(d.iso);
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
    plus: svgIcon('<path d="M12 5v14M5 12h14"/>', 2.8)
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
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (o) state = normalize(o);
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
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
    if (!node || node.dataset.st === String(st)) return;
    node.dataset.st = String(st);
    node.innerHTML = chickSVG(st);
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
  var ICON_BRAND = '<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M18 9q1-6 3.5-2q2-5 4 1" fill="none" stroke="#F5C020" stroke-width="2.4" stroke-linecap="round"/><circle cx="20" cy="22" r="14" fill="#FFD23F"/><circle cx="15.5" cy="20" r="2" fill="#4A3B32"/><circle cx="24.5" cy="20" r="2" fill="#4A3B32"/><path d="M17 24.5q3-2 6 0q-3 3.5-6 0z" fill="#FF9F45"/><ellipse cx="11" cy="25" rx="2.6" ry="1.6" fill="#FFA99A"/><ellipse cx="29" cy="25" rx="2.6" ry="1.6" fill="#FFA99A"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="6" fill="#7ED9A6"/><path d="M7.5 12.5l3 3 6-6.5" stroke="#1F6B45" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_PACE = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="6" fill="#FFD23F"/><path d="M7 16l3.5-4 3 2.5L17 9" stroke="#4A3B32" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var ICON_PENCIL ='<svg viewBox="0 0 80 80" aria-hidden="true"><g transform="rotate(-38 40 40)"><rect x="30" y="4" width="20" height="54" rx="4" fill="#FFF3C9"/><rect x="30" y="4" width="20" height="10" rx="4" fill="#FF9FB0"/><path d="M30 58h20l-10 18z" fill="#FFE0B0"/><path d="M36.5 70h7l-3.5 6z" fill="#4A3B32"/></g></svg>';

  function topbar(title) {
    var t = el("div", "topbar");
    var b = el("div", "brand");
    b.innerHTML = ICON_BRAND;
    b.append(document.createTextNode(title));
    ui.lvChip = el("span", "lv-chip");
    t.append(b, ui.lvChip);
    return t;
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
    dd.append(el("small", null, "정보처리기사 실기까지"), ui.ddn, el("div", "date", "2026. 10. 25 (일)"), deco);
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
    ui.char = btn("char", null, "병아리 쓰다듬고 응원 듣기");
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
    p.append(ui.bubble, ui.char, meta);
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
    ui.lvChip.textContent = "";
    ui.lvChip.append(el("b", null, "Lv." + (st + 1)), document.createTextNode(STAGES[st].name));
    setChar(ui.char, st);
    ui.stName.textContent = STAGES[st].name;
    ui.expNum.textContent = st < STAGES.length - 1 ? fmtH(t.act) + " / " + fmtH(STAGES[st + 1].min) : fmtH(t.act);
    expUpdate(ui.expFill, ui.expTxt, t.act, st);
    var sk = streakInfo();
    bigNum(ui.stk, sk.cur, "일");
    ui.stkSub.textContent = sk.today ? "오늘도 삐약! 최고 " + sk.best + "일" : sk.cur ? "오늘 하면 " + (sk.cur + 1) + "일째!" : "오늘부터 시작!";
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
    $screen.append(topbar("삐약 플래너"), bentoTop("오늘 공부"), petCard(false), nav, ui.back, ui.body);
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
      rest.append(el("h2", null, "계획 없는 날이에요"), el("p", null, "쉬어도 좋고, 공부했다면 아래에 기록하면 병아리가 자라요."));
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

    var memo = el("section", "card memo");
    var ta = document.createElement("textarea");
    ta.id = "memo-" + iso;
    var ml = el("label", null, "오늘 틀린 이유 한 줄");
    ml.htmlFor = ta.id;
    ta.placeholder = "예: 3NF 조건 자꾸 잊음, C 포인터 증감 순서 헷갈림";
    ta.value = typeof state.memo[iso] === "string" ? state.memo[iso] : "";
    ta.addEventListener("input", function () {
      if (ta.value) state.memo[iso] = ta.value; else delete state.memo[iso];
      save();
    });
    memo.append(ml, ta);
    ui.body.append(memo);
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
    var head = [topbar("계획·성장"), bentoTop("총 공부"), petCard(true), b4];

    var body = el("div", "body2");

    // 도감
    var dx = card("성장 도감", "공부 시간만큼 자라요");
    var grid = el("div", "dex");
    STAGES.forEach(function (st, i) {
      var t = el("div", "dex-tile");
      var art = el("div");
      art.innerHTML = chickSVG(i);
      var name = el("b");
      t.append(art, name, el("small", null, st.min ? st.min / 60 + "시간" : "시작"));
      grid.append(t);
      ui.dex.push({ tile: t, name: name });
    });
    dx.append(grid);
    body.append(dx);

    // 달력
    var cc = card("공부 달력", "날짜를 누르면 계획을 보고 고칠 수 있어요");
    cc.classList.add("cal-card");
    var lg = el("div", "legend");
    lg.innerHTML = '<span><i class="lg-full"></i>다 했어요</span><span><i class="lg-part"></i>조금 했어요</span><span><i class="lg-none"></i>못 했어요</span><span><i class="lg-future"></i>남은 날</span>';
    var wdh = el("div", "cal-wd");
    ["월", "화", "수", "목", "금", "토", "일"].forEach(function (w) { wdh.append(el("span", null, w)); });
    var cal = el("div", "cal");
    var start = Date.UTC(2026, 8, 28), end = Date.UTC(2026, 10, 1);
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
    PLAN.phases.forEach(function (p, pi) {
      var ph = el("div", "phase");
      var t2 = el("div", "phase-t");
      t2.append(el("span", "num", String(pi + 1)), el("b", null, p.name), el("span", "r", p.range));
      ph.append(t2, el("p", "phase-d", p.desc));
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
    PLAN.parts.forEach(function (p) {
      var c = el("div", "part");
      var mini = el("div", "mini"), bar = el("i");
      mini.append(bar);
      var n = el("div", "pc");
      ui.pbar[p.k] = bar; ui.pn[p.k] = n;
      c.append(el("span", "pk", "PART " + p.k), el("span", "pn", p.name), mini, n);
      pg.append(c);
    });
    pt.append(pg);
    body.append(pt);

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

    PLAN.parts.forEach(function (p) {
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
  function render() {
    closeSheet(true);
    route = location.hash === "#total" ? "total" : "today";
    var tt = document.getElementById("tab-today"), tl = document.getElementById("tab-total");
    if (route === "today") { tt.setAttribute("aria-current", "page"); tl.removeAttribute("aria-current"); }
    else { tl.setAttribute("aria-current", "page"); tt.removeAttribute("aria-current"); }
    clearTimeout(bubbleTimer);
    ui = {};
    if (route === "today") mountToday(); else mountTotal();
    window.scrollTo(0, 0);
  }

  TODAY = todayInfo();
  sel = defaultSel();
  load();
  state.lv = stageOf(totals().act);
  window.addEventListener("hashchange", render);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "visible") return;
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
