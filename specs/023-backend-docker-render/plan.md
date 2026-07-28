# Implementation Plan: Containerização do Backend para Deploy no Render

**Branch**: `023-backend-docker-render` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-backend-docker-render/spec.md`

## Summary

Empacotar o backend `Imperial.Api` (.NET 8) em uma imagem de container (Dockerfile
multi-stage) publicável no Render como Web Service, expondo a API por HTTPS na URL pública da
plataforma. String de conexão do MongoDB e origem(ns) de CORS do frontend passam a vir de
**variáveis de ambiente** (junto com os segredos já obrigatórios: chave JWT e credenciais do
Admin seed), nunca commitados nem embutidos na imagem. Ajustes mínimos no `Program.cs`:
bind à porta injetada pela plataforma (`PORT`), guardar `UseHttpsRedirection` fora de
desenvolvimento (TLS terminado na borda do Render), aceitar CORS como lista delimitada em uma
variável, e um endpoint `/health` leve para o health check da plataforma.

## Technical Context

**Language/Version**: C# 12 / .NET 8 (`Imperial.Api`, `Microsoft.NET.Sdk.Web`)  
**Primary Dependencies**: já existentes (`MongoDB.Driver` 3.9, `JwtBearer` 8, `Identity`, `Swashbuckle`). Novo: imagens base Docker oficiais `mcr.microsoft.com/dotnet/sdk:8.0` (build) e `mcr.microsoft.com/dotnet/aspnet:8.0` (runtime)  
**Storage**: MongoDB **externo/gerenciado** (ex.: Atlas) via string de conexão em variável de ambiente; Render não provê o banco  
**Testing**: `docker build` + `docker run` local (smoke test) e verificação de disponibilidade pós-deploy; sem novos testes xUnit (feature de infra)  
**Target Platform**: Render — Web Service baseado em container Linux; TLS na borda da plataforma  
**Project Type**: Web (backend containerizado; frontend fora de escopo)  
**Performance Goals**: N/A (empacotamento/config; sem mudança de carga)  
**Constraints**: imagem sem segredos; container escuta em `PORT` (runtime); nenhuma URL/porta fixa embutida; falha clara de startup quando falta config obrigatória  
**Scale/Scope**: 1 Dockerfile, 1 `.dockerignore`, 1 `render.yaml` (opcional), ~4 ajustes pontuais no `Program.cs`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Simplicidade Funcional** — ✅ Um Dockerfile multi-stage + ajustes mínimos no
  `Program.cs`; sem orquestração/infra além do necessário para o Render.
- [x] **II. Professor como Ator Central** — ✅ Sem impacto no fluxo do usuário; melhora a
  disponibilidade (API na nuvem em vez de máquina local).
- [x] **III. Aluno como Núcleo do Domínio** — ✅ Não toca o domínio nem os dados.
- [x] **IV. API-First com Frontend Desacoplado** — ✅ Reforça o desacoplamento: a mesma imagem
  serve qualquer origem de frontend via configuração de CORS; envelope de resposta inalterado.
- [x] **V. Persistência Orientada a Documentos** — ✅ Continua MongoDB via `MongoDB.Driver`;
  apenas a origem da string de conexão muda (variável de ambiente).
- [x] **Restrições de Arquitetura / Segurança** — ✅ Alinhado à regra já vigente
  (`CLAUDE.md`): **nunca commitar `Jwt:Key`/`AdminSeed:*`** — via `user-secrets` (dev) ou
  variável de ambiente (produção). CORS já parametrizado por `Cors:AllowedOrigins`. Sem EF/ORM.

**Gate**: PASS — nenhum desvio. Feature puramente de empacotamento/configuração.

## Project Structure

### Documentation (this feature)

```text
specs/023-backend-docker-render/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões técnicas (Dockerfile, PORT, CORS, HTTPS, health)
├── data-model.md        # Phase 1 — matriz de variáveis de ambiente (superfície de config)
├── quickstart.md        # Phase 1 — build local + passos de deploy no Render
├── contracts/
│   └── runtime-contract.md  # Contrato de runtime do container (entradas/porta/health)
└── tasks.md             # Phase 2 (/speckit.tasks — NÃO criado aqui)
```

### Source Code (repository root)

**Novos arquivos**:

```text
backend/
├── Dockerfile                  # NOVO — multi-stage (sdk build → aspnet runtime); publica só Imperial.Api
└── .dockerignore               # NOVO — ignora bin/obj, .git, secrets locais, etc.
render.yaml                     # NOVO (opcional) — Blueprint do Web Service; env vars com sync:false para segredos
```

**Arquivos editados** (`backend/Imperial.Api/`):

```text
Program.cs                      # EDITAR — (1) bind à porta de PORT; (2) UseHttpsRedirection só em Development;
                                #          (3) CORS: aceitar lista delimitada numa variável; (4) MapGet("/health")
appsettings.json                # (sem segredos — mantém defaults locais; DatabaseName/Jwt não-secretos)
```

**Structure Decision**: Dockerfile em `backend/Dockerfile` com **contexto de build = `backend/`**
(permite restaurar/publicar apenas `Imperial.Api`, ignorando `Imperial.Api.Tests`, que exige
MongoDB). No Render: "Dockerfile Path" = `backend/Dockerfile`, "Docker Build Context" = `backend`.
O `render.yaml` documenta o serviço e os **nomes** das variáveis (valores reais nunca versionados).

## Complexity Tracking

> Sem violações constitucionais — nenhuma entrada necessária.
