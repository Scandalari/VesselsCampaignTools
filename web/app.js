// Wait for the Python JsApi bridge to be ready before any window.pywebview.api
// calls — the api object isn't attached until after pywebviewready fires.
window.addEventListener("pywebviewready", init);

async function init() {
  await loadVersion();
  wireTabs();
  wireUpdateButton();
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

function wireTabs() {
  const tabs = document.querySelectorAll(".tab");
  const views = document.querySelectorAll(".view");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const target = tab.dataset.view;
      tabs.forEach((t) => t.classList.toggle("active", t === tab));
      views.forEach((v) => v.classList.toggle("active", v.dataset.view === target));
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
