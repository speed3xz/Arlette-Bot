@echo off
REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [Console @ Arlette-Bot] Node.js no esta instalado. Ejecutando instalador...
    start /wait node-installer.msi
) else (
    echo [Console @ Arlette-Bot] Node.js ya esta instalado.
)

REM Verificar si Git está instalado
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [Console @ Arlette-Bot] Git no esta instalado. Ejecutando instalador...
    start /wait git-installer.exe
) else (
    echo [Console @ Arlette-Bot] Git ya esta instalado.
)

REM Verificar si ImageMagick está instalado
where convert >nul 2>nul
if %errorlevel% neq 0 (
    echo [Console @ Arlette-Bot] ImageMagick no esta instalado. Ejecutando instalador...
    start /wait imagemagick-installer.exe
) else (
    echo [Console @ Arlette-Bot] ImageMagick ya esta instalado.
)

REM Ejecutar Git pull
echo [Console @ Arlette-Bot] Verificando Actualizaciones...
git pull

REM Ejecutar npm install (ignorar crasheo)
echo [Console @ Arlette-Bot] Instalando Dependencias...
npm install
if %errorlevel% neq 0 (
    echo [Console @ Arlette-Bot] Se detectó un problema después de npm install, pero se ignorará para continuar.
)

REM Ejecutar node index.js
echo Ejecutando node index.js...
node index.js

pause