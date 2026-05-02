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

// Inventory UI state. addingItem and editingItemId are mutually exclusive
// (only one form open at a time). expandedItemId is independent.
// confirmingDeleteId tracks which item is one click away from deletion.
let addingItem = false;
let editingItemId = null;
let expandedItemId = null;
let confirmingDeleteId = null;

// Notes UI state. selectedFolderId === null means we're viewing the folder
// grid; non-null means we're inside that folder viewing its notes.
let selectedFolderId = null;
let addingFolder = false;
let editingFolderId = null;
let confirmingFolderDeleteId = null;
let addingNote = false;
let editingNoteId = null;
let expandedNoteId = null;
let confirmingNoteDeleteId = null;

// Party (DM mode) state. 3-level nav:
//   selectedPartyFolderId === null                    → folder grid
//   selectedPartyFolderId set, selectedCharacterId null → character grid in folder
//   selectedCharacterId set                            → character detail (view or edit)
let dmData = null;
let selectedPartyFolderId = null;
let selectedCharacterId = null;
let editingCharacter = false;
let addingPartyFolder = false;
let editingPartyFolderId = null;
let confirmingPartyFolderDeleteId = null;
let addingCharacter = false;
let confirmingCharacterDeleteId = null;

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Render eagerly with defaults so the preview panel works without pywebview.
  character = createDefaultCharacter();
  dmData = createDefaultDmData();
  renderTabs();
  setActiveView("dashboard");
  wireSettingsButton();
  wireModeSwitch();
  wireUpdateButton();
  renderDashboard();
  renderInventory();
  renderNotes();
  renderParty();
});

window.addEventListener("pywebviewready", async () => {
  await loadVersion();
  await loadSettings();
  await loadCharacter();
  await loadPortrait();
  await loadDmData();
  renderTabs();
  setActiveView(activeView);
  renderDashboard();
  renderInventory();
  renderNotes();
  renderParty();
});

function createDefaultDmData() {
  return { party: { folders: [], characters: [] } };
}

async function loadDmData() {
  try {
    const d = await window.pywebview.api.get_dm_data();
    if (d && typeof d === "object") dmData = d;
  } catch (e) {}
  if (!dmData) dmData = createDefaultDmData();
  if (!dmData.party || typeof dmData.party !== "object") {
    dmData.party = { folders: [], characters: [] };
  }
  if (!Array.isArray(dmData.party.folders)) dmData.party.folders = [];
  if (!Array.isArray(dmData.party.characters)) dmData.party.characters = [];
}

async function saveDmData() {
  try { await window.pywebview.api.save_dm_data(dmData); } catch (e) {}
}

function createDefaultPartyCharacter() {
  return {
    id: "c" + Date.now() + Math.random().toString(36).slice(2, 7),
    folderId: null,
    name: "",
    class: "",
    level: 1,
    abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    passives: { perception: 10, investigation: 10, insight: 10 },
    languages: "",
    features: "",
    description: "",
    personality: "",
  };
}

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
    inventory: [],
    notes: { folders: [], items: [] },
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
  migrateInventory(character);
  migrateNotes(character);
  // Always rebuild spell slots after load so changing class outside the app
  // (manual edit) is reflected, and capacity matches current class+level.
  rebuildSpellSlots(character);
}

function migrateNotes(c) {
  if (!c.notes || typeof c.notes !== "object" || Array.isArray(c.notes)) {
    c.notes = { folders: [], items: [] };
    return;
  }
  if (!Array.isArray(c.notes.folders)) c.notes.folders = [];
  if (!Array.isArray(c.notes.items)) c.notes.items = [];
}

// v1.0.4 stored inventory items as {id, text}. v1.0.5 stores them as
// {id, name, details, quantity}. Convert in place — first line of the old
// text becomes name, the rest becomes details. quantity defaults to null
// (non-stackable) since old items had no concept of count.
function migrateInventory(c) {
  if (!Array.isArray(c.inventory)) { c.inventory = []; return; }
  c.inventory = c.inventory.map(item => {
    if (typeof item.name === "string") return item;
    const text = (item.text || "").trim();
    const lines = text.split(/\r?\n/);
    return {
      id: item.id || ("i" + Date.now() + Math.random().toString(36).slice(2, 7)),
      name: lines[0] || "Item",
      details: lines.slice(1).join("\n").trim(),
      quantity: null,
    };
  });
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

// Re-rendering on every keystroke blows focus out of inputs (the element under
// the user's cursor literally gets replaced). Capture which field had focus +
// where the caret was, then restore both after innerHTML swap. Without this,
// typing a multi-digit ability score becomes impossible.
function captureFocus(container) {
  const active = document.activeElement;
  if (!active || !container.contains(active)) return null;
  if (!["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName)) return null;
  const info = {
    tag: active.tagName,
    id: active.id || null,
    ab: active.dataset?.ab || null,
    prof: active.dataset?.prof || null,
    field: active.dataset?.field || null,
    actionId: active.closest("[data-action-id]")?.dataset?.actionId || null,
  };
  if (active.tagName !== "SELECT") {
    info.selectionStart = active.selectionStart;
    info.selectionEnd = active.selectionEnd;
  }
  return info;
}

function restoreFocus(container, info) {
  if (!info) return;
  let el = null;
  if (info.id) el = container.querySelector("#" + CSS.escape(info.id));
  else if (info.actionId && info.field) {
    el = container.querySelector(
      `[data-action-id="${info.actionId}"] [data-field="${info.field}"]`
    );
  } else if (info.ab) {
    el = container.querySelector(`[data-ab="${info.ab}"]`);
  } else if (info.prof) {
    el = container.querySelector(`[data-prof="${info.prof}"]`);
  }
  if (!el) return;
  el.focus();
  if (info.tag !== "SELECT" && info.selectionStart != null) {
    try { el.setSelectionRange(info.selectionStart, info.selectionEnd); } catch (e) {}
  }
}

function renderDashboard() {
  const dash = document.getElementById("dashboard");
  if (!dash) return;
  const focus = captureFocus(dash);
  dash.classList.toggle("config-mode", configMode);
  dash.innerHTML = renderDashboardHTML(character);
  wireDashboard();
  restoreFocus(dash, focus);
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
  // Identity. Name triggers a rerender so the portrait placeholder initial
  // updates as you type; origin/subclass don't show anywhere else in config
  // mode, so they just save without re-rendering (cheaper).
  bindInput("cfg-name", "input", v => { character.name = v; saveAndRerender(); });
  bindInput("cfg-origin", "input", v => { character.origin = v; saveCharacter(); });
  bindInput("cfg-subclass", "input", v => { character.subclass = v; saveCharacter(); });
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

  // Speed (no rerender — only the input itself displays this in config mode)
  bindInput("cfg-speed", "input", v => { character.speed = Math.max(0, Number(v) || 0); saveCharacter(); });

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
// INVENTORY
// ============================================================

function renderInventory() {
  const container = document.getElementById("inventory");
  if (!container) return;
  const items = character.inventory || [];

  let listHtml;
  if (items.length === 0 && !addingItem) {
    listHtml = `<div class="inventory-empty">Nothing carried. Click "+ ADD ITEM" to start.</div>`;
  } else {
    listHtml = items.map(item => renderInventoryItem(item)).join("");
  }

  // Hide ADD button while the add form is open so there are no stray click
  // targets that would tear down the user's in-progress entry.
  const addBtn = addingItem
    ? ""
    : `<button class="btn" id="add-item">+ ADD ITEM</button>`;

  container.innerHTML = `
    <div class="inventory-header">
      <div class="inventory-title">INVENTORY</div>
      ${addBtn}
    </div>
    ${addingItem ? renderItemForm(null) : ""}
    <div class="inventory-list">${listHtml}</div>
  `;
  wireInventory();
}

function renderInventoryItem(item) {
  if (editingItemId === item.id) return renderItemForm(item);

  const hasDetails = !!(item.details && item.details.trim());
  const hasQty = item.quantity !== null && item.quantity !== undefined;
  const isExpanded = expandedItemId === item.id && hasDetails;
  const isConfirming = confirmingDeleteId === item.id;

  const arrow = hasDetails
    ? `<span class="expand-arrow">${isExpanded ? "▼" : "▶"}</span>`
    : `<span class="expand-arrow-empty"></span>`;
  const nameAttrs = hasDetails
    ? `class="item-name clickable" data-toggle-expand="${item.id}"`
    : `class="item-name"`;

  const qtyHtml = hasQty
    ? `
      <div class="item-qty">
        <button class="qty-btn" data-qty-dec="${item.id}" title="decrease">−</button>
        <span class="qty-num">${item.quantity}</span>
        <button class="qty-btn" data-qty-inc="${item.id}" title="increase">+</button>
      </div>`
    : "";

  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-delete-inv="${item.id}" title="click again to confirm">SURE?</button>`
    : `<button class="item-delete" data-delete-inv="${item.id}" title="delete">×</button>`;

  const detailsHtml = isExpanded
    ? `<div class="item-details">${escapeHtml(item.details)}</div>`
    : "";

  return `
    <div class="inventory-item ${isExpanded ? "expanded" : ""}">
      <div class="item-row">
        <div ${nameAttrs}>${arrow}${escapeHtml(item.name)}</div>
        ${qtyHtml}
        <button class="item-edit" data-edit-item="${item.id}">EDIT</button>
        ${deleteBtn}
      </div>
      ${detailsHtml}
    </div>
  `;
}

// Used for both Add (item=null) and Edit (item=existing).
function renderItemForm(item) {
  const isEdit = !!item;
  const nameVal = isEdit ? escapeHtml(item.name) : "";
  const detailsVal = isEdit ? escapeHtml(item.details || "") : "";
  const qtyVal = isEdit && item.quantity != null ? item.quantity : "";
  const ns = isEdit ? `data-edit-name="${item.id}"` : `id="add-name"`;
  const ds = isEdit ? `data-edit-details="${item.id}"` : `id="add-details"`;
  const qs = isEdit ? `data-edit-qty="${item.id}"` : `id="add-qty"`;
  const saveAttr = isEdit ? `data-save-edit="${item.id}"` : `id="add-save"`;
  const cancelAttr = isEdit ? `data-cancel-edit="${item.id}"` : `id="add-cancel"`;
  const saveDisabled = isEdit ? "" : "disabled";
  const wrapClass = isEdit ? "inventory-item editing" : "inventory-item adding";

  return `
    <div class="${wrapClass}">
      <div class="item-form">
        <label class="form-label">Name <span class="required">*</span></label>
        <input type="text" ${ns} value="${nameVal}" placeholder="What is it?" />

        <label class="form-label">Details <span class="optional">(optional)</span></label>
        <textarea ${ds} placeholder="Description, properties, lore...">${detailsVal}</textarea>

        <label class="form-label">Quantity <span class="optional">(empty for non-stackable)</span></label>
        <input type="number" min="0" ${qs} value="${qtyVal}" placeholder="—" />

        <div class="form-buttons">
          <button class="btn" ${saveAttr} ${saveDisabled}>SAVE</button>
          <button class="btn danger" ${cancelAttr}>CANCEL</button>
        </div>
      </div>
    </div>
  `;
}

function wireInventory() {
  // Reset confirm state when ANY non-delete action fires. (Each handler that
  // re-renders calls resetConfirm() before doing its work; the delete handler
  // is the only one that reads confirmingDeleteId.)
  const resetConfirm = () => { confirmingDeleteId = null; };

  // ----- ADD -----
  const addBtn = document.getElementById("add-item");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      resetConfirm();
      addingItem = true;
      editingItemId = null;
      renderInventory();
      const nameInput = document.getElementById("add-name");
      if (nameInput) nameInput.focus();
    });
  }

  wireFormControls({
    nameSel: "#add-name",
    saveSel: "#add-save",
    cancelSel: "#add-cancel",
    onSave: () => {
      const name = (document.getElementById("add-name").value || "").trim();
      if (!name) return;
      const details = (document.getElementById("add-details").value || "").trim();
      const qtyStr = (document.getElementById("add-qty").value || "").trim();
      const quantity = qtyStr === "" ? null : Math.max(0, Number(qtyStr) || 0);
      character.inventory = character.inventory || [];
      character.inventory.push({
        id: "i" + Date.now() + Math.random().toString(36).slice(2, 7),
        name, details, quantity,
      });
      saveCharacter();
      addingItem = false;
      renderInventory();
    },
    onCancel: () => { addingItem = false; renderInventory(); },
  });

  // ----- EDIT -----
  document.querySelectorAll("[data-edit-item]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      editingItemId = btn.dataset.editItem;
      addingItem = false;
      renderInventory();
      const nameInput = document.querySelector(`[data-edit-name="${editingItemId}"]`);
      if (nameInput) { nameInput.focus(); nameInput.select(); }
    });
  });

  document.querySelectorAll("[data-save-edit]").forEach(btn => {
    const id = btn.dataset.saveEdit;
    wireFormControls({
      nameSel: `[data-edit-name="${id}"]`,
      saveSel: `[data-save-edit="${id}"]`,
      cancelSel: `[data-cancel-edit="${id}"]`,
      onSave: () => {
        const item = (character.inventory || []).find(i => i.id === id);
        if (!item) return;
        const name = (document.querySelector(`[data-edit-name="${id}"]`).value || "").trim();
        if (!name) return;
        item.name = name;
        item.details = (document.querySelector(`[data-edit-details="${id}"]`).value || "").trim();
        const qtyStr = (document.querySelector(`[data-edit-qty="${id}"]`).value || "").trim();
        item.quantity = qtyStr === "" ? null : Math.max(0, Number(qtyStr) || 0);
        saveCharacter();
        editingItemId = null;
        renderInventory();
      },
      onCancel: () => { editingItemId = null; renderInventory(); },
    });
  });

  // ----- EXPAND -----
  document.querySelectorAll("[data-toggle-expand]").forEach(el => {
    el.addEventListener("click", () => {
      resetConfirm();
      const id = el.dataset.toggleExpand;
      expandedItemId = expandedItemId === id ? null : id;
      renderInventory();
    });
  });

  // ----- QUANTITY -----
  document.querySelectorAll("[data-qty-inc]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      const item = (character.inventory || []).find(i => i.id === btn.dataset.qtyInc);
      if (!item) return;
      item.quantity = (Number(item.quantity) || 0) + 1;
      saveCharacter();
      renderInventory();
    });
  });
  document.querySelectorAll("[data-qty-dec]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      const item = (character.inventory || []).find(i => i.id === btn.dataset.qtyDec);
      if (!item) return;
      item.quantity = Math.max(0, (Number(item.quantity) || 0) - 1);
      saveCharacter();
      renderInventory();
    });
  });

  // ----- DELETE (click-to-confirm) -----
  document.querySelectorAll("[data-delete-inv]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteInv;
      if (confirmingDeleteId === id) {
        character.inventory = (character.inventory || []).filter(i => i.id !== id);
        saveCharacter();
        confirmingDeleteId = null;
        if (expandedItemId === id) expandedItemId = null;
        if (editingItemId === id) editingItemId = null;
      } else {
        confirmingDeleteId = id;
      }
      renderInventory();
    });
  });
}

// Shared form-control wiring for both Add and Edit forms: enables/disables
// the Save button based on the Name field, hooks Enter-to-save, and binds
// Save/Cancel handlers.
function wireFormControls({ nameSel, saveSel, cancelSel, onSave, onCancel }) {
  const nameEl = document.querySelector(nameSel);
  const saveEl = document.querySelector(saveSel);
  const cancelEl = document.querySelector(cancelSel);
  if (nameEl && saveEl) {
    const updateDisabled = () => { saveEl.disabled = nameEl.value.trim().length === 0; };
    updateDisabled();
    nameEl.addEventListener("input", updateDisabled);
    nameEl.addEventListener("keydown", e => {
      if (e.key === "Enter" && !saveEl.disabled) { e.preventDefault(); onSave(); }
    });
  }
  if (saveEl) saveEl.addEventListener("click", onSave);
  if (cancelEl) cancelEl.addEventListener("click", onCancel);
}

// ============================================================
// NOTES (folders + items, mirrors PWA's DM characters layout)
// ============================================================

function renderNotes() {
  const container = document.getElementById("notes");
  if (!container) return;

  // Clear stale folder selection if the folder was deleted out from under us.
  if (selectedFolderId &&
      !(character.notes.folders || []).find(f => f.id === selectedFolderId)) {
    selectedFolderId = null;
  }

  container.innerHTML = selectedFolderId
    ? renderNotesInFolderView()
    : renderFoldersView();
  wireNotes();
}

function renderFoldersView() {
  const folders = character.notes.folders || [];

  let body;
  if (folders.length === 0 && !addingFolder) {
    body = `<div class="notes-empty">No folders yet. Click "+ NEW FOLDER" to start organizing your notes.</div>`;
  } else {
    body = `<div class="notes-folders-grid">${folders.map(f => renderFolderCard(f)).join("")}</div>`;
  }

  const addBtn = addingFolder
    ? `<div></div>`
    : `<button class="btn" id="add-folder">+ NEW FOLDER</button>`;

  return `
    <div class="notes-header">
      <div></div>
      <div class="notes-title">NOTES</div>
      ${addBtn}
    </div>
    ${addingFolder ? renderFolderForm(null) : ""}
    ${body}
  `;
}

function renderFolderCard(folder) {
  if (editingFolderId === folder.id) return renderFolderForm(folder);

  const noteCount = (character.notes.items || []).filter(n => n.folderId === folder.id).length;
  const isConfirming = confirmingFolderDeleteId === folder.id;

  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-delete-folder="${folder.id}">SURE?</button>`
    : `<button class="item-delete" data-delete-folder="${folder.id}">×</button>`;

  return `
    <div class="folder-card">
      <div class="folder-card-name clickable" data-enter-folder="${folder.id}">${escapeHtml(folder.name)}</div>
      <div class="folder-card-count">${noteCount} ${noteCount === 1 ? "note" : "notes"}</div>
      <div class="folder-card-actions">
        <button class="item-edit" data-rename-folder="${folder.id}">RENAME</button>
        ${deleteBtn}
      </div>
    </div>
  `;
}

function renderFolderForm(folder) {
  const isEdit = !!folder;
  const nameVal = isEdit ? escapeHtml(folder.name) : "";
  const ns = isEdit ? `data-edit-folder-name="${folder.id}"` : `id="new-folder-name"`;
  const saveAttr = isEdit ? `data-save-folder="${folder.id}"` : `id="folder-save"`;
  const cancelAttr = isEdit ? `data-cancel-folder="${folder.id}"` : `id="folder-cancel"`;
  const saveDisabled = isEdit ? "" : "disabled";
  const wrapClass = isEdit ? "folder-card editing" : "folder-form";

  return `
    <div class="${wrapClass}">
      <div class="item-form">
        <label class="form-label">Folder Name <span class="required">*</span></label>
        <input type="text" ${ns} value="${nameVal}" placeholder="Folder name" />
        <div class="form-buttons">
          <button class="btn" ${saveAttr} ${saveDisabled}>SAVE</button>
          <button class="btn danger" ${cancelAttr}>CANCEL</button>
        </div>
      </div>
    </div>
  `;
}

function renderNotesInFolderView() {
  const folder = character.notes.folders.find(f => f.id === selectedFolderId);
  if (!folder) return "";

  const notes = (character.notes.items || []).filter(n => n.folderId === selectedFolderId);

  let body;
  if (notes.length === 0 && !addingNote) {
    body = `<div class="notes-empty">No notes in this folder. Click "+ NEW NOTE" to start.</div>`;
  } else {
    body = `<div class="inventory-list">${notes.map(n => renderNoteItem(n)).join("")}</div>`;
  }

  const addBtn = addingNote
    ? `<div></div>`
    : `<button class="btn" id="add-note">+ NEW NOTE</button>`;

  return `
    <div class="notes-header">
      <button class="btn back-btn" id="back-to-folders">FOLDERS</button>
      <div class="notes-title">${escapeHtml(folder.name)}</div>
      ${addBtn}
    </div>
    ${addingNote ? renderNoteForm(null) : ""}
    ${body}
  `;
}

function renderNoteItem(note) {
  if (editingNoteId === note.id) return renderNoteForm(note);

  const hasBody = !!(note.body && note.body.trim());
  const isExpanded = expandedNoteId === note.id && hasBody;
  const isConfirming = confirmingNoteDeleteId === note.id;

  const arrow = hasBody
    ? `<span class="expand-arrow">${isExpanded ? "▼" : "▶"}</span>`
    : `<span class="expand-arrow-empty"></span>`;
  const titleAttrs = hasBody
    ? `class="item-name clickable" data-toggle-note-expand="${note.id}"`
    : `class="item-name"`;

  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-delete-note="${note.id}">SURE?</button>`
    : `<button class="item-delete" data-delete-note="${note.id}">×</button>`;

  const bodyHtml = isExpanded
    ? `<div class="item-details">${escapeHtml(note.body)}</div>`
    : "";

  return `
    <div class="inventory-item ${isExpanded ? "expanded" : ""}">
      <div class="item-row">
        <div ${titleAttrs}>${arrow}${escapeHtml(note.title)}</div>
        <button class="item-edit" data-edit-note="${note.id}">EDIT</button>
        ${deleteBtn}
      </div>
      ${bodyHtml}
    </div>
  `;
}

function renderNoteForm(note) {
  const isEdit = !!note;
  const titleVal = isEdit ? escapeHtml(note.title) : "";
  const bodyVal = isEdit ? escapeHtml(note.body || "") : "";
  const ts = isEdit ? `data-edit-note-title="${note.id}"` : `id="add-note-title"`;
  const bs = isEdit ? `data-edit-note-body="${note.id}"` : `id="add-note-body"`;
  const saveAttr = isEdit ? `data-save-note="${note.id}"` : `id="add-note-save"`;
  const cancelAttr = isEdit ? `data-cancel-note="${note.id}"` : `id="add-note-cancel"`;
  const saveDisabled = isEdit ? "" : "disabled";
  const wrapClass = isEdit ? "inventory-item editing" : "inventory-item adding";

  return `
    <div class="${wrapClass}">
      <div class="item-form">
        <label class="form-label">Title <span class="required">*</span></label>
        <input type="text" ${ts} value="${titleVal}" placeholder="Note title" />

        <label class="form-label">Body <span class="optional">(optional)</span></label>
        <textarea ${bs} placeholder="What's on your mind?">${bodyVal}</textarea>

        <div class="form-buttons">
          <button class="btn" ${saveAttr} ${saveDisabled}>SAVE</button>
          <button class="btn danger" ${cancelAttr}>CANCEL</button>
        </div>
      </div>
    </div>
  `;
}

function wireNotes() {
  const resetConfirm = () => {
    confirmingFolderDeleteId = null;
    confirmingNoteDeleteId = null;
  };

  // ----- ADD FOLDER -----
  const addFolderBtn = document.getElementById("add-folder");
  if (addFolderBtn) {
    addFolderBtn.addEventListener("click", () => {
      resetConfirm();
      addingFolder = true;
      editingFolderId = null;
      renderNotes();
      const input = document.getElementById("new-folder-name");
      if (input) input.focus();
    });
  }

  wireFormControls({
    nameSel: "#new-folder-name",
    saveSel: "#folder-save",
    cancelSel: "#folder-cancel",
    onSave: () => {
      const name = (document.getElementById("new-folder-name").value || "").trim();
      if (!name) return;
      character.notes.folders = character.notes.folders || [];
      character.notes.folders.push({
        id: "f" + Date.now() + Math.random().toString(36).slice(2, 7),
        name,
      });
      saveCharacter();
      addingFolder = false;
      renderNotes();
    },
    onCancel: () => { addingFolder = false; renderNotes(); },
  });

  // ----- RENAME FOLDER -----
  document.querySelectorAll("[data-rename-folder]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      editingFolderId = btn.dataset.renameFolder;
      addingFolder = false;
      renderNotes();
      const input = document.querySelector(`[data-edit-folder-name="${editingFolderId}"]`);
      if (input) { input.focus(); input.select(); }
    });
  });

  document.querySelectorAll("[data-save-folder]").forEach(btn => {
    const id = btn.dataset.saveFolder;
    wireFormControls({
      nameSel: `[data-edit-folder-name="${id}"]`,
      saveSel: `[data-save-folder="${id}"]`,
      cancelSel: `[data-cancel-folder="${id}"]`,
      onSave: () => {
        const folder = character.notes.folders.find(f => f.id === id);
        if (!folder) return;
        const name = (document.querySelector(`[data-edit-folder-name="${id}"]`).value || "").trim();
        if (!name) return;
        folder.name = name;
        saveCharacter();
        editingFolderId = null;
        renderNotes();
      },
      onCancel: () => { editingFolderId = null; renderNotes(); },
    });
  });

  // ----- ENTER FOLDER -----
  document.querySelectorAll("[data-enter-folder]").forEach(el => {
    el.addEventListener("click", () => {
      resetConfirm();
      selectedFolderId = el.dataset.enterFolder;
      renderNotes();
    });
  });

  // ----- DELETE FOLDER (cascades to its notes) -----
  document.querySelectorAll("[data-delete-folder]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteFolder;
      if (confirmingFolderDeleteId === id) {
        character.notes.folders = (character.notes.folders || []).filter(f => f.id !== id);
        character.notes.items = (character.notes.items || []).filter(n => n.folderId !== id);
        saveCharacter();
        confirmingFolderDeleteId = null;
        renderNotes();
      } else {
        confirmingFolderDeleteId = id;
        confirmingNoteDeleteId = null;
        renderNotes();
      }
    });
  });

  // ----- BACK TO FOLDERS -----
  const backBtn = document.getElementById("back-to-folders");
  if (backBtn) {
    backBtn.addEventListener("click", () => {
      resetConfirm();
      selectedFolderId = null;
      addingNote = false;
      editingNoteId = null;
      expandedNoteId = null;
      renderNotes();
    });
  }

  // ----- ADD NOTE -----
  const addNoteBtn = document.getElementById("add-note");
  if (addNoteBtn) {
    addNoteBtn.addEventListener("click", () => {
      resetConfirm();
      addingNote = true;
      editingNoteId = null;
      renderNotes();
      const input = document.getElementById("add-note-title");
      if (input) input.focus();
    });
  }

  wireFormControls({
    nameSel: "#add-note-title",
    saveSel: "#add-note-save",
    cancelSel: "#add-note-cancel",
    onSave: () => {
      const title = (document.getElementById("add-note-title").value || "").trim();
      if (!title) return;
      const body = (document.getElementById("add-note-body").value || "").trim();
      character.notes.items = character.notes.items || [];
      character.notes.items.push({
        id: "n" + Date.now() + Math.random().toString(36).slice(2, 7),
        folderId: selectedFolderId,
        title, body,
      });
      saveCharacter();
      addingNote = false;
      renderNotes();
    },
    onCancel: () => { addingNote = false; renderNotes(); },
  });

  // ----- EDIT NOTE -----
  document.querySelectorAll("[data-edit-note]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      editingNoteId = btn.dataset.editNote;
      addingNote = false;
      renderNotes();
      const input = document.querySelector(`[data-edit-note-title="${editingNoteId}"]`);
      if (input) { input.focus(); input.select(); }
    });
  });

  document.querySelectorAll("[data-save-note]").forEach(btn => {
    const id = btn.dataset.saveNote;
    wireFormControls({
      nameSel: `[data-edit-note-title="${id}"]`,
      saveSel: `[data-save-note="${id}"]`,
      cancelSel: `[data-cancel-note="${id}"]`,
      onSave: () => {
        const note = character.notes.items.find(n => n.id === id);
        if (!note) return;
        const title = (document.querySelector(`[data-edit-note-title="${id}"]`).value || "").trim();
        if (!title) return;
        note.title = title;
        note.body = (document.querySelector(`[data-edit-note-body="${id}"]`).value || "").trim();
        saveCharacter();
        editingNoteId = null;
        renderNotes();
      },
      onCancel: () => { editingNoteId = null; renderNotes(); },
    });
  });

  // ----- EXPAND NOTE -----
  document.querySelectorAll("[data-toggle-note-expand]").forEach(el => {
    el.addEventListener("click", () => {
      resetConfirm();
      const id = el.dataset.toggleNoteExpand;
      expandedNoteId = expandedNoteId === id ? null : id;
      renderNotes();
    });
  });

  // ----- DELETE NOTE -----
  document.querySelectorAll("[data-delete-note]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteNote;
      if (confirmingNoteDeleteId === id) {
        character.notes.items = (character.notes.items || []).filter(n => n.id !== id);
        saveCharacter();
        confirmingNoteDeleteId = null;
        if (expandedNoteId === id) expandedNoteId = null;
        if (editingNoteId === id) editingNoteId = null;
        renderNotes();
      } else {
        confirmingNoteDeleteId = id;
        confirmingFolderDeleteId = null;
        renderNotes();
      }
    });
  });
}

// ============================================================
// PARTY (DM mode — folders → character grid → character detail)
// ============================================================

function renderParty() {
  const container = document.getElementById("party");
  if (!container) return;

  // Validate state — clear stale references if data was deleted out from under us.
  const folders = dmData.party.folders;
  const chars = dmData.party.characters;
  if (selectedPartyFolderId && !folders.find(f => f.id === selectedPartyFolderId)) {
    selectedPartyFolderId = null;
    selectedCharacterId = null;
  }
  if (selectedCharacterId && !chars.find(c => c.id === selectedCharacterId)) {
    selectedCharacterId = null;
  }

  if (selectedCharacterId) {
    container.innerHTML = renderCharacterDetailView();
  } else if (selectedPartyFolderId) {
    container.innerHTML = renderCharacterGridView();
  } else {
    container.innerHTML = renderPartyFolderGrid();
  }
  wireParty();
}

// ----- LEVEL 1: folder grid -----
function renderPartyFolderGrid() {
  const folders = dmData.party.folders;
  let body;
  if (folders.length === 0 && !addingPartyFolder) {
    body = `<div class="notes-empty">No party folders yet. Create one to start (e.g. "Players", "Allies", "Recurring NPCs").</div>`;
  } else {
    body = `<div class="notes-folders-grid">${folders.map(f => renderPartyFolderCard(f)).join("")}</div>`;
  }
  const addBtn = addingPartyFolder
    ? `<div></div>`
    : `<button class="btn" id="add-party-folder">+ NEW FOLDER</button>`;
  return `
    <div class="notes-header">
      <div></div>
      <div class="notes-title">PARTY</div>
      ${addBtn}
    </div>
    ${addingPartyFolder ? renderPartyFolderForm(null) : ""}
    ${body}
  `;
}

function renderPartyFolderCard(folder) {
  if (editingPartyFolderId === folder.id) return renderPartyFolderForm(folder);
  const count = dmData.party.characters.filter(c => c.folderId === folder.id).length;
  const isConfirming = confirmingPartyFolderDeleteId === folder.id;
  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-delete-party-folder="${folder.id}">SURE?</button>`
    : `<button class="item-delete" data-delete-party-folder="${folder.id}">×</button>`;
  return `
    <div class="folder-card">
      <div class="folder-card-name clickable" data-enter-party-folder="${folder.id}">${escapeHtml(folder.name)}</div>
      <div class="folder-card-count">${count} ${count === 1 ? "character" : "characters"}</div>
      <div class="folder-card-actions">
        <button class="item-edit" data-rename-party-folder="${folder.id}">RENAME</button>
        ${deleteBtn}
      </div>
    </div>
  `;
}

function renderPartyFolderForm(folder) {
  const isEdit = !!folder;
  const nameVal = isEdit ? escapeHtml(folder.name) : "";
  const ns = isEdit ? `data-edit-party-folder-name="${folder.id}"` : `id="new-party-folder-name"`;
  const saveAttr = isEdit ? `data-save-party-folder="${folder.id}"` : `id="party-folder-save"`;
  const cancelAttr = isEdit ? `data-cancel-party-folder="${folder.id}"` : `id="party-folder-cancel"`;
  const saveDisabled = isEdit ? "" : "disabled";
  const wrapClass = isEdit ? "folder-card editing" : "folder-form";
  return `
    <div class="${wrapClass}">
      <div class="item-form">
        <label class="form-label">Folder Name <span class="required">*</span></label>
        <input type="text" ${ns} value="${nameVal}" placeholder="Folder name" />
        <div class="form-buttons">
          <button class="btn" ${saveAttr} ${saveDisabled}>SAVE</button>
          <button class="btn danger" ${cancelAttr}>CANCEL</button>
        </div>
      </div>
    </div>
  `;
}

// ----- LEVEL 2: character grid in folder -----
function renderCharacterGridView() {
  const folder = dmData.party.folders.find(f => f.id === selectedPartyFolderId);
  if (!folder) return "";
  const chars = dmData.party.characters.filter(c => c.folderId === selectedPartyFolderId);
  let body;
  if (chars.length === 0 && !addingCharacter) {
    body = `<div class="notes-empty">No characters in this folder. Click "+ NEW CHARACTER" to add one.</div>`;
  } else {
    body = `<div class="character-grid">${chars.map(c => renderCharacterCard(c)).join("")}</div>`;
  }
  const addBtn = addingCharacter
    ? `<div></div>`
    : `<button class="btn" id="add-character">+ NEW CHARACTER</button>`;
  return `
    <div class="notes-header">
      <button class="btn back-btn" id="back-to-party-folders">FOLDERS</button>
      <div class="notes-title">${escapeHtml(folder.name)}</div>
      ${addBtn}
    </div>
    ${addingCharacter ? renderCharacterForm(createDefaultPartyCharacter(), true) : ""}
    ${body}
  `;
}

function renderCharacterCard(c) {
  const isConfirming = confirmingCharacterDeleteId === c.id;
  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-delete-character="${c.id}">SURE?</button>`
    : `<button class="item-delete" data-delete-character="${c.id}">×</button>`;
  const meta = [c.class, c.level ? "Lv " + c.level : ""].filter(Boolean).join(" · ");
  return `
    <div class="character-card">
      <div class="character-card-name clickable" data-open-character="${c.id}">${escapeHtml(c.name) || "<span class='placeholder'>(unnamed)</span>"}</div>
      <div class="character-card-meta">${escapeHtml(meta) || "&nbsp;"}</div>
      <div class="folder-card-actions">
        <button class="item-edit" data-open-character="${c.id}">VIEW</button>
        ${deleteBtn}
      </div>
    </div>
  `;
}

// ----- LEVEL 3: character detail -----
function renderCharacterDetailView() {
  const c = dmData.party.characters.find(c => c.id === selectedCharacterId);
  if (!c) return "";
  if (editingCharacter) return renderCharacterDetailEdit(c);
  return renderCharacterDetailRead(c);
}

function renderCharacterDetailRead(c) {
  const folder = dmData.party.folders.find(f => f.id === c.folderId);
  const meta = [c.class, c.level ? "Lv " + c.level : ""].filter(Boolean).join(" · ");
  return `
    <div class="character-detail">
      <div class="detail-header">
        <button class="btn back-btn" id="back-to-character-grid">${escapeHtml(folder ? folder.name : "BACK")}</button>
        <div class="detail-title-block">
          <div class="detail-name">${escapeHtml(c.name) || "(unnamed)"}</div>
          <div class="detail-meta">${escapeHtml(meta)}</div>
        </div>
        <button class="btn" id="edit-character">EDIT</button>
      </div>

      <div class="detail-body">
        <div class="detail-grid-2">
          <div class="panel">
            <div class="panel-header">STATS</div>
            <div class="detail-stats">
              ${["STR","DEX","CON","INT","WIS","CHA"].map(ab => `
                <div class="detail-stat-row">
                  <span class="detail-stat-label">${ab}</span>
                  <span class="detail-stat-value">${c.abilities[ab]} <span class="subtle-mod">(${fmtMod(abilityMod(c.abilities[ab]))})</span></span>
                </div>
              `).join("")}
            </div>
          </div>
          <div class="panel">
            <div class="panel-header">PASSIVES</div>
            <div class="detail-passives">
              <div class="detail-stat-row"><span class="detail-stat-label">Perception</span><span class="detail-stat-value">${c.passives.perception}</span></div>
              <div class="detail-stat-row"><span class="detail-stat-label">Investigation</span><span class="detail-stat-value">${c.passives.investigation}</span></div>
              <div class="detail-stat-row"><span class="detail-stat-label">Insight</span><span class="detail-stat-value">${c.passives.insight}</span></div>
            </div>
            <div class="panel-header" style="margin-top:14px;">LANGUAGES</div>
            <div class="detail-text ${c.languages ? "" : "empty"}">${c.languages ? escapeHtml(c.languages) : "(none)"}</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">FEATURES &amp; TRAITS</div>
          <div class="detail-text ${c.features ? "" : "empty"}">${c.features ? escapeHtml(c.features) : "(none)"}</div>
        </div>

        <div class="panel">
          <div class="panel-header">DESCRIPTION</div>
          <div class="detail-text ${c.description ? "" : "empty"}">${c.description ? escapeHtml(c.description) : "(none)"}</div>
        </div>

        <div class="panel">
          <div class="panel-header">PERSONALITY</div>
          <div class="detail-text ${c.personality ? "" : "empty"}">${c.personality ? escapeHtml(c.personality) : "(none)"}</div>
        </div>
      </div>
    </div>
  `;
}

function renderCharacterDetailEdit(c) {
  return renderCharacterForm(c, false);
}

// Used for both Add (isNew=true) and Edit (isNew=false). Same shape, different
// save/cancel destinations.
function renderCharacterForm(c, isNew) {
  return `
    <div class="character-detail">
      <div class="detail-header">
        <div></div>
        <div class="detail-title-block">
          <div class="detail-name" style="font-size:16px; color:#ff2a8a;">${isNew ? "NEW CHARACTER" : "EDITING " + escapeHtml(c.name || "(unnamed)")}</div>
        </div>
        <div></div>
      </div>

      <div class="detail-body">
        <div class="panel">
          <div class="panel-header">IDENTITY</div>
          <div class="detail-form-row">
            <label class="form-label">Name <span class="required">*</span></label>
            <input type="text" data-cf="name" value="${escapeHtml(c.name)}" placeholder="Character name" />
          </div>
          <div class="detail-form-grid">
            <div class="detail-form-row">
              <label class="form-label">Class</label>
              <input type="text" data-cf="class" value="${escapeHtml(c.class)}" placeholder="Wizard, Paladin, etc." />
            </div>
            <div class="detail-form-row">
              <label class="form-label">Level</label>
              <input type="number" min="1" max="20" data-cf="level" value="${c.level}" />
            </div>
          </div>
        </div>

        <div class="detail-grid-2">
          <div class="panel">
            <div class="panel-header">STATS</div>
            <div class="detail-form-grid-3">
              ${["STR","DEX","CON","INT","WIS","CHA"].map(ab => `
                <div class="detail-form-row">
                  <label class="form-label">${ab}</label>
                  <input type="number" min="1" max="30" data-cf-ab="${ab}" value="${c.abilities[ab]}" />
                </div>
              `).join("")}
            </div>
          </div>
          <div class="panel">
            <div class="panel-header">PASSIVES</div>
            <div class="detail-form-grid">
              <div class="detail-form-row">
                <label class="form-label">Perception</label>
                <input type="number" min="0" data-cf-pas="perception" value="${c.passives.perception}" />
              </div>
              <div class="detail-form-row">
                <label class="form-label">Investigation</label>
                <input type="number" min="0" data-cf-pas="investigation" value="${c.passives.investigation}" />
              </div>
              <div class="detail-form-row">
                <label class="form-label">Insight</label>
                <input type="number" min="0" data-cf-pas="insight" value="${c.passives.insight}" />
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">LANGUAGES</div>
          <div class="detail-form-row">
            <input type="text" data-cf="languages" value="${escapeHtml(c.languages)}" placeholder="Common, Elvish, Sylvan, ..." />
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">FEATURES &amp; TRAITS</div>
          <div class="detail-form-row">
            <textarea data-cf="features" placeholder="Alert, Resistance to fire, Fey Ancestry, ...">${escapeHtml(c.features)}</textarea>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">DESCRIPTION</div>
          <div class="detail-form-row">
            <textarea data-cf="description" placeholder="Physical appearance">${escapeHtml(c.description)}</textarea>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">PERSONALITY</div>
          <div class="detail-form-row">
            <textarea data-cf="personality" placeholder="Temperament, quirks, mannerisms">${escapeHtml(c.personality)}</textarea>
          </div>
        </div>

        <div class="form-buttons" style="justify-content: flex-end;">
          <button class="btn danger" id="${isNew ? "cancel-new-character" : "cancel-edit-character"}">CANCEL</button>
          <button class="btn" id="${isNew ? "save-new-character" : "save-edit-character"}" data-character-staging='${escapeHtml(JSON.stringify(c))}'>SAVE</button>
        </div>
      </div>
    </div>
  `;
}

function wireParty() {
  const resetConfirm = () => {
    confirmingPartyFolderDeleteId = null;
    confirmingCharacterDeleteId = null;
  };

  // ----- folder add -----
  const addFolderBtn = document.getElementById("add-party-folder");
  if (addFolderBtn) {
    addFolderBtn.addEventListener("click", () => {
      resetConfirm();
      addingPartyFolder = true;
      editingPartyFolderId = null;
      renderParty();
      const inp = document.getElementById("new-party-folder-name");
      if (inp) inp.focus();
    });
  }
  wireFormControls({
    nameSel: "#new-party-folder-name",
    saveSel: "#party-folder-save",
    cancelSel: "#party-folder-cancel",
    onSave: () => {
      const name = (document.getElementById("new-party-folder-name").value || "").trim();
      if (!name) return;
      dmData.party.folders.push({ id: "pf" + Date.now() + Math.random().toString(36).slice(2,7), name });
      saveDmData();
      addingPartyFolder = false;
      renderParty();
    },
    onCancel: () => { addingPartyFolder = false; renderParty(); },
  });

  // ----- folder rename -----
  document.querySelectorAll("[data-rename-party-folder]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      editingPartyFolderId = btn.dataset.renamePartyFolder;
      addingPartyFolder = false;
      renderParty();
      const inp = document.querySelector(`[data-edit-party-folder-name="${editingPartyFolderId}"]`);
      if (inp) { inp.focus(); inp.select(); }
    });
  });
  document.querySelectorAll("[data-save-party-folder]").forEach(btn => {
    const id = btn.dataset.savePartyFolder;
    wireFormControls({
      nameSel: `[data-edit-party-folder-name="${id}"]`,
      saveSel: `[data-save-party-folder="${id}"]`,
      cancelSel: `[data-cancel-party-folder="${id}"]`,
      onSave: () => {
        const folder = dmData.party.folders.find(f => f.id === id);
        if (!folder) return;
        const name = (document.querySelector(`[data-edit-party-folder-name="${id}"]`).value || "").trim();
        if (!name) return;
        folder.name = name;
        saveDmData();
        editingPartyFolderId = null;
        renderParty();
      },
      onCancel: () => { editingPartyFolderId = null; renderParty(); },
    });
  });

  // ----- folder enter -----
  document.querySelectorAll("[data-enter-party-folder]").forEach(el => {
    el.addEventListener("click", () => {
      resetConfirm();
      selectedPartyFolderId = el.dataset.enterPartyFolder;
      renderParty();
    });
  });

  // ----- folder delete (cascades to characters) -----
  document.querySelectorAll("[data-delete-party-folder]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deletePartyFolder;
      if (confirmingPartyFolderDeleteId === id) {
        dmData.party.folders = dmData.party.folders.filter(f => f.id !== id);
        dmData.party.characters = dmData.party.characters.filter(c => c.folderId !== id);
        saveDmData();
        confirmingPartyFolderDeleteId = null;
        renderParty();
      } else {
        confirmingPartyFolderDeleteId = id;
        confirmingCharacterDeleteId = null;
        renderParty();
      }
    });
  });

  // ----- back to party folders -----
  const backFolders = document.getElementById("back-to-party-folders");
  if (backFolders) {
    backFolders.addEventListener("click", () => {
      resetConfirm();
      selectedPartyFolderId = null;
      addingCharacter = false;
      renderParty();
    });
  }

  // ----- character add -----
  const addCharBtn = document.getElementById("add-character");
  if (addCharBtn) {
    addCharBtn.addEventListener("click", () => {
      resetConfirm();
      addingCharacter = true;
      renderParty();
      const inp = document.querySelector('input[data-cf="name"]');
      if (inp) inp.focus();
    });
  }

  const saveNewBtn = document.getElementById("save-new-character");
  if (saveNewBtn) {
    saveNewBtn.addEventListener("click", () => {
      const c = readCharacterForm();
      if (!c.name) return;
      c.folderId = selectedPartyFolderId;
      dmData.party.characters.push(c);
      saveDmData();
      addingCharacter = false;
      renderParty();
    });
  }
  const cancelNewBtn = document.getElementById("cancel-new-character");
  if (cancelNewBtn) {
    cancelNewBtn.addEventListener("click", () => {
      addingCharacter = false;
      renderParty();
    });
  }

  // ----- character open (view detail) -----
  document.querySelectorAll("[data-open-character]").forEach(el => {
    el.addEventListener("click", () => {
      resetConfirm();
      selectedCharacterId = el.dataset.openCharacter;
      editingCharacter = false;
      renderParty();
    });
  });

  // ----- character delete (from grid) -----
  document.querySelectorAll("[data-delete-character]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteCharacter;
      if (confirmingCharacterDeleteId === id) {
        dmData.party.characters = dmData.party.characters.filter(c => c.id !== id);
        saveDmData();
        confirmingCharacterDeleteId = null;
        if (selectedCharacterId === id) selectedCharacterId = null;
        renderParty();
      } else {
        confirmingCharacterDeleteId = id;
        confirmingPartyFolderDeleteId = null;
        renderParty();
      }
    });
  });

  // ----- back to character grid (from detail) -----
  const backGrid = document.getElementById("back-to-character-grid");
  if (backGrid) {
    backGrid.addEventListener("click", () => {
      resetConfirm();
      selectedCharacterId = null;
      editingCharacter = false;
      renderParty();
    });
  }

  // ----- enter edit mode on character detail -----
  const editBtn = document.getElementById("edit-character");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      editingCharacter = true;
      renderParty();
      const inp = document.querySelector('input[data-cf="name"]');
      if (inp) { inp.focus(); inp.select(); }
    });
  }

  const saveEditBtn = document.getElementById("save-edit-character");
  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", () => {
      const c = dmData.party.characters.find(c => c.id === selectedCharacterId);
      if (!c) return;
      const updated = readCharacterForm();
      if (!updated.name) return;
      // Preserve id and folderId — form doesn't expose them.
      updated.id = c.id;
      updated.folderId = c.folderId;
      Object.assign(c, updated);
      saveDmData();
      editingCharacter = false;
      renderParty();
    });
  }
  const cancelEditBtn = document.getElementById("cancel-edit-character");
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener("click", () => {
      editingCharacter = false;
      renderParty();
    });
  }
}

// Pulls all the form fields out of the active character form and returns a
// fresh character object. Used by both add and edit flows.
function readCharacterForm() {
  const get = sel => document.querySelector(sel);
  const val = sel => (get(sel)?.value || "").trim();
  const num = (sel, lo, hi, def) => clamp(Number(get(sel)?.value) || def, lo, hi);
  const c = createDefaultPartyCharacter();
  c.name = val('input[data-cf="name"]');
  c.class = val('input[data-cf="class"]');
  c.level = num('input[data-cf="level"]', 1, 20, 1);
  ["STR","DEX","CON","INT","WIS","CHA"].forEach(ab => {
    c.abilities[ab] = num(`input[data-cf-ab="${ab}"]`, 1, 30, 10);
  });
  ["perception","investigation","insight"].forEach(p => {
    c.passives[p] = num(`input[data-cf-pas="${p}"]`, 0, 99, 10);
  });
  c.languages = val('input[data-cf="languages"]');
  c.features = (get('textarea[data-cf="features"]')?.value || "").trim();
  c.description = (get('textarea[data-cf="description"]')?.value || "").trim();
  c.personality = (get('textarea[data-cf="personality"]')?.value || "").trim();
  return c;
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
