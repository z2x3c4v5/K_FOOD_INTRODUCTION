/* =========================================================
 * 6학년 · K-FOOD 소개하기 웹 앱
 * - 🍱 둘러보기 : 음식 카드(영어 + 한글 + 설명) · 종류별 보기 · 음식 고르기
 * - 🥕 재료·맛  : 정말 들어가는 재료 2~4개 + 골라 먹을 수 있는 것 2개 + 어울리는 맛 1~2개 (재료 퀴즈 모드)
 * - 🎤 내가 고른 문장들 연습하기 : 음식·소개 문장(초급/중급)·재료·골라 먹기·맛 문장을 한 편의 소개글로 모아
 *                 줄마다 말하기 채점 + 처음부터 끝까지 말하기(차례로 마이크) + 짝 활동 카드
 * - 음성 출력: Web Speech API (SpeechSynthesis) / 채점: SpeechRecognition
 * ========================================================= */

/* ---------- 음성 합성 (TTS) ---------- */
const synth = window.speechSynthesis;
let enVoice = null;
let speakRate = 0.85;

function pickVoice() {
  if (!synth) return;
  const voices = synth.getVoices();
  enVoice =
    voices.find(v => /en[-_]US/i.test(v.lang)) ||
    voices.find(v => /^en/i.test(v.lang)) ||
    null;
  const status = document.querySelector(".toolbar #voice-status");
  if (status) status.textContent = enVoice ? `음성: ${enVoice.name}` : "영어 음성을 찾는 중...";
}
pickVoice();
if (synth && synth.onvoiceschanged !== undefined) synth.onvoiceschanged = pickVoice;

/* 로마자 음식 이름을 영어 음성이 더 비슷하게 읽도록 바꿈 (화면 글자는 그대로) */
function ttsText(text) {
  return text.split(/(\s+)/).map(tok => {
    const k = wordKey(tok);
    if (!k || !SAY_MAP[k]) return tok;
    return tok.replace(/[A-Za-z-]+/, m => (m[0] === m[0].toUpperCase() ? SAY_MAP[k].replace(/^./, c => c.toUpperCase()) : SAY_MAP[k]));
  }).join("");
}

let speakSeq = 0;   // speak() 가 불릴 때마다 1씩 증가 → 이어 읽기 체인이 끊겼는지 확인용
function speak(text, rate, onStart, onEnd) {
  speakSeq++;
  if (!synth) { onEnd && onEnd(); return; }
  synth.cancel();
  const u = new SpeechSynthesisUtterance(ttsText(text));
  u.lang = "en-US";
  u.rate = rate || speakRate;
  u.pitch = 1.05;
  if (enVoice) u.voice = enVoice;
  if (onStart) u.onstart = onStart;
  if (onEnd) u.onend = onEnd;
  synth.speak(u);
}
function cancelSpeech() { speakSeq++; if (synth) synth.cancel(); }

/* ---------- 단어 뜻 풍선(popup) ---------- */
const popup = document.createElement("div");
popup.className = "word-popup hidden";
popup.innerHTML = `
  <div class="wp-word"></div>
  <div class="wp-meaning"></div>
  <button class="wp-listen">단어 다시 듣기</button>`;
document.body.appendChild(popup);

popup.querySelector(".wp-listen").addEventListener("click", e => {
  e.stopPropagation();
  if (popup.dataset.word) speak(popup.dataset.word, 0.8);
});

function showWordPopup(wordEl, rawWord) {
  const key = wordKey(rawWord);
  const plain = rawWord.replace(/[.,!?]+$/, "");
  const meaning = WORD_MEANINGS[key] || WORD_MEANINGS[plain.toLowerCase()] || "(뜻 정보 없음)";
  popup.dataset.word = key || rawWord;
  popup.querySelector(".wp-word").textContent = plain;
  popup.querySelector(".wp-meaning").textContent = meaning;

  popup.classList.remove("hidden");
  const r = wordEl.getBoundingClientRect();
  const pw = popup.offsetWidth;
  let left = r.left + r.width / 2 - pw / 2 + window.scrollX;
  left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
  popup.style.left = left + "px";
  popup.style.top = (r.bottom + 8 + window.scrollY) + "px";
  speak(key || rawWord, 0.8);   // 단어만 읽음 (문장 이어 읽기는 speakSeq 로 끊김)
}
function hidePopup() { popup.classList.add("hidden"); }
document.addEventListener("click", e => {
  if (!popup.contains(e.target) && !e.target.classList.contains("word")) hidePopup();
});

/* ---------- 클릭 가능한 단어로 문장 만들기 ---------- */
function buildWords(sentence) {
  const frag = document.createDocumentFragment();
  sentence.split(/\s+/).forEach((w, i) => {
    if (i > 0) frag.appendChild(document.createTextNode(" "));
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = w;
    span.addEventListener("click", e => { e.stopPropagation(); showWordPopup(span, w); });
    frag.appendChild(span);
  });
  return frag;
}

/* ---------- 한국어 조사 ---------- */
function hasFinal(word) {
  const s = (word || "").replace(/[\s()]+$/, "").replace(/\s*\(.*\)$/, "");
  const ch = s.charCodeAt(s.length - 1);
  if (ch >= 0xac00 && ch <= 0xd7a3) return (ch - 0xac00) % 28 !== 0;
  return /[a-z]$/i.test(s) ? /[bcdfghjklmnpqrstvxz]$/i.test(s) : false;
}
function josa(word, withFinal, noFinal) { return word + (hasFinal(word) ? withFinal : noFinal); }
function koShort(ko) { return ko.replace(/\s*\(.*\)$/, ""); }   // "밥 (쌀)" → "밥"

/* ---------- 찾기 ---------- */
const findFood = key => FOODS.find(f => f.key === key) || null;
const findIng  = en => INGREDIENTS.find(i => i.en === en) || null;
const findTaste = en => TASTES.find(t => t.en === en) || null;
const findOpt  = en => findIng(en) || CHOICES.find(c => c.en === en) || null;
function joinEn(list) {
  if (list.length <= 1) return list.join("");
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}
function lowerName(food) {
  // 문장 가운데에 들어갈 때: 고유 이름은 소문자, "Korean fried chicken"의 Korean은 대문자 유지
  return food.en.replace(/^[A-Z]/, c => c.toLowerCase()).replace(/\bkorean\b/g, "Korean");
}

/* ===========================================================
 * 상태 (localStorage)
 * =========================================================== */
const ING_MIN = 2, ING_MAX = 4, TASTE_MAX = 2, OPT_COUNT = 2;
let my = { food: null, ingredients: [], options: [], tastes: [], name: "" };
let ingMode = "real";
let stats = {};

try {
  const saved = JSON.parse(localStorage.getItem("kfood_intro") || "null");
  if (saved && typeof saved === "object") {
    my.food = findFood(saved.food) ? saved.food : null;
    my.ingredients = Array.isArray(saved.ingredients) ? saved.ingredients.filter(findIng) : [];
    my.options = Array.isArray(saved.options) ? saved.options.filter(findOpt) : [];
    my.tastes = Array.isArray(saved.tastes) ? saved.tastes.filter(findTaste) : [];
    my.name = typeof saved.name === "string" ? saved.name : "";
  }
} catch (e) {}
try { stats = JSON.parse(localStorage.getItem("kfood_stats") || "{}") || {}; } catch (e) {}

function persist() {
  try {
    localStorage.setItem("kfood_intro", JSON.stringify(my));
    localStorage.setItem("kfood_stats", JSON.stringify(stats));
  } catch (e) {}
}
function ingOk() { return my.ingredients.length >= ING_MIN && my.ingredients.length <= ING_MAX; }
function optOk() { return my.options.length === OPT_COUNT; }
function tasteOk() { return my.tastes.length >= 1 && my.tastes.length <= TASTE_MAX; }
function introComplete() { return !!(findFood(my.food) && ingOk() && tasteOk()); }

/* ---------- 문장 만들기 ---------- */
function ingSentence() {
  const items = my.ingredients.map(findIng).filter(Boolean);
  if (!items.length) return null;
  const en = `It has ${joinEn(items.map(i => i.en))}.`;
  const koList = items.map(i => koShort(i.ko)).join(", ");
  return { en, ko: `${josa(koList, "이", "가")} 들어 있어요.` };
}
function optSentence() {
  const items = my.options.map(findOpt).filter(Boolean);
  if (items.length !== OPT_COUNT) return null;
  const [a, b] = items;
  return { en: `You can choose ${a.en} or ${b.en}.`, ko: `${josa(koShort(a.ko), "이나", "나")} ${josa(koShort(b.ko), "을", "를")} 고를 수 있어요.` };
}
function tasteSentence() {
  const items = my.tastes.map(findTaste).filter(Boolean);
  if (!items.length) return null;
  const en = `It's ${joinEn(items.map(t => t.en))}.`;
  const ko = items.length === 1 ? `${items[0].koEnd}.` : `${items[0].koMid} ${items[1].koEnd}.`;
  return { en, ko };
}
/* 둘러보기에서 고른 소개 문장(초급/중급)을 "It is ~." 문장으로 */
const KEEP_CAPITAL = /^(Korean|Koreans|Chuseok|New)\b/;
function descSentence(food) {
  const d = descOf(food);
  const body = KEEP_CAPITAL.test(d.en) ? d.en : d.en.replace(/^[A-Z]/, c => c.toLowerCase());
  return { en: `It is ${body}`, ko: d.ko, tag: `📖 소개 문장 · ${LEVEL_LABEL[descLevel]}` };
}
function introLines() {
  const f = findFood(my.food);
  if (!f) return [];
  const name = my.name.trim() || "________";
  const ing = ingSentence(), opt = optSentence(), ts = tasteSentence();
  const ln = lowerName(f), ko = koShort(f.ko);
  const lines = [
    { en: `Hello. I'm ${name}.`, ko: `안녕. 나는 ${josa(name, "이야", "야")}.`, tag: "👋 인사" },
    { en: `I'd like to introduce ${ln} to you.`, ko: `여러분에게 ${josa(ko, "을", "를")} 소개할게요.`, tag: "🍱 내가 고른 음식" },
    { en: `${f.en} is Korean food.`, ko: `${josa(ko, "은", "는")} 한국 음식이에요.`, tag: "🍱 내가 고른 음식" },
    descSentence(f),
    Object.assign(ing ? ing : { en: "It has ________.", ko: "________이 들어 있어요." }, { tag: "🥕 재료" }),
  ];
  if (opt) lines.push(Object.assign(opt, { tag: "🔀 골라 먹기" }));
  lines.push(Object.assign(ts ? ts : { en: "It's ________.", ko: "________." }, { tag: "😋 맛" }));
  lines.push({ en: `Would you like this ${ln}? Bye.`, ko: `이 ${ko} 먹어 볼래요? 안녕.`, tag: "👋 마무리" });
  return lines;
}
function introText() { return introLines().map(l => l.en).join("\n"); }

/* ===========================================================
 * 🍱 K-FOOD 둘러보기
 * =========================================================== */
let currentCat = "all";
let descLevel = "beginner";   // 음식 설명 문장 난이도: beginner(초급) / intermediate(중급)
try { const lv = localStorage.getItem("kfood_desc_level"); if (lv === "beginner" || lv === "intermediate") descLevel = lv; } catch (e) {}
const LEVEL_LABEL = { beginner: "초급", intermediate: "중급" };
function descOf(food) { return food.desc[descLevel] || food.desc.beginner; }
function setDescLevel(lv) {
  descLevel = lv;
  try { localStorage.setItem("kfood_desc_level", lv); } catch (e) {}
  document.querySelectorAll(".level-switch .level-btn").forEach(b => b.classList.toggle("active", b.dataset.level === lv));
  cancelSpeech(); hidePopup();
  renderFoods(); renderFoodHead();
  if (document.getElementById("tab-practice").classList.contains("active")) renderPractice();
}
document.querySelectorAll("#desc-level .level-btn").forEach(btn => btn.addEventListener("click", () => setDescLevel(btn.dataset.level)));

/* 음식 설명 (영어 단어 클릭 + 한글 + 🔊 문장 듣기) — 카드와 재료·맛 페이지 머리에 같이 씀 */
function descBlock(food, hostEl) {
  const d = descOf(food);
  const desc = document.createElement("div"); desc.className = "food-desc";
  const txt = document.createElement("div"); txt.className = "desc-text";
  const tag = document.createElement("span"); tag.className = "desc-level-tag"; tag.textContent = `${LEVEL_LABEL[descLevel]} 설명`;
  const dEn = document.createElement("div"); dEn.className = "desc-en"; dEn.appendChild(buildWords(d.en));
  const dKo = document.createElement("div"); dKo.className = "desc-ko"; dKo.textContent = d.ko;
  txt.append(tag, dEn, dKo);
  const sp = document.createElement("button"); sp.className = "speak-btn small"; sp.textContent = "🔊"; sp.setAttribute("aria-label", "설명 문장 듣기"); sp.title = "설명 문장 전체 듣기";
  sp.addEventListener("click", e => {
    e.stopPropagation();
    speak(d.en, null, () => hostEl && hostEl.classList.add("speaking"), () => hostEl && hostEl.classList.remove("speaking"));
  });
  desc.append(txt, sp);
  return desc;
}

function makeFoodCard(food, i) {
  const div = document.createElement("div");
  div.className = "card food-card tone-" + (i % 6);
  if (my.food === food.key) div.classList.add("picked");

  const top = document.createElement("div");
  top.className = "card-top";
  const cat = FOOD_CATS.find(c => c.key === food.cat);
  const tag = document.createElement("span"); tag.className = "card-tag"; tag.textContent = cat ? cat.label : "";
  const listenAll = document.createElement("button");
  listenAll.className = "listen-all"; listenAll.textContent = "설명 듣기 ▶";
  listenAll.addEventListener("click", e => {
    e.stopPropagation();
    speak(`${food.en}. ${descOf(food).en}`, null, () => div.classList.add("speaking"), () => div.classList.remove("speaking"));
  });
  top.append(tag, listenAll);

  const visual = document.createElement("div"); visual.className = "emoji"; visual.textContent = food.emoji;

  const nameBox = document.createElement("div"); nameBox.className = "sentence-box name-box";
  const txt = document.createElement("div"); txt.className = "sentence-text";
  const en = document.createElement("div"); en.className = "en food-en"; en.appendChild(buildWords(food.en));
  const ko = document.createElement("div"); ko.className = "ko food-ko"; ko.textContent = food.ko;
  txt.append(en, ko);
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn"; speakBtn.setAttribute("aria-label", "이름 듣기"); speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", e => {
    e.stopPropagation();
    speak(food.en, 0.8, () => div.classList.add("speaking"), () => div.classList.remove("speaking"));
  });
  nameBox.append(txt, speakBtn);

  const desc = descBlock(food, div);

  const ingLine = document.createElement("div"); ingLine.className = "food-ings";
  ingLine.textContent = "🥕 " + food.ingredients.slice(0, 4).map(k => { const g = findIng(k); return g ? g.emoji + " " + koShort(g.ko) : k; }).join(" · ") + (food.ingredients.length > 4 ? " …" : "");

  const pickBtn = document.createElement("button");
  pickBtn.className = "select-btn" + (my.food === food.key ? " on" : "");
  pickBtn.textContent = my.food === food.key ? `✅ 내가 고른 음식 (${LEVEL_LABEL[descLevel]} 문장) · 재료 고르기 ➜` : `👉 이 음식 · ${LEVEL_LABEL[descLevel]} 문장 고르기`;
  pickBtn.addEventListener("click", e => {
    e.stopPropagation();
    chooseFood(food.key);
    goTab("build");
  });

  div.append(top, visual, nameBox, desc, ingLine, pickBtn);
  return div;
}

function renderFoods() {
  const grid = document.getElementById("food-grid");
  grid.innerHTML = "";
  const list = FOODS.filter(f => currentCat === "all" || f.cat === currentCat);
  list.forEach((f, i) => grid.appendChild(makeFoodCard(f, i)));
  document.getElementById("food-count").textContent = `${list.length}가지`;
}

(function initCats() {
  const wrap = document.getElementById("food-cats");
  FOOD_CATS.forEach(c => {
    const b = document.createElement("button");
    b.className = "cat-btn"; b.dataset.cat = c.key; b.textContent = c.label;
    wrap.appendChild(b);
  });
  wrap.querySelectorAll(".cat-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      wrap.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCat = btn.dataset.cat;
      cancelSpeech(); hidePopup(); renderFoods();
    });
  });
})();

function chooseFood(key) {
  if (my.food !== key) {
    my.food = key; my.ingredients = []; my.options = []; my.tastes = [];
    lastBuildSpoken = "";
  }
  persist();
  renderFoods();
  renderBuilder();
}

/* ===========================================================
 * 🥕 재료 · 맛 고르기
 * =========================================================== */
let lastBuildSpoken = "";
let quizSeed = 0;

function makeChip(text, cls, isOn, onClick) {
  const c = document.createElement("button");
  c.className = "chip " + cls + (isOn ? " on" : "");
  c.textContent = text;
  c.addEventListener("click", onClick);
  return c;
}
function setBlank(id, en) {
  const el = document.getElementById(id);
  el.classList.toggle("filled", !!en);
  if (en) { el.innerHTML = ""; el.appendChild(buildWords(en)); }
  else el.textContent = "________";
}
function seededShuffle(arr, seed) {
  const a = arr.slice();
  let s = seed * 9301 + 49297;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/* 퀴즈 모드: 진짜 재료 + 다른 음식 재료 3개 + 엉뚱한 재료 2개 를 섞음 */
function quizPool(food) {
  const real = new Set(food.ingredients.concat(food.options || []));
  const others = INGREDIENTS.filter(i => !real.has(i.en));
  const seed = quizSeed + food.key.length * 7;
  const picked = seededShuffle(others, seed).slice(0, 3).concat(seededShuffle(SILLY_INGREDIENTS, seed + 1).slice(0, 2));
  return seededShuffle(food.ingredients.map(findIng).concat(picked), seed + 2);
}

function renderFoodHead() {
  const head = document.getElementById("food-head");
  const f = findFood(my.food);
  head.innerHTML = "";
  if (!f) {
    head.classList.add("empty");
    head.innerHTML = `<div class="food-head-empty">아직 음식을 고르지 않았어요. <b>🍱 K-FOOD 둘러보기</b>에서 <b>👉 이 음식 소개하기</b>를 눌러요.</div>`;
    const b = document.createElement("button"); b.className = "btn primary"; b.textContent = "🍱 음식 고르러 가기";
    b.addEventListener("click", () => goTab("explore"));
    head.appendChild(b);
    return;
  }
  head.classList.remove("empty");
  const em = document.createElement("div"); em.className = "food-head-emoji"; em.textContent = f.emoji;
  const txt = document.createElement("div"); txt.className = "food-head-text";
  const en = document.createElement("div"); en.className = "food-head-en"; en.appendChild(buildWords(f.en));
  const ko = document.createElement("div"); ko.className = "food-head-ko"; ko.textContent = f.ko;
  const d = descBlock(f, head); d.classList.add("food-head-desc");
  txt.append(en, ko, d);
  const tools = document.createElement("div"); tools.className = "food-head-tools";
  const sp = document.createElement("button"); sp.className = "speak-btn"; sp.textContent = "🔊"; sp.setAttribute("aria-label", "이름 듣기");
  sp.addEventListener("click", () => speak(f.en, 0.8));
  const ch = document.createElement("button"); ch.className = "btn small ghost"; ch.textContent = "🔁 다른 음식";
  ch.addEventListener("click", () => goTab("explore"));
  const lvl = document.createElement("div"); lvl.className = "level-switch small";
  ["beginner", "intermediate"].forEach(lv => {
    const b = document.createElement("button"); b.className = "level-btn" + (descLevel === lv ? " active" : ""); b.dataset.level = lv; b.textContent = LEVEL_LABEL[lv];
    b.addEventListener("click", () => setDescLevel(lv));
    lvl.appendChild(b);
  });
  tools.append(sp, ch, lvl);
  head.append(em, txt, tools);
}

function renderBuilder() {
  renderFoodHead();
  const f = findFood(my.food);
  const ingRow = document.getElementById("ing-chips");
  const tasteRow = document.getElementById("taste-chips");
  const optRow = document.getElementById("opt-chips");
  const fb = document.getElementById("ing-feedback");
  ingRow.innerHTML = ""; tasteRow.innerHTML = ""; optRow.innerHTML = "";
  fb.className = "quiz-feedback"; fb.textContent = "";
  document.querySelectorAll("#ing-mode .cat-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === ingMode));

  if (f) {
    const real = new Set(f.ingredients);
    const pool = ingMode === "quiz" ? quizPool(f) : f.ingredients.map(findIng);
    pool.forEach(g => {
      const on = my.ingredients.includes(g.en);
      const chip = makeChip(`${g.emoji} ${g.en} · ${koShort(g.ko)}`, "ing", on, () => {
        if (!real.has(g.en)) {
          chip.classList.add("wrong");
          setTimeout(() => chip.classList.remove("wrong"), 600);
          fb.className = "quiz-feedback bad";
          fb.textContent = `❌ ${koShort(g.ko)}(${g.en})은(는) ${koShort(f.ko)}에 들어가지 않아요!`;
          speak(`No! ${f.en} doesn't have ${g.en}.`);
          return;
        }
        if (on) my.ingredients = my.ingredients.filter(x => x !== g.en);
        else {
          if (my.ingredients.length >= ING_MAX) {
            fb.className = "quiz-feedback warn";
            fb.textContent = `재료는 최대 ${ING_MAX}개까지만 골라요. 다른 재료를 빼고 골라 보세요.`;
            return;
          }
          my.ingredients.push(g.en);
          if (ingMode === "quiz") { fb.className = "quiz-feedback good"; fb.textContent = `✅ 맞아요! ${koShort(f.ko)}에는 ${koShort(g.ko)}(${g.en})이(가) 들어가요.`; }
        }
        persist(); renderBuilder(); updateBuildPreview(true);
      });
      if (ingMode === "quiz" && !real.has(g.en)) chip.classList.add("maybe");
      ingRow.appendChild(chip);
    });
    (f.options || []).map(findOpt).filter(Boolean).forEach(o => {
      const on = my.options.includes(o.en);
      optRow.appendChild(makeChip(`${o.emoji} ${o.en} · ${koShort(o.ko)}`, "opt", on, () => {
        if (on) my.options = my.options.filter(x => x !== o.en);
        else {
          if (my.options.length >= OPT_COUNT) my.options = my.options.slice(1);
          my.options.push(o.en);
        }
        persist(); renderBuilder(); updateBuildPreview(true);
      }));
    });
    f.tastes.map(findTaste).forEach(t => {
      const on = my.tastes.includes(t.en);
      tasteRow.appendChild(makeChip(`${t.emoji} ${t.en} · ${koShort(t.ko)}`, "taste", on, () => {
        if (on) my.tastes = my.tastes.filter(x => x !== t.en);
        else {
          if (my.tastes.length >= TASTE_MAX) my.tastes = my.tastes.slice(1);
          my.tastes.push(t.en);
        }
        persist(); renderBuilder(); updateBuildPreview(true);
      }));
    });
  }
  updateBuildPreview();
}

function updateBuildBadge() {
  const c = document.getElementById("build-count");
  const n = (ingOk() ? 1 : 0) + (tasteOk() ? 1 : 0);
  if (c) c.textContent = findFood(my.food) ? `${n}/2` : "–";
}

function updateBuildPreview(autoSpeak) {
  const f = findFood(my.food);
  const ing = ingSentence(), ts = tasteSentence();
  const items = my.ingredients.map(findIng).filter(Boolean);
  setBlank("ing-blank", items.length ? joinEn(items.map(i => i.en)) : null);
  document.getElementById("ing-ko").textContent = ing ? ing.ko : "________이 들어 있어요.";
  const oItems = my.options.map(findOpt).filter(Boolean);
  const opt = optSentence();
  setBlank("opt-blank1", oItems[0] ? oItems[0].en : null);
  setBlank("opt-blank2", oItems[1] ? oItems[1].en : null);
  document.getElementById("opt-ko").textContent = opt ? opt.ko : `${oItems[0] ? koShort(oItems[0].ko) : "________"}이나 ${oItems[1] ? koShort(oItems[1].ko) : "________"}을 고를 수 있어요.`;
  const tItems = my.tastes.map(findTaste).filter(Boolean);
  setBlank("taste-blank", tItems.length ? joinEn(tItems.map(t => t.en)) : null);
  document.getElementById("taste-ko").textContent = ts ? ts.ko : "________.";

  const status = document.getElementById("build-status");
  const done = introComplete();
  status.className = "dlg-status" + (done ? " ok" : "");
  if (!f) status.textContent = "🍱 먼저 소개할 음식을 골라요.";
  else if (my.ingredients.length < ING_MIN) status.textContent = `1️⃣ ${koShort(f.ko)}에 들어가는 재료를 ${ING_MIN}~${ING_MAX}개 골라요 👆 (지금 ${my.ingredients.length}개)`;
  else if (!tasteOk()) status.textContent = `3️⃣ ${koShort(f.ko)}의 맛을 1~${TASTE_MAX}개 골라요 👆 ${optOk() ? "" : "(2️⃣ 골라 먹을 수 있는 것도 2개 고르면 문장이 하나 더 생겨요)"}`;
  else if (!optOk()) status.textContent = `✅ 완성! 2️⃣ 골라 먹을 수 있는 것을 2개 고르면 "You can choose ___ or ___." 문장도 들어가요. · 🎤 내가 고른 문장들 연습하기에서 이름을 쓰고 말해 봐요.`;
  else status.textContent = `✅ 완성! "${ing.en} ${opt.en} ${ts.en}" · 🎤 내가 고른 문장들 연습하기에서 이름을 쓰고 말해 봐요.`;

  document.getElementById("build-listen").disabled = !(ing || opt || ts);
  document.getElementById("build-next").disabled = !done;
  document.getElementById("build-next").classList.toggle("primary", done);
  updateBuildBadge();

  if (autoSpeak) {
    const en = [ing && ing.en, opt && opt.en, ts && ts.en].filter(Boolean).join(" ");
    if (en && en !== lastBuildSpoken) { lastBuildSpoken = en; speak(en); }
  }
}

document.querySelectorAll("#ing-mode .cat-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    ingMode = btn.dataset.mode;
    if (ingMode === "quiz") quizSeed++;
    cancelSpeech(); renderBuilder();
  });
});
document.getElementById("ing-speak").addEventListener("click", () => { const s = ingSentence(); if (s) speak(s.en); });
document.getElementById("taste-speak").addEventListener("click", () => { const s = tasteSentence(); if (s) speak(s.en); });
document.getElementById("opt-speak").addEventListener("click", () => { const s = optSentence(); if (s) speak(s.en); });
document.getElementById("build-listen").addEventListener("click", () => {
  const ing = ingSentence(), opt = optSentence(), ts = tasteSentence();
  const en = [ing && ing.en, opt && opt.en, ts && ts.en].filter(Boolean).join(" ");
  if (en) speak(en);
});
function pickN(arr, n) { return seededShuffle(arr, Math.floor(Math.random() * 100000)).slice(0, n); }
document.getElementById("build-random").addEventListener("click", () => {
  let f = findFood(my.food);
  if (!f) { f = FOODS[Math.floor(Math.random() * FOODS.length)]; my.food = f.key; renderFoods(); }
  my.ingredients = pickN(f.ingredients, Math.min(f.ingredients.length, 2 + Math.floor(Math.random() * 3)));
  my.options = pickN(f.options || [], OPT_COUNT);
  my.tastes = pickN(f.tastes, 1 + Math.floor(Math.random() * 2));
  persist(); renderBuilder(); updateBuildPreview(true);
});
document.getElementById("build-clear").addEventListener("click", () => {
  my.ingredients = []; my.options = []; my.tastes = []; lastBuildSpoken = "";
  cancelSpeech(); persist(); renderBuilder();
});
document.getElementById("build-next").addEventListener("click", () => goTab("practice"));

/* ---------- 🙋 내 이름 (연습하기 탭) ---------- */
const nameInput = document.getElementById("my-name");
nameInput.value = my.name;
nameInput.addEventListener("input", () => {
  my.name = nameInput.value.replace(/[^A-Za-z .'-]/g, "").slice(0, 24);
  if (nameInput.value !== my.name) nameInput.value = my.name;
  persist(); renderPractice();
});

/* ===========================================================
 * 🎤 내가 고른 문장들 연습하기 (음성 인식)
 * =========================================================== */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const srSupported = !!SR;
let rec = srSupported ? new SR() : null;
if (rec) { rec.lang = "en-US"; rec.interimResults = false; rec.maxAlternatives = 5; }
let recBusy = false;

function normalize(s) { return s.toLowerCase().replace(/[^a-z\s']/g, " ").replace(/\s+/g, " ").trim(); }
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[m][n];
}
function wordsClose(a, b) {
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4 && (a.startsWith(b) || b.startsWith(a))) return true;
  return Math.abs(a.length - b.length) <= 1 && levenshtein(a, b) <= 1;
}
const STOPWORDS = new Set(["a", "an", "the", "to", "of", "on", "in", "at", "for", "but", "i", "i'm", "i'd", "it", "it's", "is", "and", "or", "this"]);
/* 로마자 한국어 단어(음식·재료 이름)는 음성 인식이 잘 못 알아듣기 때문에,
 * 비슷한 소리가 들리면 맞은 것으로, 아예 없으면 채점에서 빼 줌 */
const KOREAN_WORDS = new Set(Object.keys(SAY_MAP).flatMap(k => k.split("-")));
function sayTokens(k) { return (SAY_MAP[k] || "").toLowerCase().split(/[-\s]+/).filter(Boolean); }
function scoreMatch(target, heard) {
  const t = normalize(target).split(" ").filter(Boolean);
  const h = normalize(heard).split(" ").filter(Boolean);
  const hJoined = h.join("");
  let content = t.filter(w => !STOPWORDS.has(w));
  if (!content.length) content = t;
  let hit = 0, total = 0;
  content.forEach(w => {
    if (KOREAN_WORDS.has(w)) {
      const toks = sayTokens(w);
      const ok = h.some(x => wordsClose(x, w)) || hJoined.includes(w.slice(0, 4)) ||
        (toks.length && toks.filter(tk => h.some(x => x.includes(tk) || tk.includes(x))).length >= Math.ceil(toks.length / 2));
      if (ok) { hit++; total++; }           // 비슷하게 들렸으면 맞음
      return;                                // 못 들었으면 채점에서 제외
    }
    total++;
    if (h.some(x => wordsClose(x, w))) hit++;
  });
  if (!total) return h.length ? 1 : 0;
  let score = hit / total;
  if (score >= 0.5) score = Math.min(1, score + 0.12);
  return score;
}
function practiceAttempt(target, cb) {
  if (!rec || recBusy) { cb.onend && cb.onend(); return; }
  recBusy = true;
  let score = 0, heard = "", errCode = null;
  rec.onresult = e => {
    const alts = e.results[0];
    for (let i = 0; i < alts.length; i++) {
      const s = scoreMatch(target, alts[i].transcript);
      if (s > score || !heard) { if (s >= score) { score = s; heard = alts[i].transcript; } }
    }
  };
  rec.onerror = ev => { errCode = ev.error; };
  rec.onend = () => {
    recBusy = false;
    if (errCode && score === 0) cb.onerror && cb.onerror(errCode);
    else cb.onresult && cb.onresult(Math.round(score * 100), heard);
    cb.onend && cb.onend();
  };
  try { rec.start(); } catch (e) { recBusy = false; cb.onend && cb.onend(); }
}
/* 문장을 읽고 나서 cb 실행. 그 사이에 다른 speak()(예: 단어 클릭)가 있었으면 체인을 멈춰
 * 단어만 들리고 다음 문장이 이어서 나오지 않게 함 */
function speakThen(text, cb) {
  let done = false;
  const mySeq = speakSeq + 1;          // 바로 아래 speak() 가 올릴 번호
  let timer = null;
  const finish = () => { if (done) return; done = true; clearTimeout(timer); if (speakSeq === mySeq) cb(); };
  timer = setTimeout(finish, Math.min(9000, 1500 + text.length * 90));
  speak(text, null, null, finish);
}
function statsText(en, last) {
  const s = stats[en] || { attempts: 0, best: 0 };
  return `정확도 <b class="acc">${last != null ? last + "%" : "--"}</b>` +
    ` · 최고 <b class="best">${s.best ? s.best + "%" : "--"}</b>` +
    ` · <b>${s.attempts}</b>회`;
}
function recordScore(en, score) {
  const s = stats[en] || { attempts: 0, best: 0 };
  s.attempts++; s.best = Math.max(s.best, score); stats[en] = s; persist();
}
function feedbackHtml(score, heard) {
  const h = `<span class="heard">내 발음: ${heard || "(못 들었어요)"}</span>`;
  if (score >= 75) return ["good", `⭐ 훌륭해요! ${score}% ${h}`];
  if (score >= 45) return ["good", `👍 좋아요! 한 번 더! ${score}% ${h}`];
  return ["bad", `🔁 다시 또박또박! ${score}% ${h}`];
}

function makeSpeakRow(en, ko, idx, tag) {
  const row = document.createElement("div");
  row.className = "prow";
  const speakBtn = document.createElement("button");
  speakBtn.className = "speak-btn small"; speakBtn.setAttribute("aria-label", "듣기"); speakBtn.textContent = "🔊";
  speakBtn.addEventListener("click", () => speak(en));
  const txt = document.createElement("div"); txt.className = "prow-text";
  const w = document.createElement("span"); w.className = "prow-who"; w.textContent = `${idx + 1}줄`; txt.appendChild(w);
  if (tag) { const t = document.createElement("span"); t.className = "prow-tag"; t.textContent = tag; txt.appendChild(t); }
  const enEl = document.createElement("div"); enEl.className = "en"; enEl.appendChild(buildWords(en));
  const koEl = document.createElement("div"); koEl.className = "ko"; koEl.textContent = ko;
  txt.append(enEl, koEl);
  const mic = document.createElement("button");
  mic.className = "mic-btn"; mic.innerHTML = '<span class="mic-ico">🎙️</span><span class="mic-txt">말하기</span>';
  const score = document.createElement("div"); score.className = "pstats"; score.innerHTML = statsText(en, null);
  const fb = document.createElement("div"); fb.className = "mic-feedback";
  if (!srSupported) { mic.disabled = true; mic.title = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; }

  let lastScore = null;
  function attempt(after) {
    if (recBusy || !srSupported) { after && after(null); return; }
    mic.classList.add("recording"); row.classList.add("active");
    fb.className = "mic-feedback"; fb.textContent = "🔴 듣고 있어요... 또박또박 말해보세요!";
    lastScore = null;
    practiceAttempt(en, {
      onresult: (s, heard) => {
        lastScore = s; recordScore(en, s); score.innerHTML = statsText(en, s);
        const [cls, html] = feedbackHtml(s, heard);
        fb.className = "mic-feedback " + cls; fb.innerHTML = html;
      },
      onerror: err => {
        fb.className = "mic-feedback bad";
        fb.textContent = err === "not-allowed" ? "마이크 권한을 허용해 주세요." : "다시 시도해 주세요.";
      },
      onend: () => { mic.classList.remove("recording"); row.classList.remove("active"); after && after(lastScore); }
    });
  }
  mic.addEventListener("click", () => attempt());
  const main = document.createElement("div"); main.className = "prow-main";
  main.append(speakBtn, txt, mic, score);
  row.append(main, fb);
  row._attempt = attempt; row._en = en;
  return row;
}

function renderPractice() {
  const empty = document.getElementById("practice-empty");
  const list = document.getElementById("practice-list");
  const pairBlock = document.getElementById("pair-block");
  list.innerHTML = "";
  const f = findFood(my.food);
  if (!f || !introComplete()) {
    empty.style.display = "block"; pairBlock.style.display = "none";
    if (f) empty.innerHTML = `${f.emoji} <b>${f.en} (${koShort(f.ko)})</b> · ${LEVEL_LABEL[descLevel]} 문장을 골랐어요. 이제 <b>🥕 재료 · 맛 고르기</b>에서 재료 ${ING_MIN}~${ING_MAX}개와 맛 1~${TASTE_MAX}개를 골라야 문장이 모여요.`;
    return;
  }
  empty.style.display = "none"; pairBlock.style.display = "block";

  const card = document.createElement("div"); card.className = "pcard pcard-dialog";
  const top = document.createElement("div"); top.className = "card-top";
  const left = document.createElement("div"); left.className = "ptag-left";
  const tag = document.createElement("span"); tag.className = "card-tag tag-combo"; tag.textContent = "📌 내가 고른 문장들";
  const title = document.createElement("span"); title.className = "pset-title"; title.textContent = `${f.emoji} ${f.en} (${f.ko})`;
  left.append(tag, title); top.append(left); card.appendChild(top);

  const body = document.createElement("div");
  const rows = introLines().map((l, i) => makeSpeakRow(l.en, l.ko, i, l.tag));
  rows.forEach(r => body.appendChild(r));
  const tools = document.createElement("div"); tools.className = "ptools";
  const note = document.createElement("div"); note.className = "role-note";
  const allBtn = document.createElement("button"); allBtn.className = "btn small"; allBtn.textContent = "🔊 전체 듣기";
  allBtn.addEventListener("click", () => {
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) return;
      const r = rows[i++]; r.classList.add("turn");
      speakThen(r._en, () => setTimeout(step, 250));
    };
    cancelSpeech(); step();
  });
  const presentBtn = document.createElement("button"); presentBtn.className = "btn small primary"; presentBtn.textContent = "🎭 처음부터 끝까지 말하기 (차례로 마이크)";
  let playing = false;
  presentBtn.addEventListener("click", () => {
    if (playing || recBusy) return;
    if (!srSupported) { note.textContent = "이 브라우저는 음성 인식을 지원하지 않아요 (Chrome 권장)"; return; }
    playing = true; presentBtn.disabled = true;
    const scores = [];
    let i = 0;
    const step = () => {
      rows.forEach(r => r.classList.remove("turn"));
      if (i >= rows.length) {
        playing = false; presentBtn.disabled = false;
        const valid = scores.filter(s => s != null);
        const avg = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : 0;
        const stars = avg >= 75 ? "⭐⭐⭐" : avg >= 45 ? "⭐⭐" : "⭐";
        note.textContent = `🎉 다 말했어요! 점수 ${avg}% ${stars} ${avg >= 75 ? "정말 잘했어요!" : "한 번 더 연습해 볼까요?"}`;
        return;
      }
      const r = rows[i]; i++;
      r.classList.add("turn");
      r.scrollIntoView({ behavior: "smooth", block: "center" });
      note.textContent = `🎙️ ${i}줄 차례! "${r._en}" 라고 말해보세요.`;
      r._attempt(s => { scores.push(s); setTimeout(step, 600); });
    };
    step();
  });
  tools.append(allBtn, presentBtn);
  card.append(body, tools, note);
  list.appendChild(card);
  renderPairCard();
}

function renderPairCard() {
  const box = document.getElementById("pair-card");
  box.innerHTML = "";
  const f = findFood(my.food);
  if (!f) return;
  const card = document.createElement("div"); card.className = "pair-card tone-1";
  const head = document.createElement("div"); head.className = "pair-head";
  head.innerHTML = `<span class="card-tag tag-combo">👫 짝 활동</span><span class="pair-emoji">${f.emoji}</span>`;
  card.appendChild(head);
  const me = document.createElement("div"); me.className = "pair-line me";
  me.innerHTML = `<div class="pair-who">🙋 나</div>`;
  introLines().forEach(l => {
    const row = document.createElement("div"); row.className = "pair-en-row";
    const d = document.createElement("div"); d.className = "pair-en"; d.appendChild(buildWords(l.en));
    const sp = document.createElement("button"); sp.className = "speak-btn small"; sp.textContent = "🔊"; sp.setAttribute("aria-label", "이 문장 듣기");
    sp.addEventListener("click", () => speak(l.en));
    row.append(d, sp); me.appendChild(row);
  });
  const friend = document.createElement("div"); friend.className = "pair-line friend";
  friend.innerHTML = `<div class="pair-who">🙆 친구 (Would you like this ${lowerName(f)}?)</div>
    <div class="pair-choice"><span class="pair-ok">○ Yes, please. It looks delicious!</span><span class="pair-no">× No, thanks. I don't like spicy food.</span></div>`;
  const tools = document.createElement("div"); tools.className = "ptools";
  const b1 = document.createElement("button"); b1.className = "btn small primary"; b1.textContent = "🔊 소개글 듣기";
  b1.addEventListener("click", () => speak(introText().replace(/\n/g, " ")));
  const b2 = document.createElement("button"); b2.className = "btn small"; b2.textContent = "🔊 친구 대답 듣기";
  b2.addEventListener("click", () => speak("Yes, please. It looks delicious! ... No, thanks. I don't like spicy food."));
  tools.append(b1, b2);
  card.append(me, friend, tools);
  box.appendChild(card);
}

/* ===========================================================
 * 탭 전환 · 초기화
 * =========================================================== */
function goTab(name) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
  cancelSpeech(); hidePopup();
  if (name === "explore") renderFoods();
  if (name === "build") { lastBuildSpoken = ""; renderBuilder(); }
  if (name === "practice") renderPractice();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
document.querySelectorAll(".tab-btn").forEach(btn => btn.addEventListener("click", () => goTab(btn.dataset.tab)));
document.getElementById("rate").addEventListener("input", e => { speakRate = parseFloat(e.target.value); });

document.querySelectorAll("#desc-level .level-btn").forEach(b => b.classList.toggle("active", b.dataset.level === descLevel));
renderFoods();
renderBuilder();
