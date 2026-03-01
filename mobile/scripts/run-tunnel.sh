#!/usr/bin/env bash
# NVM ile Node 20 kullanarak Expo tunnel başlatır.
# Kullanım: ./scripts/run-tunnel.sh  veya  bash scripts/run-tunnel.sh

unset npm_config_prefix 2>/dev/null
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
  nvm use 20 2>/dev/null || nvm use default 2>/dev/null
fi

cd "$(dirname "$0")/.."
exec node scripts/start-tunnel-with-url.js
