@echo off
REM Script de instalación automática del Backend
cd /d "%~dp0"

echo ====================================
echo Instalador Automático - Backend Laravel
echo ====================================
echo.

REM Verificar si Python está instalado
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python no está instalado
    echo Descargalo desde: https://www.python.org/downloads/
    pause
    exit /b 1
)

echo [1/4] Instalando servidor Python...
python -m http.server 8000 -d "%~dp0backend\public"

echo.
echo ====================================
echo Servidor iniciado en: http://localhost:8000
echo ====================================
echo.
pause
