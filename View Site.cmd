@echo off
setlocal
cd /d "%~dp0"
set "PATH=C:\Program Files\nodejs;%PATH%"

rem If the site is already running, just open it.
powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:4321' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } } catch {}; exit 1"
if %errorlevel%==0 (
  start "" "http://localhost:4321"
  exit /b
)

echo.
echo   Starting your site. A small server window will open, minimised.
echo   Keep that window open while you look around.
echo   Close the server window when you are finished.
echo.

start "Kamda Kachroo - site server" /min cmd /k "npm run dev"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok = $false; for ($i = 0; $i -lt 60; $i++) { try { $r = Invoke-WebRequest -Uri 'http://localhost:4321' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { $ok = $true; break } } catch {}; Start-Sleep -Milliseconds 1000 }; if ($ok) { Start-Process 'http://localhost:4321' } else { Write-Host ''; Write-Host 'The site could not start. Look at the server window for the error.' -ForegroundColor Red; Read-Host 'Press Enter to close' }"
