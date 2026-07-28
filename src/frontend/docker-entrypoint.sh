#!/bin/sh
# Entrypoint do container do frontend (feature 024):
#  1) configura a porta do nginx a partir de PORT (injetada pelo Render);
#  2) gera env.js com o endereço da API a partir de API_URL (config em runtime);
#  3) inicia o nginx.
set -e

: "${PORT:=8080}"
: "${API_URL:=http://localhost:5179/api/v1}"
export PORT

# Só ${PORT} é substituído — preserva as variáveis de runtime do nginx ($uri, $host...).
envsubst '${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Config lida pelo app (window.__env.apiUrl) — sobrescreve o env.js default do build.
cat > /usr/share/nginx/html/env.js <<EOF
window.__env = { apiUrl: "${API_URL}" };
EOF

exec nginx -g 'daemon off;'
