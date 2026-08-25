#!/usr/bin/env bash
# ── 类型契约生成（CP-03） ──
# 从后端 OpenAPI/Swagger 生成前端 API 类型：src/types/api.d.ts
#
# 前置条件：
#   1. 后端提供 OpenAPI 文档（Swagger JSON），默认地址见下
#   2. 或手动导出到 scripts/openapi.json
#
# 用法：
#   npm run gen:api                  # 从默认地址抓取并生成
#   OPENAPI_URL=xxx npm run gen:api  # 指定文档地址
#   npx openapi-typescript openapi.json -o src/types/api.d.ts  # 使用本地文档

set -e
cd "$(dirname "$0")/.."

OPENAPI_URL="${OPENAPI_URL:-http://localhost:8080/v3/api-docs}"
OUTPUT="src/types/api.d.ts"

if [ -f "scripts/openapi.json" ]; then
  echo "使用本地 OpenAPI 文档: scripts/openapi.json"
  npx openapi-typescript scripts/openapi.json -o "$OUTPUT"
else
  echo "拉取 OpenAPI 文档: $OPENAPI_URL"
  curl -sf "$OPENAPI_URL" -o scripts/openapi.json
  npx openapi-typescript scripts/openapi.json -o "$OUTPUT"
fi

echo "✅ 类型已生成: $OUTPUT（由后端契约驱动，勿手改）"
echo "⚠️  后端 OpenAPI 未就绪时，类型以 src/types/index.ts 手写为准"
