# Kizuna Tablet

In-game tablet companion for the **Vessels** sci-fi campaign.

A Python + pywebview desktop app (Windows) that mirrors the physical/visual tablet the party carries during sessions.

## Build

Requires Python 3.10+ on PATH and Inno Setup 6 (https://jrsoftware.org/isinfo.php).

```
build.bat              rebuild with the current version
build.bat 1.1.0        bump version (app.py + installer.iss) then rebuild
```

Output: `installer-output\KizunaTablet-Setup.exe`

## Release

1. `build.bat <new-version>` — bumps and builds the installer.
2. `git commit -am "Kizuna Tablet vX.Y.Z: <notes>"`
3. `git push origin HEAD:main`
4. Create a GitHub release tagged `vX.Y.Z` and attach the `KizunaTablet-Setup.exe` from `installer-output\`.
5. The in-app update check (Settings → Check for Update) finds it via the GitHub releases API.

## Run from source

```
pip install -r requirements.txt
python app.py
```
