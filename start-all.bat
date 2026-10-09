@echo off
chcp 65001 >nul
setlocal
REM ============================================================
REM  生态环境系统 · 一键启动（PC 端 + 指挥大屏）
REM  脚本随仓库根目录 ec-frontend/ 存放，所有路径基于脚本自身位置，
REM  可任意移动而不失效。
REM  端口统一配置：改下面两行即可，两端跳转地址自动同步
REM    PC_PORT      PC 端启动端口
REM    SCREEN_PORT  指挥大屏启动端口（同时决定 PC"指挥大屏"按钮跳转地址
REM                  与大屏"工作台"按钮跳回 PC 的地址）
REM  用法：
REM    start-all.bat         启动两个服务
REM    start-all.bat pc      仅启动 PC 端
REM    start-all.bat screen  仅启动大屏
REM  注意：NODE 路径版本号(22.22.2-6)若变化，请同步更新下面一行
REM ============================================================
set PC_PORT=8090
set SCREEN_PORT=8081
set CODEBUDDY_SAFE_DELETE_ENABLED=0
set NODE=C:\Users\ASUS\.workbuddy\binaries\node\versions\22.22.2-6\node.exe

REM 脚本所在目录（ec-frontend/），去掉结尾反斜杠便于拼接
set ROOT=%~dp0
if "%ROOT:~-1%"=="\" set ROOT=%ROOT:~0,-1%

set PC_DIR=%ROOT%
set SCR_DIR=%ROOT%\demo4-standalone

REM 大屏 dist 缺失时先构建（dist 不入库，仅本地缓存）
if not exist "%SCR_DIR%\dist" (
  echo [BUILD] 大屏 dist 缺失，正在构建...
  pushd "%SCR_DIR%"
  %NODE% node_modules\vite\bin\vite.js build
  popd
)

REM 将大屏地址注入 PC 端运行环境，使"指挥大屏"按钮跳转随端口变化
set VITE_SCREEN_URL=http://127.0.0.1:%SCREEN_PORT%/

REM 生成大屏运行时配置，使"工作台"按钮跳回 PC 端时随 PC 端口变化
set RUNTIME_CONFIG=%SCR_DIR%\dist\runtime-config.js
powershell -NoProfile -Command "Set-Content -LiteralPath '%RUNTIME_CONFIG%' -Value \"window.__EC_PC_URL__='http://127.0.0.1:%PC_PORT%/';\" -Encoding UTF8"

if "%1"=="pc" goto :pc
if "%1"=="screen" goto :screen
goto :both

:both
start "PC-%PC_PORT%" cmd /k "cd /d %PC_DIR% && set VITE_SCREEN_URL=%VITE_SCREEN_URL% && %NODE% node_modules\vite\bin\vite.js --host 127.0.0.1 --port %PC_PORT%"
start "Screen-%SCREEN_PORT%" cmd /k "cd /d %SCR_DIR% && %NODE% node_modules\vite\bin\vite.js preview --host 127.0.0.1 --port %SCREEN_PORT%"
echo [OK] Started both. Open in browser:
echo   PC:     http://127.0.0.1:%PC_PORT%/
echo   Screen: http://127.0.0.1:%SCREEN_PORT%/
goto :end

:pc
start "PC-%PC_PORT%" cmd /k "cd /d %PC_DIR% && set VITE_SCREEN_URL=%VITE_SCREEN_URL% && %NODE% node_modules\vite\bin\vite.js --host 127.0.0.1 --port %PC_PORT%"
echo [OK] PC started: http://127.0.0.1:%PC_PORT%/
goto :end

:screen
start "Screen-%SCREEN_PORT%" cmd /k "cd /d %SCR_DIR% && %NODE% node_modules\vite\bin\vite.js preview --host 127.0.0.1 --port %SCREEN_PORT%"
echo [OK] Screen started: http://127.0.0.1:%SCREEN_PORT%/
goto :end

:end
timeout /t 3 >nul
endlocal
