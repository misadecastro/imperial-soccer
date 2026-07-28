# Quickstart: Deploy do Backend no Render (container)

**Feature**: 023-backend-docker-render | **Date**: 2026-07-27

## 1. Teste local da imagem (antes do deploy)

```bash
# A partir de backend/ (contexto de build = backend)
cd backend
docker build -t imperial-api -f Dockerfile .

# Rodar apontando para um MongoDB acessível e definindo os segredos como variáveis
docker run --rm -p 8080:8080 \
  -e PORT=8080 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e MongoDb__ConnectionString="mongodb+srv://<user>:<pass>@<cluster>/..." \
  -e Cors__AllowedOrigins__0="https://seu-frontend.exemplo" \
  -e Jwt__Key="<chave-forte>" \
  -e AdminSeed__Email="admin@imperial.com" \
  -e AdminSeed__Senha="<senha-forte>" \
  imperial-api

# Verificar liveness
curl -s http://localhost:8080/health   # → {"status":"ok"}
```

## 2. Provisionar o MongoDB externo

- Criar um cluster gerenciado (ex.: MongoDB Atlas) e obter a connection string.
- Liberar o acesso de rede para o Render (allowlist de IP ou `0.0.0.0/0` conforme a política do
  provedor) — sem isso o container não conecta ao banco.

## 3. Criar o Web Service no Render

Opção A — **Blueprint** (`render.yaml` na raiz): "New +" → "Blueprint" → apontar o repo. O
Render lê o serviço e pede os valores das variáveis marcadas `sync: false`.

Opção B — **Manual**: "New +" → "Web Service" → conectar o repo e configurar:
- Runtime/Environment: **Docker**
- Dockerfile Path: `backend/Dockerfile`
- Docker Build Context Directory: `backend`
- Health Check Path: `/health`

## 4. Definir as variáveis de ambiente no Render

Obrigatórias (ver [data-model.md](./data-model.md)):

| Variável | Exemplo/observação |
|---|---|
| `ASPNETCORE_ENVIRONMENT` | `Production` |
| `MongoDb__ConnectionString` | string do Atlas (**secret**) |
| `Cors__AllowedOrigins__0` | `https://seu-frontend.exemplo` (sem barra final) |
| `Jwt__Key` | chave forte (**secret**) |
| `AdminSeed__Email` | `admin@imperial.com` |
| `AdminSeed__Senha` | senha forte (**secret**) |

## 5. Validar o deploy (mapa de aceitação)

| # | Verificação | Esperado |
|---|---|---|
| 1 | `GET https://<app>.onrender.com/health` | `200 {"status":"ok"}` (US1) |
| 2 | Frontend na origem configurada chama a API | sem erro de CORS (US2) |
| 3 | Origem não configurada chama a API | bloqueada por CORS (US2) |
| 4 | Trocar `MongoDb__ConnectionString`/origem e redeploy | novo valor vale sem rebuild de código (US2/SC-002) |
| 5 | Inspecionar repo e imagem | sem connection string/chave/senha (US3/SC-004) |
| 6 | Remover `Jwt__Key` e reiniciar | serviço **não sobe**, erro claro (US3/SC-006) |
| 7 | Primeiro deploy sem Administrador ativo | Administrador inicial criado no startup (US1) |

## 6. Segurança

- Nenhum segredo no repositório: valores reais só no painel do Render; `render.yaml` usa
  `sync: false`; `appsettings.json` permanece sem `Jwt:Key`/`AdminSeed:*`; `.dockerignore` evita
  copiar `appsettings.*.json` locais e artefatos para a imagem.
