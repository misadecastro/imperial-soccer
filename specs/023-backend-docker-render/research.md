# Research: Containerização do Backend para Deploy no Render

**Feature**: 023-backend-docker-render | **Date**: 2026-07-27

## Decisão 1 — Dockerfile multi-stage (build SDK → runtime aspnet)

- **Decision**: `backend/Dockerfile` em dois estágios: `mcr.microsoft.com/dotnet/sdk:8.0`
  (restore + publish de `Imperial.Api`) → `mcr.microsoft.com/dotnet/aspnet:8.0` (runtime).
  Copiar primeiro o `.csproj` e `dotnet restore`, depois o código e `dotnet publish -c Release`
  para aproveitar cache de camadas. Contexto de build = `backend/`; publica **somente**
  `Imperial.Api/Imperial.Api.csproj` (ignora `Imperial.Api.Tests`, que exige MongoDB).
- **Rationale**: Imagem final enxuta (sem SDK), build reprodutível, cache eficiente.
- **Alternatives considered**: imagem única com SDK (grande, insegura); `dotnet publish` local +
  copiar binário (não reprodutível no CI do Render).

## Decisão 2 — Bind à porta injetada pela plataforma (`PORT`)

- **Decision**: No `Program.cs`, ler `Environment.GetEnvironmentVariable("PORT")` e, se presente,
  `builder.WebHost.UseUrls($"http://0.0.0.0:{port}")`; fallback `8080` fora da plataforma.
- **Rationale**: O Render injeta `PORT` em runtime e roteia o tráfego externo para ela; a porta
  não pode ser fixa na imagem (FR-002). Ler `PORT` é explícito e independente de expansão de
  variável no Dockerfile (que `ENV ASPNETCORE_URLS=...:${PORT}` não faz).
- **Alternatives considered**: `ENV ASPNETCORE_URLS=http://+:8080` fixo (quebra se o Render usar
  outra porta); depender de o operador setar `ASPNETCORE_URLS` manualmente (frágil, esquecível).

## Decisão 3 — `UseHttpsRedirection` apenas em Development

- **Decision**: Chamar `app.UseHttpsRedirection()` somente quando `app.Environment.IsDevelopment()`.
- **Rationale**: No Render, o TLS é terminado na borda e o container recebe HTTP interno. Com
  redirect ativo e sem porta HTTPS configurada, o ASP.NET loga "Failed to determine https port"
  e pode causar redirecionos indevidos. A borda já garante HTTPS ao cliente (FR-003).
- **Alternatives considered**: remover totalmente (perde o redirect útil em dev); configurar
  `https_port` no container (desnecessário atrás de proxy TLS).

## Decisão 4 — CORS: uma variável com uma ou mais origens (delimitadas)

- **Decision**: Manter a leitura de `Cors:AllowedOrigins` (array), mas no `Program.cs` **achatar
  e dividir** cada entrada por `,`/`;` e `Trim()`, removendo vazios. Assim o operador pode setar
  **uma única** variável `Cors__AllowedOrigins__0="https://front-a,https://front-b"` (ou várias
  indexadas). Sanitizar barra final para casar origem exata.
- **Rationale**: Casa com "a url do front como variável" (FR-005/SC-002): uma variável cobre uma
  ou várias origens. Mantém compatibilidade com o binding de array padrão do .NET.
- **Alternatives considered**: só array indexado `__0/__1` (menos ergonômico para "uma
  variável"); coringa `*` (inseguro, rejeitado por segurança).

## Decisão 5 — Mapeamento das variáveis de ambiente (convenção `__`)

- **Decision**: Documentar os nomes exatos (o .NET mapeia `:` → `__` em variáveis de ambiente):
  `MongoDb__ConnectionString`, `MongoDb__DatabaseName` (opcional), `Cors__AllowedOrigins__0`,
  `Jwt__Key`, `Jwt__Issuer`/`Jwt__Audience`/`Jwt__ExpirationHours` (opcionais),
  `AdminSeed__Email`, `AdminSeed__Senha`, `ASPNETCORE_ENVIRONMENT=Production`.
- **Rationale**: Sem código extra — o provider de variáveis de ambiente do .NET já resolve.
  Segredos ficam no painel/secret do Render (FR-007/FR-009).
- **Alternatives considered**: prefixos custom / leitura manual de env (reinventa o que o
  framework já faz).

## Decisão 6 — Endpoint `/health` para o health check da plataforma

- **Decision**: Adicionar `app.MapGet("/health", () => Results.Ok(new { status = "ok" }))`
  (anônimo, fora do pipeline de `[Authorize]`). Configurar o Health Check Path do Render para
  `/health`.
- **Rationale**: O Swagger é só em Development; sem um endpoint 200 público, o Render não tem
  como aferir liveness de forma limpa. Endpoint mínimo e barato.
- **Alternatives considered**: usar `/swagger` (indisponível em produção); depender de rota que
  retorna 404 (o Render espera 200).

## Decisão 7 — `render.yaml` (Blueprint) opcional + `.dockerignore`

- **Decision**: Incluir `render.yaml` na raiz declarando o Web Service (env `docker`, dockerfile
  path/contexto, health check path) e a **lista de nomes** de variáveis com `sync: false` para os
  segredos (valores preenchidos no painel, nunca no repo). Incluir `backend/.dockerignore`
  (ignora `bin/`, `obj/`, `.git`, `**/appsettings.*.json` locais, `*.user`).
- **Rationale**: Infra-as-code documenta o serviço e evita config manual divergente; `.dockerignore`
  reduz o contexto e impede vazar artefatos/segredos locais para a imagem (FR-009).
- **Alternatives considered**: só configurar no dashboard (não versionado, sujeito a erro humano).

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Segredo vazar na imagem/repo | `.dockerignore` + `render.yaml` com `sync:false` + manter `appsettings.json` sem segredos (já é o caso) |
| App não escutar na porta certa | Ler `PORT` e `UseUrls`; health check em `/health` confirma liveness |
| MongoDB externo bloquear a conexão | Liberar o acesso de rede/IP do Render no provedor do banco (ex.: allowlist do Atlas) — passo de operação documentado no quickstart |
| CORS falhar por barra final/esquema | Sanitizar/`Trim` e casar origem exata; documentar formato `https://host` sem barra final |
| Tests project quebrar o build da imagem | Dockerfile publica só `Imperial.Api`; não referencia o projeto de testes |
