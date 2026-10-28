@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>&1
if errorlevel 1 (
    python -X utf8 "%~dp0scripts\serve.py" %*
) else (
    py -3 -X utf8 "%~dp0scripts\serve.py" %*
)
echo.
echo Model Atlas has stopped. If it did not start, install Python 3 and try again.
pause
