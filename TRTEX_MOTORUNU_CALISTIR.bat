@echo off
title TRTEX ALOHA DAEMON (24/7 OTONOM MOTOR)
color 0A

echo ==================================================
echo      TRTEX B2B INTELLIGENCE - OTONOM MOTORU
echo ==================================================
echo.
echo Bu ekran acik kaldigi surece ajanlar 24/7
echo veri cekecek, fotograflari isleyecek ve terminali 
echo kendi kendine guncelleyecektir.
echo Lutfen kapatmayin.
echo.
echo Motor atesleniyor...

cd /d "C:\Users\MSI\Desktop\aipyramweb"
call npm run nexus:start

pause
