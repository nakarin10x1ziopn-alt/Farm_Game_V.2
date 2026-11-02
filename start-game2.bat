@echo off
chcp 65001 >nul
rem เล่นไร่สุขใจ 2 บนเครื่องนี้: เปิดเซิร์ฟเวอร์ (เซฟ 2 ช่องเก็บที่โฟลเดอร์ saves) แล้วเปิดเบราว์เซอร์ให้อัตโนมัติ
cd /d "%~dp0"
set PORT=8771
start "" cmd /c "timeout /t 2 >nul & start http://localhost:%PORT%/"
python server.py --port %PORT%
pause
