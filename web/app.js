// ============================================================
// CONSTANTS
// ============================================================

const TABS = {
  player: [
    { id: "dashboard", label: "DASHBOARD" },
    { id: "inventory", label: "INVENTORY" },
    { id: "logs",      label: "LOGS" },
    { id: "notes",     label: "NOTES" },
  ],
  dm: [
    { id: "dashboard", label: "DASHBOARD" },
    { id: "party",     label: "PARTY" },
    { id: "combat",    label: "COMBAT" },
    { id: "loot",      label: "LOOT" },
  ],
};

// 5e 2024 — 18 standard skills, mapped to their governing ability.
const SKILLS = {
  "Acrobatics": "DEX", "Animal Handling": "WIS", "Arcana": "INT",
  "Athletics": "STR",  "Deception": "CHA",       "History": "INT",
  "Insight": "WIS",    "Intimidation": "CHA",    "Investigation": "INT",
  "Medicine": "WIS",   "Nature": "INT",          "Perception": "WIS",
  "Performance": "CHA","Persuasion": "CHA",      "Religion": "INT",
  "Sleight of Hand": "DEX", "Stealth": "DEX",    "Survival": "WIS",
};

const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];

const CLASSES = [
  "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
  "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
];

// Casting stat per class. Non-casters omitted.
const CASTING_ABILITY = {
  "Bard": "CHA", "Cleric": "WIS", "Druid": "WIS",
  "Sorcerer": "CHA", "Wizard": "INT",
  "Paladin": "CHA", "Ranger": "WIS",
  "Warlock": "CHA",
};

// Proficiency bonus by character level (1-20).
const PB_TABLE = [2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,6,6,6,6];

// Full caster spell slots (Bard/Cleric/Druid/Sorcerer/Wizard).
// Index 0 = level 1. Each row = [1st, 2nd, 3rd, 4th, 5th, 6th, 7th, 8th, 9th].
const FULL_CASTER_SLOTS = [
  [2,0,0,0,0,0,0,0,0],
  [3,0,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0],
  [4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],
  [4,3,3,0,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0],
  [4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],
  [4,3,3,3,2,0,0,0,0],
  [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,0,0,0],
  [4,3,3,3,2,1,1,0,0],
  [4,3,3,3,2,1,1,0,0],
  [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,0],
  [4,3,3,3,2,1,1,1,1],
  [4,3,3,3,3,1,1,1,1],
  [4,3,3,3,3,2,1,1,1],
  [4,3,3,3,3,2,2,1,1],
];

// Half caster spell slots (Paladin/Ranger). No slots at level 1.
const HALF_CASTER_SLOTS = [
  [0,0,0,0,0],
  [2,0,0,0,0],
  [3,0,0,0,0],
  [3,0,0,0,0],
  [4,2,0,0,0],
  [4,2,0,0,0],
  [4,3,0,0,0],
  [4,3,0,0,0],
  [4,3,2,0,0],
  [4,3,2,0,0],
  [4,3,3,0,0],
  [4,3,3,0,0],
  [4,3,3,1,0],
  [4,3,3,1,0],
  [4,3,3,2,0],
  [4,3,3,2,0],
  [4,3,3,3,1],
  [4,3,3,3,1],
  [4,3,3,3,2],
  [4,3,3,3,2],
];

// Warlock pact slots. Each row = [slot_level, count].
const PACT_SLOTS = [
  [1,1], [1,2], [2,2], [2,2], [3,2], [3,2], [4,2], [4,2], [5,2], [5,2],
  [5,3], [5,3], [5,3], [5,3], [5,3], [5,3], [5,4], [5,4], [5,4], [5,4],
];

const ARMOR_TYPES = [
  { id: "unarmored",  label: "Unarmored (10 + DEX)" },
  { id: "light",      label: "Light (base + DEX)" },
  { id: "medium",     label: "Medium (base + min DEX 2)" },
  { id: "heavy",      label: "Heavy (base, no DEX)" },
  { id: "natural",    label: "Natural (base + DEX)" },
  { id: "monk",       label: "Monk (10 + DEX + WIS)" },
  { id: "barbarian",  label: "Barbarian (10 + DEX + CON)" },
  { id: "draconic",   label: "Draconic (13 + DEX)" },
];

// ============================================================
// STATE
// ============================================================

let settings = { mode: "player" };
let character = null;
let activeView = "dashboard";
let configMode = false;
let portraitDataUrl = null;

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Render eagerly with defaults so the preview panel works without pywebview.
  character = createDefaultCharacter();
  renderTabs();
  setActiveView("dashboard");
  wireSettingsButton();
  wireModeSwitch();
  wireUpdateButton();
  renderDashboard();
});

window.addEventListener("pywebviewready", async () => {
  await loadVersion();
  await loadSettings();
  await loadCharacter();
  await loadPortrait();
  renderTabs();
  setActiveView(activeView);
  renderDashboard();
});

function createDefaultCharacter() {
  const skills = {};
  Object.keys(SKILLS).forEach(s => { skills[s] = "none"; });
  return {
    name: "", origin: "", class: "", subclass: "", level: 1,
    icon_filename: null,
    abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    saves_proficient: [],
    skills,
    speed: 30,
    armor: { type: "unarmored", base_ac: 10, shield: false, misc_bonus: 0 },
    hp: { current: 8, max: 8, temp: 0 },
    spell_slots: {},
    pact_slots: null,
    actions: [],
    action_economy: { Action: true, Bonus: true, Reaction: true, Movement: true, Object: true },
    proficiencies: { armor: "", weapons: "", tools: "", languages: "" },
  };
}

// ============================================================
// SETTINGS / VERSION / UPDATES (existing)
// ============================================================

async function loadSettings() {
  try {
    const s = await window.pywebview.api.get_settings();
    if (s && typeof s === "object") settings = s;
  } catch (e) {}
  if (settings.mode !== "player" && settings.mode !== "dm") settings.mode = "player";
}

async function saveSettings() {
  try { await window.pywebview.api.save_settings(settings); } catch (e) {}
}

async function loadVersion() {
  try {
    const v = await window.pywebview.api.get_version();
    const text = "v" + v;
    document.getElementById("version").textContent = text;
    document.getElementById("settings-version").textContent = text;
  } catch (e) {
    document.getElementById("version").textContent = "v?.?.?";
  }
}

// ============================================================
// CHARACTER LOAD/SAVE
// ============================================================

async function loadCharacter() {
  try {
    const c = await window.pywebview.api.get_character();
    if (c && typeof c === "object") character = c;
  } catch (e) {}
  if (!character) character = createDefaultCharacter();
  // Always rebuild spell slots after load so changing class outside the app
  // (manual edit) is reflected, and capacity matches current class+level.
  rebuildSpellSlots(character);
}

async function saveCharacter() {
  try { await window.pywebview.api.save_character(character); } catch (e) {}
}

async function loadPortrait() {
  if (!character.icon_filename) { portraitDataUrl = null; return; }
  try {
    portraitDataUrl = await window.pywebview.api.get_portrait_data(character.icon_filename);
  } catch (e) { portraitDataUrl = null; }
}

// ============================================================
// 5E MATH HELPERS
// ============================================================

function abilityMod(score) { return Math.floor((Number(score) - 10) / 2); }

function profBonus(level) {
  const lv = Math.max(1, Math.min(20, Number(level) || 1));
  return PB_TABLE[lv - 1];
}

function fmtMod(n) { return (n >= 0 ? "+" : "") + n; }

function calcAC(c) {
  const dex = abilityMod(c.abilities.DEX);
  const wis = abilityMod(c.abilities.WIS);
  const con = abilityMod(c.abilities.CON);
  const a = c.armor || {};
  const base = Number(a.base_ac) || 10;
  const misc = Number(a.misc_bonus) || 0;
  const shield = a.shield ? 2 : 0;
  let ac;
  switch (a.type) {
    case "light":     ac = base + dex; break;
    case "medium":    ac = base + Math.min(dex, 2); break;
    case "heavy":     ac = base; break;
    case "natural":   ac = base + dex; break;
    case "monk":      ac = 10 + dex + wis; break;
    case "barbarian": ac = 10 + dex + con; break;
    case "draconic":  ac = 13 + dex; break;
    case "unarmored":
    default:          ac = 10 + dex; break;
  }
  return ac + shield + misc;
}

function calcSaveMod(c, ability) {
  const base = abilityMod(c.abilities[ability]);
  const prof = (c.saves_proficient || []).includes(ability) ? profBonus(c.level) : 0;
  return base + prof;
}

function calcSkillMod(c, skill) {
  const ability = SKILLS[skill];
  const base = abilityMod(c.abilities[ability]);
  const state = (c.skills || {})[skill] || "none";
  const pb = profBonus(c.level);
  if (state === "expertise") return base + pb * 2;
  if (state === "proficient") return base + pb;
  return base;
}

function calcPassive(c, skill) { return 10 + calcSkillMod(c, skill); }

function calcSpellDC(c) {
  const ab = CASTING_ABILITY[c.class];
  if (!ab) return null;
  return 8 + profBonus(c.level) + abilityMod(c.abilities[ab]);
}

function calcSpellAttack(c) {
  const ab = CASTING_ABILITY[c.class];
  if (!ab) return null;
  return profBonus(c.level) + abilityMod(c.abilities[ab]);
}

function rebuildSpellSlots(c) {
  const lv = Math.max(1, Math.min(20, Number(c.level) || 1));
  const cls = c.class;
  let table = null;
  if (["Bard","Cleric","Druid","Sorcerer","Wizard"].includes(cls)) {
    table = FULL_CASTER_SLOTS[lv - 1];
  } else if (["Paladin","Ranger"].includes(cls)) {
    table = HALF_CASTER_SLOTS[lv - 1];
  }
  const newSlots = {};
  if (table) {
    table.forEach((max, i) => {
      if (max > 0) {
        const slotLevel = String(i + 1);
        const prevUsed = (c.spell_slots[slotLevel] || {}).used || 0;
        newSlots[slotLevel] = { max, used: Math.min(prevUsed, max) };
      }
    });
  }
  c.spell_slots = newSlots;

  if (cls === "Warlock") {
    const [slotLv, count] = PACT_SLOTS[lv - 1];
    const prevUsed = (c.pact_slots || {}).used || 0;
    c.pact_slots = { level: slotLv, max: count, used: Math.min(prevUsed, count) };
  } else {
    c.pact_slots = null;
  }
}

// ============================================================
// TAB / VIEW SWITCHING (existing + config-mode handling)
// ============================================================

function renderTabs() {
  const container = document.getElementById("tabs");
  if (!container) return;
  container.innerHTML = "";
  for (const t of TABS[settings.mode]) {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.dataset.view = t.id;
    btn.textContent = t.label;
    btn.addEventListener("click", () => setActiveView(t.id));
    container.appendChild(btn);
  }
}

function setActiveView(viewId) {
  const allowed = TABS[settings.mode].map(t => t.id);
  if (viewId !== "settings" && !allowed.includes(viewId)) viewId = "dashboard";
  // Leaving the dashboard exits config mode (already auto-saved on every edit).
  if (configMode && viewId !== "dashboard") {
    configMode = false;
    renderDashboard();
  }
  activeView = viewId;

  document.querySelectorAll(".tab").forEach(t => {
    t.classList.toggle("active", t.dataset.view === viewId);
  });
  document.querySelectorAll(".view").forEach(v => {
    v.classList.toggle("active", v.dataset.view === viewId);
  });
  const sb = document.getElementById("open-settings");
  if (sb) sb.classList.toggle("active", viewId === "settings");

  document.querySelectorAll(".mode-option").forEach(o => {
    o.classList.toggle("active", o.dataset.mode === settings.mode);
  });
}

function wireSettingsButton() {
  const btn = document.getElementById("open-settings");
  if (!btn) return;
  btn.addEventListener("click", () => setActiveView("settings"));
}

function wireModeSwitch() {
  const sw = document.getElementById("mode-switch");
  if (!sw) return;
  sw.querySelectorAll(".mode-option").forEach(opt => {
    opt.addEventListener("click", async () => {
      const newMode = opt.dataset.mode;
      if (newMode === settings.mode) return;
      settings.mode = newMode;
      await saveSettings();
      renderTabs();
      setActiveView("settings");
    });
  });
}

// ============================================================
// DASHBOARD RENDER
// ============================================================

function renderDashboard() {
  const dash = document.getElementById("dashboard");
  if (!dash) return;
  dash.classList.toggle("config-mode", configMode);
  dash.innerHTML = renderDashboardHTML(character);
  wireDashboard();
}

function renderDashboardHTML(c) {
  return `
    <div class="config-banner">
      CONFIG MODE
      <button class="btn tiny" id="exit-config">DONE</button>
    </div>

    <div class="dash-portrait" id="portrait">
      ${renderPortraitInner(c)}
    </div>

    <div class="dash-identity">
      ${renderIdentity(c)}
      <div class="ability-row">
        ${ABILITIES.map(a => renderAbility(c, a)).join("")}
      </div>
    </div>

    <div class="dash-combat-stats">
      ${renderCombatStats(c)}
    </div>

    <div class="dash-health">
      ${renderHealthModule(c)}
    </div>

    <div class="dash-bottom">
      <div class="bottom-col">
        <div class="panel">
          <div class="panel-header">SAVING THROWS</div>
          ${renderSavingThrows(c)}
        </div>
        <div class="panel">
          <div class="panel-header">PASSIVES</div>
          ${renderPassives(c)}
        </div>
        <div class="panel">
          <div class="panel-header">PROFICIENCIES</div>
          ${renderProficiencies(c)}
        </div>
      </div>
      <div class="bottom-col">
        <div class="panel" style="flex:1;">
          <div class="panel-header">SKILLS</div>
          ${renderSkills(c)}
        </div>
      </div>
      <div class="bottom-col">
        <div class="panel" style="flex:1;">
          <div class="panel-header">ACTIONS</div>
          ${renderActions(c)}
        </div>
      </div>
    </div>
  `;
}

// ----- portrait -----
function renderPortraitInner(c) {
  if (portraitDataUrl) {
    return `<img src="${portraitDataUrl}" alt="portrait" />
            <div class="portrait-hint">${configMode ? "CLICK TO CHANGE" : "CLICK TO EDIT"}</div>`;
  }
  const initial = (c.name || "?").trim().charAt(0).toUpperCase() || "?";
  return `<div class="portrait-placeholder">${escapeHtml(initial)}</div>
          <div class="portrait-hint">${configMode ? "CLICK TO UPLOAD" : "CLICK TO EDIT"}</div>`;
}

// ----- identity -----
function renderIdentity(c) {
  if (configMode) {
    return `
      <div class="char-name">
        <input id="cfg-name" type="text" placeholder="Character Name" value="${escapeHtml(c.name)}" />
      </div>
      <div class="char-meta">
        <input id="cfg-origin" class="meta-origin" type="text" placeholder="Origin" value="${escapeHtml(c.origin)}" />
        <select id="cfg-class" class="meta-class">
          <option value="">(class)</option>
          ${CLASSES.map(cl => `<option value="${cl}" ${c.class === cl ? "selected" : ""}>${cl}</option>`).join("")}
        </select>
        <input id="cfg-subclass" class="meta-subclass" type="text" placeholder="Subclass" value="${escapeHtml(c.subclass)}" />
        <input id="cfg-level" class="meta-level" type="number" min="1" max="20" value="${c.level}" />
      </div>
    `;
  }
  const nameDisplay = c.name
    ? escapeHtml(c.name)
    : `<span class="placeholder">Click portrait to set up</span>`;
  const metaParts = [];
  if (c.origin) metaParts.push(escapeHtml(c.origin));
  if (c.class) metaParts.push(escapeHtml(c.class) + (c.subclass ? "/" + escapeHtml(c.subclass) : ""));
  metaParts.push("Lv " + c.level);
  return `
    <div class="char-name">${nameDisplay}</div>
    <div class="char-meta">${metaParts.join(" · ")}</div>
  `;
}

// ----- ability boxes -----
function renderAbility(c, ab) {
  const score = c.abilities[ab];
  const mod = abilityMod(score);
  if (configMode) {
    return `
      <div class="ability-box">
        <div class="ability-label">${ab}</div>
        <input data-ab="${ab}" class="cfg-ability" type="number" min="1" max="30" value="${score}" />
        <div class="ability-score">${fmtMod(mod)}</div>
      </div>
    `;
  }
  return `
    <div class="ability-box">
      <div class="ability-label">${ab}</div>
      <div class="ability-mod">${fmtMod(mod)}</div>
      <div class="ability-score">${score}</div>
    </div>
  `;
}

// ----- combat stat boxes (PB / Speed / Init / AC) -----
function renderCombatStats(c) {
  const pb = profBonus(c.level);
  const init = abilityMod(c.abilities.DEX);
  const ac = calcAC(c);
  if (configMode) {
    return `
      <div class="stat-box">
        <div class="stat-label">PROF BONUS</div>
        <div class="stat-value">${fmtMod(pb)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">SPEED</div>
        <input id="cfg-speed" type="number" min="0" value="${c.speed}" />
      </div>
      <div class="stat-box">
        <div class="stat-label">INITIATIVE</div>
        <div class="stat-value">${fmtMod(init)}</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">ARMOR CLASS</div>
        <div class="stat-value">${ac}</div>
      </div>
    `;
  }
  return `
    <div class="stat-box">
      <div class="stat-label">PROF BONUS</div>
      <div class="stat-value">${fmtMod(pb)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">SPEED</div>
      <div class="stat-value">${c.speed}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">INITIATIVE</div>
      <div class="stat-value">${fmtMod(init)}</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">ARMOR CLASS</div>
      <div class="stat-value">${ac}</div>
    </div>
  `;
}

// ----- health module -----
function renderHealthModule(c) {
  const cur = c.hp.current;
  const max = c.hp.max;
  const temp = c.hp.temp || 0;
  const ratio = max > 0 ? cur / max : 0;
  const hpClass = ratio <= 0.25 ? "critical" : ratio <= 0.5 ? "low" : "";
  const widthPct = Math.max(0, Math.min(100, ratio * 100));

  const maxField = configMode
    ? `<input id="cfg-hp-max" type="number" min="1" value="${max}" />`
    : max;

  return `
    <div class="health-header">
      <span>HEALTH MODULE</span>
      ${configMode ? "" : `<span class="subtle">${c.class ? escapeHtml(c.class) : ""}</span>`}
    </div>
    <div class="health-numbers">
      <span class="hp-current ${hpClass}">${cur}</span>
      <span class="hp-sep">/</span>
      <span class="hp-max">${maxField}</span>
      ${temp > 0 ? `<span class="hp-temp">+${temp} TEMP</span>` : ""}
    </div>
    <div class="hp-bar">
      <div class="hp-bar-fill ${hpClass}" style="width:${widthPct}%"></div>
    </div>
    ${configMode ? "" : `
      <div class="health-actions">
        <input id="hp-amount" type="number" min="0" placeholder="0" />
        <button class="btn danger" id="hp-harm">HARM</button>
        <button class="btn success" id="hp-heal">HEAL</button>
        <button class="btn warn" id="hp-temp-btn">TEMP</button>
      </div>
      <div class="rest-buttons">
        <button class="btn" id="short-rest">SHORT REST</button>
        <button class="btn magenta" id="long-rest">LONG REST</button>
      </div>
    `}
    ${configMode ? renderArmorConfig(c) : ""}
  `;
}

function renderArmorConfig(c) {
  const a = c.armor || {};
  return `
    <div style="margin-top:8px; padding-top:8px; border-top:1px solid #1a1a2e; display:flex; flex-direction:column; gap:6px;">
      <div class="row-label" style="margin-bottom:2px;">ARMOR</div>
      <select id="cfg-armor-type">
        ${ARMOR_TYPES.map(t => `<option value="${t.id}" ${a.type === t.id ? "selected" : ""}>${t.label}</option>`).join("")}
      </select>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        <label style="font-size:10px; color:#8a7a9a; letter-spacing:0.1em;">
          BASE AC
          <input id="cfg-armor-base" type="number" min="0" value="${a.base_ac}" style="width:100%; background:#0a0a14; border:1px solid #1a1a2e; color:#e6e0f0; padding:4px;" />
        </label>
        <label style="font-size:10px; color:#8a7a9a; letter-spacing:0.1em;">
          MISC +
          <input id="cfg-armor-misc" type="number" value="${a.misc_bonus}" style="width:100%; background:#0a0a14; border:1px solid #1a1a2e; color:#e6e0f0; padding:4px;" />
        </label>
      </div>
      <label style="font-size:11px; color:#e6e0f0; display:flex; align-items:center; gap:6px;">
        <input id="cfg-armor-shield" type="checkbox" ${a.shield ? "checked" : ""} /> Shield (+2)
      </label>
    </div>
  `;
}

// ----- saving throws -----
function renderSavingThrows(c) {
  const rows = ABILITIES.map(ab => {
    const prof = (c.saves_proficient || []).includes(ab);
    const mod = calcSaveMod(c, ab);
    const dotClass = prof ? "proficient" : "";
    const clickAttr = configMode ? `data-save="${ab}"` : "";
    const cursor = configMode ? "cursor:pointer;" : "cursor:default;";
    return `
      <div class="save-row">
        <div class="prof-dot ${dotClass}" ${clickAttr} style="${cursor}"></div>
        <div class="skill-name">${ab}</div>
        <div class="skill-mod">${fmtMod(mod)}</div>
        <div></div>
      </div>
    `;
  }).join("");
  return `<div class="saves-list">${rows}</div>`;
}

// ----- skills -----
function renderSkills(c) {
  const rows = Object.keys(SKILLS).sort().map(skill => {
    const ability = SKILLS[skill];
    const state = (c.skills || {})[skill] || "none";
    const mod = calcSkillMod(c, skill);
    const dotClass = state === "expertise" ? "expertise" : state === "proficient" ? "proficient" : "";
    const clickAttr = configMode ? `data-skill="${skill}"` : "";
    const cursor = configMode ? "cursor:pointer;" : "cursor:default;";
    return `
      <div class="skill-row">
        <div class="prof-dot ${dotClass}" ${clickAttr} style="${cursor}"></div>
        <div class="skill-name">${skill}</div>
        <div class="skill-mod">${fmtMod(mod)}</div>
        <div class="skill-stat">${ability}</div>
      </div>
    `;
  }).join("");
  const legend = configMode
    ? `<div class="subtle" style="margin-top:8px; font-size:10px; text-align:center;">click dot to cycle: none → proficient → expertise</div>`
    : "";
  return `<div class="skills-list">${rows}</div>${legend}`;
}

// ----- passives -----
function renderPassives(c) {
  const items = ["Perception", "Investigation", "Insight"].map(skill => `
    <div class="passive-row">
      <div class="passive-name">${skill.toUpperCase()}</div>
      <div class="passive-value">${calcPassive(c, skill)}</div>
    </div>
  `).join("");
  return `<div class="passives-list">${items}</div>`;
}

// ----- proficiencies -----
function renderProficiencies(c) {
  const fields = [
    ["armor", "ARMOR"], ["weapons", "WEAPONS"],
    ["tools", "TOOLS"], ["languages", "LANGUAGES"]
  ];
  const rows = fields.map(([key, label]) => {
    const val = (c.proficiencies || {})[key] || "";
    if (configMode) {
      return `
        <div class="prof-row">
          <div class="prof-label">${label}</div>
          <textarea data-prof="${key}" placeholder="comma-separated">${escapeHtml(val)}</textarea>
        </div>
      `;
    }
    return `
      <div class="prof-row">
        <div class="prof-label">${label}</div>
        <div class="prof-text ${val ? "" : "prof-text-empty"}">${val ? escapeHtml(val) : "(none)"}</div>
      </div>
    `;
  }).join("");
  return `<div class="profs-list">${rows}</div>`;
}

// ----- actions block -----
function renderActions(c) {
  let html = "";

  // Spell slots
  const slots = c.spell_slots || {};
  const slotLevels = Object.keys(slots).sort((a, b) => Number(a) - Number(b));
  if (slotLevels.length > 0 || c.pact_slots) {
    html += `<div class="actions-section">
      <div class="actions-section-header">SPELL SLOTS</div>`;
    if (CASTING_ABILITY[c.class]) {
      const dc = calcSpellDC(c);
      const atk = calcSpellAttack(c);
      html += `<div class="subtle" style="font-size:10px; margin-bottom:6px;">
        DC ${dc} · ATK ${fmtMod(atk)} (${CASTING_ABILITY[c.class]})
      </div>`;
    }
    slotLevels.forEach(lv => {
      const s = slots[lv];
      let pips = "";
      for (let i = 0; i < s.max; i++) {
        const used = i < s.used;
        pips += `<button class="slot-pip ${used ? "used" : ""}" data-slot-level="${lv}" data-slot-idx="${i}"></button>`;
      }
      html += `<div class="slot-group">
        <div class="slot-level">${ordinal(Number(lv))}</div>
        <div class="slot-pips">${pips}</div>
      </div>`;
    });
    if (c.pact_slots) {
      let pips = "";
      for (let i = 0; i < c.pact_slots.max; i++) {
        const used = i < c.pact_slots.used;
        pips += `<button class="slot-pip ${used ? "used" : ""}" data-pact-idx="${i}"></button>`;
      }
      html += `<div class="slot-group" style="margin-top:6px;">
        <div class="slot-level" style="color:#ff2a8a;">PACT ${ordinal(c.pact_slots.level)}</div>
        <div class="slot-pips">${pips}</div>
      </div>`;
    }
    html += `</div>`;
  }

  // Action economy
  html += `<div class="actions-section">
    <div class="actions-section-header" style="display:flex; justify-content:space-between; align-items:center;">
      <span>ACTION ECONOMY</span>
      <button class="btn tiny" id="econ-reset">RESET</button>
    </div>
    <div class="economy-row">
      ${["Action","Bonus","Reaction","Movement","Object"].map(k => `
        <button class="economy-pill ${c.action_economy[k] ? "" : "used"}" data-econ="${k}">${k.toUpperCase()}</button>
      `).join("")}
    </div>
  </div>`;

  // Attacks list, grouped by type
  html += `<div class="actions-section">
    <div class="actions-section-header">ATTACKS &amp; ABILITIES</div>`;
  const groups = ["Action", "Bonus", "Reaction"];
  groups.forEach(group => {
    const items = (c.actions || []).filter(a => a.action_type === group);
    if (items.length === 0 && !configMode) return;
    if (items.length > 0) {
      html += `<div class="subtle" style="font-size:9px; margin:6px 0 4px; letter-spacing:0.18em;">${group.toUpperCase()}</div>`;
      html += `<div class="attacks-list">`;
      items.forEach(a => {
        if (configMode) {
          html += `
            <div class="attack-row" data-action-id="${a.id}">
              <input class="attack-name-input" data-field="name" type="text" value="${escapeHtml(a.name)}" placeholder="Name" />
              <input data-field="hit_mod" type="number" value="${a.hit_mod}" />
              <input data-field="damage" type="text" value="${escapeHtml(a.damage)}" placeholder="1d8+3" />
              <select data-field="action_type">
                ${["Action","Bonus","Reaction"].map(t => `<option value="${t}" ${a.action_type === t ? "selected" : ""}>${t}</option>`).join("")}
              </select>
              <button class="attack-delete" data-delete-action="${a.id}" title="delete">×</button>
            </div>
          `;
        } else {
          html += `
            <div class="attack-row">
              <div class="attack-name">${escapeHtml(a.name)}</div>
              <div class="attack-hit">${fmtMod(Number(a.hit_mod) || 0)}</div>
              <div class="attack-damage">${escapeHtml(a.damage) || "—"}</div>
              <div class="attack-type">${a.action_type.toUpperCase()}</div>
              <div></div>
            </div>
          `;
        }
      });
      html += `</div>`;
    }
  });
  if (configMode) {
    html += `
      <div class="add-attack-row">
        <select id="add-attack-type">
          <option value="Action">Action</option>
          <option value="Bonus">Bonus</option>
          <option value="Reaction">Reaction</option>
        </select>
        <button class="btn tiny" id="add-attack">+ ADD</button>
      </div>
    `;
  }
  if ((c.actions || []).length === 0 && !configMode) {
    html += `<div class="subtle" style="font-size:11px; margin-top:6px;">No actions defined. Click portrait to enter config mode.</div>`;
  }
  html += `</div>`;

  return html;
}

function ordinal(n) {
  const suf = ["th","st","nd","rd"];
  const v = n % 100;
  return n + (suf[(v - 20) % 10] || suf[v] || suf[0]);
}

// ============================================================
// DASHBOARD WIRING
// ============================================================

function wireDashboard() {
  const portrait = document.getElementById("portrait");
  if (portrait) {
    portrait.addEventListener("click", onPortraitClick);
  }
  const exitBtn = document.getElementById("exit-config");
  if (exitBtn) {
    exitBtn.addEventListener("click", () => {
      configMode = false;
      renderDashboard();
    });
  }

  if (configMode) wireConfigInputs();
  else wireViewInteractions();
}

async function onPortraitClick() {
  if (!configMode) {
    configMode = true;
    renderDashboard();
    return;
  }
  // In config mode, click → upload new portrait.
  try {
    const r = await window.pywebview.api.pick_portrait();
    if (r && r.ok) {
      character.icon_filename = r.filename;
      portraitDataUrl = r.data_url;
      await saveCharacter();
      renderDashboard();
    }
  } catch (e) {}
}

function wireConfigInputs() {
  // Identity
  bindInput("cfg-name", "input", v => character.name = v);
  bindInput("cfg-origin", "input", v => character.origin = v);
  bindInput("cfg-subclass", "input", v => character.subclass = v);
  bindInput("cfg-class", "change", v => {
    character.class = v;
    rebuildSpellSlots(character);
    saveAndRerender();
  });
  bindInput("cfg-level", "input", v => {
    character.level = clamp(Number(v), 1, 20);
    rebuildSpellSlots(character);
    saveAndRerender();
  });

  // Abilities
  document.querySelectorAll(".cfg-ability").forEach(input => {
    input.addEventListener("input", e => {
      const ab = e.target.dataset.ab;
      character.abilities[ab] = clamp(Number(e.target.value), 1, 30);
      saveAndRerender();
    });
  });

  // Speed
  bindInput("cfg-speed", "input", v => { character.speed = Math.max(0, Number(v) || 0); });

  // HP max
  bindInput("cfg-hp-max", "input", v => {
    const n = Math.max(1, Number(v) || 1);
    character.hp.max = n;
    if (character.hp.current > n) character.hp.current = n;
    saveAndRerender();
  });

  // Armor
  bindInput("cfg-armor-type", "change", v => { character.armor.type = v; saveAndRerender(); });
  bindInput("cfg-armor-base", "input", v => { character.armor.base_ac = Number(v) || 0; saveAndRerender(); });
  bindInput("cfg-armor-misc", "input", v => { character.armor.misc_bonus = Number(v) || 0; saveAndRerender(); });
  const shield = document.getElementById("cfg-armor-shield");
  if (shield) shield.addEventListener("change", e => {
    character.armor.shield = e.target.checked;
    saveAndRerender();
  });

  // Saves (click dots to toggle)
  document.querySelectorAll(".prof-dot[data-save]").forEach(dot => {
    dot.addEventListener("click", () => {
      const ab = dot.dataset.save;
      const set = new Set(character.saves_proficient || []);
      if (set.has(ab)) set.delete(ab); else set.add(ab);
      character.saves_proficient = Array.from(set);
      saveAndRerender();
    });
  });

  // Skills (click dot to cycle: none → proficient → expertise → none)
  document.querySelectorAll(".prof-dot[data-skill]").forEach(dot => {
    dot.addEventListener("click", () => {
      const skill = dot.dataset.skill;
      const cur = character.skills[skill] || "none";
      const next = cur === "none" ? "proficient" : cur === "proficient" ? "expertise" : "none";
      character.skills[skill] = next;
      saveAndRerender();
    });
  });

  // Proficiencies textareas
  document.querySelectorAll("textarea[data-prof]").forEach(ta => {
    ta.addEventListener("input", e => {
      character.proficiencies[e.target.dataset.prof] = e.target.value;
      saveCharacter();
    });
  });

  // Attack rows in config
  document.querySelectorAll(".attack-row[data-action-id]").forEach(row => {
    const id = row.dataset.actionId;
    row.querySelectorAll("[data-field]").forEach(input => {
      input.addEventListener("input", e => {
        const action = character.actions.find(a => a.id === id);
        if (!action) return;
        const field = e.target.dataset.field;
        if (field === "hit_mod") action[field] = Number(e.target.value) || 0;
        else action[field] = e.target.value;
        if (field === "action_type") saveAndRerender();
        else saveCharacter();
      });
    });
  });
  document.querySelectorAll("[data-delete-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteAction;
      character.actions = character.actions.filter(a => a.id !== id);
      saveAndRerender();
    });
  });
  const addBtn = document.getElementById("add-attack");
  if (addBtn) addBtn.addEventListener("click", () => {
    const type = document.getElementById("add-attack-type").value;
    character.actions.push({
      id: "a" + Date.now() + Math.random().toString(36).slice(2, 7),
      name: "", hit_mod: 0, damage: "", action_type: type,
    });
    saveAndRerender();
  });
}

function wireViewInteractions() {
  // HP buttons
  const harm = document.getElementById("hp-harm");
  const heal = document.getElementById("hp-heal");
  const tempBtn = document.getElementById("hp-temp-btn");
  const amount = document.getElementById("hp-amount");
  const getAmt = () => Math.max(0, Number(amount?.value) || 0);
  if (harm) harm.addEventListener("click", () => { applyDamage(getAmt()); amount.value = ""; });
  if (heal) heal.addEventListener("click", () => { applyHeal(getAmt()); amount.value = ""; });
  if (tempBtn) tempBtn.addEventListener("click", () => { applyTemp(getAmt()); amount.value = ""; });

  // Rest buttons
  const sr = document.getElementById("short-rest");
  const lr = document.getElementById("long-rest");
  if (sr) sr.addEventListener("click", shortRest);
  if (lr) lr.addEventListener("click", longRest);

  // Action economy pills
  document.querySelectorAll(".economy-pill").forEach(pill => {
    pill.addEventListener("click", () => {
      const k = pill.dataset.econ;
      character.action_economy[k] = !character.action_economy[k];
      saveAndRerender();
    });
  });
  const reset = document.getElementById("econ-reset");
  if (reset) reset.addEventListener("click", () => {
    Object.keys(character.action_economy).forEach(k => character.action_economy[k] = true);
    saveAndRerender();
  });

  // Spell slot pips
  document.querySelectorAll(".slot-pip[data-slot-level]").forEach(pip => {
    pip.addEventListener("click", () => {
      const lv = pip.dataset.slotLevel;
      const idx = Number(pip.dataset.slotIdx);
      const slot = character.spell_slots[lv];
      if (!slot) return;
      // Click a used pip → unspend (decrement). Click empty pip → spend (increment).
      if (idx < slot.used) slot.used = idx;
      else slot.used = idx + 1;
      saveAndRerender();
    });
  });
  document.querySelectorAll(".slot-pip[data-pact-idx]").forEach(pip => {
    pip.addEventListener("click", () => {
      const idx = Number(pip.dataset.pactIdx);
      const slot = character.pact_slots;
      if (!slot) return;
      if (idx < slot.used) slot.used = idx;
      else slot.used = idx + 1;
      saveAndRerender();
    });
  });
}

// ============================================================
// HEALTH ACTIONS
// ============================================================

function applyDamage(amount) {
  if (!amount) return;
  let remaining = amount;
  if (character.hp.temp > 0) {
    if (remaining <= character.hp.temp) {
      character.hp.temp -= remaining;
      remaining = 0;
    } else {
      remaining -= character.hp.temp;
      character.hp.temp = 0;
    }
  }
  character.hp.current = Math.max(0, character.hp.current - remaining);
  saveAndRerender();
}

function applyHeal(amount) {
  if (!amount) return;
  character.hp.current = Math.min(character.hp.max, character.hp.current + amount);
  saveAndRerender();
}

function applyTemp(amount) {
  if (!amount) return;
  // 5e rule: temp HP doesn't stack — take the higher value.
  character.hp.temp = Math.max(character.hp.temp || 0, amount);
  saveAndRerender();
}

function shortRest() {
  // Restore Warlock pact slots only.
  if (character.pact_slots) character.pact_slots.used = 0;
  saveAndRerender();
}

function longRest() {
  character.hp.current = character.hp.max;
  character.hp.temp = 0;
  Object.keys(character.spell_slots).forEach(lv => character.spell_slots[lv].used = 0);
  if (character.pact_slots) character.pact_slots.used = 0;
  Object.keys(character.action_economy).forEach(k => character.action_economy[k] = true);
  saveAndRerender();
}

// ============================================================
// HELPERS
// ============================================================

function bindInput(id, evt, handler) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener(evt, e => handler(e.target.value));
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

function escapeHtml(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function saveAndRerender() {
  saveCharacter();
  renderDashboard();
}

// ============================================================
// UPDATE BUTTON (existing)
// ============================================================

function wireUpdateButton() {
  const btn = document.getElementById("check-update");
  const status = document.getElementById("update-status");
  if (!btn || !status) return;

  btn.addEventListener("click", async () => {
    status.className = "update-status";
    status.textContent = "Checking...";
    btn.disabled = true;
    try {
      const r = await window.pywebview.api.check_for_update();
      if (r.error) {
        status.classList.add("err");
        status.textContent = r.error;
      } else if (r.has_update) {
        status.classList.add("warn");
        status.innerHTML = "";
        const msg = document.createElement("span");
        msg.textContent = `Update available: ${r.latest} (current ${r.current}). `;
        status.appendChild(msg);
        if (r.asset_url) {
          const installBtn = document.createElement("button");
          installBtn.className = "btn magenta";
          installBtn.textContent = "INSTALL";
          installBtn.style.marginLeft = "8px";
          installBtn.addEventListener("click", async () => {
            installBtn.disabled = true;
            installBtn.textContent = "INSTALLING...";
            await window.pywebview.api.download_and_install_update(r.asset_url);
          });
          status.appendChild(installBtn);
        } else if (r.html_url) {
          const link = document.createElement("button");
          link.className = "btn magenta";
          link.textContent = "OPEN RELEASE";
          link.style.marginLeft = "8px";
          link.addEventListener("click", () => {
            window.pywebview.api.open_release_page(r.html_url);
          });
          status.appendChild(link);
        }
      } else {
        status.classList.add("ok");
        status.textContent = `Up to date (${r.current}).`;
      }
    } catch (e) {
      status.classList.add("err");
      status.textContent = "Update check failed.";
    } finally {
      btn.disabled = false;
    }
  });
}
