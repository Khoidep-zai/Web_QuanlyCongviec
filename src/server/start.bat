@echo off
chcp 65001 >nul
echo ==========================================
echo   Task Manager - Khoi dong ung dung
echo ==========================================
echo.

:: Cài đặt concurrently nếu chưa có
if not exist node_modules (
    echo [*] Dang cai dat dependencies...
    call npm install
    echo.
)

echo [*] Khoi dong Backend  ^(port 5000^) va Frontend ^(port 3000^)...
echo [*] Nhan Ctrl+C de dung ca hai.
echo.

:: Chuyen ve thu muc server roi chay
cd /d "%~dp0"
call npm run dev

pause
