import json
import os
import subprocess
import tempfile
import threading
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

import webview

# Source of truth for app version. installer.iss MyAppVersion must match
# before each release build (build.bat handles the bump for both).
__version__ = "1.0.1"
GITHUB_REPO = "Scandalari/VesselsCampaignTools"

WEB_DIR = Path(__file__).parent / "web"
APP_DATA_DIR = Path(os.environ.get("APPDATA", str(Path.home()))) / "KizunaTablet"
SETTINGS_PATH = APP_DATA_DIR / "settings.json"
DEFAULT_SETTINGS = {"mode": "player"}

WINDOW_TITLE = "Kizuna Tablet"


def _parse_version(s):
    if not s:
        return None
    s = s.strip()
    if s[:1].lower() == "v":
        s = s[1:]
    try:
        return tuple(int(p) for p in s.split("."))
    except ValueError:
        return None


def _load_settings():
    try:
        with open(SETTINGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return dict(DEFAULT_SETTINGS)
    merged = dict(DEFAULT_SETTINGS)
    if isinstance(data, dict):
        merged.update(data)
    return merged


def _save_settings(settings):
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(SETTINGS_PATH, "w", encoding="utf-8") as f:
            json.dump(settings, f, indent=2)
        return True
    except OSError:
        return False


class JsApi:
    """Methods exposed to the web UI via window.pywebview.api.<name>()."""

    def get_version(self):
        return __version__

    def get_settings(self):
        return _load_settings()

    def save_settings(self, settings):
        if not isinstance(settings, dict):
            return {"ok": False}
        merged = dict(DEFAULT_SETTINGS)
        merged.update(settings)
        return {"ok": _save_settings(merged)}

    def check_for_update(self):
        payload = {
            "current": __version__,
            "latest": None,
            "has_update": False,
            "html_url": None,
            "asset_url": None,
            "error": None,
        }
        try:
            req = urllib.request.Request(
                f"https://api.github.com/repos/{GITHUB_REPO}/releases/latest",
                headers={
                    "User-Agent": f"KizunaTablet/{__version__}",
                    "Accept": "application/vnd.github+json",
                },
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                data = json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError):
            payload["error"] = "Couldn't reach GitHub."
            return payload

        payload["latest"] = (data.get("tag_name") or "").strip() or None
        payload["html_url"] = data.get("html_url")

        for asset in data.get("assets", []) or []:
            name = asset.get("name", "") or ""
            if name.lower().endswith(".exe"):
                payload["asset_url"] = asset.get("browser_download_url")
                break

        current_v = _parse_version(__version__)
        latest_v = _parse_version(payload["latest"])
        if current_v is not None and latest_v is not None:
            payload["has_update"] = latest_v > current_v
        return payload

    def open_release_page(self, url):
        # Only allow github.com URLs through — JsApi is reachable from any JS
        # context and webbrowser.open will happily launch anything.
        if not isinstance(url, str) or not url.startswith("https://github.com/"):
            return False
        webbrowser.open(url)
        return True

    def download_and_install_update(self, url):
        if not isinstance(url, str) or not url.startswith("https://github.com/"):
            return {"ok": False, "error": "Invalid update URL."}

        try:
            tmp_fd, tmp_path = tempfile.mkstemp(
                suffix=".exe", prefix="KizunaTablet-Setup-"
            )
            os.close(tmp_fd)
            req = urllib.request.Request(
                url,
                headers={"User-Agent": f"KizunaTablet/{__version__}"},
            )
            with urllib.request.urlopen(req, timeout=60) as resp, open(tmp_path, "wb") as f:
                while True:
                    chunk = resp.read(64 * 1024)
                    if not chunk:
                        break
                    f.write(chunk)
        except (urllib.error.URLError, TimeoutError, OSError):
            return {"ok": False, "error": "Couldn't download the update."}

        try:
            # Detached so the installer outlives our process. /SILENT shows a
            # progress bar but skips wizard prompts; /SUPPRESSMSGBOXES kills
            # confirmation dialogs. Inno Setup re-launches the app on finish.
            creationflags = 0
            if hasattr(subprocess, "DETACHED_PROCESS"):
                creationflags |= subprocess.DETACHED_PROCESS
            if hasattr(subprocess, "CREATE_NEW_PROCESS_GROUP"):
                creationflags |= subprocess.CREATE_NEW_PROCESS_GROUP
            subprocess.Popen(
                [tmp_path, "/SILENT", "/SUPPRESSMSGBOXES"],
                creationflags=creationflags,
                close_fds=True,
            )
        except OSError:
            return {"ok": False, "error": "Couldn't launch the installer."}

        # Brief delay lets pywebview ship our return value back to JS before
        # the installer overwrites the running .exe.
        threading.Timer(0.5, lambda: os._exit(0)).start()
        return {"ok": True, "error": None}


def main():
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    index = WEB_DIR / "index.html"
    webview.create_window(
        WINDOW_TITLE,
        url=str(index),
        js_api=JsApi(),
        width=1280,
        height=820,
        min_size=(900, 600),
        background_color="#0a0a14",
    )
    webview.start()


if __name__ == "__main__":
    main()
