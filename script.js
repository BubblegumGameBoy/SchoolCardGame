// ===== Banana Gorilla Skull Game =====
// 7x7 grid card game. Cards are placed RANDOMLY each game.

const COLUMNS = [
  { name: "黄", key: "yellow", css: "var(--yellow)" },
  { name: "赤", key: "red",    css: "var(--red)" },
  { name: "橙", key: "orange", css: "var(--orange)" },
  { name: "青", key: "blue",   css: "var(--blue)" },
  { name: "緑", key: "green",  css: "var(--green)" },
  { name: "紫", key: "purple", css: "var(--purple)" },
  { name: "桃", key: "pink",   css: "var(--pink)" },
];
const SIZE = 7;

// Team colors used for scoreboard dots / swatches
const TEAM_COLORS = ["#ff6b6b", "#54a0ff", "#1dd1a1", "#a55eea"];

// ---- Game state ----
let state = null;

// ---------- Setup screen ----------
const teamCountSel = document.getElementById("team-count");
const teamNamesDiv = document.getElementById("team-names");

function renderTeamNameInputs() {
  const n = parseInt(teamCountSel.value, 10);
  teamNamesDiv.innerHTML = "";
  for (let i = 0; i < n; i++) {
    const row = document.createElement("div");
    row.className = "team-name-row";
    const swatch = document.createElement("span");
    swatch.className = "team-swatch";
    swatch.style.background = TEAM_COLORS[i];
    const input = document.createElement("input");
    input.type = "text";
    input.value = `チーム${i + 1}`;
    input.maxLength = 16;
    input.dataset.index = i;
    row.append(swatch, input);
    teamNamesDiv.appendChild(row);
  }
}
teamCountSel.addEventListener("change", renderTeamNameInputs);
renderTeamNameInputs();

document.getElementById("start-btn").addEventListener("click", startGame);
document.getElementById("reset-btn").addEventListener("click", () => {
  document.getElementById("game-screen").classList.add("hidden");
  document.getElementById("setup-screen").classList.remove("hidden");
});

// ---------- Build a random board ----------
function buildRandomBoard() {
  // 49 cells. Multiset of card values, then shuffled for a random layout.
  const pool = [];
  for (let i = 0; i < 6; i++) pool.push("gorilla");
  for (let i = 0; i < 3; i++) pool.push("skull");
  for (let i = 0; i < 14; i++) pool.push(1);
  for (let i = 0; i < 14; i++) pool.push(2);
  for (let i = 0; i < 12; i++) pool.push(3); // total = 6+3+14+14+12 = 49

  // Fisher-Yates shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const grid = [];
  let idx = 0;
  for (let r = 0; r < SIZE; r++) {
    const rowArr = [];
    for (let c = 0; c < SIZE; c++) {
      rowArr.push({ value: pool[idx++], revealed: false });
    }
    grid.push(rowArr);
  }
  return grid;
}

// ---------- Start ----------
function startGame() {
  const inputs = [...teamNamesDiv.querySelectorAll("input")];
  const teams = inputs.map((inp, i) => ({
    name: inp.value.trim() || `チーム${i + 1}`,
    color: TEAM_COLORS[i],
    score: 0,
  }));

  state = {
    teams,
    current: 0,
    grid: buildRandomBoard(),
    remaining: SIZE * SIZE,
    selRow: null,
    selCol: null,
    locked: false, // input lock during animations / modal
  };

  document.getElementById("setup-screen").classList.add("hidden");
  document.getElementById("game-screen").classList.remove("hidden");

  renderBoard();
  renderScoreboard();
  updateTurnBanner();
}

// ---------- Render board ----------
function renderBoard() {
  const board = document.getElementById("board");
  board.innerHTML = "";

  // Header row (color columns)
  const headRow = document.createElement("tr");
  const corner = document.createElement("th");
  corner.className = "corner";
  headRow.appendChild(corner);
  COLUMNS.forEach((col, c) => {
    const th = document.createElement("th");
    const btn = document.createElement("button");
    btn.className = "col-head";
    btn.style.background = col.css;
    btn.textContent = col.name;
    btn.dataset.col = c;
    btn.addEventListener("click", () => selectCol(c));
    th.appendChild(btn);
    headRow.appendChild(th);
  });
  board.appendChild(headRow);

  // Body rows
  for (let r = 0; r < SIZE; r++) {
    const tr = document.createElement("tr");
    const rowTh = document.createElement("th");
    const rowBtn = document.createElement("button");
    rowBtn.className = "row-head";
    rowBtn.textContent = r + 1;
    rowBtn.dataset.row = r;
    rowBtn.addEventListener("click", () => selectRow(r));
    rowTh.appendChild(rowBtn);
    tr.appendChild(rowTh);

    for (let c = 0; c < SIZE; c++) {
      const td = document.createElement("td");
      const cell = state.grid[r][c];
      const div = document.createElement("div");
      div.className = "card";
      div.dataset.row = r;
      div.dataset.col = c;
      if (cell.revealed) {
        applyRevealedFace(div, cell.value);
      } else {
        div.innerHTML = '<span class="back">❓</span>';
      }
      td.appendChild(div);
      tr.appendChild(td);
    }
    board.appendChild(tr);
  }
}

function faceFor(value) {
  if (value === "skull") return { html: "💀", cls: "skull" };
  if (value === "gorilla") return { html: "🦍", cls: "gorilla" };
  const bananas = "🍌".repeat(value);
  return { html: `<span class="face">${bananas}<span class="pts-label">${value}点</span></span>`, cls: "" };
}

function applyRevealedFace(div, value) {
  const f = faceFor(value);
  div.classList.add("revealed");
  if (f.cls) div.classList.add(f.cls);
  div.innerHTML = f.html;
}

// ---------- Selection ----------
function selectRow(r) {
  if (state.locked) return;
  state.selRow = r;
  highlightSelections();
  tryReveal();
}
function selectCol(c) {
  if (state.locked) return;
  state.selCol = c;
  highlightSelections();
  tryReveal();
}

function highlightSelections() {
  document.querySelectorAll(".row-head").forEach((el) =>
    el.classList.toggle("selected", parseInt(el.dataset.row, 10) === state.selRow)
  );
  document.querySelectorAll(".col-head").forEach((el) =>
    el.classList.toggle("selected", parseInt(el.dataset.col, 10) === state.selCol)
  );
}

function tryReveal() {
  if (state.selRow === null || state.selCol === null) return;
  const r = state.selRow, c = state.selCol;
  const cell = state.grid[r][c];

  if (cell.revealed) {
    flashBanner("そのカードはもうめくられています！別のマスを選んでね。");
    // keep selections so players can change one of them
    return;
  }

  state.locked = true;
  cell.revealed = true;
  state.remaining--;

  const cardDiv = document.querySelector(`.card[data-row="${r}"][data-col="${c}"]`);
  applyRevealedFace(cardDiv, cell.value);
  cardDiv.classList.add("flip");

  setTimeout(() => resolveCard(cell.value), 450);
}

// ---------- Card effects ----------
function resolveCard(value) {
  const team = state.teams[state.current];

  if (value === "skull") {
    team.score = 0;
    renderScoreboard();
    showMessage("💀 スカル！", `${team.name} の得点が 0 にリセットされました…！`, endTurn);
    return;
  }

  if (value === "gorilla") {
    handleGorilla();
    return;
  }

  // banana points
  team.score += value;
  renderScoreboard();
  endTurn();
}

function handleGorilla() {
  const current = state.current;
  const opponents = state.teams
    .map((t, i) => ({ t, i }))
    .filter((o) => o.i !== current);

  // Opponents that actually have points worth stealing
  const withPoints = opponents.filter((o) => o.t.score > 0);

  if (withPoints.length === 0) {
    showMessage("🦍 ゴリラ！", "でも奪える得点を持っている相手がいません。残念！", endTurn);
    return;
  }

  if (withPoints.length === 1) {
    doSteal(withPoints[0].i);
    return;
  }

  // More than one stealable opponent -> let active team choose
  showChoices(
    "🦍 ゴリラ！ どのチームから奪う？",
    `${state.teams[current].name} は、相手チームの得点を全て奪えます！`,
    withPoints.map((o) => ({
      label: `${o.t.name}（${o.t.score}点）`,
      color: o.t.color,
      onPick: () => doSteal(o.i),
    }))
  );
}

function doSteal(targetIndex) {
  const team = state.teams[state.current];
  const target = state.teams[targetIndex];
  const stolen = target.score;
  team.score += stolen;
  target.score = 0;
  renderScoreboard();
  showMessage(
    "🦍 ゴリラ！",
    `${team.name} が ${target.name} から ${stolen}点 を奪いました！`,
    endTurn
  );
}

// ---------- Turn flow ----------
function endTurn() {
  state.selRow = null;
  state.selCol = null;
  highlightSelections();

  if (state.remaining <= 0) {
    gameOver();
    return;
  }

  state.current = (state.current + 1) % state.teams.length;
  state.locked = false;
  renderScoreboard();
  updateTurnBanner();
}

function updateTurnBanner() {
  const team = state.teams[state.current];
  const banner = document.getElementById("turn-banner");
  banner.innerHTML =
    `▶ <span style="color:${team.color}">${team.name}</span> の番 — ` +
    `Player A: 行（数字）／ Player B: 色 を選んでカードをめくろう！`;
}

let bannerTimer = null;
function flashBanner(msg) {
  const banner = document.getElementById("turn-banner");
  banner.textContent = msg;
  clearTimeout(bannerTimer);
  bannerTimer = setTimeout(updateTurnBanner, 1800);
}

// ---------- Scoreboard ----------
function renderScoreboard() {
  const sb = document.getElementById("scoreboard");
  sb.innerHTML = "";
  state.teams.forEach((t, i) => {
    const chip = document.createElement("div");
    chip.className = "score-chip" + (i === state.current ? " active" : "");
    chip.innerHTML =
      `<span class="dot" style="background:${t.color}"></span>` +
      `<span class="nm">${escapeHtml(t.name)}</span>` +
      `<span class="pts">🍌 ${t.score}</span>`;
    sb.appendChild(chip);
  });
}

// ---------- Game over ----------
function gameOver() {
  const max = Math.max(...state.teams.map((t) => t.score));
  const winners = state.teams.filter((t) => t.score === max);
  let title, body;
  if (winners.length === 1) {
    title = `🏆 ${winners[0].name} の勝ち！`;
    body = `${winners[0].name} が ${max}点 で優勝しました！おめでとう！🎉`;
  } else {
    title = "🤝 引き分け！";
    body = `${winners.map((w) => w.name).join("・")} が ${max}点 で同点でした！`;
  }
  showMessage(title, body, () => {
    document.getElementById("game-screen").classList.add("hidden");
    document.getElementById("setup-screen").classList.remove("hidden");
  });
}

// ---------- Modal ----------
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalChoices = document.getElementById("modal-choices");
const modalClose = document.getElementById("modal-close");

function showMessage(title, body, onClose) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modalChoices.innerHTML = "";
  modalClose.classList.remove("hidden");
  modal.classList.remove("hidden");
  modalClose.onclick = () => {
    modal.classList.add("hidden");
    if (onClose) onClose();
  };
}

function showChoices(title, body, choices) {
  modalTitle.textContent = title;
  modalBody.textContent = body;
  modalChoices.innerHTML = "";
  modalClose.classList.add("hidden");
  choices.forEach((ch) => {
    const btn = document.createElement("button");
    btn.className = "btn btn-primary";
    btn.textContent = ch.label;
    if (ch.color) {
      btn.style.background = ch.color;
      btn.style.boxShadow = "none";
    }
    btn.onclick = () => {
      modal.classList.add("hidden");
      ch.onPick();
    };
    modalChoices.appendChild(btn);
  });
  modal.classList.remove("hidden");
}

// ---------- Utils ----------
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch])
  );
}
