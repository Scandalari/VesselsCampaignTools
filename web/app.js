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
    { id: "dm-dashboard", label: "DASHBOARD" },
    { id: "party",        label: "PARTY" },
    { id: "combat",       label: "COMBAT" },
    { id: "loot",         label: "LOOT" },
    { id: "logs",         label: "LOGS" },
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
  "Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
  "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
];

// Casting stat per class. Non-casters omitted.
const CASTING_ABILITY = {
  "Artificer": "INT",
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

// Artificer spell slots. Like a half caster but rounds UP, so unlike
// Paladin/Ranger it has a slot at level 1. Index 0 = level 1.
const ARTIFICER_SLOTS = [
  [2,0,0,0,0],
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
// Which spell-slot action currently has its UPCAST list expanded (view mode).
let expandedUpcastId = null;
// Active center-screen roll result, or null when the overlay is hidden.
let rollResult = null;
// When set, the dashboard shows that nested ally's sheet instead of the main
// character's. null = main character.
let activeAllyId = null;

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

// Party (DM mode) state. 2-level nav (no folders):
//   selectedCharacterId === null → character grid (root)
//   selectedCharacterId set      → character detail (view or edit)
// Allies are sub-entities attached to a character via characterId; managed
// inside the character detail view's ATTACHED ALLIES panel.
let dmData = null;
let selectedCharacterId = null;
let editingCharacter = false;
let addingCharacter = false;
let confirmingCharacterDeleteId = null;
let addingAlly = false;
let editingAllyId = null;
let confirmingAllyDeleteId = null;

// Loot UI state. lootResults === null means "no roll yet"; an empty array
// means the roll happened but the category had no items.
let lootCategory = "consumable";
let lootCount = 15;
let lootResults = null;

// Combat UI state. addingCombatant gates the inline add form; type tells which
// shape (party | ally | enemy). Confirmation flags gate the destructive bits.
let addingCombatant = false;
let addingCombatantType = null;
let conditionPickerCombatantId = null;
let confirmingFinishCombat = false;
let confirmingResetCombat = false;
let postCombatLootCount = 10;

// DM Dashboard UI state. Pending XP highlight runs briefly after a button click
// so the DM can see where the points just landed.
let xpPulse = 0;

// Quest tracker UI state. addingQuest gates the inline add form; only one
// quest can be in edit mode at a time. Confirmation flags gate the destructive
// bits (delete + complete-when-non-repeatable).
let addingQuest = false;
let editingQuestId = null;
let confirmingQuestDeleteId = null;
let confirmingQuestCompleteId = null;

// Logs / Logbook UI state. Two-level nav (folder grid → entry list inside a
// folder) plus an entry-detail level. logsData is loaded from logs.json and
// is what both DM and player modes render against (DM authors, player views).
let logsData = null;
let selectedLogFolderId = null;
let selectedLogEntryId = null;
let editingLogEntry = false;
let addingLogEntry = false;
let addingLogFolder = false;
let editingLogFolderId = null;
let confirmingLogFolderDeleteId = null;
let confirmingLogEntryDeleteId = null;
let logImageCache = {};   // entryId -> dataURL, fetched on demand from Python
let logbookStatus = "";   // transient banner text after export/import

const LOG_TYPES = [
  { id: "character",    label: "Character" },
  { id: "location",     label: "Location" },
  { id: "organization", label: "Organization" },
  { id: "item",         label: "Item" },
  { id: "other",        label: "Other" },
];

// Standard 5e XP-by-level thresholds (PHB). Level = highest threshold <= total.
// Index 0 = level 1 (no XP needed). Capped at 20.
const XP_THRESHOLDS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
  85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000,
];

// XP preset buttons grouped by category. Left-click adds, right-click subtracts.
// Each value gets multiplied by the active multiplier (RECAP + FULL PARTY).
const XP_PRESETS = {
  story: {
    label: "Story",
    items: [
      { id: "campaign",    label: "Campaign",    value: 2500 },
      { id: "major",       label: "Major",       value: 250 },
      { id: "minor",       label: "Minor",       value: 125 },
      { id: "progression", label: "Progression", value: 250 },
    ],
  },
  roleplay: {
    label: "Roleplay",
    items: [
      { id: "majorRp",   label: "Major RP",  value: 250 },
      { id: "minorRp",   label: "Minor RP",  value: 75 },
      { id: "bonding",   label: "Bonding",   value: 100 },
      { id: "backstory", label: "Backstory", value: 150 },
    ],
  },
  problemSolving: {
    label: "Problem Solving",
    items: [
      { id: "puzzle",   label: "Puzzle",   value: 150 },
      { id: "secret",   label: "Secret",   value: 100 },
      { id: "creative", label: "Creative", value: 100 },
      { id: "memory",   label: "Memory",   value: 50 },
    ],
  },
  sideQuests: {
    label: "Side Quests",
    items: [
      { id: "short",  label: "Short",  value: 100 },
      { id: "medium", label: "Medium", value: 150 },
      { id: "long",   label: "Long",   value: 200 },
      { id: "huge",   label: "LONG",   value: 500 },
    ],
  },
};

const LOOT_CATEGORIES = [
  "consumable", "weapon", "armor", "wondrous",
  "ammo", "gear", "tools", "gem", "art",
];

// 5e standard 16 conditions, alphabetized.
const CONDITIONS = [
  "Blinded", "Charmed", "Concentration", "Deafened", "Exhaustion",
  "Frightened", "Grappled", "Incapacitated", "Invisible", "Paralyzed",
  "Petrified", "Poisoned", "Prone", "Restrained", "Stunned", "Unconscious",
];

// Enemy type tags — match the `loot:` field strings on items.js so the
// post-combat loot roller can filter by what the party fought.
const ENEMY_TYPES = [
  { id: "civilian", label: "Civilian" },
  { id: "guard",    label: "Guard" },
  { id: "military", label: "Military" },
  { id: "space",    label: "Space" },
];

// Standard 5e CR → XP table. Used to prefill XP when adding an enemy by CR.
const CR_TO_XP = {
  "0": 10, "1/8": 25, "1/4": 50, "1/2": 100,
  "1": 200, "2": 450, "3": 700, "4": 1100,
  "5": 1800, "6": 2300, "7": 2900, "8": 3900,
  "9": 5000, "10": 5900, "11": 7200, "12": 8400,
  "13": 10000, "14": 11500, "15": 13000, "16": 15000,
  "17": 18000, "18": 20000, "19": 22000, "20": 25000,
  "21": 33000, "22": 41000, "23": 50000, "24": 62000,
  "25": 75000, "26": 90000, "27": 105000, "28": 120000,
  "29": 135000, "30": 155000,
};
const CR_OPTIONS = Object.keys(CR_TO_XP);

// ============================================================
// INIT
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Render eagerly with defaults so the preview panel works without pywebview.
  character = createDefaultCharacter();
  dmData = createDefaultDmData();
  logsData = createDefaultLogs();
  renderTabs();
  setActiveView("dashboard");
  wireSettingsButton();
  wireModeSwitch();
  wireUpdateButton();
  wireImportLogbookButton();
  refreshImportLogbookVisibility();
  renderDashboard();
  renderInventory();
  renderNotes();
  renderParty();
  renderDmDashboard();
  renderLoot();
  renderCombat();
  renderLogs();
});

window.addEventListener("pywebviewready", async () => {
  await loadVersion();
  await loadSettings();
  await loadCharacter();
  await loadPortrait();
  await loadDmData();
  await loadLogsData();
  renderTabs();
  setActiveView(activeView);
  renderDashboard();
  renderInventory();
  renderNotes();
  renderParty();
  renderDmDashboard();
  renderLoot();
  renderCombat();
  renderLogs();
});

function createDefaultDmData() {
  return {
    party: { characters: [], allies: [] },
    combat: createDefaultCombat(),
    xp: createDefaultXp(),
    quests: [],
    scratchpad: "",
  };
}

// Party-wide XP. `total` is committed XP (level is derived from it). `pending`
// buffers button clicks + post-combat encounter XP until END SESSION commits.
function createDefaultXp() {
  return { total: 0, pending: 0, recapBonus: false, fullParty: false };
}

function createDefaultCombat() {
  return {
    active: false,
    finished: false,
    round: 1,
    currentTurnIdx: 0,
    combatants: [],
    lastEncounterXp: 0,
    postCombatLoot: null,
    defeatedEnemyTypes: [],
  };
}

function createDefaultAlly(characterId) {
  return {
    id: "a" + Date.now() + Math.random().toString(36).slice(2, 7),
    characterId,
    name: "",
    initiativeMod: 0,
    hp_max: 10,
    ac: 10,
    notes: "",
  };
}

async function loadDmData() {
  try {
    const d = await window.pywebview.api.get_dm_data();
    if (d && typeof d === "object") dmData = d;
  } catch (e) {}
  if (!dmData) dmData = createDefaultDmData();
  if (!dmData.party || typeof dmData.party !== "object") {
    dmData.party = { characters: [], allies: [] };
  }
  if (!Array.isArray(dmData.party.characters)) dmData.party.characters = [];
  if (!Array.isArray(dmData.party.allies)) dmData.party.allies = [];
  if (!dmData.combat || typeof dmData.combat !== "object") {
    dmData.combat = createDefaultCombat();
  }
  if (!Array.isArray(dmData.combat.combatants)) dmData.combat.combatants = [];
  if (!Array.isArray(dmData.combat.defeatedEnemyTypes)) dmData.combat.defeatedEnemyTypes = [];
  // v1.0.7 → v1.0.8: dropped folders. Strip stale data to keep dm.json clean.
  if (dmData.party.folders) delete dmData.party.folders;
  dmData.party.characters.forEach(c => { if (c.folderId !== undefined) delete c.folderId; });
  // v1.0.11 → v1.0.12: introduce XP pool.
  if (!dmData.xp || typeof dmData.xp !== "object") dmData.xp = createDefaultXp();
  if (typeof dmData.xp.total !== "number") dmData.xp.total = 0;
  if (typeof dmData.xp.pending !== "number") dmData.xp.pending = 0;
  if (typeof dmData.xp.recapBonus !== "boolean") dmData.xp.recapBonus = false;
  if (typeof dmData.xp.fullParty !== "boolean") dmData.xp.fullParty = false;
  // v1.0.12 → v1.0.13: quest tracker + persistent scratchpad.
  if (!Array.isArray(dmData.quests)) dmData.quests = [];
  if (typeof dmData.scratchpad !== "string") dmData.scratchpad = "";
}

async function saveDmData() {
  try { await window.pywebview.api.save_dm_data(dmData); } catch (e) {}
}

function createDefaultLogs() {
  return { folders: [], entries: [], exportedAt: null };
}

async function loadLogsData() {
  try {
    const d = await window.pywebview.api.get_logs_data();
    if (d && typeof d === "object") logsData = d;
  } catch (e) {}
  if (!logsData) logsData = createDefaultLogs();
  if (!Array.isArray(logsData.folders)) logsData.folders = [];
  if (!Array.isArray(logsData.entries)) logsData.entries = [];
}

async function saveLogsData() {
  try { await window.pywebview.api.save_logs_data(logsData); } catch (e) {}
}

function createDefaultPartyCharacter() {
  return {
    id: "c" + Date.now() + Math.random().toString(36).slice(2, 7),
    name: "",
    class: "",
    level: 1,
    abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    passives: { perception: 10, investigation: 10, insight: 10 },
    hp_max: 0,
    ac: 10,
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
    allies: [],
  };
}

// A nested ally is a trimmed character sheet: no class/origin/level/skills
// column and no spell slots (allies can't cast). Proficiency bonus is
// inherited from the main character at render time.
function newAlly() {
  const skills = {};
  Object.keys(SKILLS).forEach(s => { skills[s] = "none"; });
  return {
    id: "al" + Date.now() + Math.random().toString(36).slice(2, 7),
    name: "",
    ally_type: "",
    icon_filename: null,
    abilities: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
    saves_proficient: [],
    skills,
    speed: 30,
    armor: { type: "unarmored", base_ac: 10, shield: false, misc_bonus: 0 },
    hp: { current: 1, max: 1, temp: 0 },
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
  if (!Array.isArray(character.allies)) character.allies = [];
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
  } else if (cls === "Artificer") {
    table = ARTIFICER_SLOTS[lv - 1];
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
  if (viewId !== "settings" && !allowed.includes(viewId)) viewId = allowed[0];
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
      // Mode change shifts the meaning of every shared view (Logs especially).
      // Reset nav so we don't end up with stale selection state.
      selectedLogFolderId = null;
      selectedLogEntryId = null;
      addingLogFolder = false;
      addingLogEntry = false;
      editingLogEntry = false;
      editingLogFolderId = null;
      await saveSettings();
      renderTabs();
      refreshImportLogbookVisibility();
      renderLogs();
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

// True when we're currently viewing/editing a nested ally rather than the
// main character.
function isAllyActive() {
  return !!(activeAllyId && (character.allies || []).some(a => a.id === activeAllyId));
}

// The sheet the dashboard is currently showing: the active ally or the main
// character. Allies inherit the character's level so proficiency-based math
// (saves, passives, to-hit) lands on the right bonus.
function currentSheet() {
  if (activeAllyId) {
    const ally = (character.allies || []).find(a => a.id === activeAllyId);
    if (ally) { ally.level = character.level; return ally; }
  }
  return character;
}

function renderDashboard() {
  const dash = document.getElementById("dashboard");
  if (!dash) return;
  const focus = captureFocus(dash);
  dash.classList.toggle("config-mode", configMode);
  dash.classList.toggle("ally-mode", isAllyActive());
  dash.innerHTML = renderDashboardHTML(currentSheet());
  wireDashboard();
  restoreFocus(dash, focus);
}

function renderDashboardHTML(c) {
  const ally = isAllyActive();
  return `
    <div class="config-banner">
      CONFIG MODE
      <button class="btn tiny" id="exit-config">DONE</button>
    </div>

    <div class="dash-portrait" id="portrait">
      ${renderPortraitInner(c)}
    </div>

    <div class="dash-identity">
      ${ally ? renderAllyIdentity(c) : renderIdentity(c)}
      ${ally ? "" : renderAllyBar()}
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
      ${ally ? "" : `
      <div class="bottom-col">
        <div class="panel" style="flex:1;">
          <div class="panel-header">SKILLS</div>
          ${renderSkills(c)}
        </div>
      </div>`}
      <div class="bottom-col">
        <div class="panel" style="flex:1;">
          <div class="panel-header">ACTIONS</div>
          ${renderActions(c, { allowSlots: !ally })}
        </div>
      </div>
    </div>
  `;
}

// ----- ally identity + ally bar -----
function renderAllyIdentity(c) {
  const back = escapeHtml(character.name || "character");
  if (configMode) {
    return `
      <div class="char-name">
        <input id="cfg-name" type="text" placeholder="Ally Name" value="${escapeHtml(c.name)}" />
      </div>
      <div class="char-meta">
        <input id="cfg-ally-type" class="ally-type-input" type="text" placeholder="Ally type. IE: Pet, Automaton, Apprentice, Drone, etc." value="${escapeHtml(c.ally_type || "")}" />
        <button class="btn tiny ally-return" id="ally-return">Return to ${back}</button>
      </div>
    `;
  }
  const nameDisplay = c.name ? escapeHtml(c.name) : `<span class="placeholder">Unnamed ally</span>`;
  return `
    <div class="char-name">${nameDisplay}</div>
    <div class="char-meta">
      <span>${c.ally_type ? escapeHtml(c.ally_type) : "Ally"}</span>
      <button class="btn tiny ally-return" id="ally-return">Return to ${back}</button>
    </div>
  `;
}

// The chips shown on the MAIN character sheet: enter an ally's sheet, and (in
// view mode) adjust its HP inline without diving in.
function renderAllyBar() {
  const allies = character.allies || [];
  if (configMode) {
    return `<div class="ally-bar">
      ${allies.map(a => `
        <div class="ally-chip">
          <button class="ally-chip-name" data-enter-ally="${a.id}">${a.name ? escapeHtml(a.name) : "[Ally Name]"}</button>
          <button class="ally-chip-del" data-delete-ally="${a.id}" title="delete">×</button>
        </div>`).join("")}
      <button class="btn tiny ally-add" id="add-ally">+ Ally</button>
    </div>`;
  }
  if (allies.length === 0) return "";
  return `<div class="ally-bar">
    ${allies.map(a => {
      const cur = a.hp ? a.hp.current : 0;
      const max = a.hp ? a.hp.max : 0;
      return `<div class="ally-chip ally-chip-view">
        <button class="ally-chip-name" data-enter-ally="${a.id}">${a.name ? escapeHtml(a.name) : "[Ally Name]"}</button>
        <span class="ally-chip-hp">${cur}/${max}</span>
        <input class="ally-hp-amt" type="number" min="0" placeholder="0" data-ally-amt="${a.id}" />
        <button class="btn danger tiny" data-ally-harm="${a.id}">HARM</button>
        <button class="btn success tiny" data-ally-heal="${a.id}">HEAL</button>
      </div>`;
    }).join("")}
  </div>`;
}

// ----- portrait -----
function renderPortraitInner(c) {
  // Ally portraits aren't wired yet — always show the letter placeholder for
  // allies so we don't accidentally show the main character's portrait.
  if (!isAllyActive() && portraitDataUrl) {
    return `<img src="${portraitDataUrl}" alt="portrait" />
            <div class="portrait-hint">${configMode ? "CLICK TO CHANGE" : "CLICK TO EDIT"}</div>`;
  }
  const initial = (c.name || "?").trim().charAt(0).toUpperCase() || "?";
  const hint = isAllyActive()
    ? (configMode ? "" : "CLICK TO EDIT")
    : (configMode ? "CLICK TO UPLOAD" : "CLICK TO EDIT");
  return `<div class="portrait-placeholder">${escapeHtml(initial)}</div>
          ${hint ? `<div class="portrait-hint">${hint}</div>` : ""}`;
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
    // In view mode the whole row rolls a d20 + this save; in config the dot
    // toggles proficiency instead.
    const rowAttr = configMode ? "" : `rollable" data-roll-save="${ab}`;
    return `
      <div class="save-row ${rowAttr}">
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
    // View mode: click the row to roll a d20 + this skill. Config: dot cycles
    // proficiency.
    const rowAttr = configMode ? "" : `rollable" data-roll-skill="${skill}`;
    return `
      <div class="skill-row ${rowAttr}">
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
function renderActions(c, opts) {
  const allowSlots = !opts || opts.allowSlots !== false;
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
  if (!configMode) {
    const pb = profBonus(c.level);
    const melee = pb + abilityMod(c.abilities.STR);
    const ranged = pb + abilityMod(c.abilities.DEX);
    const spell = calcSpellAttack(c);
    html += `<div class="tohit-row">
      <button class="tohit-btn" data-roll-attack="melee">MELEE <span>${fmtMod(melee)}</span></button>
      <button class="tohit-btn" data-roll-attack="ranged">RANGED <span>${fmtMod(ranged)}</span></button>
      ${spell !== null ? `<button class="tohit-btn" data-roll-attack="spell">SPELL <span>${fmtMod(spell)}</span></button>` : ``}
    </div>`;
  }
  const groups = ["Action", "Bonus", "Reaction"];
  groups.forEach(group => {
    const items = (c.actions || []).filter(a => a.action_type === group);
    if (items.length === 0 && !configMode) return;
    if (items.length > 0) {
      html += `<div class="subtle" style="font-size:9px; margin:6px 0 4px; letter-spacing:0.18em;">${group.toUpperCase()}</div>`;
      html += `<div class="attacks-list">`;
      items.forEach(a => {
        const sl = Number(a.slot_level) || 0;
        const up = a.upcast || "none";
        if (configMode) {
          html += `
            <div class="attack-cfg" data-action-id="${a.id}">
              <div class="attack-row">
                <input class="attack-name-input" data-field="name" type="text" value="${escapeHtml(a.name)}" placeholder="Name" />
                <input data-field="hit_mod" type="number" value="${a.hit_mod}" />
                <input data-field="damage" type="text" value="${escapeHtml(a.damage)}" placeholder="1d8+3" />
                <select data-field="action_type">
                  ${["Action","Bonus","Reaction"].map(t => `<option value="${t}" ${a.action_type === t ? "selected" : ""}>${t}</option>`).join("")}
                </select>
                <button class="attack-delete" data-delete-action="${a.id}" title="delete">×</button>
              </div>
              ${allowSlots ? `
              <div class="attack-spell-cfg">
                <span class="aspell-label">SLOT</span>
                <select data-field="slot_level">
                  <option value="0" ${sl === 0 ? "selected" : ""}>—</option>
                  ${[1,2,3,4,5,6,7,8,9].map(n => `<option value="${n}" ${sl === n ? "selected" : ""}>${ordinal(n)}</option>`).join("")}
                </select>
                ${sl > 0 ? `
                  <select data-field="upcast">
                    <option value="none" ${up === "none" ? "selected" : ""}>No upcast</option>
                    <option value="dice" ${up === "dice" ? "selected" : ""}>+ Dice / level</option>
                    <option value="targets" ${up === "targets" ? "selected" : ""}>+ Targets / level</option>
                  </select>
                  ${up !== "none" ? `<input data-field="upcast_amount" type="text" class="aspell-amount" value="${escapeHtml(a.upcast_amount || "")}" placeholder="${up === "dice" ? "1d8" : "1"}" />` : ``}
                ` : ``}
              </div>` : ``}
            </div>
          `;
        } else {
          const canRoll = sl === 0 && (a.damage || "").trim() !== "";
          html += `
            <div class="attack-view">
              <div class="attack-row">
                <div class="attack-name">${escapeHtml(a.name)}</div>
                <div class="attack-hit rollable" data-roll-hit="${a.id}" title="roll to hit">${fmtMod(Number(a.hit_mod) || 0)}</div>
                <div class="attack-damage">${escapeHtml(a.damage) || "—"}</div>
                <div class="attack-type">${a.action_type.toUpperCase()}</div>
                <div>${canRoll ? `<button class="row-roll" data-roll-damage="${a.id}">ROLL</button>` : ""}</div>
              </div>`;
          if (sl > 0) {
            const baseSlot = c.spell_slots[String(sl)];
            const baseAvail = baseSlot && baseSlot.used < baseSlot.max;
            html += `<div class="cast-bar">
              <button class="cast-btn" data-cast="${a.id}" data-cast-level="${sl}" ${baseAvail ? "" : "disabled"}>CAST ${ordinal(sl)}</button>
              ${up !== "none" ? `<button class="upcast-btn ${expandedUpcastId === a.id ? "open" : ""}" data-upcast-toggle="${a.id}">UPCAST</button>` : ``}
            </div>`;
            if (up !== "none" && expandedUpcastId === a.id) {
              const higher = Object.keys(c.spell_slots)
                .map(Number)
                .filter(L => L > sl && c.spell_slots[String(L)].used < c.spell_slots[String(L)].max)
                .sort((x, y) => x - y);
              html += `<div class="upcast-list">`;
              if (higher.length === 0) {
                html += `<div class="subtle" style="font-size:10px; padding:4px 6px;">No higher slots available.</div>`;
              } else {
                higher.forEach(L => {
                  html += `<button class="upcast-opt" data-cast="${a.id}" data-cast-level="${L}">
                    <span class="upcast-opt-lvl">${ordinal(L)}</span>
                    <span class="upcast-opt-eff">${escapeHtml(actionEffectAt(a, L))}</span>
                  </button>`;
                });
              }
              html += `</div>`;
            }
          }
          html += `</div>`;
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

// Pull the first "NdM(+/-K)" term out of a free-text damage/dice string.
function parseDice(str) {
  const m = String(str || "").match(/(\d+)\s*d\s*(\d+)\s*([+-]\s*\d+)?/i);
  if (!m) return null;
  return {
    count: Number(m[1]),
    size: Number(m[2]),
    flat: m[3] ? Number(m[3].replace(/\s+/g, "")) : 0,
  };
}

// What to roll when an action is cast at the given slot level, applying its
// upcast rule. Dice upcasts merge into the base when the die size matches
// (1d8 base + 2 levels of 1d8 -> 3d8); otherwise they're shown as a separate
// term. Targets upcasts just report the extra targets.
function actionEffectAt(a, level) {
  const base = Number(a.slot_level) || 0;
  const extra = Math.max(0, level - base);
  const dmg = a.damage || "";
  const mode = a.upcast || "none";

  if (mode === "targets") {
    const add = extra * (Number(a.upcast_amount) || 0);
    if (add <= 0) return dmg || "—";
    return dmg ? `${dmg} · +${add} tgt` : `+${add} tgt`;
  }

  if (mode === "dice") {
    const up = parseDice(a.upcast_amount);
    if (!up || extra <= 0) return dmg || "—";
    const baseD = parseDice(dmg);
    if (baseD && baseD.size === up.size) {
      const count = baseD.count + extra * up.count;
      const flat = baseD.flat;
      const flatStr = flat > 0 ? `+${flat}` : (flat < 0 ? `${flat}` : "");
      return `${count}d${baseD.size}${flatStr}`;
    }
    const addStr = `+${extra * up.count}d${up.size}`;
    return dmg ? `${dmg} ${addStr}` : addStr;
  }

  return dmg || "—";
}

// ============================================================
// DICE ROLLING
// ============================================================

function rollOne(size) { return 1 + Math.floor(Math.random() * size); }

// Break a free-text damage string into dice terms + a single flat modifier.
// Handles multiple terms like "2d6+1d4+3".
function parseDamage(str) {
  const s = String(str || "");
  const diceRe = /([+-]?)\s*(\d+)\s*[dD]\s*(\d+)/g;
  const dice = [];
  let m;
  while ((m = diceRe.exec(s)) !== null) {
    dice.push({ count: Number(m[2]), size: Number(m[3]), sign: m[1] === "-" ? -1 : 1 });
  }
  // Strip the dice terms, then sum whatever standalone numbers are left as flat.
  const rest = s.replace(/([+-]?)\s*(\d+)\s*[dD]\s*(\d+)/g, " ");
  let flat = 0;
  const flatRe = /([+-]?)\s*(\d+)/g;
  let f;
  while ((f = flatRe.exec(rest)) !== null) {
    flat += (f[1] === "-" ? -1 : 1) * Number(f[2]);
  }
  return { dice, flat };
}

// Roll an action's damage at a given cast level, adding upcast dice when set.
// Returns null when there's nothing rollable (utility spells with no dice/flat).
function rollDamageForAction(a, level) {
  const { dice, flat } = parseDamage(a.damage);
  const terms = dice.map(d => ({ ...d }));
  if ((a.upcast || "none") === "dice") {
    const base = Number(a.slot_level) || 0;
    const extra = Math.max(0, (Number(level) || base) - base);
    const up = parseDice(a.upcast_amount);
    if (up && extra > 0) terms.push({ count: extra * up.count, size: up.size, sign: 1 });
  }
  if (terms.length === 0 && flat === 0) return null;

  let total = 0;
  const parts = [];
  terms.forEach(t => {
    const vals = [];
    for (let i = 0; i < t.count; i++) { const v = rollOne(t.size); vals.push(v); total += t.sign * v; }
    parts.push(`${t.sign < 0 ? "−" : ""}${t.count}d${t.size} [${vals.join(", ")}]`);
  });
  total += flat;
  let breakdown = parts.join(" + ");
  if (flat) breakdown += `${breakdown ? " " : ""}${flat > 0 ? "+" : "−"} ${Math.abs(flat)}`;
  breakdown += ` = ${total}`;
  return { total, breakdown };
}

// A plain d20 + flat modifier roll (to-hit, skill check, saving throw).
function d20Roll(title, mod) {
  const d20 = rollOne(20);
  const total = d20 + mod;
  return { title, total, breakdown: `d20 (${d20}) ${mod >= 0 ? "+" : "−"} ${Math.abs(mod)} = ${total}` };
}

function showRoll(result) { rollResult = result; renderRollModal(); }
function hideRoll() { rollResult = null; renderRollModal(); }

function renderRollModal() {
  const root = document.getElementById("modal-root");
  if (!root) return;
  if (!rollResult) { root.classList.remove("active"); root.innerHTML = ""; return; }
  root.classList.add("active");
  root.innerHTML = `
    <div class="roll-backdrop" data-roll-dismiss></div>
    <div class="roll-card">
      <div class="roll-title">${escapeHtml(rollResult.title)}</div>
      <div class="roll-total">${rollResult.total}</div>
      <div class="roll-breakdown">${escapeHtml(rollResult.breakdown)}</div>
      <button class="btn" data-roll-dismiss>OK</button>
    </div>`;
  root.querySelectorAll("[data-roll-dismiss]").forEach(el => el.addEventListener("click", hideRoll));
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
  // Ally portraits aren't wired yet — clicking just keeps you in config.
  if (isAllyActive()) return;
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
  // The dashboard may be showing the main character or a nested ally; edits go
  // to whichever is active. Character-only inputs (class/level/origin/skills)
  // simply aren't rendered for allies, so their handlers never bind there.
  const sheet = currentSheet();

  // Ally-only: type field + the "Return to character" button.
  bindInput("cfg-ally-type", "input", v => { sheet.ally_type = v; saveCharacter(); });
  const allyReturn = document.getElementById("ally-return");
  if (allyReturn) allyReturn.addEventListener("click", () => { activeAllyId = null; renderDashboard(); });

  // Identity. Name triggers a rerender so the portrait placeholder initial
  // updates as you type; origin/subclass don't show anywhere else in config
  // mode, so they just save without re-rendering (cheaper).
  bindInput("cfg-name", "input", v => { sheet.name = v; saveAndRerender(); });
  bindInput("cfg-origin", "input", v => { character.origin = v; saveCharacter(); });
  bindInput("cfg-subclass", "input", v => { character.subclass = v; saveCharacter(); });
  bindInput("cfg-class", "change", v => {
    character.class = v;
    rebuildSpellSlots(character);
    saveAndRerender();
  });
  // "change" not "input" — same caret/clamp problem as the ability fields below.
  bindInput("cfg-level", "change", v => {
    character.level = clamp(Number(v), 1, 20);
    rebuildSpellSlots(character);
    saveAndRerender();
  });

  // Abilities — clamp + rerender only on blur/Enter ("change"), never on every
  // keystroke. Re-rendering mid-type redraws the whole sheet under the cursor,
  // and number fields lose the text caret across that swap, so typing "17" over
  // "10" ballooned to "117" and got clamped to 30.
  document.querySelectorAll(".cfg-ability").forEach(input => {
    input.addEventListener("change", e => {
      const ab = e.target.dataset.ab;
      sheet.abilities[ab] = clamp(Number(e.target.value), 1, 30);
      saveAndRerender();
    });
  });

  // Speed (no rerender — only the input itself displays this in config mode)
  bindInput("cfg-speed", "input", v => { sheet.speed = Math.max(0, Number(v) || 0); saveCharacter(); });

  // HP max — "change" not "input" for the same caret/clamp reason.
  bindInput("cfg-hp-max", "change", v => {
    const n = Math.max(1, Number(v) || 1);
    sheet.hp.max = n;
    if (sheet.hp.current > n) sheet.hp.current = n;
    saveAndRerender();
  });

  // Armor
  bindInput("cfg-armor-type", "change", v => { sheet.armor.type = v; saveAndRerender(); });
  bindInput("cfg-armor-base", "input", v => { sheet.armor.base_ac = Number(v) || 0; saveAndRerender(); });
  bindInput("cfg-armor-misc", "input", v => { sheet.armor.misc_bonus = Number(v) || 0; saveAndRerender(); });
  const shield = document.getElementById("cfg-armor-shield");
  if (shield) shield.addEventListener("change", e => {
    sheet.armor.shield = e.target.checked;
    saveAndRerender();
  });

  // Saves (click dots to toggle)
  document.querySelectorAll(".prof-dot[data-save]").forEach(dot => {
    dot.addEventListener("click", () => {
      const ab = dot.dataset.save;
      const set = new Set(sheet.saves_proficient || []);
      if (set.has(ab)) set.delete(ab); else set.add(ab);
      sheet.saves_proficient = Array.from(set);
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
      sheet.proficiencies[e.target.dataset.prof] = e.target.value;
      saveCharacter();
    });
  });

  // Ally management (main character only): add, delete, enter an ally's sheet.
  const addAlly = document.getElementById("add-ally");
  if (addAlly) addAlly.addEventListener("click", () => {
    const ally = newAlly();
    character.allies.push(ally);
    activeAllyId = ally.id;
    saveAndRerender();
  });
  document.querySelectorAll("[data-enter-ally]").forEach(btn => {
    btn.addEventListener("click", () => { activeAllyId = btn.dataset.enterAlly; renderDashboard(); });
  });
  document.querySelectorAll("[data-delete-ally]").forEach(btn => {
    btn.addEventListener("click", () => {
      character.allies = character.allies.filter(a => a.id !== btn.dataset.deleteAlly);
      saveAndRerender();
    });
  });

  // Attack rows in config (the wrapper holds both the main row and the
  // spell-slot sub-row, so query the wrapper for all data-field inputs).
  document.querySelectorAll(".attack-cfg[data-action-id]").forEach(row => {
    const id = row.dataset.actionId;
    row.querySelectorAll("[data-field]").forEach(input => {
      input.addEventListener("input", e => {
        const action = sheet.actions.find(a => a.id === id);
        if (!action) return;
        const field = e.target.dataset.field;
        if (field === "hit_mod" || field === "slot_level") action[field] = Number(e.target.value) || 0;
        else action[field] = e.target.value;
        // Dropdowns that reveal/hide other fields need a redraw; text saves quietly.
        if (field === "action_type" || field === "slot_level" || field === "upcast") saveAndRerender();
        else saveCharacter();
      });
    });
  });
  document.querySelectorAll("[data-delete-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteAction;
      sheet.actions = sheet.actions.filter(a => a.id !== id);
      saveAndRerender();
    });
  });
  const addBtn = document.getElementById("add-attack");
  if (addBtn) addBtn.addEventListener("click", () => {
    const type = document.getElementById("add-attack-type").value;
    sheet.actions.push({
      id: "a" + Date.now() + Math.random().toString(36).slice(2, 7),
      name: "", hit_mod: 0, damage: "", action_type: type,
      slot_level: 0, upcast: "none", upcast_amount: "",
    });
    saveAndRerender();
  });
}

function wireViewInteractions() {
  // The visible sheet's own controls (HP, rests, economy, casting, rolls) act
  // on whichever sheet is shown — main character or active ally.
  const sheet = currentSheet();

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
      sheet.action_economy[k] = !sheet.action_economy[k];
      saveAndRerender();
    });
  });
  const reset = document.getElementById("econ-reset");
  if (reset) reset.addEventListener("click", () => {
    Object.keys(sheet.action_economy).forEach(k => sheet.action_economy[k] = true);
    saveAndRerender();
  });

  // Spell slot pips
  document.querySelectorAll(".slot-pip[data-slot-level]").forEach(pip => {
    pip.addEventListener("click", () => {
      const lv = pip.dataset.slotLevel;
      const idx = Number(pip.dataset.slotIdx);
      const slot = (sheet.spell_slots || {})[lv];
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
      const slot = sheet.pact_slots;
      if (!slot) return;
      if (idx < slot.used) slot.used = idx;
      else slot.used = idx + 1;
      saveAndRerender();
    });
  });

  // Cast / upcast buttons on spell-slot actions: expend the slot, then roll
  // the damage dice for that cast level (skipped for slotless utility spells).
  document.querySelectorAll("[data-cast]").forEach(btn => {
    btn.addEventListener("click", () => {
      const lv = Number(btn.dataset.castLevel);
      const action = sheet.actions.find(a => a.id === btn.dataset.cast);
      const slot = (sheet.spell_slots || {})[String(lv)];
      if (!slot || slot.used >= slot.max) return;
      slot.used += 1;
      expandedUpcastId = null;
      const roll = action ? rollDamageForAction(action, lv) : null;
      saveAndRerender();
      if (roll) showRoll({ title: `${action.name || "Spell"} · ${ordinal(lv)}`, total: roll.total, breakdown: roll.breakdown });
    });
  });
  document.querySelectorAll("[data-upcast-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.upcastToggle;
      expandedUpcastId = expandedUpcastId === id ? null : id;
      renderDashboard();
    });
  });

  // Roll damage on a non-spell action (weapon attacks, etc.).
  document.querySelectorAll("[data-roll-damage]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = sheet.actions.find(a => a.id === btn.dataset.rollDamage);
      if (!action) return;
      const roll = rollDamageForAction(action, Number(action.slot_level) || 0);
      if (roll) showRoll({ title: action.name || "Damage", total: roll.total, breakdown: roll.breakdown });
    });
  });

  // Roll a specific action's own hit modifier (alternative to the generic
  // MELEE/RANGED/SPELL buttons).
  document.querySelectorAll("[data-roll-hit]").forEach(el => {
    el.addEventListener("click", () => {
      const action = sheet.actions.find(a => a.id === el.dataset.rollHit);
      if (!action) return;
      showRoll(d20Roll(`${action.name || "Attack"} · To Hit`, Number(action.hit_mod) || 0));
    });
  });

  // Skill checks and saving throws: click the row to roll d20 + its modifier.
  document.querySelectorAll("[data-roll-skill]").forEach(row => {
    row.addEventListener("click", () => {
      const skill = row.dataset.rollSkill;
      showRoll(d20Roll(`${skill} Check`, calcSkillMod(sheet, skill)));
    });
  });
  document.querySelectorAll("[data-roll-save]").forEach(row => {
    row.addEventListener("click", () => {
      const ab = row.dataset.rollSave;
      showRoll(d20Roll(`${ab} Save`, calcSaveMod(sheet, ab)));
    });
  });

  // To-hit rolls: d20 + proficiency + the relevant ability (or spell attack).
  document.querySelectorAll("[data-roll-attack]").forEach(btn => {
    btn.addEventListener("click", () => {
      const kind = btn.dataset.rollAttack;
      const pb = profBonus(sheet.level);
      let bonus = 0, label = "Attack";
      if (kind === "melee") { bonus = pb + abilityMod(sheet.abilities.STR); label = "Melee Attack"; }
      else if (kind === "ranged") { bonus = pb + abilityMod(sheet.abilities.DEX); label = "Ranged Attack"; }
      else if (kind === "spell") { bonus = calcSpellAttack(sheet) || 0; label = "Spell Attack"; }
      showRoll(d20Roll(label, bonus));
    });
  });

  // Ally chips on the main character: enter an ally's sheet, or adjust its HP
  // inline without diving in.
  document.querySelectorAll("[data-enter-ally]").forEach(btn => {
    btn.addEventListener("click", () => { activeAllyId = btn.dataset.enterAlly; renderDashboard(); });
  });
  const allyReturn = document.getElementById("ally-return");
  if (allyReturn) allyReturn.addEventListener("click", () => { activeAllyId = null; renderDashboard(); });
  const allyAmt = id => {
    const el = document.querySelector(`.ally-hp-amt[data-ally-amt="${id}"]`);
    return Math.max(0, Number(el?.value) || 0);
  };
  document.querySelectorAll("[data-ally-harm]").forEach(btn => {
    btn.addEventListener("click", () => {
      const ally = (character.allies || []).find(a => a.id === btn.dataset.allyHarm);
      if (ally) applyDamage(allyAmt(ally.id), ally);
    });
  });
  document.querySelectorAll("[data-ally-heal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const ally = (character.allies || []).find(a => a.id === btn.dataset.allyHeal);
      if (ally) applyHeal(allyAmt(ally.id), ally);
    });
  });
}

// ============================================================
// HEALTH ACTIONS
// ============================================================

// HP helpers take an optional target sheet (defaults to the visible one) so
// ally HP can be adjusted from the main character's chips.
function applyDamage(amount, target) {
  const t = target || currentSheet();
  if (!amount) return;
  let remaining = amount;
  if (t.hp.temp > 0) {
    if (remaining <= t.hp.temp) {
      t.hp.temp -= remaining;
      remaining = 0;
    } else {
      remaining -= t.hp.temp;
      t.hp.temp = 0;
    }
  }
  t.hp.current = Math.max(0, t.hp.current - remaining);
  saveAndRerender();
}

function applyHeal(amount, target) {
  const t = target || currentSheet();
  if (!amount) return;
  t.hp.current = Math.min(t.hp.max, t.hp.current + amount);
  saveAndRerender();
}

function applyTemp(amount, target) {
  const t = target || currentSheet();
  if (!amount) return;
  // 5e rule: temp HP doesn't stack — take the higher value.
  t.hp.temp = Math.max(t.hp.temp || 0, amount);
  saveAndRerender();
}

function shortRest() {
  // Restore Warlock pact slots only.
  const t = currentSheet();
  if (t.pact_slots) t.pact_slots.used = 0;
  saveAndRerender();
}

function longRest() {
  const t = currentSheet();
  t.hp.current = t.hp.max;
  t.hp.temp = 0;
  if (t.spell_slots) Object.keys(t.spell_slots).forEach(lv => t.spell_slots[lv].used = 0);
  if (t.pact_slots) t.pact_slots.used = 0;
  if (t.action_economy) Object.keys(t.action_economy).forEach(k => t.action_economy[k] = true);
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
// DM DASHBOARD (XP pool, preset awards, player at-a-glance)
// ============================================================

// Multiplier rule: each toggled checkbox adds 0.05 to the base 1.0 multiplier.
// Both on → ×1.10. Multiplier applies to every preset button click.
function xpMultiplier() {
  let m = 1;
  if (dmData.xp.recapBonus) m += 0.05;
  if (dmData.xp.fullParty)  m += 0.05;
  return m;
}

// Derive level from total XP using the standard 5e thresholds. Caps at 20.
function xpLevelInfo(total) {
  let level = 1;
  for (let i = 0; i < XP_THRESHOLDS.length; i++) {
    if (total >= XP_THRESHOLDS[i]) level = i + 1;
  }
  if (level >= 20) {
    return { level: 20, current: total, base: XP_THRESHOLDS[19], next: XP_THRESHOLDS[19], pct: 100, maxed: true };
  }
  const base = XP_THRESHOLDS[level - 1];
  const next = XP_THRESHOLDS[level];
  const span = next - base;
  const pct = span > 0 ? Math.max(0, Math.min(100, ((total - base) / span) * 100)) : 0;
  return { level, current: total, base, next, pct, maxed: false };
}

// Comma-split that ignores empties + whitespace. Used for feats / languages
// chip rendering. Stored shape stays a single string for now.
function splitChips(s) {
  if (!s) return [];
  return s.split(",").map(x => x.trim()).filter(Boolean);
}

function fmtXp(n) {
  return n.toLocaleString("en-US");
}

function renderDmDashboard() {
  const container = document.getElementById("dm-dashboard");
  if (!container) return;
  container.innerHTML = renderDmDashboardHTML();
  wireDmDashboard();
}

function renderDmDashboardHTML() {
  const xp = dmData.xp;
  const mult = xpMultiplier();
  const info = xpLevelInfo(xp.total);
  const pendingSign = xp.pending >= 0 ? "+" : "";
  const pendingClass = xp.pending > 0 ? "positive" : xp.pending < 0 ? "negative" : "zero";
  const pendingLabel = xp.pending !== 0
    ? `${pendingSign}${fmtXp(xp.pending)} pending`
    : "no pending xp";

  return `
    <div class="dm-dash">
      <div class="dm-xp-bar">
        <div class="dm-xp-level">LVL ${info.level}</div>
        <div class="dm-xp-track">
          <div class="dm-xp-fill" style="width: ${info.pct}%"></div>
          <div class="dm-xp-current">${fmtXp(info.current)} XP</div>
        </div>
        <div class="dm-xp-next">${info.maxed ? "MAX" : fmtXp(info.next)}</div>
      </div>

      <div class="dm-dash-grid">
        <div class="dm-dash-col left">
          ${renderQuestsPanel()}
        </div>

        <div class="dm-dash-col middle">
          <div class="dm-player-cards">
            ${renderPlayerCards()}
          </div>
          <div class="dm-scratchpad-wrap">
            <div class="dm-scratchpad-label">SCRATCHPAD</div>
            <textarea
              id="dm-scratchpad"
              class="dm-scratchpad"
              placeholder="Notes for next session — autosaved, never wiped."
            >${escapeHtml(dmData.scratchpad || "")}</textarea>
          </div>
        </div>

        <div class="dm-dash-col right">
          <div class="dm-xp-controls">
            <div class="dm-xp-controls-top">
              <div class="dm-xp-pending ${pendingClass}">${pendingLabel}</div>
              <button class="btn end-session" id="end-session" ${xp.pending === 0 ? "disabled" : ""}>END SESSION</button>
            </div>
            <div class="dm-xp-toggles">
              <button class="dm-toggle ${xp.recapBonus ? "on" : ""}" data-xp-toggle="recapBonus">
                <span class="dm-toggle-dot"></span>RECAP
              </button>
              <button class="dm-toggle ${xp.fullParty ? "on" : ""}" data-xp-toggle="fullParty">
                <span class="dm-toggle-dot"></span>FULL PARTY
              </button>
              <div class="dm-multiplier">×${mult.toFixed(2)}</div>
            </div>
          </div>
          ${renderPresetGroup("problemSolving")}
          ${renderPresetGroup("sideQuests")}
          ${renderPresetGroup("story")}
          ${renderPresetGroup("roleplay")}
        </div>
      </div>
    </div>
  `;
}

// ----- QUEST TRACKER -----

function createDefaultQuest() {
  return {
    id: "q" + Date.now() + Math.random().toString(36).slice(2, 7),
    title: "",
    objective: "",
    reward: "",
    repeatable: false,
    completedCount: 0,
  };
}

function renderQuestsPanel() {
  const quests = dmData.quests || [];
  let body;
  if (quests.length === 0 && !addingQuest) {
    body = `<div class="dm-quest-empty">No quests yet. Click + ADD QUEST to track a hook.</div>`;
  } else {
    body = `<div class="dm-quest-list">${quests.map(renderQuestCard).join("")}</div>`;
  }
  const addBtn = addingQuest
    ? ""
    : `<button class="btn quest-add-btn" id="add-quest">+ ADD QUEST</button>`;
  return `
    <div class="dm-quest-panel">
      <div class="dm-quest-header">QUESTS</div>
      ${addingQuest ? renderQuestForm(createDefaultQuest(), true) : ""}
      ${body}
      ${addBtn}
    </div>
  `;
}

function renderQuestCard(q) {
  if (editingQuestId === q.id) return renderQuestForm(q, false);

  const isConfirmingDelete   = confirmingQuestDeleteId === q.id;
  const isConfirmingComplete = confirmingQuestCompleteId === q.id;

  const deleteBtn = isConfirmingDelete
    ? `<button class="item-delete confirming" data-quest-delete="${q.id}">SURE?</button>`
    : `<button class="item-delete" data-quest-delete="${q.id}" title="delete">×</button>`;

  // Repeatable quests increment a counter on COMPLETE — no confirm needed.
  // Non-repeatable quests need a click-to-confirm before deletion.
  let completeBtn;
  if (q.repeatable) {
    completeBtn = `<button class="btn tiny" data-quest-complete="${q.id}">+ COMPLETE</button>`;
  } else {
    completeBtn = isConfirmingComplete
      ? `<button class="btn tiny success confirming" data-quest-complete="${q.id}">CONFIRM DONE</button>`
      : `<button class="btn tiny" data-quest-complete="${q.id}">COMPLETE</button>`;
  }

  const repeatBadge = q.repeatable
    ? `<span class="dm-quest-repeat">REPEATABLE${q.completedCount > 0 ? ` · ${q.completedCount}×` : ""}</span>`
    : "";
  const rewardLine = q.reward
    ? `<div class="dm-quest-reward"><span class="dm-quest-reward-label">REWARD</span> ${escapeHtml(q.reward)}</div>`
    : "";

  return `
    <div class="dm-quest-card">
      <div class="dm-quest-card-head">
        <div class="dm-quest-title">${escapeHtml(q.title) || "(untitled)"}</div>
        ${deleteBtn}
      </div>
      ${q.objective ? `<div class="dm-quest-objective">${escapeHtml(q.objective)}</div>` : ""}
      ${rewardLine}
      <div class="dm-quest-actions">
        ${repeatBadge}
        <span class="dm-quest-actions-right">
          <button class="item-edit" data-quest-edit="${q.id}">EDIT</button>
          ${completeBtn}
        </span>
      </div>
    </div>
  `;
}

function renderQuestForm(q, isNew) {
  const titleAttr = isNew ? `id="new-quest-title"` : `data-qf-title="${q.id}"`;
  const objAttr   = isNew ? `id="new-quest-objective"` : `data-qf-objective="${q.id}"`;
  const rewAttr   = isNew ? `id="new-quest-reward"` : `data-qf-reward="${q.id}"`;
  const repAttr   = isNew ? `id="new-quest-repeatable"` : `data-qf-repeatable="${q.id}"`;
  const saveAttr  = isNew ? `id="save-new-quest"` : `data-quest-save="${q.id}"`;
  const cancelAttr = isNew ? `id="cancel-new-quest"` : `data-quest-cancel="${q.id}"`;
  return `
    <div class="dm-quest-form">
      <div class="detail-form-row">
        <label class="form-label">Title <span class="required">*</span></label>
        <input type="text" ${titleAttr} value="${escapeHtml(q.title)}" placeholder="Tamara's missing cat" />
      </div>
      <div class="detail-form-row">
        <label class="form-label">Objective</label>
        <textarea ${objAttr} placeholder="Find Whiskers, last seen near the cargo bay.">${escapeHtml(q.objective)}</textarea>
      </div>
      <div class="detail-form-row">
        <label class="form-label">Reward (optional)</label>
        <input type="text" ${rewAttr} value="${escapeHtml(q.reward)}" placeholder="50 cr, a homemade pie, ..." />
      </div>
      <label class="dm-quest-repeat-check">
        <input type="checkbox" ${repAttr} ${q.repeatable ? "checked" : ""} />
        <span>Repeatable (track completions instead of removing)</span>
      </label>
      <div class="form-buttons">
        <button class="btn" ${saveAttr}>SAVE</button>
        <button class="btn danger" ${cancelAttr}>CANCEL</button>
      </div>
    </div>
  `;
}

function renderPresetGroup(groupId) {
  const g = XP_PRESETS[groupId];
  return `
    <div class="dm-preset-group">
      <div class="dm-preset-group-label">${g.label}</div>
      <div class="dm-preset-grid">
        ${g.items.map(p => `
          <button class="dm-preset" data-xp-preset="${groupId}:${p.id}">
            <div class="dm-preset-label">${p.label}</div>
            <div class="dm-preset-value">+${fmtXp(p.value)}</div>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function renderPlayerCards() {
  const chars = dmData.party.characters || [];
  if (chars.length === 0) {
    return `<div class="dm-dash-empty">No party characters yet. Add them on the PARTY tab so they show up here.</div>`;
  }
  return chars.map(renderPlayerCard).join("");
}

function renderPlayerCard(c) {
  const feats = splitChips(c.features);
  const langs = splitChips(c.languages);
  const featsHtml = feats.length === 0
    ? `<div class="dm-card-empty">no feats</div>`
    : `<div class="dm-feat-chips">${feats.map(f => `<span class="dm-feat-chip">${escapeHtml(f)}</span>`).join("")}</div>`;
  const langsHtml = langs.length === 0
    ? `<div class="dm-card-empty">no languages</div>`
    : `<div class="dm-lang-chips">${langs.map(l => `<span class="dm-lang-chip">${escapeHtml(l)}</span>`).join("")}</div>`;
  return `
    <div class="dm-player-card">
      <div class="dm-player-card-head">
        <div class="dm-player-name">${escapeHtml(c.name) || "(unnamed)"}</div>
        <div class="dm-player-passives">
          <div class="dm-passives-head">Passives</div>
          <div class="dm-passives-row">
            <span class="dm-passive-cell"><span class="dm-passive-label">Per</span><span class="dm-passive-val">${c.passives.perception}</span></span>
            <span class="dm-passive-sep">|</span>
            <span class="dm-passive-cell"><span class="dm-passive-label">Inv</span><span class="dm-passive-val">${c.passives.investigation}</span></span>
            <span class="dm-passive-sep">|</span>
            <span class="dm-passive-cell"><span class="dm-passive-label">Ins</span><span class="dm-passive-val">${c.passives.insight}</span></span>
          </div>
        </div>
      </div>
      <div class="dm-player-card-feats">${featsHtml}</div>
      <div class="dm-player-card-langs">${langsHtml}</div>
    </div>
  `;
}

function wireDmDashboard() {
  // Multiplier toggles
  document.querySelectorAll("[data-xp-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.xpToggle;
      dmData.xp[key] = !dmData.xp[key];
      saveDmData();
      renderDmDashboard();
    });
  });

  // Preset awards. Left-click adds, right-click subtracts. Both apply the
  // current multiplier. Pending can go negative; END SESSION reconciles.
  document.querySelectorAll("[data-xp-preset]").forEach(btn => {
    const [group, id] = btn.dataset.xpPreset.split(":");
    const preset = XP_PRESETS[group].items.find(p => p.id === id);
    if (!preset) return;
    btn.addEventListener("click", () => applyXp(preset.value, +1));
    btn.addEventListener("contextmenu", e => {
      e.preventDefault();
      applyXp(preset.value, -1);
    });
  });

  // END SESSION commits pending → total. Total cannot go below 0.
  const end = document.getElementById("end-session");
  if (end) end.addEventListener("click", () => {
    if (dmData.xp.pending === 0) return;
    dmData.xp.total = Math.max(0, dmData.xp.total + dmData.xp.pending);
    dmData.xp.pending = 0;
    saveDmData();
    renderDmDashboard();
  });

  wireQuests();
  wireScratchpad();
}

function wireQuests() {
  const resetConfirm = () => {
    confirmingQuestDeleteId = null;
    confirmingQuestCompleteId = null;
  };

  // ----- ADD QUEST -----
  const addBtn = document.getElementById("add-quest");
  if (addBtn) addBtn.addEventListener("click", () => {
    resetConfirm();
    addingQuest = true;
    editingQuestId = null;
    renderDmDashboard();
    document.getElementById("new-quest-title")?.focus();
  });

  const saveNew = document.getElementById("save-new-quest");
  if (saveNew) saveNew.addEventListener("click", () => {
    const title = (document.getElementById("new-quest-title").value || "").trim();
    if (!title) return;
    const q = createDefaultQuest();
    q.title = title;
    q.objective = (document.getElementById("new-quest-objective").value || "").trim();
    q.reward = (document.getElementById("new-quest-reward").value || "").trim();
    q.repeatable = !!document.getElementById("new-quest-repeatable").checked;
    dmData.quests.push(q);
    addingQuest = false;
    saveDmData();
    renderDmDashboard();
  });

  const cancelNew = document.getElementById("cancel-new-quest");
  if (cancelNew) cancelNew.addEventListener("click", () => {
    addingQuest = false;
    renderDmDashboard();
  });

  // ----- EDIT QUEST -----
  document.querySelectorAll("[data-quest-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      editingQuestId = btn.dataset.questEdit;
      addingQuest = false;
      renderDmDashboard();
      document.querySelector(`[data-qf-title="${editingQuestId}"]`)?.focus();
    });
  });

  document.querySelectorAll("[data-quest-save]").forEach(btn => {
    const id = btn.dataset.questSave;
    btn.addEventListener("click", () => {
      const q = dmData.quests.find(x => x.id === id);
      if (!q) return;
      const title = (document.querySelector(`[data-qf-title="${id}"]`).value || "").trim();
      if (!title) return;
      q.title = title;
      q.objective = (document.querySelector(`[data-qf-objective="${id}"]`).value || "").trim();
      q.reward = (document.querySelector(`[data-qf-reward="${id}"]`).value || "").trim();
      q.repeatable = !!document.querySelector(`[data-qf-repeatable="${id}"]`).checked;
      editingQuestId = null;
      saveDmData();
      renderDmDashboard();
    });
  });

  document.querySelectorAll("[data-quest-cancel]").forEach(btn => {
    btn.addEventListener("click", () => {
      editingQuestId = null;
      renderDmDashboard();
    });
  });

  // ----- COMPLETE QUEST -----
  // Repeatable: increments completedCount, no removal, no confirm.
  // Non-repeatable: first click stages confirm, second click removes the quest.
  document.querySelectorAll("[data-quest-complete]").forEach(btn => {
    const id = btn.dataset.questComplete;
    btn.addEventListener("click", () => {
      const q = dmData.quests.find(x => x.id === id);
      if (!q) return;
      if (q.repeatable) {
        q.completedCount = (q.completedCount || 0) + 1;
        saveDmData();
        renderDmDashboard();
        return;
      }
      if (confirmingQuestCompleteId === id) {
        dmData.quests = dmData.quests.filter(x => x.id !== id);
        confirmingQuestCompleteId = null;
        saveDmData();
        renderDmDashboard();
      } else {
        confirmingQuestCompleteId = id;
        confirmingQuestDeleteId = null;
        renderDmDashboard();
      }
    });
  });

  // ----- DELETE QUEST (× button, click-to-confirm) -----
  document.querySelectorAll("[data-quest-delete]").forEach(btn => {
    const id = btn.dataset.questDelete;
    btn.addEventListener("click", () => {
      if (confirmingQuestDeleteId === id) {
        dmData.quests = dmData.quests.filter(x => x.id !== id);
        confirmingQuestDeleteId = null;
        saveDmData();
        renderDmDashboard();
      } else {
        confirmingQuestDeleteId = id;
        confirmingQuestCompleteId = null;
        renderDmDashboard();
      }
    });
  });
}

function wireScratchpad() {
  const ta = document.getElementById("dm-scratchpad");
  if (!ta) return;
  // Save on every keystroke; do NOT re-render or focus + caret would die mid-typing.
  ta.addEventListener("input", () => {
    dmData.scratchpad = ta.value;
    saveDmData();
  });
}

function applyXp(baseValue, sign) {
  const awarded = Math.round(baseValue * xpMultiplier()) * sign;
  dmData.xp.pending += awarded;
  saveDmData();
  renderDmDashboard();
}

// ============================================================
// PARTY (DM mode — flat character grid → character detail w/ allies)
// ============================================================

function renderParty() {
  const container = document.getElementById("party");
  if (!container) return;

  // Validate state — clear stale references if data was deleted out from under us.
  const chars = dmData.party.characters;
  if (selectedCharacterId && !chars.find(c => c.id === selectedCharacterId)) {
    selectedCharacterId = null;
  }

  if (selectedCharacterId) {
    container.innerHTML = renderCharacterDetailView();
  } else {
    container.innerHTML = renderCharacterGridView();
  }
  wireParty();
}

function alliesFor(characterId) {
  return (dmData.party.allies || []).filter(a => a.characterId === characterId);
}

// ----- LEVEL 1: flat character grid (no folders) -----
function renderCharacterGridView() {
  const chars = dmData.party.characters || [];
  let body;
  if (chars.length === 0 && !addingCharacter) {
    body = `<div class="notes-empty">No characters yet. Click "+ NEW CHARACTER" to add your first player.</div>`;
  } else {
    body = `<div class="character-grid">${chars.map(c => renderCharacterCard(c)).join("")}</div>`;
  }
  const addBtn = addingCharacter
    ? `<div></div>`
    : `<button class="btn" id="add-character">+ NEW CHARACTER</button>`;
  return `
    <div class="notes-header">
      <div></div>
      <div class="notes-title">PARTY</div>
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
  const allies = alliesFor(c.id);
  const alliesHtml = allies.length > 0
    ? `<div class="ally-pills">${allies.map(a => `<span class="ally-pill">${escapeHtml(a.name)}</span>`).join("")}</div>`
    : "";
  return `
    <div class="character-card">
      <div class="character-card-name clickable" data-open-character="${c.id}">${escapeHtml(c.name) || "<span class='placeholder'>(unnamed)</span>"}</div>
      <div class="character-card-meta">${escapeHtml(meta) || "&nbsp;"}</div>
      ${alliesHtml}
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
  const meta = [c.class, c.level ? "Lv " + c.level : ""].filter(Boolean).join(" · ");
  const allies = alliesFor(c.id);
  return `
    <div class="character-detail">
      <div class="detail-header">
        <button class="btn back-btn" id="back-to-character-grid">PARTY</button>
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
            <div class="panel-header" style="margin-top:14px;">COMBAT REF</div>
            <div class="detail-passives">
              <div class="detail-stat-row"><span class="detail-stat-label">HP Max</span><span class="detail-stat-value">${c.hp_max || "—"}</span></div>
              <div class="detail-stat-row"><span class="detail-stat-label">AC</span><span class="detail-stat-value">${c.ac || 10}</span></div>
            </div>
            <div class="panel-header" style="margin-top:14px;">LANGUAGES</div>
            ${renderChipReadHTML(c.languages, "lang")}
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">ATTACHED ALLIES</div>
          ${addingAlly ? renderAllyForm(null, c.id) : ""}
          ${allies.length === 0 && !addingAlly
            ? '<div class="detail-text empty">No allies attached. Click "+ NEW ALLY" to add one.</div>'
            : `<div class="ally-list">${allies.map(a => editingAllyId === a.id ? renderAllyForm(a, c.id) : renderAllyRow(a)).join("")}</div>`}
          ${!addingAlly ? `<button class="btn" id="add-ally" style="margin-top:10px;">+ NEW ALLY</button>` : ""}
        </div>

        <div class="panel">
          <div class="panel-header">FEATS</div>
          ${renderChipReadHTML(c.features, "feat")}
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

// Compact row for an attached ally inside the character detail view.
function renderAllyRow(a) {
  const isConfirming = confirmingAllyDeleteId === a.id;
  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-delete-ally="${a.id}">SURE?</button>`
    : `<button class="item-delete" data-delete-ally="${a.id}">×</button>`;
  return `
    <div class="ally-row">
      <div class="ally-name">${escapeHtml(a.name)}</div>
      <div class="ally-stats">init ${fmtMod(Number(a.initiativeMod) || 0)} · HP ${a.hp_max} · AC ${a.ac}</div>
      <button class="item-edit" data-edit-ally="${a.id}">EDIT</button>
      ${deleteBtn}
    </div>
  `;
}

// Inline ally form. Used for both adding (ally=null) and editing (ally=existing).
function renderAllyForm(ally, characterId) {
  const isEdit = !!ally;
  const a = ally || createDefaultAlly(characterId);
  const ns = isEdit ? `data-af-name="${a.id}"` : `id="new-ally-name"`;
  const init = isEdit ? `data-af-init="${a.id}"` : `id="new-ally-init"`;
  const hp   = isEdit ? `data-af-hp="${a.id}"`   : `id="new-ally-hp"`;
  const ac   = isEdit ? `data-af-ac="${a.id}"`   : `id="new-ally-ac"`;
  const saveAttr = isEdit ? `data-save-ally="${a.id}"` : `id="save-new-ally"`;
  const cancelAttr = isEdit ? `data-cancel-ally="${a.id}"` : `id="cancel-new-ally"`;
  const saveDisabled = isEdit ? "" : "disabled";
  return `
    <div class="ally-form">
      <div class="detail-form-row">
        <label class="form-label">Name <span class="required">*</span></label>
        <input type="text" ${ns} value="${escapeHtml(a.name)}" placeholder="Beast, Familiar, Steel Defender, ..." />
      </div>
      <div class="detail-form-grid-3">
        <div class="detail-form-row">
          <label class="form-label">Init Mod</label>
          <input type="number" ${init} value="${a.initiativeMod}" />
        </div>
        <div class="detail-form-row">
          <label class="form-label">HP Max</label>
          <input type="number" min="1" ${hp} value="${a.hp_max}" />
        </div>
        <div class="detail-form-row">
          <label class="form-label">AC</label>
          <input type="number" min="0" ${ac} value="${a.ac}" />
        </div>
      </div>
      <div class="form-buttons">
        <button class="btn" ${saveAttr} ${saveDisabled}>SAVE</button>
        <button class="btn danger" ${cancelAttr}>CANCEL</button>
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
            <div class="panel-header" style="margin-top:14px;">COMBAT REF</div>
            <div class="detail-form-grid">
              <div class="detail-form-row">
                <label class="form-label">HP Max</label>
                <input type="number" min="0" data-cf="hp_max" value="${c.hp_max || 0}" />
              </div>
              <div class="detail-form-row">
                <label class="form-label">AC</label>
                <input type="number" min="0" data-cf="ac" value="${c.ac || 10}" />
              </div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header">LANGUAGES</div>
          ${renderChipEditHTML(c.languages, "languages", "lang", "Add language…")}
        </div>

        <div class="panel">
          <div class="panel-header">FEATS</div>
          ${renderChipEditHTML(c.features, "features", "feat", "Add feat…")}
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
    confirmingCharacterDeleteId = null;
    confirmingAllyDeleteId = null;
  };

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
      addingAlly = false;
      editingAllyId = null;
      renderParty();
    });
  });

  // ----- character delete (cascades to its allies) -----
  document.querySelectorAll("[data-delete-character]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteCharacter;
      if (confirmingCharacterDeleteId === id) {
        dmData.party.characters = dmData.party.characters.filter(c => c.id !== id);
        dmData.party.allies = (dmData.party.allies || []).filter(a => a.characterId !== id);
        saveDmData();
        confirmingCharacterDeleteId = null;
        if (selectedCharacterId === id) selectedCharacterId = null;
        renderParty();
      } else {
        confirmingCharacterDeleteId = id;
        confirmingAllyDeleteId = null;
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
      addingAlly = false;
      editingAllyId = null;
      renderParty();
    });
  }

  // ----- enter edit mode on character detail -----
  const editBtn = document.getElementById("edit-character");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      editingCharacter = true;
      addingAlly = false;
      editingAllyId = null;
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
      updated.id = c.id;
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

  // ----- ALLY add -----
  const addAllyBtn = document.getElementById("add-ally");
  if (addAllyBtn) {
    addAllyBtn.addEventListener("click", () => {
      resetConfirm();
      addingAlly = true;
      editingAllyId = null;
      renderParty();
      const inp = document.getElementById("new-ally-name");
      if (inp) inp.focus();
    });
  }
  wireFormControls({
    nameSel: "#new-ally-name",
    saveSel: "#save-new-ally",
    cancelSel: "#cancel-new-ally",
    onSave: () => {
      const name = (document.getElementById("new-ally-name").value || "").trim();
      if (!name) return;
      const a = createDefaultAlly(selectedCharacterId);
      a.name = name;
      a.initiativeMod = clamp(Number(document.getElementById("new-ally-init").value) || 0, -10, 30);
      a.hp_max = clamp(Number(document.getElementById("new-ally-hp").value) || 10, 1, 999);
      a.ac = clamp(Number(document.getElementById("new-ally-ac").value) || 10, 0, 99);
      dmData.party.allies = dmData.party.allies || [];
      dmData.party.allies.push(a);
      saveDmData();
      addingAlly = false;
      renderParty();
    },
    onCancel: () => { addingAlly = false; renderParty(); },
  });

  // ----- ALLY edit -----
  document.querySelectorAll("[data-edit-ally]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      editingAllyId = btn.dataset.editAlly;
      addingAlly = false;
      renderParty();
      const inp = document.querySelector(`[data-af-name="${editingAllyId}"]`);
      if (inp) { inp.focus(); inp.select(); }
    });
  });

  document.querySelectorAll("[data-save-ally]").forEach(btn => {
    const id = btn.dataset.saveAlly;
    wireFormControls({
      nameSel: `[data-af-name="${id}"]`,
      saveSel: `[data-save-ally="${id}"]`,
      cancelSel: `[data-cancel-ally="${id}"]`,
      onSave: () => {
        const ally = (dmData.party.allies || []).find(a => a.id === id);
        if (!ally) return;
        const name = (document.querySelector(`[data-af-name="${id}"]`).value || "").trim();
        if (!name) return;
        ally.name = name;
        ally.initiativeMod = clamp(Number(document.querySelector(`[data-af-init="${id}"]`).value) || 0, -10, 30);
        ally.hp_max = clamp(Number(document.querySelector(`[data-af-hp="${id}"]`).value) || 10, 1, 999);
        ally.ac = clamp(Number(document.querySelector(`[data-af-ac="${id}"]`).value) || 10, 0, 99);
        saveDmData();
        editingAllyId = null;
        renderParty();
      },
      onCancel: () => { editingAllyId = null; renderParty(); },
    });
  });

  // ----- ALLY delete -----
  document.querySelectorAll("[data-delete-ally]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.deleteAlly;
      if (confirmingAllyDeleteId === id) {
        dmData.party.allies = (dmData.party.allies || []).filter(a => a.id !== id);
        saveDmData();
        confirmingAllyDeleteId = null;
        renderParty();
      } else {
        confirmingAllyDeleteId = id;
        confirmingCharacterDeleteId = null;
        renderParty();
      }
    });
  });

  // ----- chip editors (FEATS, LANGUAGES) inside the character form -----
  document.querySelectorAll("[data-chip-editor]").forEach(wireChipEditor);
}

// Read-only chip render used on the character detail panels and DM Dashboard.
// `kind` is "feat" (yellow) or "lang" (magenta) and selects the chip class.
function renderChipReadHTML(rawString, kind) {
  const chips = splitChips(rawString);
  if (chips.length === 0) return `<div class="detail-text empty">(none)</div>`;
  const cls = kind === "feat" ? "dm-feat-chip" : "dm-lang-chip";
  const wrapCls = kind === "feat" ? "dm-feat-chips" : "dm-lang-chips";
  return `<div class="${wrapCls}">${chips.map(c => `<span class="${cls}">${escapeHtml(c)}</span>`).join("")}</div>`;
}

// Editable chip block for the character form. Stores the canonical value as
// a comma-separated string in a hidden input so readCharacterForm() picks it
// up the same way as the old plain text fields.
function renderChipEditHTML(rawString, fieldName, kind, addPlaceholder) {
  const chips = splitChips(rawString);
  return `
    <div class="chip-editor" data-chip-editor="${fieldName}">
      <input type="hidden" data-cf="${fieldName}" value="${escapeHtml(chips.join(", "))}" />
      <div class="chip-editor-list ${kind === "feat" ? "feat" : "lang"}">${
        chips.map(c => renderEditableChip(c, kind)).join("")
      }</div>
      <div class="chip-editor-add">
        <input type="text" class="chip-editor-input" placeholder="${addPlaceholder}" />
        <button type="button" class="btn tiny chip-editor-add-btn">+ ADD</button>
      </div>
    </div>
  `;
}

function renderEditableChip(text, kind) {
  const cls = kind === "feat" ? "dm-feat-chip" : "dm-lang-chip";
  return `
    <span class="${cls} editable">
      <span class="chip-text">${escapeHtml(text)}</span>
      <button type="button" class="chip-remove" data-chip-remove>×</button>
    </span>
  `;
}

// Wires up an in-place chip editor: clicking + or pressing Enter adds the
// text from the input to the hidden comma-list; clicking × on a chip removes
// it. Only the chip list innerHTML is replaced — the rest of the form keeps
// its focus state.
function wireChipEditor(root) {
  if (!root) return;
  const hidden = root.querySelector('input[type="hidden"][data-cf]');
  const list = root.querySelector('.chip-editor-list');
  const input = root.querySelector('.chip-editor-input');
  const addBtn = root.querySelector('.chip-editor-add-btn');
  if (!hidden || !list || !input || !addBtn) return;
  const kind = list.classList.contains("feat") ? "feat" : "lang";

  function getChips() { return splitChips(hidden.value); }
  function setChips(chips) {
    hidden.value = chips.join(", ");
    list.innerHTML = chips.map(c => renderEditableChip(c, kind)).join("");
    list.querySelectorAll("[data-chip-remove]").forEach(b => {
      b.addEventListener("click", () => {
        const text = b.parentElement.querySelector(".chip-text").textContent;
        setChips(getChips().filter(x => x !== text));
      });
    });
  }
  function add() {
    const v = input.value.trim();
    if (!v) return;
    const chips = getChips();
    if (!chips.includes(v)) chips.push(v);
    setChips(chips);
    input.value = "";
    input.focus();
  }
  addBtn.addEventListener("click", add);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); add(); }
  });
  setChips(getChips());
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
  c.hp_max = num('input[data-cf="hp_max"]', 0, 9999, 0);
  c.ac = num('input[data-cf="ac"]', 0, 99, 10);
  c.features = val('input[data-cf="features"]');
  c.description = (get('textarea[data-cf="description"]')?.value || "").trim();
  c.personality = (get('textarea[data-cf="personality"]')?.value || "").trim();
  return c;
}

// ============================================================
// LOOT (DM mode — random item roller from items.js)
// ============================================================

function renderLoot() {
  const container = document.getElementById("loot");
  if (!container) return;

  const optionsHtml = LOOT_CATEGORIES.map(cat =>
    `<option value="${cat}" ${cat === lootCategory ? "selected" : ""}>${titleCase(cat)}</option>`
  ).join("");

  let resultsHtml;
  if (lootResults === null) {
    resultsHtml = `<div class="loot-empty">Pick a category and click ROLL to generate items.</div>`;
  } else if (lootResults.length === 0) {
    resultsHtml = `<div class="loot-empty">No items in this category.</div>`;
  } else {
    resultsHtml = `<div class="loot-results-grid">${lootResults.map(item => `
      <div class="loot-card">
        <div class="loot-name">${escapeHtml(item.name)}</div>
        <div class="loot-rarity ${item.rarity}">${formatRarity(item.rarity)}</div>
        <div class="loot-price">${item.rolledPrice} cr</div>
      </div>
    `).join("")}</div>`;
  }

  container.innerHTML = `
    <div class="notes-header">
      <div></div>
      <div class="notes-title">LOOT</div>
      <div></div>
    </div>
    <div class="loot-controls">
      <div class="loot-control">
        <label class="form-label">Category</label>
        <select id="loot-category">${optionsHtml}</select>
      </div>
      <div class="loot-control">
        <label class="form-label">Count</label>
        <input type="number" id="loot-count" min="1" max="100" value="${lootCount}" />
      </div>
      <div class="loot-control loot-control-buttons">
        <button class="btn" id="loot-roll">${lootResults === null ? "ROLL" : "REROLL"}</button>
        ${lootResults !== null ? '<button class="btn danger" id="loot-clear">CLEAR</button>' : ""}
      </div>
    </div>
    ${resultsHtml}
  `;
  wireLoot();
}

function wireLoot() {
  const cat = document.getElementById("loot-category");
  if (cat) cat.addEventListener("change", e => { lootCategory = e.target.value; });

  const count = document.getElementById("loot-count");
  if (count) count.addEventListener("input", e => {
    lootCount = clamp(Number(e.target.value) || 1, 1, 100);
  });

  const roll = document.getElementById("loot-roll");
  if (roll) roll.addEventListener("click", () => {
    lootResults = rollLoot();
    renderLoot();
  });

  const clear = document.getElementById("loot-clear");
  if (clear) clear.addEventListener("click", () => {
    lootResults = null;
    renderLoot();
  });
}

// Pick N items at random from the chosen category, with replacement (so
// duplicates can show up — same as the PWA). Each item gets a fresh price
// rolled at 75–100% of its base value.
function rollLoot() {
  if (typeof items === "undefined" || !Array.isArray(items)) return [];
  const pool = items.filter(i => i.category === lootCategory);
  if (pool.length === 0) return [];
  const result = [];
  for (let i = 0; i < lootCount; i++) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    const rolledPrice = item.price * (0.75 + Math.random() * 0.25);
    result.push({
      name: item.name,
      rarity: item.rarity,
      rolledPrice: Math.round(rolledPrice),
    });
  }
  return result;
}

function formatRarity(r) {
  if (r === "veryRare") return "Very Rare";
  return titleCase(r || "");
}

function titleCase(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ============================================================
// COMBAT (DM mode — initiative tracker, HP, conditions, XP, post-combat loot)
// ============================================================

function renderCombat() {
  const container = document.getElementById("combat");
  if (!container) return;
  const c = dmData.combat;
  if (c.finished) {
    container.innerHTML = renderCombatFinished();
  } else if (c.active) {
    container.innerHTML = renderCombatActive();
  } else {
    container.innerHTML = renderCombatSetup();
  }
  wireCombat();
}

// ----- helpers -----
function rollD20() { return Math.floor(Math.random() * 20) + 1; }

function sortCombatants(list) {
  return [...list].sort((a, b) => {
    const ai = a.initiative == null ? -999 : a.initiative;
    const bi = b.initiative == null ? -999 : b.initiative;
    return bi - ai;
  });
}

function combatantById(id) {
  return dmData.combat.combatants.find(c => c.id === id);
}

function liveParty() {
  return dmData.combat.combatants.filter(c => c.type === "party");
}

function partyDexMod(character) {
  if (!character || !character.abilities) return 0;
  return Math.floor((Number(character.abilities.DEX) - 10) / 2);
}

// ----- SETUP MODE -----
function renderCombatSetup() {
  const combatants = dmData.combat.combatants;
  const canStart = combatants.length >= 1;
  let listHtml;
  if (combatants.length === 0 && !addingCombatant) {
    listHtml = `<div class="notes-empty">No combatants. Add party members, allies, or enemies to begin.</div>`;
  } else {
    listHtml = `<div class="combat-list">${combatants.map(c => renderSetupRow(c)).join("")}</div>`;
  }
  return `
    <div class="notes-header">
      <div></div>
      <div class="notes-title">COMBAT</div>
      <div></div>
    </div>
    <div class="combat-add-buttons">
      <button class="btn" id="add-combatant-party">+ ADD PARTY</button>
      <button class="btn" id="add-combatant-ally">+ ADD ALLY</button>
      <button class="btn magenta" id="add-combatant-enemy">+ ADD ENEMY</button>
    </div>
    ${addingCombatant ? renderAddCombatantForm() : ""}
    ${listHtml}
    ${combatants.length > 0 ? `
      <div class="combat-footer">
        <button class="btn warn" id="roll-all-init">ROLL ALL INITIATIVE</button>
        <button class="btn success" id="start-combat" ${!canStart ? "disabled" : ""}>START COMBAT</button>
      </div>
    ` : ""}
  `;
}

function renderSetupRow(c) {
  const typeBadge = c.type === "enemy" ? "ENEMY" : c.type === "ally" ? "ALLY" : "PARTY";
  // Editable input so the DM can type whatever the player rolled. The
  // adjacent d20 button is a fallback (mostly used for absent players or
  // for re-rolling enemies the DM doesn't like).
  return `
    <div class="combatant-row setup ${c.type}">
      <div class="combatant-init-cell init-setup">
        <input type="number" class="init-input" data-set-init="${c.id}" value="${c.initiative ?? ""}" placeholder="?" />
        <button class="init-roll-btn" data-roll-init="${c.id}" title="Roll d20 + ${c.initBonus || 0}">d20+${c.initBonus || 0}</button>
      </div>
      <div class="combatant-name-block">
        <div class="combatant-name">${escapeHtml(c.name)}</div>
        <div class="combatant-meta">${typeBadge} · HP ${c.maxHp} · AC ${c.ac}${c.type === "enemy" && c.xp ? ` · ${c.xp} XP` : ""}${c.attachedTo ? ` · attached to ${escapeHtml(combatantById(c.attachedTo)?.name || "?")}` : ""}</div>
      </div>
      <div class="combatant-actions">
        <button class="item-delete" data-remove-combatant="${c.id}" title="remove">×</button>
      </div>
    </div>
  `;
}

// ----- ADD COMBATANT FORMS -----
function renderAddCombatantForm() {
  if (addingCombatantType === "party") return renderAddPartyForm();
  if (addingCombatantType === "ally")  return renderAddAllyForm();
  if (addingCombatantType === "enemy") return renderAddEnemyForm();
  return "";
}

function renderAddPartyForm() {
  const chars = dmData.party.characters || [];
  // Hide characters already in combat to avoid duplicates.
  const inCombatIds = new Set(dmData.combat.combatants.map(c => c.sourceCharacterId).filter(Boolean));
  const available = chars.filter(c => !inCombatIds.has(c.id));
  if (chars.length === 0) {
    return `
      <div class="combat-form">
        <div class="form-label" style="color:#ff5577;">No party characters defined yet.</div>
        <div class="subtle" style="font-size:11px;">Add players in the PARTY tab first.</div>
        <div class="form-buttons">
          <button class="btn danger" id="cancel-add-combatant">CANCEL</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="combat-form">
      <div class="form-label">Pick a player character</div>
      <div class="combat-pick-list">
        ${available.map(ch => `
          <button class="combat-pick" data-pick-party="${ch.id}">
            <span class="pick-name">${escapeHtml(ch.name) || "(unnamed)"}</span>
            <span class="pick-meta">${escapeHtml(ch.class)}${ch.level ? " · Lv " + ch.level : ""} · DEX ${fmtMod(partyDexMod(ch))}${ch.hp_max ? " · HP " + ch.hp_max : ""}</span>
          </button>
        `).join("") || `<div class="subtle" style="font-size:11px; padding:8px;">All party characters are already in combat.</div>`}
      </div>
      <div class="form-buttons">
        <button class="btn danger" id="cancel-add-combatant">CANCEL</button>
      </div>
    </div>
  `;
}

function renderAddAllyForm() {
  const allies = dmData.party.allies || [];
  const inCombatIds = new Set(dmData.combat.combatants.map(c => c.sourceAllyId).filter(Boolean));
  const available = allies.filter(a => !inCombatIds.has(a.id));
  if (allies.length === 0) {
    return `
      <div class="combat-form">
        <div class="form-label" style="color:#ff5577;">No allies defined yet.</div>
        <div class="subtle" style="font-size:11px;">Attach allies to characters in the PARTY tab first.</div>
        <div class="form-buttons">
          <button class="btn danger" id="cancel-add-combatant">CANCEL</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="combat-form">
      <div class="form-label">Pick an ally</div>
      <div class="combat-pick-list">
        ${available.map(a => {
          const parent = (dmData.party.characters || []).find(c => c.id === a.characterId);
          return `
            <button class="combat-pick" data-pick-ally="${a.id}">
              <span class="pick-name">${escapeHtml(a.name)}</span>
              <span class="pick-meta">${parent ? "attached to " + escapeHtml(parent.name) : "no parent"} · init ${fmtMod(a.initiativeMod || 0)} · HP ${a.hp_max} · AC ${a.ac}</span>
            </button>
          `;
        }).join("") || `<div class="subtle" style="font-size:11px; padding:8px;">All allies are already in combat.</div>`}
      </div>
      <div class="form-buttons">
        <button class="btn danger" id="cancel-add-combatant">CANCEL</button>
      </div>
    </div>
  `;
}

function renderAddEnemyForm() {
  return `
    <div class="combat-form">
      <div class="form-label">Add Enemy</div>
      <div class="combat-form-grid">
        <div class="detail-form-row">
          <label class="form-label">Name <span class="required">*</span></label>
          <input type="text" id="enemy-name" placeholder="Goblin, Bandit, Drone..." />
        </div>
        <div class="detail-form-row">
          <label class="form-label">Quantity</label>
          <input type="number" min="1" max="20" id="enemy-qty" value="1" />
        </div>
        <div class="detail-form-row">
          <label class="form-label">CR (auto-fills XP)</label>
          <select id="enemy-cr">
            <option value="">— none —</option>
            ${CR_OPTIONS.map(cr => `<option value="${cr}">${cr}</option>`).join("")}
          </select>
        </div>
        <div class="detail-form-row">
          <label class="form-label">XP each</label>
          <input type="number" min="0" id="enemy-xp" value="0" />
        </div>
        <div class="detail-form-row">
          <label class="form-label">HP Max</label>
          <input type="number" min="1" id="enemy-hp" value="10" />
        </div>
        <div class="detail-form-row">
          <label class="form-label">AC</label>
          <input type="number" min="0" id="enemy-ac" value="10" />
        </div>
        <div class="detail-form-row">
          <label class="form-label">Init Bonus</label>
          <input type="number" id="enemy-init-bonus" value="0" />
        </div>
        <div class="detail-form-row">
          <label class="form-label">Enemy Type (for loot)</label>
          <select id="enemy-type">
            <option value="">— none —</option>
            ${ENEMY_TYPES.map(t => `<option value="${t.id}">${t.label}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form-buttons">
        <button class="btn" id="save-enemy" disabled>ADD ENEMY</button>
        <button class="btn danger" id="cancel-add-combatant">CANCEL</button>
      </div>
    </div>
  `;
}

// ----- ACTIVE MODE -----
function renderCombatActive() {
  const combat = dmData.combat;
  const sorted = sortCombatants(combat.combatants);
  const currentId = sorted[combat.currentTurnIdx]?.id;
  const rowsHtml = sorted.map(c => renderActiveRow(c, c.id === currentId)).join("");
  return `
    <div class="combat-active-header">
      <div class="round-display">ROUND <span class="round-num">${combat.round}</span></div>
      <div class="combat-controls">
        <button class="btn tiny" id="prev-turn">PREV</button>
        <button class="btn tiny" id="next-turn">NEXT</button>
        <button class="btn tiny" id="add-mid-combat">+ ADD</button>
        <button class="btn ${confirmingFinishCombat ? "magenta" : "danger"}" id="finish-combat">${confirmingFinishCombat ? "CONFIRM FINISH" : "FINISH"}</button>
      </div>
    </div>
    ${addingCombatant ? renderAddCombatantForm() : ""}
    <div class="combat-list">${rowsHtml}</div>
  `;
}

function renderActiveRow(c, isCurrent) {
  const hpRatio = c.maxHp > 0 ? c.currentHp / c.maxHp : 0;
  const hpClass = c.currentHp === 0 ? "critical" : hpRatio <= 0.25 ? "critical" : hpRatio <= 0.5 ? "low" : "";
  const isDead = c.type === "enemy" && c.currentHp === 0;
  const downedPC = (c.type === "party" || c.type === "ally") && c.currentHp === 0;
  const conditionsHtml = (c.conditions || []).map(cond => `
    <span class="condition-pill" data-remove-condition="${c.id}|${cond.id}" title="click to remove">${cond.name}</span>
  `).join("");
  const conditionPicker = conditionPickerCombatantId === c.id ? `
    <div class="condition-picker">
      ${CONDITIONS.map(cond => `<button class="condition-option" data-add-condition="${c.id}|${cond}">${cond}</button>`).join("")}
    </div>
  ` : "";
  const deathSavesHtml = downedPC ? renderDeathSaves(c) : "";

  return `
    <div class="combatant-row ${c.type} ${isCurrent ? "current" : ""} ${isDead ? "dead" : ""}">
      <div class="combatant-init-cell">
        <span class="combatant-init">${c.initiative ?? "?"}</span>
      </div>
      <div class="combatant-name-block">
        <div class="combatant-name">${escapeHtml(c.name)}${isDead ? ` <span class="dead-tag">DEFEATED</span>` : ""}${downedPC ? ` <span class="dead-tag" style="color:#fbbf24;">DOWNED</span>` : ""}</div>
        <div class="combatant-meta">
          AC ${c.ac} ${c.type === "enemy" && c.xp ? `· ${c.xp} XP` : ""}
          ${c.attachedTo ? `· attached to ${escapeHtml(combatantById(c.attachedTo)?.name || "?")}` : ""}
        </div>
        ${conditionsHtml ? `<div class="conditions-row">${conditionsHtml}</div>` : ""}
        ${deathSavesHtml}
        ${conditionPicker}
      </div>
      <div class="combatant-hp-cell">
        <span class="combatant-hp ${hpClass}">${c.currentHp}/${c.maxHp}</span>
      </div>
      <div class="combatant-actions">
        <input class="hp-input" type="number" data-hp-amount="${c.id}" placeholder="0" />
        <button class="btn tiny danger" data-damage="${c.id}">DMG</button>
        <button class="btn tiny success" data-heal="${c.id}">HEAL</button>
        <button class="btn tiny" data-toggle-conditions="${c.id}">+ CND</button>
        <button class="item-delete" data-remove-combatant="${c.id}" title="remove">×</button>
      </div>
    </div>
  `;
}

function renderDeathSaves(c) {
  const ds = c.deathSaves || { successes: 0, failures: 0 };
  const dot = (filled, type) => `<span class="death-dot ${type} ${filled ? "filled" : ""}"></span>`;
  return `
    <div class="death-saves">
      <span class="death-label">Death Saves:</span>
      <div class="death-row">
        <span class="death-row-label">S</span>
        <button class="death-cluster" data-death-success="${c.id}">
          ${dot(ds.successes >= 1, "success")}${dot(ds.successes >= 2, "success")}${dot(ds.successes >= 3, "success")}
        </button>
      </div>
      <div class="death-row">
        <span class="death-row-label">F</span>
        <button class="death-cluster" data-death-failure="${c.id}">
          ${dot(ds.failures >= 1, "failure")}${dot(ds.failures >= 2, "failure")}${dot(ds.failures >= 3, "failure")}
        </button>
      </div>
    </div>
  `;
}

// ----- FINISHED MODE (post-combat summary + loot roll) -----
function renderCombatFinished() {
  const combat = dmData.combat;
  const xp = combat.lastEncounterXp || 0;
  const partySize = combat.combatants.filter(c => c.type === "party").length;
  const xpPer = partySize > 0 ? Math.floor(xp / partySize) : xp;
  const types = combat.defeatedEnemyTypes;

  let lootResultsHtml = "";
  if (Array.isArray(combat.postCombatLoot)) {
    if (combat.postCombatLoot.length === 0) {
      lootResultsHtml = `<div class="loot-empty">No items match the defeated enemy types.</div>`;
    } else {
      lootResultsHtml = `<div class="loot-results-grid">${combat.postCombatLoot.map(item => `
        <div class="loot-card">
          <div class="loot-name">${escapeHtml(item.name)}</div>
          <div class="loot-rarity ${item.rarity}">${formatRarity(item.rarity)}</div>
          <div class="loot-price">${item.rolledPrice} cr</div>
        </div>
      `).join("")}</div>`;
    }
  }

  return `
    <div class="notes-header">
      <div></div>
      <div class="notes-title">COMBAT ENDED</div>
      <div></div>
    </div>

    <div class="combat-summary">
      <div class="summary-stat">
        <div class="summary-label">TOTAL XP</div>
        <div class="summary-value">${xp}</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">PER PLAYER</div>
        <div class="summary-value">${xpPer}</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">PARTY SIZE</div>
        <div class="summary-value">${partySize}</div>
      </div>
      <div class="summary-stat">
        <div class="summary-label">ROUNDS</div>
        <div class="summary-value">${combat.round}</div>
      </div>
    </div>

    ${types.length > 0 ? `
      <div class="panel" style="margin-top:16px;">
        <div class="panel-header">POST-COMBAT LOOT</div>
        <div class="subtle" style="font-size:11px; margin-bottom:10px;">
          Defeated enemy types: ${types.map(t => `<strong style="color:#ff2a8a;">${escapeHtml(t)}</strong>`).join(", ")}
        </div>
        <div class="loot-controls" style="border:none; padding:0; margin-bottom:12px;">
          <div class="loot-control">
            <label class="form-label">Count</label>
            <input type="number" id="post-loot-count" min="1" max="100" value="${postCombatLootCount}" />
          </div>
          <div class="loot-control loot-control-buttons">
            <button class="btn" id="roll-post-loot">${combat.postCombatLoot === null ? "ROLL LOOT" : "REROLL"}</button>
          </div>
        </div>
        ${lootResultsHtml}
      </div>
    ` : `
      <div class="subtle" style="text-align:center; margin-top:24px; font-size:12px;">No tagged enemies defeated — no loot to roll.</div>
    `}

    <div class="combat-footer" style="margin-top:24px;">
      <button class="btn ${confirmingResetCombat ? "magenta" : "danger"}" id="reset-combat">${confirmingResetCombat ? "CONFIRM RESET" : "NEW COMBAT (RESET)"}</button>
    </div>
  `;
}

// ============================================================
// COMBAT WIRING
// ============================================================

function wireCombat() {
  // ===== ADD COMBATANT (top-level buttons) =====
  ["party", "ally", "enemy"].forEach(t => {
    const btn = document.getElementById(`add-combatant-${t}`);
    if (btn) {
      btn.addEventListener("click", () => {
        addingCombatant = true;
        addingCombatantType = t;
        renderCombat();
        if (t === "enemy") {
          const inp = document.getElementById("enemy-name");
          if (inp) {
            inp.focus();
            inp.addEventListener("input", () => {
              const save = document.getElementById("save-enemy");
              if (save) save.disabled = inp.value.trim().length === 0;
            });
          }
        }
      });
    }
  });

  const cancelAdd = document.getElementById("cancel-add-combatant");
  if (cancelAdd) cancelAdd.addEventListener("click", () => {
    addingCombatant = false;
    addingCombatantType = null;
    renderCombat();
  });

  // Mid-combat add (active mode)
  const midAdd = document.getElementById("add-mid-combat");
  if (midAdd) midAdd.addEventListener("click", () => {
    addingCombatant = true;
    addingCombatantType = "enemy";
    renderCombat();
    const inp = document.getElementById("enemy-name");
    if (inp) {
      inp.focus();
      inp.addEventListener("input", () => {
        const save = document.getElementById("save-enemy");
        if (save) save.disabled = inp.value.trim().length === 0;
      });
    }
  });

  // Pick party member from list
  document.querySelectorAll("[data-pick-party]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.pickParty;
      const ch = dmData.party.characters.find(c => c.id === id);
      if (!ch) return;
      const dexMod = partyDexMod(ch);
      dmData.combat.combatants.push({
        id: "cb" + Date.now() + Math.random().toString(36).slice(2, 7),
        type: "party",
        name: ch.name,
        sourceCharacterId: ch.id,
        sourceAllyId: null,
        maxHp: ch.hp_max || 10,
        currentHp: ch.hp_max || 10,
        ac: ch.ac || 10,
        initiative: null,
        initBonus: dexMod,
        attachedTo: null,
        deathSaves: { successes: 0, failures: 0 },
        cr: null, xp: 0, enemyType: null, dead: false,
        conditions: [],
      });
      saveDmData();
      addingCombatant = false;
      addingCombatantType = null;
      renderCombat();
    });
  });

  // Pick ally from list
  document.querySelectorAll("[data-pick-ally]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.pickAlly;
      const a = dmData.party.allies.find(x => x.id === id);
      if (!a) return;
      // If parent character is in combat, attach to them.
      const parentCombatant = dmData.combat.combatants.find(
        c => c.type === "party" && c.sourceCharacterId === a.characterId
      );
      dmData.combat.combatants.push({
        id: "cb" + Date.now() + Math.random().toString(36).slice(2, 7),
        type: "ally",
        name: a.name,
        sourceCharacterId: null,
        sourceAllyId: a.id,
        maxHp: a.hp_max || 1,
        currentHp: a.hp_max || 1,
        ac: a.ac || 10,
        initiative: parentCombatant?.initiative ?? null,
        initBonus: a.initiativeMod || 0,
        attachedTo: parentCombatant?.id || null,
        deathSaves: { successes: 0, failures: 0 },
        cr: null, xp: 0, enemyType: null, dead: false,
        conditions: [],
      });
      saveDmData();
      addingCombatant = false;
      addingCombatantType = null;
      renderCombat();
    });
  });

  // Save new enemy (with quantity)
  const saveEnemy = document.getElementById("save-enemy");
  if (saveEnemy) {
    saveEnemy.addEventListener("click", () => {
      const name = (document.getElementById("enemy-name").value || "").trim();
      if (!name) return;
      const qty = clamp(Number(document.getElementById("enemy-qty").value) || 1, 1, 20);
      const cr = document.getElementById("enemy-cr").value || null;
      const xp = clamp(Number(document.getElementById("enemy-xp").value) || 0, 0, 999999);
      const hp = clamp(Number(document.getElementById("enemy-hp").value) || 10, 1, 9999);
      const ac = clamp(Number(document.getElementById("enemy-ac").value) || 10, 0, 99);
      const initBonus = clamp(Number(document.getElementById("enemy-init-bonus").value) || 0, -10, 30);
      const enemyType = document.getElementById("enemy-type").value || null;
      for (let i = 0; i < qty; i++) {
        const suffix = qty > 1 ? ` ${i + 1}` : "";
        // Always auto-roll enemy initiative — the DM has no player to ask.
        // Setup-mode roll is editable via the init input on the row.
        const initiative = rollD20() + initBonus;
        dmData.combat.combatants.push({
          id: "cb" + Date.now() + Math.random().toString(36).slice(2, 7),
          type: "enemy",
          name: name + suffix,
          sourceCharacterId: null,
          sourceAllyId: null,
          maxHp: hp,
          currentHp: hp,
          ac, initiative,
          initBonus,
          attachedTo: null,
          deathSaves: { successes: 0, failures: 0 },
          cr, xp, enemyType, dead: false,
          conditions: [],
        });
      }
      saveDmData();
      addingCombatant = false;
      addingCombatantType = null;
      renderCombat();
    });
  }

  // CR change auto-fills XP
  const crSelect = document.getElementById("enemy-cr");
  if (crSelect) {
    crSelect.addEventListener("change", e => {
      const xp = CR_TO_XP[e.target.value];
      if (xp !== undefined) {
        const xpInput = document.getElementById("enemy-xp");
        if (xpInput) xpInput.value = xp;
      }
    });
  }

  // ===== INITIATIVE =====
  // Manual entry (party/ally rows in setup, also editable for enemies if the
  // DM wants to override the auto-roll). Save on every keystroke; do NOT
  // re-render here or the user loses focus mid-typing.
  document.querySelectorAll("[data-set-init]").forEach(input => {
    input.addEventListener("input", e => {
      const c = combatantById(input.dataset.setInit);
      if (!c) return;
      const val = input.value.trim();
      c.initiative = val === "" ? null : Number(val);
      saveDmData();
    });
  });

  document.querySelectorAll("[data-roll-init]").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = combatantById(btn.dataset.rollInit);
      if (!c) return;
      c.initiative = rollD20() + (c.initBonus || 0);
      saveDmData();
      renderCombat();
    });
  });

  const rollAll = document.getElementById("roll-all-init");
  if (rollAll) rollAll.addEventListener("click", () => {
    dmData.combat.combatants.forEach(c => {
      if (c.attachedTo) {
        // attached creatures take their parent's init
        const parent = combatantById(c.attachedTo);
        c.initiative = parent ? parent.initiative : rollD20() + (c.initBonus || 0);
      } else {
        c.initiative = rollD20() + (c.initBonus || 0);
      }
    });
    // Re-sync attached after parents rolled
    dmData.combat.combatants.forEach(c => {
      if (c.attachedTo) {
        const parent = combatantById(c.attachedTo);
        if (parent && parent.initiative != null) c.initiative = parent.initiative;
      }
    });
    saveDmData();
    renderCombat();
  });

  // ===== START COMBAT =====
  const start = document.getElementById("start-combat");
  if (start) start.addEventListener("click", () => {
    // Anyone without an initiative gets one rolled now.
    dmData.combat.combatants.forEach(c => {
      if (c.initiative == null) c.initiative = rollD20() + (c.initBonus || 0);
    });
    dmData.combat.active = true;
    dmData.combat.round = 1;
    dmData.combat.currentTurnIdx = 0;
    saveDmData();
    renderCombat();
  });

  // ===== TURN ADVANCE =====
  const next = document.getElementById("next-turn");
  if (next) next.addEventListener("click", () => {
    const sorted = sortCombatants(dmData.combat.combatants);
    if (sorted.length === 0) return;
    const newIdx = (dmData.combat.currentTurnIdx + 1) % sorted.length;
    if (newIdx === 0) dmData.combat.round += 1;
    dmData.combat.currentTurnIdx = newIdx;
    saveDmData();
    renderCombat();
  });

  const prev = document.getElementById("prev-turn");
  if (prev) prev.addEventListener("click", () => {
    const sorted = sortCombatants(dmData.combat.combatants);
    if (sorted.length === 0) return;
    let newIdx = dmData.combat.currentTurnIdx - 1;
    if (newIdx < 0) {
      newIdx = sorted.length - 1;
      if (dmData.combat.round > 1) dmData.combat.round -= 1;
    }
    dmData.combat.currentTurnIdx = newIdx;
    saveDmData();
    renderCombat();
  });

  // ===== HP DAMAGE / HEAL =====
  document.querySelectorAll("[data-damage]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.damage;
      const c = combatantById(id);
      if (!c) return;
      const inp = document.querySelector(`input[data-hp-amount="${id}"]`);
      const amt = Math.max(0, Number(inp?.value) || 0);
      if (amt === 0) return;
      c.currentHp = Math.max(0, c.currentHp - amt);
      if (c.type === "enemy" && c.currentHp === 0) c.dead = true;
      if (inp) inp.value = "";
      saveDmData();
      renderCombat();
    });
  });
  document.querySelectorAll("[data-heal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.heal;
      const c = combatantById(id);
      if (!c) return;
      const inp = document.querySelector(`input[data-hp-amount="${id}"]`);
      const amt = Math.max(0, Number(inp?.value) || 0);
      if (amt === 0) return;
      c.currentHp = Math.min(c.maxHp, c.currentHp + amt);
      if (c.currentHp > 0) {
        c.dead = false;
        // Healing a downed PC resets their death saves.
        if (c.type !== "enemy") c.deathSaves = { successes: 0, failures: 0 };
      }
      if (inp) inp.value = "";
      saveDmData();
      renderCombat();
    });
  });

  // ===== CONDITIONS =====
  document.querySelectorAll("[data-toggle-conditions]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.toggleConditions;
      conditionPickerCombatantId = conditionPickerCombatantId === id ? null : id;
      renderCombat();
    });
  });
  document.querySelectorAll("[data-add-condition]").forEach(btn => {
    btn.addEventListener("click", () => {
      const [id, name] = btn.dataset.addCondition.split("|");
      const c = combatantById(id);
      if (!c) return;
      c.conditions = c.conditions || [];
      // Avoid duplicates of the same condition.
      if (!c.conditions.find(x => x.name === name)) {
        c.conditions.push({
          id: "cnd" + Date.now() + Math.random().toString(36).slice(2, 7),
          name,
          expiresOnId: null,
          expiresAtRound: null,
        });
      }
      conditionPickerCombatantId = null;
      saveDmData();
      renderCombat();
    });
  });
  document.querySelectorAll("[data-remove-condition]").forEach(el => {
    el.addEventListener("click", () => {
      const [cid, condId] = el.dataset.removeCondition.split("|");
      const c = combatantById(cid);
      if (!c) return;
      c.conditions = (c.conditions || []).filter(x => x.id !== condId);
      saveDmData();
      renderCombat();
    });
  });

  // ===== DEATH SAVES =====
  document.querySelectorAll("[data-death-success]").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = combatantById(btn.dataset.deathSuccess);
      if (!c) return;
      c.deathSaves = c.deathSaves || { successes: 0, failures: 0 };
      // Cycle 0 → 1 → 2 → 3 → 0
      c.deathSaves.successes = (c.deathSaves.successes + 1) % 4;
      saveDmData();
      renderCombat();
    });
  });
  document.querySelectorAll("[data-death-failure]").forEach(btn => {
    btn.addEventListener("click", () => {
      const c = combatantById(btn.dataset.deathFailure);
      if (!c) return;
      c.deathSaves = c.deathSaves || { successes: 0, failures: 0 };
      c.deathSaves.failures = (c.deathSaves.failures + 1) % 4;
      saveDmData();
      renderCombat();
    });
  });

  // ===== REMOVE COMBATANT =====
  document.querySelectorAll("[data-remove-combatant]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.removeCombatant;
      dmData.combat.combatants = dmData.combat.combatants.filter(c => c.id !== id);
      // Detach anyone attached to this combatant.
      dmData.combat.combatants.forEach(c => {
        if (c.attachedTo === id) c.attachedTo = null;
      });
      // Adjust currentTurnIdx if it points past the new length.
      if (dmData.combat.currentTurnIdx >= dmData.combat.combatants.length) {
        dmData.combat.currentTurnIdx = 0;
      }
      saveDmData();
      renderCombat();
    });
  });

  // ===== FINISH COMBAT (click-to-confirm) =====
  const finish = document.getElementById("finish-combat");
  if (finish) finish.addEventListener("click", () => {
    if (!confirmingFinishCombat) {
      confirmingFinishCombat = true;
      renderCombat();
      return;
    }
    confirmingFinishCombat = false;
    const enemies = dmData.combat.combatants.filter(c => c.type === "enemy");
    const defeated = enemies.filter(c => c.dead || c.currentHp === 0);
    dmData.combat.lastEncounterXp = defeated.reduce((sum, e) => sum + (Number(e.xp) || 0), 0);
    dmData.combat.defeatedEnemyTypes = Array.from(new Set(defeated.map(e => e.enemyType).filter(Boolean)));
    dmData.combat.active = false;
    dmData.combat.finished = true;
    dmData.combat.postCombatLoot = null;
    // Encounter XP (CR-based, already a hard number) flows straight into the
    // pending pool — no multiplier, since multipliers are for narrative awards.
    if (dmData.combat.lastEncounterXp > 0) {
      dmData.xp.pending += dmData.combat.lastEncounterXp;
    }
    saveDmData();
    renderCombat();
    renderDmDashboard();
  });

  // ===== POST-COMBAT LOOT =====
  const lootCountEl = document.getElementById("post-loot-count");
  if (lootCountEl) lootCountEl.addEventListener("input", e => {
    postCombatLootCount = clamp(Number(e.target.value) || 1, 1, 100);
  });
  const rollLootBtn = document.getElementById("roll-post-loot");
  if (rollLootBtn) rollLootBtn.addEventListener("click", () => {
    dmData.combat.postCombatLoot = rollPostCombatLoot(
      dmData.combat.defeatedEnemyTypes, postCombatLootCount
    );
    saveDmData();
    renderCombat();
  });

  // ===== RESET COMBAT (click-to-confirm) =====
  const reset = document.getElementById("reset-combat");
  if (reset) reset.addEventListener("click", () => {
    if (!confirmingResetCombat) {
      confirmingResetCombat = true;
      renderCombat();
      return;
    }
    confirmingResetCombat = false;
    dmData.combat = createDefaultCombat();
    saveDmData();
    renderCombat();
  });
}

// Rolls N items from items.js where the item's `loot` array overlaps any of
// the given enemy types. Same price-variance formula as the regular Loot tab.
function rollPostCombatLoot(enemyTypes, count) {
  if (typeof items === "undefined" || !Array.isArray(items)) return [];
  if (!enemyTypes || enemyTypes.length === 0) return [];
  const types = new Set(enemyTypes);
  const pool = items.filter(i =>
    Array.isArray(i.loot) && i.loot.some(t => types.has(t))
  );
  if (pool.length === 0) return [];
  const result = [];
  for (let i = 0; i < count; i++) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    const rolledPrice = item.price * (0.75 + Math.random() * 0.25);
    result.push({
      name: item.name,
      rarity: item.rarity,
      rolledPrice: Math.round(rolledPrice),
    });
  }
  return result;
}

// ============================================================
// LOGS / LOGBOOK (DM authors via folders + entries; player imports + browses)
// ============================================================

function renderLogs() {
  const container = document.getElementById("logs");
  if (!container) return;
  if (settings.mode === "dm") {
    renderDmLogs(container);
  } else {
    renderPlayerLogs(container);
  }
}

function makeLogId(prefix) {
  return prefix + Date.now() + Math.random().toString(36).slice(2, 7);
}

function logTypeLabel(typeId) {
  return (LOG_TYPES.find(t => t.id === typeId) || LOG_TYPES[LOG_TYPES.length - 1]).label;
}

function entriesInLogFolder(folderId) {
  return logsData.entries.filter(e => e.folderId === folderId);
}

function findLogFolder(id) { return logsData.folders.find(f => f.id === id); }
function findLogEntry(id)  { return logsData.entries.find(e => e.id === id); }

function logbookSummary() {
  const folders = logsData.folders.length;
  const entries = logsData.entries.length;
  const exported = logsData.exportedAt
    ? new Date(logsData.exportedAt).toLocaleString()
    : null;
  return { folders, entries, exported };
}

// Image fetch is async — first call returns null and triggers a re-render
// once the data URL lands. Subsequent calls return the cached URL.
function fetchLogImage(entry) {
  if (!entry || !entry.imageFile) return null;
  if (logImageCache[entry.id]) return logImageCache[entry.id];
  if (window.pywebview && window.pywebview.api) {
    window.pywebview.api.get_log_image(entry.imageFile)
      .then(dataUrl => {
        if (dataUrl) {
          logImageCache[entry.id] = dataUrl;
          renderLogs();
        }
      })
      .catch(() => {});
  }
  return null;
}

// ===== DM MODE =====
function renderDmLogs(container) {
  if (selectedLogFolderId && !findLogFolder(selectedLogFolderId)) {
    selectedLogFolderId = null;
    selectedLogEntryId = null;
  }
  if (selectedLogEntryId && !findLogEntry(selectedLogEntryId)) {
    selectedLogEntryId = null;
  }

  if (selectedLogEntryId) {
    container.innerHTML = renderDmLogEntryDetail();
  } else if (selectedLogFolderId) {
    container.innerHTML = renderDmLogFolderView();
  } else {
    container.innerHTML = renderDmLogRoot();
  }
  wireDmLogs();
}

function renderDmLogRoot() {
  const folders = logsData.folders;
  const summary = logbookSummary();
  const status = logbookStatus
    ? `<div class="logs-status">${escapeHtml(logbookStatus)}</div>`
    : "";
  const grid = folders.length === 0 && !addingLogFolder
    ? `<div class="logs-empty">No folders yet. Create a folder to start building your logbook.</div>`
    : `<div class="logs-folder-grid">${folders.map(renderDmFolderCard).join("")}</div>`;
  return `
    <div class="logs-header">
      <div class="logs-header-left">
        <button class="btn" id="logs-export">SEND TO PLAYERS</button>
      </div>
      <div class="logs-title">LOGBOOK</div>
      <div class="logs-header-right">
        <button class="btn" id="logs-add-folder">+ NEW FOLDER</button>
      </div>
    </div>
    <div class="logs-summary">${summary.folders} folder${summary.folders === 1 ? "" : "s"} · ${summary.entries} entr${summary.entries === 1 ? "y" : "ies"}${summary.exported ? ` · last exported ${escapeHtml(summary.exported)}` : ""}</div>
    ${status}
    ${addingLogFolder ? renderLogFolderForm(null, true) : ""}
    ${grid}
  `;
}

function renderDmFolderCard(f) {
  if (editingLogFolderId === f.id) return renderLogFolderForm(f, false);
  const isConfirming = confirmingLogFolderDeleteId === f.id;
  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-log-folder-delete="${f.id}">SURE?</button>`
    : `<button class="item-delete" data-log-folder-delete="${f.id}">×</button>`;
  const count = entriesInLogFolder(f.id).length;
  return `
    <div class="logs-folder-card">
      <div class="logs-folder-name clickable" data-log-folder-open="${f.id}">${escapeHtml(f.name) || "(unnamed)"}</div>
      <div class="logs-folder-meta">${count} entr${count === 1 ? "y" : "ies"}</div>
      <div class="folder-card-actions">
        <button class="item-edit" data-log-folder-edit="${f.id}">RENAME</button>
        ${deleteBtn}
      </div>
    </div>
  `;
}

function renderLogFolderForm(folder, isNew) {
  const f = folder || { id: "", name: "" };
  const nameAttr   = isNew ? `id="new-log-folder-name"` : `data-lf-name="${f.id}"`;
  const saveAttr   = isNew ? `id="save-new-log-folder"` : `data-log-folder-save="${f.id}"`;
  const cancelAttr = isNew ? `id="cancel-new-log-folder"` : `data-log-folder-cancel="${f.id}"`;
  return `
    <div class="logs-folder-form">
      <input type="text" ${nameAttr} value="${escapeHtml(f.name)}" placeholder="Folder name (e.g. Lore, NPCs, Session 7)" />
      <div class="form-buttons">
        <button class="btn" ${saveAttr}>SAVE</button>
        <button class="btn danger" ${cancelAttr}>CANCEL</button>
      </div>
    </div>
  `;
}

function renderDmLogFolderView() {
  const folder = findLogFolder(selectedLogFolderId);
  if (!folder) return "";
  const entries = entriesInLogFolder(folder.id);
  const body = entries.length === 0 && !addingLogEntry
    ? `<div class="logs-empty">No entries in this folder yet.</div>`
    : `<div class="logs-entry-list">${entries.map(renderDmEntryRow).join("")}</div>`;
  return `
    <div class="logs-header">
      <div class="logs-header-left">
        <button class="btn back-btn" id="logs-back-to-root">LOGBOOK</button>
      </div>
      <div class="logs-title">${escapeHtml(folder.name)}</div>
      <div class="logs-header-right">
        <button class="btn" id="logs-add-entry">+ NEW ENTRY</button>
      </div>
    </div>
    ${addingLogEntry ? renderLogEntryForm(null, folder.id, true) : ""}
    ${body}
  `;
}

function renderDmEntryRow(e) {
  const isConfirming = confirmingLogEntryDeleteId === e.id;
  const deleteBtn = isConfirming
    ? `<button class="item-delete confirming" data-log-entry-delete="${e.id}">SURE?</button>`
    : `<button class="item-delete" data-log-entry-delete="${e.id}">×</button>`;
  return `
    <div class="logs-entry-row">
      <span class="logs-entry-type ${e.type}">${escapeHtml(logTypeLabel(e.type))}</span>
      <div class="logs-entry-title clickable" data-log-entry-open="${e.id}">${escapeHtml(e.title) || "(untitled)"}</div>
      <button class="item-edit" data-log-entry-open="${e.id}">VIEW</button>
      ${deleteBtn}
    </div>
  `;
}

function renderDmLogEntryDetail() {
  const entry = findLogEntry(selectedLogEntryId);
  if (!entry) return "";
  if (editingLogEntry) return renderLogEntryForm(entry, entry.folderId, false);
  const folder = findLogFolder(entry.folderId);
  const imgUrl = fetchLogImage(entry);
  const imgHtml = imgUrl
    ? `<div class="logs-entry-image"><img src="${imgUrl}" alt="${escapeHtml(entry.title)}" /></div>`
    : entry.imageFile
      ? `<div class="logs-entry-image loading">Loading image…</div>`
      : "";
  return `
    <div class="logs-header">
      <div class="logs-header-left">
        <button class="btn back-btn" id="logs-back-to-folder">${escapeHtml(folder ? folder.name : "BACK")}</button>
      </div>
      <div class="logs-title">${escapeHtml(entry.title) || "(untitled)"}</div>
      <div class="logs-header-right">
        <button class="btn" id="logs-edit-entry">EDIT</button>
      </div>
    </div>
    <div class="logs-entry-detail">
      <div class="logs-entry-type-row">
        <span class="logs-entry-type ${entry.type}">${escapeHtml(logTypeLabel(entry.type))}</span>
      </div>
      ${imgHtml}
      <div class="logs-entry-body">${escapeHtml(entry.body || "")}</div>
    </div>
  `;
}

function renderLogEntryForm(entry, folderId, isNew) {
  const e = entry || {
    id: makeLogId("le"),
    folderId,
    type: "character",
    title: "",
    body: "",
    imageFile: null,
  };
  const titleAttr  = isNew ? `id="new-log-entry-title"` : `data-le-title="${e.id}"`;
  const bodyAttr   = isNew ? `id="new-log-entry-body"` : `data-le-body="${e.id}"`;
  const typeAttr   = isNew ? `id="new-log-entry-type"` : `data-le-type="${e.id}"`;
  const saveAttr   = isNew ? `id="save-new-log-entry"` : `data-log-entry-save="${e.id}"`;
  const cancelAttr = isNew ? `id="cancel-new-log-entry"` : `data-log-entry-cancel="${e.id}"`;

  const typeOptions = LOG_TYPES.map(t =>
    `<option value="${t.id}" ${t.id === e.type ? "selected" : ""}>${t.label}</option>`
  ).join("");

  const imgUrl = fetchLogImage(e);
  const imgInner = imgUrl
    ? `<img src="${imgUrl}" alt="" />`
    : e.imageFile
      ? `<div class="logs-image-loading">Loading…</div>`
      : `<div class="logs-image-empty">No image — click ATTACH IMAGE.</div>`;

  return `
    <div class="logs-entry-form">
      <div class="detail-form-row">
        <label class="form-label">Title <span class="required">*</span></label>
        <input type="text" ${titleAttr} value="${escapeHtml(e.title)}" placeholder="Marcus Cole, Father's Foundation, Plasma Pistol, ..." />
      </div>
      <div class="detail-form-row">
        <label class="form-label">Type</label>
        <select ${typeAttr}>${typeOptions}</select>
      </div>
      <div class="detail-form-row">
        <label class="form-label">Body</label>
        <textarea ${bodyAttr} placeholder="Write what your players need to know.">${escapeHtml(e.body || "")}</textarea>
      </div>
      <div class="detail-form-row">
        <label class="form-label">Image</label>
        <div class="logs-image-area">${imgInner}</div>
        <div class="form-buttons">
          <button class="btn" data-log-entry-image="${e.id}">${e.imageFile ? "REPLACE IMAGE" : "ATTACH IMAGE"}</button>
          ${e.imageFile ? `<button class="btn danger" data-log-entry-image-clear="${e.id}">REMOVE IMAGE</button>` : ""}
        </div>
      </div>
      <div class="form-buttons" style="justify-content: flex-end;">
        <button class="btn danger" ${cancelAttr}>CANCEL</button>
        <button class="btn" ${saveAttr} data-log-entry-staging='${escapeHtml(JSON.stringify(e))}'>SAVE</button>
      </div>
    </div>
  `;
}

function wireDmLogs() {
  const resetConfirm = () => {
    confirmingLogFolderDeleteId = null;
    confirmingLogEntryDeleteId = null;
  };

  // EXPORT (SEND TO PLAYERS)
  const exportBtn = document.getElementById("logs-export");
  if (exportBtn) exportBtn.addEventListener("click", async () => {
    if (!window.pywebview || !window.pywebview.api) return;
    logbookStatus = "Opening save dialog…";
    renderLogs();
    try {
      // Stamp BEFORE export so the file embeds the timestamp.
      logsData.exportedAt = Date.now();
      await saveLogsData();
      const r = await window.pywebview.api.export_logbook();
      if (!r.ok) {
        // Roll back the timestamp on cancel/failure so summary doesn't lie.
        logsData.exportedAt = null;
        await saveLogsData();
        logbookStatus = r.error === "Cancelled." ? "" : `Export failed: ${r.error || "unknown"}`;
      } else {
        logbookStatus = "Exported. File Explorer is open at the file — drop it in Discord to send.";
      }
    } catch (e) {
      logbookStatus = "Export failed.";
    }
    renderLogs();
  });

  // ROOT view: + NEW FOLDER
  const addFolderBtn = document.getElementById("logs-add-folder");
  if (addFolderBtn) addFolderBtn.addEventListener("click", () => {
    resetConfirm();
    addingLogFolder = true;
    editingLogFolderId = null;
    renderLogs();
    document.getElementById("new-log-folder-name")?.focus();
  });

  const saveNewFolder = document.getElementById("save-new-log-folder");
  if (saveNewFolder) saveNewFolder.addEventListener("click", () => {
    const name = (document.getElementById("new-log-folder-name").value || "").trim();
    if (!name) return;
    logsData.folders.push({ id: makeLogId("lf"), name });
    addingLogFolder = false;
    saveLogsData();
    renderLogs();
  });
  const cancelNewFolder = document.getElementById("cancel-new-log-folder");
  if (cancelNewFolder) cancelNewFolder.addEventListener("click", () => {
    addingLogFolder = false;
    renderLogs();
  });

  // FOLDER: open
  document.querySelectorAll("[data-log-folder-open]").forEach(el => {
    el.addEventListener("click", () => {
      resetConfirm();
      selectedLogFolderId = el.dataset.logFolderOpen;
      selectedLogEntryId = null;
      addingLogEntry = false;
      editingLogEntry = false;
      renderLogs();
    });
  });

  // FOLDER: rename
  document.querySelectorAll("[data-log-folder-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      resetConfirm();
      editingLogFolderId = btn.dataset.logFolderEdit;
      addingLogFolder = false;
      renderLogs();
      document.querySelector(`[data-lf-name="${editingLogFolderId}"]`)?.focus();
    });
  });

  document.querySelectorAll("[data-log-folder-save]").forEach(btn => {
    const id = btn.dataset.logFolderSave;
    btn.addEventListener("click", () => {
      const name = (document.querySelector(`[data-lf-name="${id}"]`).value || "").trim();
      if (!name) return;
      const f = findLogFolder(id);
      if (f) f.name = name;
      editingLogFolderId = null;
      saveLogsData();
      renderLogs();
    });
  });

  document.querySelectorAll("[data-log-folder-cancel]").forEach(btn => {
    btn.addEventListener("click", () => {
      editingLogFolderId = null;
      renderLogs();
    });
  });

  // FOLDER: delete (cascades to its entries and their images)
  document.querySelectorAll("[data-log-folder-delete]").forEach(btn => {
    const id = btn.dataset.logFolderDelete;
    btn.addEventListener("click", async () => {
      if (confirmingLogFolderDeleteId === id) {
        const orphaned = logsData.entries.filter(e => e.folderId === id);
        for (const e of orphaned) {
          if (e.imageFile && window.pywebview && window.pywebview.api) {
            try { await window.pywebview.api.delete_log_image(e.id); } catch (err) {}
          }
        }
        logsData.entries = logsData.entries.filter(e => e.folderId !== id);
        logsData.folders = logsData.folders.filter(f => f.id !== id);
        confirmingLogFolderDeleteId = null;
        saveLogsData();
        renderLogs();
      } else {
        confirmingLogFolderDeleteId = id;
        confirmingLogEntryDeleteId = null;
        renderLogs();
      }
    });
  });

  // BACK navigation
  const backRoot = document.getElementById("logs-back-to-root");
  if (backRoot) backRoot.addEventListener("click", () => {
    resetConfirm();
    selectedLogFolderId = null;
    selectedLogEntryId = null;
    addingLogEntry = false;
    editingLogEntry = false;
    renderLogs();
  });

  const backFolder = document.getElementById("logs-back-to-folder");
  if (backFolder) backFolder.addEventListener("click", () => {
    resetConfirm();
    selectedLogEntryId = null;
    editingLogEntry = false;
    renderLogs();
  });

  // ENTRY: add
  const addEntryBtn = document.getElementById("logs-add-entry");
  if (addEntryBtn) addEntryBtn.addEventListener("click", () => {
    resetConfirm();
    addingLogEntry = true;
    selectedLogEntryId = null;
    editingLogEntry = false;
    renderLogs();
    document.getElementById("new-log-entry-title")?.focus();
  });

  const saveNewEntry = document.getElementById("save-new-log-entry");
  if (saveNewEntry) saveNewEntry.addEventListener("click", () => {
    let staged = {};
    try { staged = JSON.parse(saveNewEntry.dataset.logEntryStaging || "{}"); } catch (e) {}
    const title = (document.getElementById("new-log-entry-title").value || "").trim();
    if (!title) return;
    const body = (document.getElementById("new-log-entry-body").value || "").trim();
    const type = document.getElementById("new-log-entry-type").value || "other";
    logsData.entries.push({
      id: staged.id || makeLogId("le"),
      folderId: selectedLogFolderId,
      type, title, body,
      imageFile: staged.imageFile || null,
    });
    addingLogEntry = false;
    saveLogsData();
    renderLogs();
  });

  const cancelNewEntry = document.getElementById("cancel-new-log-entry");
  if (cancelNewEntry) cancelNewEntry.addEventListener("click", async () => {
    // Clean up any image attached to a not-yet-saved entry so we don't orphan it.
    let staged = {};
    try { staged = JSON.parse(cancelNewEntry.dataset.logEntryStaging || "{}"); } catch (e) {}
    if (staged.id && staged.imageFile && window.pywebview && window.pywebview.api) {
      try { await window.pywebview.api.delete_log_image(staged.id); } catch (e) {}
    }
    addingLogEntry = false;
    renderLogs();
  });

  // ENTRY: open
  document.querySelectorAll("[data-log-entry-open]").forEach(el => {
    el.addEventListener("click", () => {
      resetConfirm();
      selectedLogEntryId = el.dataset.logEntryOpen;
      editingLogEntry = false;
      addingLogEntry = false;
      renderLogs();
    });
  });

  // ENTRY: edit
  const editEntryBtn = document.getElementById("logs-edit-entry");
  if (editEntryBtn) editEntryBtn.addEventListener("click", () => {
    editingLogEntry = true;
    renderLogs();
    document.querySelector(`[data-le-title="${selectedLogEntryId}"]`)?.focus();
  });

  document.querySelectorAll("[data-log-entry-save]").forEach(btn => {
    const id = btn.dataset.logEntrySave;
    btn.addEventListener("click", () => {
      const e = findLogEntry(id);
      if (!e) return;
      const title = (document.querySelector(`[data-le-title="${id}"]`).value || "").trim();
      if (!title) return;
      e.title = title;
      e.body = (document.querySelector(`[data-le-body="${id}"]`).value || "").trim();
      e.type = document.querySelector(`[data-le-type="${id}"]`).value || "other";
      editingLogEntry = false;
      saveLogsData();
      renderLogs();
    });
  });

  document.querySelectorAll("[data-log-entry-cancel]").forEach(btn => {
    btn.addEventListener("click", () => {
      editingLogEntry = false;
      renderLogs();
    });
  });

  // ENTRY: delete
  document.querySelectorAll("[data-log-entry-delete]").forEach(btn => {
    const id = btn.dataset.logEntryDelete;
    btn.addEventListener("click", async () => {
      if (confirmingLogEntryDeleteId === id) {
        const e = findLogEntry(id);
        if (e && e.imageFile && window.pywebview && window.pywebview.api) {
          try { await window.pywebview.api.delete_log_image(e.id); } catch (err) {}
        }
        logsData.entries = logsData.entries.filter(x => x.id !== id);
        confirmingLogEntryDeleteId = null;
        if (selectedLogEntryId === id) selectedLogEntryId = null;
        saveLogsData();
        renderLogs();
      } else {
        confirmingLogEntryDeleteId = id;
        confirmingLogFolderDeleteId = null;
        renderLogs();
      }
    });
  });

  // ENTRY: image attach / replace
  document.querySelectorAll("[data-log-entry-image]").forEach(btn => {
    const id = btn.dataset.logEntryImage;
    btn.addEventListener("click", async () => {
      if (!window.pywebview || !window.pywebview.api) return;
      try {
        const r = await window.pywebview.api.pick_log_image(id);
        if (r && r.ok) {
          const target = findLogEntry(id);
          if (target) {
            target.imageFile = r.filename;
            saveLogsData();
          } else {
            // Add-form case — entry isn't in logsData yet. Stash filename
            // in the SAVE button's staging blob so it persists on save.
            const saveBtn = document.getElementById("save-new-log-entry");
            if (saveBtn) {
              let staged = {};
              try { staged = JSON.parse(saveBtn.dataset.logEntryStaging || "{}"); } catch (e) {}
              staged.imageFile = r.filename;
              saveBtn.dataset.logEntryStaging = JSON.stringify(staged);
            }
          }
          if (r.data_url) logImageCache[id] = r.data_url;
          renderLogs();
        }
      } catch (e) {}
    });
  });

  // ENTRY: image clear
  document.querySelectorAll("[data-log-entry-image-clear]").forEach(btn => {
    const id = btn.dataset.logEntryImageClear;
    btn.addEventListener("click", async () => {
      if (window.pywebview && window.pywebview.api) {
        try { await window.pywebview.api.delete_log_image(id); } catch (e) {}
      }
      delete logImageCache[id];
      const target = findLogEntry(id);
      if (target) {
        target.imageFile = null;
        saveLogsData();
      } else {
        const saveBtn = document.getElementById("save-new-log-entry");
        if (saveBtn) {
          let staged = {};
          try { staged = JSON.parse(saveBtn.dataset.logEntryStaging || "{}"); } catch (e) {}
          staged.imageFile = null;
          saveBtn.dataset.logEntryStaging = JSON.stringify(staged);
        }
      }
      renderLogs();
    });
  });
}

// ===== PLAYER MODE (read-only viewer) =====
function renderPlayerLogs(container) {
  if (selectedLogFolderId && !findLogFolder(selectedLogFolderId)) {
    selectedLogFolderId = null;
    selectedLogEntryId = null;
  }
  if (selectedLogEntryId && !findLogEntry(selectedLogEntryId)) {
    selectedLogEntryId = null;
  }

  if (selectedLogEntryId) {
    container.innerHTML = renderPlayerLogEntryDetail();
  } else if (selectedLogFolderId) {
    container.innerHTML = renderPlayerLogFolderView();
  } else {
    container.innerHTML = renderPlayerLogRoot();
  }
  wirePlayerLogs();
}

function renderPlayerLogRoot() {
  const folders = logsData.folders;
  const summary = logbookSummary();
  let body;
  if (folders.length === 0) {
    body = `<div class="logs-empty">No logbook imported yet. Ask your DM to send one, then import it via Settings.</div>`;
  } else {
    body = `<div class="logs-folder-grid">${folders.map(renderPlayerFolderCard).join("")}</div>`;
  }
  return `
    <div class="logs-header">
      <div class="logs-header-left"></div>
      <div class="logs-title">LOGBOOK</div>
      <div class="logs-header-right"></div>
    </div>
    <div class="logs-summary">${summary.entries} entr${summary.entries === 1 ? "y" : "ies"}${summary.exported ? ` · received ${escapeHtml(summary.exported)}` : ""}</div>
    ${body}
  `;
}

function renderPlayerFolderCard(f) {
  const count = entriesInLogFolder(f.id).length;
  return `
    <div class="logs-folder-card">
      <div class="logs-folder-name clickable" data-log-folder-open="${f.id}">${escapeHtml(f.name) || "(unnamed)"}</div>
      <div class="logs-folder-meta">${count} entr${count === 1 ? "y" : "ies"}</div>
    </div>
  `;
}

function renderPlayerLogFolderView() {
  const folder = findLogFolder(selectedLogFolderId);
  if (!folder) return "";
  const entries = entriesInLogFolder(folder.id);
  const body = entries.length === 0
    ? `<div class="logs-empty">No entries in this folder.</div>`
    : `<div class="logs-entry-list">${entries.map(renderPlayerEntryRow).join("")}</div>`;
  return `
    <div class="logs-header">
      <div class="logs-header-left">
        <button class="btn back-btn" id="logs-back-to-root">LOGBOOK</button>
      </div>
      <div class="logs-title">${escapeHtml(folder.name)}</div>
      <div class="logs-header-right"></div>
    </div>
    ${body}
  `;
}

function renderPlayerEntryRow(e) {
  return `
    <div class="logs-entry-row">
      <span class="logs-entry-type ${e.type}">${escapeHtml(logTypeLabel(e.type))}</span>
      <div class="logs-entry-title clickable" data-log-entry-open="${e.id}">${escapeHtml(e.title) || "(untitled)"}</div>
      <button class="item-edit" data-log-entry-open="${e.id}">VIEW</button>
    </div>
  `;
}

function renderPlayerLogEntryDetail() {
  const entry = findLogEntry(selectedLogEntryId);
  if (!entry) return "";
  const folder = findLogFolder(entry.folderId);
  const imgUrl = fetchLogImage(entry);
  const imgHtml = imgUrl
    ? `<div class="logs-entry-image"><img src="${imgUrl}" alt="${escapeHtml(entry.title)}" /></div>`
    : entry.imageFile
      ? `<div class="logs-entry-image loading">Loading image…</div>`
      : "";
  return `
    <div class="logs-header">
      <div class="logs-header-left">
        <button class="btn back-btn" id="logs-back-to-folder">${escapeHtml(folder ? folder.name : "BACK")}</button>
      </div>
      <div class="logs-title">${escapeHtml(entry.title) || "(untitled)"}</div>
      <div class="logs-header-right"></div>
    </div>
    <div class="logs-entry-detail">
      <div class="logs-entry-type-row">
        <span class="logs-entry-type ${entry.type}">${escapeHtml(logTypeLabel(entry.type))}</span>
      </div>
      ${imgHtml}
      <div class="logs-entry-body">${escapeHtml(entry.body || "")}</div>
    </div>
  `;
}

function wirePlayerLogs() {
  document.querySelectorAll("[data-log-folder-open]").forEach(el => {
    el.addEventListener("click", () => {
      selectedLogFolderId = el.dataset.logFolderOpen;
      selectedLogEntryId = null;
      renderLogs();
    });
  });

  document.querySelectorAll("[data-log-entry-open]").forEach(el => {
    el.addEventListener("click", () => {
      selectedLogEntryId = el.dataset.logEntryOpen;
      renderLogs();
    });
  });

  const backRoot = document.getElementById("logs-back-to-root");
  if (backRoot) backRoot.addEventListener("click", () => {
    selectedLogFolderId = null;
    selectedLogEntryId = null;
    renderLogs();
  });

  const backFolder = document.getElementById("logs-back-to-folder");
  if (backFolder) backFolder.addEventListener("click", () => {
    selectedLogEntryId = null;
    renderLogs();
  });
}

// ----- Settings IMPORT LOGBOOK button (player mode only) -----
function wireImportLogbookButton() {
  const btn = document.getElementById("import-logbook");
  const status = document.getElementById("import-logbook-status");
  if (!btn || !status) return;
  btn.addEventListener("click", async () => {
    if (!window.pywebview || !window.pywebview.api) return;
    status.className = "update-status";
    status.textContent = "Importing…";
    btn.disabled = true;
    try {
      const r = await window.pywebview.api.import_logbook();
      if (!r.ok) {
        if (r.error === "Cancelled.") {
          status.textContent = "";
        } else {
          status.classList.add("err");
          status.textContent = r.error || "Import failed.";
        }
      } else {
        await loadLogsData();
        selectedLogFolderId = null;
        selectedLogEntryId = null;
        logImageCache = {};
        renderLogs();
        status.classList.add("ok");
        status.textContent = "Logbook imported.";
      }
    } catch (e) {
      status.classList.add("err");
      status.textContent = "Import failed.";
    }
    btn.disabled = false;
  });
}

// Hide the IMPORT LOGBOOK row when the DM is the active mode (DM doesn't
// import — they author). Called whenever mode changes.
function refreshImportLogbookVisibility() {
  const row = document.getElementById("settings-import-row");
  if (!row) return;
  row.style.display = settings.mode === "player" ? "" : "none";
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
