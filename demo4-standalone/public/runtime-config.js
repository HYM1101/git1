/* 运行时配置：PC 端跳转地址
 * start-all.bat 会在启动大屏前根据 PC_PORT 重写 dist/runtime-config.js
 * 若未被重写，则使用以下兜底地址 */
window.__EC_PC_URL__ = window.__EC_PC_URL__ || "http://127.0.0.1:8090/";
