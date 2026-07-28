# syntax=docker/dockerfile:1
# ─────────────────────────────────────────────────────────────────────────────
# Frontend Angular — imagem para deploy no Render (feature 024).
# Contexto de build = src/frontend/  →  docker build src/frontend
# Serve os estáticos por nginx com fallback SPA; endereço da API via env.js (runtime).
# ─────────────────────────────────────────────────────────────────────────────

# ── Estágio de build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Restore em camada separada (cache): copia manifestos e instala
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código e gera o build de produção (saída em dist/imperial-frontend/browser)
COPY . .
RUN npm run build

# ── Estágio de runtime ────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Estáticos da aplicação (builder `application`/esbuild → subpasta browser/)
COPY --from=build /app/dist/imperial-frontend/browser /usr/share/nginx/html

# Template do nginx (porta via envsubst) e entrypoint (porta + env.js)
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Porta padrão (o Render injeta PORT em runtime); 8080 é só o fallback.
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
