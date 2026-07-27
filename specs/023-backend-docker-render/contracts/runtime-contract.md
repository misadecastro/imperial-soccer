# Contrato de Runtime do Container

**Feature**: 023-backend-docker-render | **Date**: 2026-07-27

Define o contrato de execução da imagem do backend — o que ela consome, expõe e garante.
Não há novos endpoints de negócio; apenas o contorno operacional do container.

## Entradas (variáveis de ambiente)

Ver a matriz completa em [data-model.md](../data-model.md). Obrigatórias em produção:
`MongoDb__ConnectionString`, `Cors__AllowedOrigins__0`, `Jwt__Key`, `AdminSeed__Email`,
`AdminSeed__Senha`. Injetada pela plataforma: `PORT`.

## Porta / rede

- O container escuta em `http://0.0.0.0:${PORT}` (fallback `8080`).
- Não expõe HTTPS internamente; o TLS é terminado na borda do Render (cliente acessa `https://`).

## Endpoints operacionais

| Método | Rota | Auth | Resposta | Uso |
|---|---|---|---|---|
| `GET` | `/health` | Anônimo | `200 { "status": "ok" }` | Health check da plataforma |
| `GET` | `/swagger` | — | Disponível **apenas** fora de produção | Doc interativa (dev) |

Todos os endpoints de negócio existentes (`/api/v1/...`) permanecem inalterados, protegidos por
JWT conforme já definido.

## Garantias de startup

- Com `Jwt__Key` ausente → processo **encerra** com erro claro (não sobe inseguro).
- Com todas as variáveis obrigatórias presentes → API disponível e, se não houver Administrador
  ativo, o seed cria o Administrador inicial (idempotente).

## Contrato de build (para o Render)

- **Dockerfile Path**: `backend/Dockerfile`
- **Docker Build Context**: `backend`
- **Runtime**: container Linux; imagem final baseada em `aspnet:8.0`.
- **Health Check Path**: `/health`
- A imagem **não** contém segredos nem o projeto de testes.
