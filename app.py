import base64
import json
import os
import shutil
import subprocess
import tempfile
import threading
import urllib.error
import urllib.request
import webbrowser
import zipfile
from pathlib import Path

import webview

# Source of truth for app version. installer.iss MyAppVersion must match
# before each release build (build.bat handles the bump for both).
__version__ = "1.3.0"
GITHUB_REPO = "Scandalari/VesselsCampaignTools"

WEB_DIR = Path(__file__).parent / "web"
APP_DATA_DIR = Path(os.environ.get("APPDATA", str(Path.home()))) / "KizunaTablet"
SETTINGS_PATH = APP_DATA_DIR / "settings.json"
CHARACTER_PATH = APP_DATA_DIR / "character.json"
DM_DATA_PATH = APP_DATA_DIR / "dm.json"
PORTRAITS_DIR = APP_DATA_DIR / "portraits"
LOGS_PATH = APP_DATA_DIR / "logs.json"
LOG_IMAGES_DIR = APP_DATA_DIR / "logs-images"
DEFAULT_SETTINGS = {"mode": "player"}
DEFAULT_LOGS = {"folders": [], "entries": [], "exportedAt": None}
LOG_IMAGE_EXTS = (".png", ".jpg", ".jpeg", ".gif", ".webp")

# DM-mode data lives in its own file so player-character data stays clean for
# future per-character import/export. Loot and Combat will nest as siblings of
# "party" inside this same file.
DEFAULT_DM_DATA = {
    "party": {"characters": [], "allies": []},
    "combat": {
        "active": False,
        "finished": False,
        "round": 1,
        "currentTurnIdx": 0,
        "combatants": [],
        "lastEncounterXp": 0,
        "postCombatLoot": None,
        "defeatedEnemyTypes": [],
    },
}

DEFAULT_CHARACTER = {
    "name": "",
    "origin": "",
    "class": "",
    "subclass": "",
    "level": 1,
    "icon_filename": None,
    "abilities": {"STR": 10, "DEX": 10, "CON": 10, "INT": 10, "WIS": 10, "CHA": 10},
    "saves_proficient": [],
    "skills": {
        "Acrobatics": "none", "Animal Handling": "none", "Arcana": "none",
        "Athletics": "none", "Deception": "none", "History": "none",
        "Insight": "none", "Intimidation": "none", "Investigation": "none",
        "Medicine": "none", "Nature": "none", "Perception": "none",
        "Performance": "none", "Persuasion": "none", "Religion": "none",
        "Sleight of Hand": "none", "Stealth": "none", "Survival": "none",
    },
    "speed": 30,
    "armor": {
        "type": "unarmored",
        "base_ac": 10,
        "shield": False,
        "misc_bonus": 0,
    },
    "hp": {"current": 8, "max": 8, "temp": 0},
    "spell_slots": {},
    "pact_slots": None,
    "actions": [],
    "action_economy": {
        "Action": True, "Bonus": True, "Reaction": True,
        "Movement": True, "Object": True,
    },
    "proficiencies": {"armor": "", "weapons": "", "tools": "", "languages": ""},
    "inventory": [],
    "notes": {"folders": [], "items": []},
    "allies": [],
}

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


def _deep_copy(obj):
    return json.loads(json.dumps(obj))


def _merge_character(data):
    """Merge loaded data over a fresh DEFAULT_CHARACTER copy so future-added
    keys don't break loading of old saves. One level deep — sub-dicts get
    .update()'d, lists/scalars are replaced wholesale."""
    base = _deep_copy(DEFAULT_CHARACTER)
    for key, value in data.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            base[key].update(value)
        else:
            base[key] = value
    return base


def _load_character():
    try:
        with open(CHARACTER_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return _deep_copy(DEFAULT_CHARACTER)
    if not isinstance(data, dict):
        return _deep_copy(DEFAULT_CHARACTER)
    return _merge_character(data)


def _save_character(char):
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(CHARACTER_PATH, "w", encoding="utf-8") as f:
            json.dump(char, f, indent=2)
        return True
    except OSError:
        return False


def _load_dm_data():
    try:
        with open(DM_DATA_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return _deep_copy(DEFAULT_DM_DATA)
    if not isinstance(data, dict):
        return _deep_copy(DEFAULT_DM_DATA)
    base = _deep_copy(DEFAULT_DM_DATA)
    for key, value in data.items():
        if key in base and isinstance(base[key], dict) and isinstance(value, dict):
            merged = dict(base[key]); merged.update(value)
            base[key] = merged
        else:
            base[key] = value
    return base


def _save_dm_data(data):
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(DM_DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return True
    except OSError:
        return False


def _portrait_to_base64(filename):
    if not filename:
        return None
    path = PORTRAITS_DIR / filename
    try:
        with open(path, "rb") as f:
            data = f.read()
    except (FileNotFoundError, OSError):
        return None
    ext = path.suffix.lower().lstrip(".")
    mime = "jpeg" if ext == "jpg" else ext
    return f"data:image/{mime};base64,{base64.b64encode(data).decode('ascii')}"


def _log_image_to_base64(filename):
    if not filename:
        return None
    path = LOG_IMAGES_DIR / filename
    try:
        with open(path, "rb") as f:
            data = f.read()
    except (FileNotFoundError, OSError):
        return None
    ext = path.suffix.lower().lstrip(".")
    mime = "jpeg" if ext == "jpg" else ext
    return f"data:image/{mime};base64,{base64.b64encode(data).decode('ascii')}"


def _load_logs():
    try:
        with open(LOGS_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return _deep_copy(DEFAULT_LOGS)
    if not isinstance(data, dict):
        return _deep_copy(DEFAULT_LOGS)
    base = _deep_copy(DEFAULT_LOGS)
    if isinstance(data.get("folders"), list): base["folders"] = data["folders"]
    if isinstance(data.get("entries"), list): base["entries"] = data["entries"]
    if "exportedAt" in data: base["exportedAt"] = data["exportedAt"]
    return base


def _save_logs(data):
    APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
    try:
        with open(LOGS_PATH, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        return True
    except OSError:
        return False


def _wipe_log_images():
    """Delete every file in logs-images/. Used by import to start clean."""
    if not LOG_IMAGES_DIR.exists():
        return
    for p in LOG_IMAGES_DIR.iterdir():
        try:
            if p.is_file():
                p.unlink()
        except OSError:
            pass


def _show_in_explorer(path):
    """Open Windows Explorer with the given file pre-selected."""
    try:
        subprocess.Popen(["explorer", "/select,", str(path)])
    except OSError:
        pass


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

    def get_character(self):
        return _load_character()

    def save_character(self, char):
        if not isinstance(char, dict):
            return {"ok": False}
        return {"ok": _save_character(char)}

    def get_dm_data(self):
        return _load_dm_data()

    def save_dm_data(self, data):
        if not isinstance(data, dict):
            return {"ok": False}
        return {"ok": _save_dm_data(data)}

    def get_portrait_data(self, filename):
        return _portrait_to_base64(filename)

    def pick_portrait(self):
        """Native file dialog → copy chosen image into PORTRAITS_DIR → return
        the new filename + base64 data URL. Filename is always portrait.<ext>
        so old uploads get overwritten (one portrait per character)."""
        PORTRAITS_DIR.mkdir(parents=True, exist_ok=True)
        try:
            result = webview.windows[0].create_file_dialog(
                webview.OPEN_DIALOG,
                allow_multiple=False,
                file_types=("Image files (*.png;*.jpg;*.jpeg;*.gif;*.webp)",),
            )
        except Exception:
            return {"ok": False, "error": "File dialog failed."}
        if not result:
            return {"ok": False, "error": "Cancelled."}
        src = Path(result[0] if isinstance(result, (list, tuple)) else result)
        if not src.exists():
            return {"ok": False, "error": "File not found."}
        ext = src.suffix.lower()
        if ext not in (".png", ".jpg", ".jpeg", ".gif", ".webp"):
            return {"ok": False, "error": "Unsupported image format."}
        dest = PORTRAITS_DIR / f"portrait{ext}"
        # Wipe any other-extension portrait that might be lingering so we don't
        # end up with both portrait.png and portrait.jpg.
        for existing in PORTRAITS_DIR.glob("portrait.*"):
            if existing != dest:
                try:
                    existing.unlink()
                except OSError:
                    pass
        try:
            shutil.copyfile(src, dest)
        except OSError:
            return {"ok": False, "error": "Couldn't copy file."}
        return {
            "ok": True,
            "filename": dest.name,
            "data_url": _portrait_to_base64(dest.name),
        }

    # ----- Logbook (DM authors, players consume via export/import) -----

    def get_logs_data(self):
        return _load_logs()

    def save_logs_data(self, data):
        if not isinstance(data, dict):
            return {"ok": False}
        return {"ok": _save_logs(data)}

    def get_log_image(self, filename):
        return _log_image_to_base64(filename)

    def pick_log_image(self, entry_id):
        """Native file dialog → copy chosen image into LOG_IMAGES_DIR named
        after the entry id → return new filename + base64 data URL."""
        if not isinstance(entry_id, str) or not entry_id:
            return {"ok": False, "error": "Bad entry id."}
        LOG_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
        try:
            result = webview.windows[0].create_file_dialog(
                webview.OPEN_DIALOG,
                allow_multiple=False,
                file_types=("Image files (*.png;*.jpg;*.jpeg;*.gif;*.webp)",),
            )
        except Exception:
            return {"ok": False, "error": "File dialog failed."}
        if not result:
            return {"ok": False, "error": "Cancelled."}
        src = Path(result[0] if isinstance(result, (list, tuple)) else result)
        if not src.exists():
            return {"ok": False, "error": "File not found."}
        ext = src.suffix.lower()
        if ext not in LOG_IMAGE_EXTS:
            return {"ok": False, "error": "Unsupported image format."}
        # One image per entry — wipe any other-extension file for this id so we
        # don't leave dead .png alongside a new .jpg.
        for existing in LOG_IMAGES_DIR.glob(f"{entry_id}.*"):
            try:
                existing.unlink()
            except OSError:
                pass
        dest = LOG_IMAGES_DIR / f"{entry_id}{ext}"
        try:
            shutil.copyfile(src, dest)
        except OSError:
            return {"ok": False, "error": "Couldn't copy file."}
        return {
            "ok": True,
            "filename": dest.name,
            "data_url": _log_image_to_base64(dest.name),
        }

    def delete_log_image(self, entry_id):
        if not isinstance(entry_id, str) or not entry_id:
            return {"ok": False}
        if not LOG_IMAGES_DIR.exists():
            return {"ok": True}
        for existing in LOG_IMAGES_DIR.glob(f"{entry_id}.*"):
            try:
                existing.unlink()
            except OSError:
                pass
        return {"ok": True}

    def export_logbook(self):
        """Bundle logs.json + every file in logs-images/ into a .kizunalog
        zip at a user-chosen path, then open File Explorer with it selected.
        Local logs are not modified."""
        try:
            result = webview.windows[0].create_file_dialog(
                webview.SAVE_DIALOG,
                save_filename="logbook.kizunalog",
                file_types=("Kizuna Logbook (*.kizunalog)",),
            )
        except Exception:
            return {"ok": False, "error": "File dialog failed."}
        if not result:
            return {"ok": False, "error": "Cancelled."}
        out_path = Path(result if isinstance(result, str) else result[0])
        if out_path.suffix.lower() != ".kizunalog":
            out_path = out_path.with_suffix(".kizunalog")

        logs = _load_logs()
        try:
            with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.writestr("logbook.json", json.dumps(logs, indent=2))
                if LOG_IMAGES_DIR.exists():
                    for img in LOG_IMAGES_DIR.iterdir():
                        if img.is_file() and img.suffix.lower() in LOG_IMAGE_EXTS:
                            zf.write(img, arcname=f"images/{img.name}")
        except OSError:
            return {"ok": False, "error": "Couldn't write the export file."}

        _show_in_explorer(out_path)
        return {"ok": True, "path": str(out_path)}

    def import_logbook(self):
        """Open .kizunalog file → wipe local logs.json + logs-images/ →
        extract new contents in their place. Replace-all semantics."""
        try:
            result = webview.windows[0].create_file_dialog(
                webview.OPEN_DIALOG,
                allow_multiple=False,
                file_types=("Kizuna Logbook (*.kizunalog)",),
            )
        except Exception:
            return {"ok": False, "error": "File dialog failed."}
        if not result:
            return {"ok": False, "error": "Cancelled."}
        src = Path(result[0] if isinstance(result, (list, tuple)) else result)
        if not src.exists():
            return {"ok": False, "error": "File not found."}

        try:
            with zipfile.ZipFile(src, "r") as zf:
                names = zf.namelist()
                if "logbook.json" not in names:
                    return {"ok": False, "error": "Not a valid Kizuna logbook."}
                with zf.open("logbook.json") as f:
                    logs = json.loads(f.read().decode("utf-8"))
                if not isinstance(logs, dict):
                    return {"ok": False, "error": "Logbook file is malformed."}

                APP_DATA_DIR.mkdir(parents=True, exist_ok=True)
                LOG_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
                _wipe_log_images()

                for name in names:
                    if not name.startswith("images/"):
                        continue
                    if name.endswith("/"):
                        continue
                    rel = name[len("images/"):]
                    # Reject path-traversal: only allow simple basenames.
                    if "/" in rel or "\\" in rel or rel in ("", ".", ".."):
                        continue
                    suffix = Path(rel).suffix.lower()
                    if suffix not in LOG_IMAGE_EXTS:
                        continue
                    dest = LOG_IMAGES_DIR / rel
                    with zf.open(name) as src_f, open(dest, "wb") as dest_f:
                        shutil.copyfileobj(src_f, dest_f)
        except (zipfile.BadZipFile, json.JSONDecodeError, OSError, UnicodeDecodeError):
            return {"ok": False, "error": "Couldn't read the logbook file."}

        if not _save_logs(logs):
            return {"ok": False, "error": "Couldn't save logbook locally."}
        return {"ok": True}

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
