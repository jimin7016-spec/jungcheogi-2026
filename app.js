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
    { min: 0, name: "잠꾸러기 알", line: "쿨쿨… 공부하면 깨어나요" },
    { min: 120, name: "톡톡 알", line: "안에서 뭔가 꿈틀거려요!" },
    { min: 360, name: "삐약이", line: "드디어 껍질을 깨고 나왔어요" },
    { min: 840, name: "병아리", line: "두 발로 씩씩하게 섰어요" },
    { min: 1560, name: "공부 병아리", line: "안경 쓰고 열공 모드 돌입" },
    { min: 2400, name: "합격 꼬꼬", line: "합격 준비 완료! 시험장으로!" }
  ];
  var CHEERS = [
    "10분만 해도 어제보다 한 발 앞이야!",
    "틀린 문제는 점수로 바뀌는 중이야",
    "60점만 넘기면 돼. 할 수 있어!",
    "SQL은 손으로 써봐야 내 거가 돼",
    "물 한 잔 마시고 다시 가보자",
    "코드 문제는 변수 표 그리기!",
    "오늘 공부하면 나도 쑥쑥 커!",
    "피곤하면 짧게라도, 끊기지만 않으면 돼"
  ];

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
      toast("🎉 " + STAGES[st].name + "로 성장했어요!");
      hop();
    } else if (st < state.lv) {
      state.lv = st; save();
    }
  }

  /* ---------- character ---------- */
  function chickSVG(st) {
    var s = '<svg viewBox="0 0 120 120" aria-hidden="true">';
    s += '<ellipse cx="60" cy="111" rx="30" ry="5" fill="rgba(120,80,20,.14)"/>';
    var cheek = function (y) {
      return '<ellipse cx="44" cy="' + y + '" rx="5.5" ry="3.2" fill="#FFA9A9" opacity=".75"/><ellipse cx="76" cy="' + y + '" rx="5.5" ry="3.2" fill="#FFA9A9" opacity=".75"/>';
    };
    var eyes = function (y) {
      return '<circle cx="50" cy="' + y + '" r="4.2" fill="#3B2F2A"/><circle cx="70" cy="' + y + '" r="4.2" fill="#3B2F2A"/>' +
        '<circle cx="51.4" cy="' + (y - 1.5) + '" r="1.4" fill="#fff"/><circle cx="71.4" cy="' + (y - 1.5) + '" r="1.4" fill="#fff"/>';
    };
    var beak = function (y) { return '<path d="M55 ' + y + 'l5 5.5 5-5.5q-5-2.5-10 0z" fill="#FF9B3D"/>'; };
    if (st <= 1) {
      s += '<path d="M60 20c19 0 33 29 33 52s-14 37-33 37-33-14-33-37 14-52 33-52z" fill="#FFFDF6" stroke="#EAD8B0" stroke-width="2.5"/>';
      s += '<ellipse cx="44" cy="46" rx="5" ry="4" fill="#F7E8C4"/><ellipse cx="76" cy="92" rx="6.5" ry="4" fill="#F7E8C4"/><ellipse cx="79" cy="46" rx="3" ry="2.5" fill="#F7E8C4"/>';
      s += cheek(83);
      if (st === 0) {
        s += '<path d="M45 74q5 4.5 10 0M65 74q5 4.5 10 0" stroke="#3B2F2A" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
        s += '<text x="86" y="30" font-size="13" fill="#B9A67E" font-family="sans-serif" font-weight="700">z</text><text x="95" y="20" font-size="9" fill="#CDBD98" font-family="sans-serif" font-weight="700">z</text>';
      } else {
        s += eyes(74) + '<ellipse cx="60" cy="84" rx="3" ry="2.4" fill="#3B2F2A"/>';
        s += '<path d="M31 60l8 5 6-6 7 7 6-6 7 6 6-5 8 4" stroke="#C7AF80" stroke-width="2.2" fill="none" stroke-linejoin="round" stroke-linecap="round"/>';
        s += '<path d="M20 50l-6-3M22 42l-5-6M100 50l6-3M98 42l5-6" stroke="#E7C66A" stroke-width="2.4" stroke-linecap="round"/>';
      }
    } else if (st === 2) {
      s += '<path d="M52 36q2-10 7-3q3-8 7 1" fill="none" stroke="#F5BE24" stroke-width="3.2" stroke-linecap="round"/>';
      s += '<circle cx="60" cy="62" r="27" fill="#FFD54A"/>';
      s += eyes(58) + beak(64) + cheek(67);
      s += '<path d="M27 76l8-8 8 8 8-8 9 8 9-8 8 8 8-8 8 8c1 20-13 33-33 33s-34-13-33-33z" fill="#FFFDF6" stroke="#EAD8B0" stroke-width="2.5" stroke-linejoin="round"/>';
      s += '<ellipse cx="44" cy="94" rx="5" ry="3.5" fill="#F7E8C4"/><ellipse cx="78" cy="90" rx="4" ry="3" fill="#F7E8C4"/>';
    } else {
      var faceY = 63;
      if (st === 5) {
        s += '<path d="M60 16l32 11-32 11-32-11z" fill="#3E4360"/><path d="M45 31v9q15 6 30 0v-9" fill="#2D3148"/>';
        s += '<path d="M92 27v15" stroke="#FFC23A" stroke-width="2.4" stroke-linecap="round"/><circle cx="92" cy="44" r="3.4" fill="#FFC23A"/>';
      } else {
        s += '<path d="M53 42q2-11 7-3q3-9 7 1" fill="none" stroke="#F5BE24" stroke-width="3.2" stroke-linecap="round"/>';
      }
      s += '<path d="M48 101v7m-5 0h10M72 101v7m-5 0h10" stroke="#FF9B3D" stroke-width="3.2" stroke-linecap="round"/>';
      s += '<ellipse cx="27" cy="77" rx="7.5" ry="12" fill="#F7C531" transform="rotate(22 27 77)"/><ellipse cx="93" cy="77" rx="7.5" ry="12" fill="#F7C531" transform="rotate(-22 93 77)"/>';
      s += '<ellipse cx="60" cy="72" rx="34" ry="32" fill="#FFD54A"/><ellipse cx="60" cy="84" rx="21" ry="16" fill="#FFE58C"/>';
      s += eyes(faceY) + beak(faceY + 6) + cheek(faceY + 9);
      if (st === 4) {
        s += '<circle cx="50" cy="' + faceY + '" r="8.5" fill="rgba(255,255,255,.25)" stroke="#5B4636" stroke-width="2.4"/><circle cx="70" cy="' + faceY + '" r="8.5" fill="rgba(255,255,255,.25)" stroke="#5B4636" stroke-width="2.4"/><path d="M58.5 ' + faceY + 'h3" stroke="#5B4636" stroke-width="2.4"/>';
        s += '<path d="M38 86l22 6 22-6v17l-22 6-22-6z" fill="#7CC0F0" stroke="#3E86BF" stroke-width="2" stroke-linejoin="round"/><path d="M60 92v17" stroke="#3E86BF" stroke-width="2"/><path d="M44 92l11 3M44 97l11 3M65 95l11-3M65 100l11-3" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>';
      }
      if (st === 5) {
        s += '<g transform="rotate(-18 86 90)"><rect x="70" y="84" width="30" height="11" rx="5" fill="#FFF8E4" stroke="#E0C98E" stroke-width="2"/><path d="M84 84v11" stroke="#E0564B" stroke-width="3"/></g>';
        s += '<path d="M16 40l2.5 5 5 2.5-5 2.5-2.5 5-2.5-5-5-2.5 5-2.5zM104 58l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#FFC23A"/>';
      }
    }
    return s + "</svg>";
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
    bubbleTimer = setTimeout(function () { ui.hold = false; if (route === "today") updateToday(); }, ms || 3500);
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
      say(after > before ? "+" + fmtMin(after - before) + " 냠냠! 쑥쑥 크는 중" : "완료! 잘했어");
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
  var CLOUDS = '<svg class="cloud" style="left:6%;top:58px;width:78px" viewBox="0 0 80 36" aria-hidden="true"><path d="M16 34a14 14 0 0 1 2-28 18 18 0 0 1 33 2 12 12 0 0 1 13 26z"/></svg>' +
    '<svg class="cloud" style="right:4%;top:110px;width:64px;opacity:.75" viewBox="0 0 80 36" aria-hidden="true"><path d="M16 34a14 14 0 0 1 2-28 18 18 0 0 1 33 2 12 12 0 0 1 13 26z"/></svg>' +
    '<svg class="cloud" style="right:26%;top:40px;width:40px;opacity:.6" viewBox="0 0 80 36" aria-hidden="true"><path d="M16 34a14 14 0 0 1 2-28 18 18 0 0 1 33 2 12 12 0 0 1 13 26z"/></svg>';

  function mountToday() {
    var scene = el("header", "scene");
    scene.innerHTML = CLOUDS;
    var top = el("div", "scene-top");
    ui.ddChip = el("span", "chip dd-chip");
    ui.lvChip = el("span", "chip");
    top.append(ui.ddChip, ui.lvChip);
    var stage = el("div", "stage");
    ui.bubble = el("div", "bubble");
    ui.bubble.setAttribute("aria-live", "polite");
    ui.char = btn("char", null, "병아리에게 응원 듣기");
    ui.char.addEventListener("click", function () {
      hop();
      say(CHEERS[cheerIdx++ % CHEERS.length]);
    });
    stage.append(ui.bubble, ui.char);
    var exp = el("div", "exp");
    var tr = el("div", "exp-track");
    ui.expFill = el("i");
    tr.append(ui.expFill);
    ui.expTxt = el("small");
    exp.append(tr, ui.expTxt);
    scene.append(top, stage, exp, el("div", "ground"));

    var sheet = el("section", "sheet");
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
    sheet.append(nav, ui.back, ui.body);

    $screen.textContent = "";
    $screen.append(scene, sheet);
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
    var st = stageOf(t.act);
    ui.ddChip.textContent = ddText();
    ui.lvChip.textContent = "Lv." + (st + 1) + " " + STAGES[st].name;
    setChar(ui.char, st);
    expUpdate(ui.expFill, ui.expTxt, t.act, st);

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
  function statBox(label, key) {
    var w = el("div", "stat");
    var dd = el("dd"), sm = el("small");
    ui[key] = dd; ui[key + "Sub"] = sm;
    w.append(el("dt", null, label), dd, sm);
    return w;
  }

  function mountTotal() {
    ui.cells = {}; ui.rows = {}; ui.dex = [];
    var hero = el("header", "hero2");
    var top = el("div", "h2-top");
    var left = el("div");
    left.append(el("div", "eyebrow", "정보처리기사 실기까지"));
    ui.ddn = el("div", "dday");
    left.append(ui.ddn, el("div", "exam-date", "2026년 10월 25일 (일)"));
    top.append(left);

    var grow = el("div", "grow");
    ui.char = btn("char", null, "병아리에게 응원 듣기");
    ui.char.addEventListener("click", function () { hop(); toast(CHEERS[cheerIdx++ % CHEERS.length]); });
    var gi = el("div");
    ui.lv = el("div", "lv");
    ui.stName = el("h2");
    ui.stLine = el("p");
    var exp = el("div", "exp");
    var tr = el("div", "exp-track");
    ui.expFill = el("i");
    tr.append(ui.expFill);
    ui.expTxt = el("small");
    exp.append(tr, ui.expTxt);
    gi.append(ui.lv, ui.stName, ui.stLine, exp);
    grow.append(ui.char, gi);

    var stats = el("dl", "stats");
    stats.append(statBox("총 공부", "stAct"), statBox("완료", "stDone"), statBox("계획 대비", "stPace"));
    hero.append(top, grow, stats);

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
    $screen.append(hero, body);
    updateTotal();
  }

  function updateTotal() {
    var t = totals();
    var st = stageOf(t.act);
    ui.ddn.textContent = ddText();
    setChar(ui.char, st);
    ui.lv.textContent = "Lv." + (st + 1);
    ui.stName.textContent = STAGES[st].name;
    ui.stLine.textContent = STAGES[st].line;
    expUpdate(ui.expFill, ui.expTxt, t.act, st);

    ui.stAct.textContent = fmtH(t.act);
    ui.stActSub.textContent = "계획 " + fmtH(t.plan);
    ui.stDone.textContent = t.done + "/" + t.total;
    ui.stDoneSub.textContent = "남은 " + (t.total - t.done) + "개";
    if (t.planNow > 0) {
      ui.stPace.textContent = Math.round((t.actNow / t.planNow) * 100) + "%";
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
