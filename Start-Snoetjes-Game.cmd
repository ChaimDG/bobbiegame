@echo off
setlocal
cd /d "%~dp0"

where pnpm >nul 2>nul
if not errorlevel 1 (
  pnpm run dev
  goto :end
)

set "CODEX_PNPM=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
set "CODEX_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"

if exist "%CODEX_PNPM%" (
  set "PATH=%CODEX_NODE%;%PATH%"
  call "%CODEX_PNPM%" run dev
  goto :end
)

echo Node.js and pnpm were not found.
echo Install Node.js from https://nodejs.org, then run this file again.
pause

:end
endlocal
