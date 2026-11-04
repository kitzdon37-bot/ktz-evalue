@echo off
rem Verifie que l'IA du site fonctionne (credit Anthropic disponible, cle valide).
title KTZ Evalue - verification de l'IA
cd /d "%~dp0"
echo.
echo  Verification de l'IA...
echo.
call node scripts\verifier-ia.mjs
echo.
echo  Appuyez sur une touche pour fermer.
pause >nul
