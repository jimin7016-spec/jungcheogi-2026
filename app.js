(function () {
  "use strict";

  var TAGS = { t: "이론", s: "SQL", m: "계산식", c: "코드", r: "복습·기출" };
  var TAG_ORDER = ["t", "s", "m", "c", "r"];
  var WDL = { "일": "일요일", "월": "월요일", "화": "화요일", "수": "수요일", "목": "목요일", "금": "금요일", "토": "토요일" };
  var EXAM_UTC = Date.UTC(2026, 9, 25);
  var LS_KEY = "itp-app-v1";
  var SCALE = 200;
  var CIRC = 2 * Math.PI * 42;

  var $screen = document.getElementById("screen");
  var state = { done: {}, act: {}, memo: {} };
  var idx = {}, dayBy = {}, phaseBy = {};
  var ui = {};
  var route = "today";
  var TODAY;
  var sel;

  PLAN.phases.forEach(function (p) { phaseBy[p.key] = p; });
  PLAN.days.forEach(function (d) {
    dayBy[d.iso] = d;
    d.items.forEach(function (it, i) { it.id = d.iso + "-" + i; idx[it.id] = it; });
  });

  /* ---------- helpers ---------- */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function pad(n) { return String(n).padStart(2, "0"); }
  function fmtH(min) { return (min / 60).toFixed(1); }
  function obj(o) { return o && typeof o === "object" && !Array.isArray(o) ? o : {}; }
  function actOf(id) { var v = state.act[id]; return typeof v === "number" ? v : 0; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

  function todayInfo() {
    var o = new URLSearchParams(location.search).get("today");
    var y, m, d;
    if (o && /^\d{4}-\d{2}-\d{2}$/.test(o)) {
      var p = o.split("-").map(Number);
      y = p[0]; m = p[1] - 1; d = p[2];
    } else {
      var n = new Date();
      y = n.getFullYear(); m = n.getMonth(); d = n.getDate();
    }
    return {
      iso: y + "-" + pad(m + 1) + "-" + pad(d),
      diff: Math.round((EXAM_UTC - Date.UTC(y, m, d)) / 864e5)
    };
  }
  function defaultSel() {
    var first = PLAN.days[0].iso, last = PLAN.days[PLAN.days.length - 1].iso;
    if (dayBy[TODAY.iso]) return TODAY.iso;
    return TODAY.iso < first ? first : last;
  }

  /* ---------- state ---------- */
  function load() {
    try {
      var o = JSON.parse(localStorage.getItem(LS_KEY) || "null");
      if (o) { state.done = obj(o.done); state.act = obj(o.act); state.memo = obj(o.memo); }
    } catch (e) {}
  }
  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
  }

  function dayStat(d) {
    var plan = 0, act = 0, done = 0;
    d.items.forEach(function (it) {
      plan += it.min; act += actOf(it.id);
      if (state.done[it.id]) done++;
    });
    return { plan: plan, act: act, done: done, total: d.items.length };
  }
  function dayStatus(d, s) {
    if (!d.items.length) return "rest";
    if (s.done === s.total) return "full";
    if (s.done > 0 || s.act > 0) return "part";
    return "none";
  }
  function totals() {
    var t = { done: 0, total: 0, plan: 0, act: 0, planNow: 0, actNow: 0, partDone: {}, partTotal: {} };
    PLAN.days.forEach(function (d) {
      d.items.forEach(function (it) {
        var dn = !!state.done[it.id];
        t.total++; t.plan += it.min; t.act += actOf(it.id);
        if (dn) t.done++;
        if (d.iso <= TODAY.iso) { t.planNow += it.min; t.actNow += actOf(it.id); }
        (it.parts || []).forEach(function (k) {
          t.partTotal[k] = (t.partTotal[k] || 0) + 1;
          if (dn) t.partDone[k] = (t.partDone[k] || 0) + 1;
        });
      });
    });
    return t;
  }

  function toggle(id) {
    var it = idx[id];
    if (state.done[id]) {
      delete state.done[id];
      if (state.act[id] === it.min) delete state.act[id];
    } else {
      state.done[id] = 1;
      if (it.min > 0 && state.act[id] === undefined) state.act[id] = it.min;
    }
    save();
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
    refresh();
  }
  function setAct(id, n) {
    n = clamp(Math.round(n), 0, 600);
    if (n === 0) delete state.act[id]; else state.act[id] = n;
    save();
    refresh();
  }
  function refresh() { if (route === "today") updateToday(); else updateTotal(); }

  /* ---------- 오늘 계획 ---------- */
  function taskCard(it) {
    var card = el("article", "tcard");
    var main = el("div", "tmain");
    main.tabIndex = 0;
    main.setAttribute("role", "checkbox");
    main.setAttribute("aria-checked", "false");
    main.setAttribute("aria-label", it.slot + " " + it.title);
    var txt = el("span", "ttxt");
    var meta = el("span", "meta");
    meta.append(el("span", "slot", it.slot));
    var tag = el("span", "tag");
    tag.dataset.t = it.tag;
    tag.append(el("i", "dot"), document.createTextNode(TAGS[it.tag]));
    meta.append(tag);
    (it.parts || []).forEach(function (k) { meta.append(el("span", "chip-part", "PART " + k)); });
    if (it.pages) meta.append(el("span", "pg", "교재 " + it.pages));
    txt.append(meta, el("span", "ttl", it.title));
    var bub = el("span", "bub");
    bub.setAttribute("aria-hidden", "true");
    main.append(bub, txt);
    main.addEventListener("click", function () { toggle(it.id); });
    main.addEventListener("keydown", function (e) {
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(it.id); }
    });
    card.append(main);
    if (it.detail) card.append(el("p", "tdet", it.detail));

    var rec = { card: card, main: main, inp: null };
    if (it.min > 0) {
      var foot = el("div", "tfoot");
      var lab = el("label", null, "실제");
      var inp = document.createElement("input");
      inp.type = "number"; inp.id = "act-" + it.id; inp.min = "0"; inp.max = "600"; inp.step = "5";
      inp.setAttribute("inputmode", "numeric");
      inp.placeholder = String(it.min);
      lab.htmlFor = inp.id;
      var minus = el("button", null, "−"); minus.type = "button"; minus.setAttribute("aria-label", "5분 줄이기");
      var plus = el("button", null, "+"); plus.type = "button"; plus.setAttribute("aria-label", "5분 늘리기");
      minus.addEventListener("click", function () { setAct(it.id, actOf(it.id) - 5); });
      plus.addEventListener("click", function () { setAct(it.id, actOf(it.id) + 5); });
      inp.addEventListener("input", function () {
        var raw = inp.value.trim();
        if (raw === "") { delete state.act[it.id]; save(); refresh(); return; }
        var n = Number(raw);
        if (!isFinite(n)) return;
        state.act[it.id] = clamp(Math.round(n), 0, 600);
        save(); refresh();
      });
      var step = el("div", "step");
      step.append(minus, inp, plus, el("span", null, "분"));
      foot.append(lab, step, el("span", "pl", "계획 " + it.min + "분"));
      card.append(foot);
      rec.inp = inp;
    }
    ui.tasks[it.id] = rec;
    return card;
  }

  function fillDayBody() {
    var d = dayBy[sel];
    var iso = sel;
    ui.body.textContent = "";
    ui.tasks = {};
    ui.sumAct = ui.sumPlan = ui.sumDone = ui.barPlan = ui.barAct = null;

    if (!d.items.length) {
      var rest = el("section", "card rest-card");
      rest.append(el("h2", null, "쉬는 날입니다"), el("p", null, "계획 없이 푹 쉬고 다음 날 이어갑니다."));
      ui.body.append(rest);
    } else {
      var sum = el("section", "card");
      var top = el("div", "sum-top");
      function cell(label, key) {
        var w = el("div");
        w.append(el("small", null, label));
        ui[key] = el("b");
        w.append(ui[key]);
        return w;
      }
      top.append(cell("실제", "sumAct"), cell("계획", "sumPlan"), cell("완료", "sumDone"));
      var track = el("div", "track");
      ui.barPlan = el("i", "plan"); ui.barAct = el("i", "act");
      track.append(ui.barPlan, ui.barAct);
      sum.append(top, track);
      ui.body.append(sum);
      d.items.forEach(function (it) { ui.body.append(taskCard(it)); });
    }

    var memo = el("section", "card memo");
    var ml = el("label", null, "오늘 틀린 이유 한 줄");
    var ta = document.createElement("textarea");
    ta.id = "memo-" + iso;
    ml.htmlFor = ta.id;
    ta.placeholder = "예: 정규화 3NF 조건 자꾸 잊음, C 포인터 증감 순서 헷갈림";
    ta.value = typeof state.memo[iso] === "string" ? state.memo[iso] : "";
    ta.addEventListener("input", function () {
      if (ta.value) state.memo[iso] = ta.value; else delete state.memo[iso];
      save();
    });
    memo.append(ml, ta);
    ui.body.append(memo);
  }

  function selectDay(iso) {
    sel = iso;
    fillDayBody();
    updateToday();
    scrollPill();
  }
  function scrollPill() {
    var b = ui.pills && ui.pills[sel], strip = ui.strip;
    if (!b || !strip) return;
    strip.scrollLeft = b.offsetLeft - strip.clientWidth / 2 + b.offsetWidth / 2;
  }

  function mountToday() {
    var hero = el("header", "hero");
    var row = el("div", "hero-row");
    var left = el("div", "hero-left");
    ui.month = el("small");
    ui.title = el("h1");
    ui.sub = el("div", "sub");
    ui.back = el("button", "link-btn", "오늘로 돌아가기");
    ui.back.type = "button";
    ui.back.addEventListener("click", function () { selectDay(defaultSel()); });
    left.append(ui.month, ui.title, ui.sub, ui.back);
    var dd = el("div", "dd");
    ui.ddl = el("small"); ui.ddn = el("b");
    dd.append(ui.ddl, ui.ddn);
    row.append(left, dd);

    var strip = el("div", "strip");
    strip.setAttribute("role", "group");
    strip.setAttribute("aria-label", "날짜 선택");
    ui.strip = strip;
    ui.pills = {};
    PLAN.days.forEach(function (d) {
      var b = el("button", "pill");
      b.type = "button";
      b.setAttribute("aria-label", d.md + " " + d.wd);
      b.append(el("span", "n", d.md.split("/")[1]), el("span", "w", d.wd), el("span", "st"));
      b.addEventListener("click", function () { selectDay(d.iso); });
      strip.append(b);
      ui.pills[d.iso] = b;
    });
    hero.append(row, strip);
    ui.body = el("div", "body");
    $screen.textContent = "";
    $screen.append(hero, ui.body);
    fillDayBody();
    updateToday();
    scrollPill();
  }

  function updateToday() {
    var d = dayBy[sel];
    var p = d.iso.split("-").map(Number);
    ui.month.textContent = p[0] + "년 " + p[1] + "월";
    ui.title.textContent = p[2] + "일 " + WDL[d.wd];
    var bits = [];
    if (d.hol) bits.push(d.hol);
    bits.push(d.dd);
    bits.push(phaseBy[d.phase].name);
    ui.sub.textContent = bits.join(" · ");
    ui.ddl.textContent = TODAY.diff > 0 ? "시험까지" : TODAY.diff === 0 ? "시험 당일" : "시험 종료";
    ui.ddn.textContent = TODAY.diff > 0 ? "D-" + TODAY.diff : TODAY.diff === 0 ? "D-DAY" : "끝";
    ui.back.hidden = sel === defaultSel();

    PLAN.days.forEach(function (day) {
      var b = ui.pills[day.iso];
      b.className = "pill " + dayStatus(day, dayStat(day)) + (day.iso === TODAY.iso ? " today" : "");
      b.setAttribute("aria-pressed", day.iso === sel ? "true" : "false");
    });

    var s = dayStat(d);
    if (ui.sumAct) {
      ui.sumAct.textContent = s.act + "분";
      ui.sumPlan.textContent = s.plan + "분";
      ui.sumDone.textContent = s.done + " / " + s.total;
      var scale = Math.max(s.plan, s.act, 1);
      ui.barPlan.style.width = (s.plan / scale) * 100 + "%";
      ui.barAct.style.width = (s.act / scale) * 100 + "%";
    }
    d.items.forEach(function (it) {
      var r = ui.tasks[it.id];
      if (!r) return;
      var on = !!state.done[it.id];
      r.card.classList.toggle("on", on);
      r.main.setAttribute("aria-checked", on ? "true" : "false");
      if (r.inp && document.activeElement !== r.inp) {
        var v = state.act[it.id];
        r.inp.value = typeof v === "number" ? String(v) : "";
      }
    });
  }

  /* ---------- 누적 ---------- */
  var RING = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-bg" cx="50" cy="50" r="42"></circle><circle class="ring-fg" cx="50" cy="50" r="42" transform="rotate(-90 50 50)"></circle></svg>';
  var GAUGE = '<div class="gauge-pin above" style="left:60%"><b>60점</b><small>합격선</small></div><div class="gauge-track"><div class="gauge-gap"></div></div><div class="gauge-pin below" style="left:45%"><b>45점</b><small>지난 시험</small></div><div class="gauge-scale"><span>0</span><span>100</span></div>';

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
    var dt = el("dt", null, label), dd = el("dd"), sm = el("small");
    ui[key] = dd; ui[key + "Sub"] = sm;
    w.append(dt, dd, sm);
    return w;
  }

  function mountTotal() {
    ui.cols = {}; ui.rows = {}; ui.capIso = null;
    var hero = el("header", "hero");
    hero.append(el("span", "eyebrow", "정보처리기사 실기 · 2026.10.25(일)"));
    var main = el("div", "hero-main");
    var dd = el("div", "dd");
    ui.ddl = el("small"); ui.ddn = el("b");
    dd.append(ui.ddl, ui.ddn);
    var ring = el("div", "ring");
    ring.setAttribute("role", "img");
    ring.setAttribute("aria-label", "전체 진행률");
    ring.innerHTML = RING;
    ui.ringFg = ring.querySelector(".ring-fg");
    var rt = el("div", "ring-txt");
    ui.ringPct = el("b"); rt.append(ui.ringPct, el("small", null, "완료"));
    ring.append(rt);
    main.append(dd, ring);
    var stats = el("dl", "stats");
    stats.append(statBox("완료 항목", "stDone"), statBox("실제 공부시간", "stAct"), statBox("오늘까지 계획 대비", "stPace"));
    hero.append(main, stats);

    ui.body = el("div", "body");

    var goal = card("합격선까지 15점", "실기 100점 만점, 60점 이상 합격");
    goal.classList.add("goal");
    goal.append(el("p", null, "문제당 약 5점이라 3문제 안팎을 더 맞히면 됩니다."));
    var g = el("div", "gauge");
    g.innerHTML = GAUGE;
    goal.append(g);
    ui.body.append(goal);

    var pc = card("교재 PART별 진도", "완료한 블록 / 배정된 블록");
    var pg = el("div", "parts");
    ui.pbar = {}; ui.pn = {};
    PLAN.parts.forEach(function (p) {
      var c = el("div", "part");
      var mini = el("div", "mini"), bar = el("i");
      mini.append(bar);
      var n = el("div", "part-n");
      ui.pbar[p.k] = bar; ui.pn[p.k] = n;
      c.append(el("span", "chip-part", "PART " + p.k), el("div", "part-name", p.name), el("div", "part-pg", p.pages), mini, n);
      pg.append(c);
    });
    pc.append(pg);
    ui.body.append(pc);

    var ch = card("일별 공부시간", "막대를 누르면 그날 정보가 보입니다");
    var legend = el("div", "legend");
    legend.innerHTML = '<span><i class="sw plan"></i>계획</span><span><i class="sw act"></i>실제</span><span><i class="sw today"></i>오늘</span>';
    var plot = el("div", "plot");
    plot.style.setProperty("--n", PLAN.days.length);
    plot.setAttribute("role", "group");
    plot.setAttribute("aria-label", "날짜별 계획과 실제 공부시간 막대 그래프");
    [[30, "1h"], [60, "2h"], [90, "3h"]].forEach(function (g2) {
      var gl = el("div", "gl");
      gl.style.bottom = g2[0] + "%";
      gl.append(el("span", null, g2[1]));
      plot.append(gl);
    });
    var cols = el("div", "cols");
    var xl = el("div", "xl");
    xl.style.setProperty("--n", PLAN.days.length);
    var marks = { "2026-09-29": 1, "2026-10-06": 1, "2026-10-13": 1, "2026-10-20": 1, "2026-10-25": 1 };
    PLAN.days.forEach(function (d, i) {
      var c = el("button", "col" + (d.iso === TODAY.iso ? " today" : ""));
      c.type = "button";
      c.setAttribute("aria-label", d.md + " " + d.wd);
      var bp = el("i", "bp"), ba = el("i", "ba");
      var plan = d.items.reduce(function (n, it) { return n + it.min; }, 0);
      bp.style.height = (Math.min(plan, SCALE) / SCALE) * 100 + "%";
      ba.style.height = "0%";
      c.append(bp, ba);
      c.addEventListener("click", function () { showCap(d.iso); });
      cols.append(c);
      ui.cols[d.iso] = { col: c, ba: ba };
      var x = el("span", i === PLAN.days.length - 1 ? "end" : "");
      if (marks[d.iso]) x.append(el("b", null, d.md));
      xl.append(x);
    });
    plot.append(cols);
    var capRow = el("div", "cap-row");
    ui.cap = el("p", "cap", "막대를 눌러 보세요.");
    ui.open = el("button", "link-btn", "이 날 열기");
    ui.open.type = "button";
    ui.open.hidden = true;
    ui.open.addEventListener("click", function () { openDay(ui.capIso); });
    capRow.append(ui.cap, ui.open);
    ch.append(legend, plot, xl, capRow);

    var mh = el("div", "sec-h");
    mh.style.marginTop = "18px";
    var mt = el("h2", null, "계획 시간 배분");
    mt.style.fontSize = "15px";
    ui.mixTotal = el("span");
    mh.append(mt, ui.mixTotal);
    var mixBar = el("div", "mix-bar"), mixLeg = el("div", "mix-leg");
    var sums = { t: 0, s: 0, m: 0, c: 0, r: 0 }, tot = 0;
    PLAN.days.forEach(function (d) { d.items.forEach(function (it) { sums[it.tag] += it.min; tot += it.min; }); });
    ui.mixTotal.textContent = "총 " + fmtH(tot) + "시간";
    TAG_ORDER.forEach(function (k) {
      var seg = el("span");
      seg.dataset.t = k;
      seg.style.flex = sums[k] + " 1 0";
      mixBar.append(seg);
      var item = el("span", "tag");
      item.dataset.t = k;
      item.append(el("i", "dot"), document.createTextNode(TAGS[k] + " " + Math.round((sums[k] / tot) * 100) + "% · " + fmtH(sums[k]) + "시간"));
      mixLeg.append(item);
    });
    ch.append(mh, mixBar, mixLeg);
    ui.body.append(ch);

    var sc = card("전체 일정", "날짜를 누르면 그날 계획이 열립니다");
    PLAN.phases.forEach(function (p, pi) {
      var t = el("div", "phase-t");
      t.append(el("span", "num", String(pi + 1)), el("b", null, p.name), el("span", "r", p.range));
      sc.append(t);
      PLAN.days.filter(function (d) { return d.phase === p.key; }).forEach(function (d) {
        var r = el("button", "lrow");
        r.type = "button";
        var dcol = el("span", "d", d.md);
        dcol.append(el("small", null, d.wd + (d.hol ? " " + d.hol : "")));
        var mid = el("span", "m");
        var first = d.items[0];
        mid.textContent = first ? first.title : "쉬는 날";
        if (d.items.length > 1) mid.append(el("small", null, "  외 " + (d.items.length - 1) + "개"));
        var st = el("span", "s");
        var stt = el("span");
        st.append(stt, el("i", "sdot"));
        r.append(dcol, mid, st);
        r.addEventListener("click", function () { openDay(d.iso); });
        sc.append(r);
        ui.rows[d.iso] = { row: r, txt: stt };
      });
    });
    ui.body.append(sc);

    var bk = card("기록 백업", "이 기기의 브라우저에 저장됩니다");
    bk.append(el("p", "note", "폰과 PC 기록은 따로 저장됩니다. 옮기거나 지우기 전에 내보내기로 백업해 두세요."));
    var br = el("div", "btnrow");
    br.style.marginTop = "12px";
    var bExp = el("button", "btn primary", "파일로 내보내기"); bExp.type = "button";
    var bCopy = el("button", "btn", "복사"); bCopy.type = "button";
    var bImp = el("button", "btn", "가져오기"); bImp.type = "button";
    var bRst = el("button", "btn danger", "기록 지우기"); bRst.type = "button";
    var file = document.createElement("input");
    file.type = "file"; file.accept = "application/json,.json"; file.hidden = true; file.id = "import-file";
    br.append(bExp, bCopy, bImp, bRst, file);
    ui.msg = el("div", "msg");
    ui.msg.setAttribute("aria-live", "polite");
    ui.msgBtns = el("div", "btnrow");
    ui.msgBtns.style.marginTop = "8px";
    bk.append(br, ui.msg, ui.msgBtns);
    ui.body.append(bk);
    bExp.addEventListener("click", exportFile);
    bCopy.addEventListener("click", copyJson);
    bImp.addEventListener("click", function () { file.value = ""; file.click(); });
    file.addEventListener("change", function () { if (file.files && file.files[0]) readImport(file.files[0]); });
    bRst.addEventListener("click", askReset);

    $screen.textContent = "";
    $screen.append(hero, ui.body);
    updateTotal();
  }

  function capText(iso) {
    var d = dayBy[iso], s = dayStat(d);
    return d.md + "(" + d.wd + ")" + (d.hol ? " " + d.hol : "") + " · 계획 " + s.plan + "분 · 실제 " + s.act + "분";
  }
  function showCap(iso) {
    ui.capIso = iso;
    ui.cap.textContent = capText(iso);
    ui.open.hidden = false;
    Object.keys(ui.cols).forEach(function (k) { ui.cols[k].col.classList.toggle("sel", k === iso); });
  }
  function openDay(iso) {
    sel = iso;
    location.hash = "#today";
  }

  function updateTotal() {
    var t = totals();
    ui.ddl.textContent = TODAY.diff > 0 ? "시험까지" : TODAY.diff === 0 ? "시험 당일" : "시험 종료";
    ui.ddn.textContent = TODAY.diff > 0 ? "D-" + TODAY.diff : TODAY.diff === 0 ? "D-DAY" : "끝";
    var pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
    ui.ringPct.textContent = pct + "%";
    ui.ringFg.style.strokeDasharray = String(CIRC);
    ui.ringFg.style.strokeDashoffset = String(CIRC * (1 - pct / 100));
    ui.stDone.textContent = t.done + " / " + t.total;
    ui.stDoneSub.textContent = "남은 항목 " + (t.total - t.done);
    ui.stAct.textContent = fmtH(t.act) + "h";
    ui.stActSub.textContent = "계획 " + fmtH(t.plan) + "h";
    if (t.planNow > 0) {
      ui.stPace.textContent = Math.round((t.actNow / t.planNow) * 100) + "%";
      ui.stPaceSub.textContent = "실제 " + fmtH(t.actNow) + " / 계획 " + fmtH(t.planNow) + "h";
    } else {
      ui.stPace.textContent = "-";
      ui.stPaceSub.textContent = "시작 전";
    }
    PLAN.parts.forEach(function (p) {
      var tt = t.partTotal[p.k] || 0, dn = t.partDone[p.k] || 0;
      ui.pbar[p.k].style.width = (tt ? Math.round((dn / tt) * 100) : 0) + "%";
      ui.pn[p.k].textContent = dn + " / " + tt + " 블록";
    });
    PLAN.days.forEach(function (d) {
      var s = dayStat(d);
      ui.cols[d.iso].ba.style.height = (Math.min(s.act, SCALE) / SCALE) * 100 + "%";
      var r = ui.rows[d.iso];
      r.row.className = "lrow " + dayStatus(d, s) + (d.iso === TODAY.iso ? " today" : "");
      r.txt.textContent = d.items.length ? "실제 " + s.act + " / " + s.plan + "분" : "휴식";
    });
    if (ui.capIso) ui.cap.textContent = capText(ui.capIso);
  }

  /* ---------- backup ---------- */
  function backupJson() {
    return JSON.stringify({ app: "itp-checklist", version: 1, exportedAt: new Date().toISOString(), state: state }, null, 1);
  }
  function say(text, ok) {
    ui.msg.textContent = text;
    ui.msg.style.color = ok === false ? "var(--c-r)" : "var(--ink)";
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
      say("백업 파일을 저장했습니다. 저장이 안 되면 '복사'를 써 보세요.");
    } catch (e) {
      say("파일 저장에 실패했습니다. '복사'를 써 보세요.", false);
    }
  }
  function copyJson() {
    var text = backupJson();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { say("백업 내용을 복사했습니다. 메모 앱 등에 붙여 넣어 보관하세요."); },
        function () { say("복사가 막혀 있습니다. '파일로 내보내기'를 써 주세요.", false); }
      );
    } else {
      say("이 브라우저에서는 복사를 쓸 수 없습니다. '파일로 내보내기'를 써 주세요.", false);
    }
  }
  function readImport(f) {
    var rd = new FileReader();
    rd.onload = function () {
      var data;
      try { data = JSON.parse(String(rd.result)); } catch (e) { say("JSON 파일이 아닙니다.", false); return; }
      var src = obj(data.state && typeof data.state === "object" ? data.state : data);
      var next = { done: obj(src.done), act: obj(src.act), memo: obj(src.memo) };
      var nd = Object.keys(next.done).length, na = Object.keys(next.act).length;
      if (!nd && !na && !Object.keys(next.memo).length) { say("가져올 기록이 없는 파일입니다.", false); return; }
      say("완료 " + nd + "개, 실제 시간 " + na + "개가 들어 있습니다. 지금 기록을 이 내용으로 바꿀까요?");
      var ok = el("button", "btn primary", "바꾸기"); ok.type = "button";
      var no = el("button", "btn", "취소"); no.type = "button";
      ok.addEventListener("click", function () { state = next; save(); render(); });
      no.addEventListener("click", function () { say("취소했습니다."); });
      ui.msgBtns.append(ok, no);
    };
    rd.onerror = function () { say("파일을 읽지 못했습니다.", false); };
    rd.readAsText(f);
  }
  function askReset() {
    say("체크, 실제 시간, 메모를 모두 지웁니다. 되돌릴 수 없습니다.", false);
    var ok = el("button", "btn danger", "모두 지우기"); ok.type = "button";
    var no = el("button", "btn", "취소"); no.type = "button";
    ok.addEventListener("click", function () { state = { done: {}, act: {}, memo: {} }; save(); render(); });
    no.addEventListener("click", function () { say("취소했습니다."); });
    ui.msgBtns.append(ok, no);
  }

  /* ---------- routing ---------- */
  function render() {
    route = location.hash === "#total" ? "total" : "today";
    var tt = document.getElementById("tab-today"), tl = document.getElementById("tab-total");
    if (route === "today") { tt.setAttribute("aria-current", "page"); tl.removeAttribute("aria-current"); }
    else { tl.setAttribute("aria-current", "page"); tt.removeAttribute("aria-current"); }
    ui = {};
    if (route === "today") mountToday(); else mountTotal();
    window.scrollTo(0, 0);
  }

  TODAY = todayInfo();
  sel = defaultSel();
  load();
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
