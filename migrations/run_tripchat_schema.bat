@echo off
setlocal enabledelayedexpansion

:: Load .env file line by line
for /f "usebackq tokens=1,* delims==" %%a in (".env") do (
    if "%%a" neq "" (
        set "key=%%a"
        set "val=%%b"
        set "!key!=!val!"
    )
)

:: Show loaded vars (for debug)
echo Using Server: %DB_SERVER%
echo Using User: %DB_USER%

:: Run sqlcmd
sqlcmd -S %DB_SERVER% -U %DB_USER% -P %DB_PASSWORD% -d %DB_NAME% -i %DB_FILE%

pause
