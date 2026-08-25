# ── ec-frontend 生产镜像（多阶段构建） ──
# 说明：与后端网关同域部署（PC /、大屏 /screen、网关 /api）
# 部署路径：nginx 容器 80 端口，反代 /api 到后端网关

# Stage 1：构建
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

COPY . .
# 生产环境：VITE_MOCK=false 直连后端（由 .env.production 控制）
RUN npm run build

# Stage 2：运行
FROM nginx:1.27-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null || exit 1
