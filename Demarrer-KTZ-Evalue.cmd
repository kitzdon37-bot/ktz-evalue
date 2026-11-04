@echo off
rem Demarre KTZ Evalue sur cet ordinateur : la base de donnees locale, puis le site.
rem Double-cliquez sur ce fichier, laissez la fenetre ouverte, puis ouvrez http://localhost:3100
title KTZ Evalue - site local - laissez cette fenetre ouverte
cd /d "%~dp0"

echo.
echo  KTZ Evalue - demarrage...
echo.

rem Arrete un ancien serveur reste bloque sur le port 3100.
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3100 " ^| findstr "LISTENING"') do call :stop %%p

echo  1/2 Base de donnees locale...
call npx prisma dev start ktz-evalue >nul 2>&1

echo  2/2 Site : il sera pret dans quelques secondes sur http://localhost:3100
echo.
start "" /min cmd /c "timeout /t 15 >nul & start http://localhost:3100"
call npx next dev -p 3100

echo.
echo  Le site s'est arrete. Appuyez sur une touche pour fermer.
pause >nul
goto :eof

:stop
echo  Arret d'un ancien serveur, processus %1
taskkill /PID %1 /T /F >nul 2>&1
goto :eof
