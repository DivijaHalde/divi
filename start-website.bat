@echo off
title APSIT Faculty Ranking & Evaluation System (AY 2026-27)
echo ====================================================
echo  A. P. Shah Institute of Technology, Thane
echo  Faculty Ranking ^& Evaluation System (AY 2026-27)
echo ====================================================
echo.
echo Starting backend server...

if exist "%~dp0node.exe" (
    set "NODE_CMD=%~dp0node.exe"
) else if exist "node.exe" (
    set "NODE_CMD=node.exe"
) else (
    set "NODE_CMD=node"
)

start "" http://localhost:3000
"%NODE_CMD%" server.js
pause
