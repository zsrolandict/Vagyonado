#!/usr/bin/env bash
set -euo pipefail
cd /workspace/Vagyonado
node -e "if (Number(process.versions.node.split('.')[0]) !== 24) { console.error('A Vagyonado projekthez Node.js 24.x szükséges.'); process.exit(1); }"
npm ci --cache /workspace/.cache/npm --no-audit --no-fund
npm run build
