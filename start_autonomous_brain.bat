@echo off
title AIPYRAM AUTONOMOUS BRAIN DEPLOYER (IDE-KILLER)
echo.
echo ========================================================
echo [AIPYRAM] 60+ AJANLI OTONOM DEVLET BASLATILIYOR...
echo [AIPYRAM] Hakan Toprak - 1000 Yillik Uzman Surusu
echo ========================================================
echo.

:: PM2 Yüklenmiş mi Kontrol
call pm2 -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [UYARI] Globale PM2 kurulmamiş. Kuruluyor...
    call npm install -g pm2
)

echo [SISTEM] Next.js Uretim (Production) Buildi Aliniyor...
call npm run build

echo.
echo [SISTEM] Ajanlar (PM2 Daemon) Uzerinden Canlandiriliyor! (IDE'siz Calisma)
call pm2 start ecosystem.config.js

echo.
echo ========================================================
echo [ONAY] SİSTEM BASARIYLA UYANDI!
echo Artik komut satirini / Visual Studio'yu KAPATABILIRSINIZ.
echo PC Acik Kaldikca Ajanlar 24/7 Çalişacaktir.
echo Ajan Zihin Haritasini Gormek Icin: pm2 monit
echo ========================================================
pause
