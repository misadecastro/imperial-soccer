# Data Model: Superfície de Configuração (variáveis de ambiente)

**Feature**: 023-backend-docker-render | **Date**: 2026-07-27

Esta feature não introduz entidades de domínio. O "modelo" aqui é a **superfície de
configuração** — o mapeamento entre variáveis de ambiente (Render) e as chaves de configuração
do `Imperial.Api`. O .NET converte `:` em `__` nas variáveis de ambiente.

## Matriz de variáveis de ambiente

| Variável de ambiente | Chave de config | Obrigatória | Segredo | Default | Descrição |
|---|---|---|---|---|---|
| `MongoDb__ConnectionString` | `MongoDb:ConnectionString` | **Sim** | **Sim** | `mongodb://localhost:27017` (só local) | String de conexão do MongoDB externo |
| `MongoDb__DatabaseName` | `MongoDb:DatabaseName` | Não | Não | `imperial_soccer` | Nome do banco |
| `Cors__AllowedOrigins__0` | `Cors:AllowedOrigins[0]` | **Sim** | Não | `http://localhost:4200` (só local) | Origem(ns) do frontend; aceita lista delimitada por `,`/`;` numa variável |
| `Jwt__Key` | `Jwt:Key` | **Sim** | **Sim** | — (app não sobe sem) | Chave de assinatura do token |
| `Jwt__Issuer` | `Jwt:Issuer` | Não | Não | `ImperialSoccer.Api` | Emissor do token |
| `Jwt__Audience` | `Jwt:Audience` | Não | Não | `ImperialSoccer.Frontend` | Audiência do token |
| `Jwt__ExpirationHours` | `Jwt:ExpirationHours` | Não | Não | `8` | Validade do token (horas) |
| `AdminSeed__Email` | `AdminSeed:Email` | **Sim** | Não | — | E-mail do Administrador inicial (seed) |
| `AdminSeed__Senha` | `AdminSeed:Senha` | **Sim** | **Sim** | — | Senha do Administrador inicial (seed) |
| `ASPNETCORE_ENVIRONMENT` | (ambiente) | Recomendado | Não | `Production` (no container) | Ambiente de execução |
| `PORT` | (injetada pelo Render) | Auto | Não | `8080` (fallback local) | Porta em que o container escuta |

## Regras de validação / comportamento

- **RV-001**: `Jwt__Key` ausente → o app **falha no startup** com mensagem clara (comportamento
  já existente: `throw` em `Program.cs`). (FR-010, SC-006)
- **RV-002**: `MongoDb__ConnectionString` ausente → usa o default local (impróprio em produção);
  a conexão ao banco externo depende dessa variável (FR-004).
- **RV-003**: `AdminSeed__Email`/`AdminSeed__Senha` ausentes → o seed do Administrador inicial
  não cria o admin (o startup do seeder é idempotente e tolerante). Para o primeiro deploy, ambas
  são necessárias (FR-011).
- **RV-004**: `Cors__AllowedOrigins*` deve conter a URL pública do frontend, **sem barra final**
  e com o esquema correto (`https://...`), para casar a origem exatamente (FR-006).
- **RV-005**: `PORT` é injetada pela plataforma; o app deve escutar nela (FR-002). Fora da
  plataforma, usa `8080`.

## Segurança (não versionar)

Nunca commitar valores reais de: `MongoDb__ConnectionString`, `Jwt__Key`, `AdminSeed__Senha`
(nem `AdminSeed__Email`). No repositório ficam apenas os **nomes** (em `render.yaml` com
`sync: false`) e os defaults **não-secretos** de `appsettings.json`. (FR-007, FR-009, SC-004)
