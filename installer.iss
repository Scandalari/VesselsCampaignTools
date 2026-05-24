; Kizuna Tablet — Inno Setup script
; Compile by opening this file in the Inno Setup Compiler (or via ISCC.exe).
; Output: installer-output\KizunaTablet-Setup.exe

#define MyAppName "Kizuna Tablet"
#define MyAppVersion "1.0.15"
#define MyAppPublisher "Scandalari"
#define MyAppExeName "KizunaTablet.exe"

[Setup]
; AppId uniquely identifies this app to Windows. Never change it once shipped —
; doing so would make Windows treat upgrades as separate installs.
AppId={{7350fa98-74af-437d-ad87-b531373631fa}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
OutputDir=installer-output
OutputBaseFilename=KizunaTablet-Setup
SetupIconFile=app.ico
UninstallDisplayIcon={app}\{#MyAppExeName}
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
PrivilegesRequiredOverridesAllowed=dialog
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Bundles everything from the PyInstaller dist folder. Must build the dist
; folder first via build.bat.
Source: "dist\KizunaTablet\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
