// Tabs per mode. Settings is NOT here — it lives as a corner button so each
// mode shows exactly the four in-game tabs the user specified.
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

let settings = { mode: "player" };
let activeView = "dashboard";

// Render eagerly with defaults so the preview panel works even before the
// Python bridge attaches. The pywebviewready handler then upgrades to real
// settings when running inside the actual app.
document.addEventListener("DOMContentLoaded", () => {
  renderTabs();
  setActiveView("dashboard");
  wireSettingsButton();
  wireModeSwitch();
  wireUpdateButton();
});

window.addEventListener("pywebviewready", async () => {
  await loadVersion();
  await loadSettings();
  renderTabs();
  setActiveView(activeView);
});

async function loadSettings() {
  try {
    const s = await window.pywebview.api.get_settings();
    if (s && typeof s === "object") settings = s;
  } catch (e) {}
  if (settings.mode !== "player" && settings.mode !== "dm") {
    settings.mode = "player";
  }
}

async function saveSettings() {
  try {
    await window.pywebview.api.save_settings(settings);
  } catch (e) {}
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
  // If a stale view (from the other mode) is requested, fall back to dashboard.
  const allowed = TABS[settings.mode].map(t => t.id);
  if (viewId !== "settings" && !allowed.includes(viewId)) {
    viewId = "dashboard";
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
      // Stay on Settings while toggling so user can flip modes back-to-back.
      setActiveView("settings");
    });
  });
}

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
