# imperial Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-07-12

## Active Technologies
- HTML5 + JavaScript ES Modules (browsers modernos 2023+) + Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) — zero instalação (002-student-register-eval)
- In-memory (JavaScript array em `window`-scope) — dados perdidos ao recarregar (002-student-register-eval)
- In-memory (array `state.alunos` / `state.avaliacoes` em `window`-scope) — sem persistência (003-students-eval-display)
- HTML5 + JavaScript ES Modules (browsers modernos 2023+) + Tailwind CSS v3 via CDN, Chart.js v4 via CDN (nova dependência para o gráfico) (004-cumulative-student-eval)
- In-memory (`window`-scope array), com `sessionStorage` para compartilhamento de estado entre páginas (004-cumulative-student-eval)
- HTML5 + JavaScript ES Modules (browsers modernos 2023+) + Tailwind CSS v3 via CDN, Chart.js v4 via CDN (já existente) (005-ui-improvements-mock-data)
- `sessionStorage` com chave `"imperialState"` (padrão da feature 004) (005-ui-improvements-mock-data)
- HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`), Chart.js v4 via CDN (somente `student-eval.html`) (006-app-redesign)
- `sessionStorage` com chave `"imperialState"` (existente, sem alteração) (006-app-redesign)
- `sessionStorage` com chave `"imperialState"` — estrutura estendida com campo `chamadas: []` (007-attendance-tracking)
- HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS (007-attendance-tracking)
- `sessionStorage` com chave `"imperialState"` — estrutura estendida com campo `jogos: []` (008-match-minutes)
- HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS + Tailwind CSS v3 via CDN; Chart.js não é necessário nesta página (009-training-drill-specs)
- `sessionStorage` com chave `"imperialState"` — estrutura de `chamadas[]` estendida com campos `momentos` e `principiosFundamentos` (009-training-drill-specs)
- `sessionStorage` com chave `"imperialState"` — reutiliza `chamadas[]` existente sem alteração de esquema (010-training-crud-list)
- HTML5 + JavaScript ES Modules (navegadores 2023+); Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS + Tailwind CSS v3 via CDN, Chart.js v4 via CDN (`https://cdn.jsdelivr.net/npm/chart.js`) — já utilizado em `student-eval.html` (011-training-dashboard)
- `sessionStorage` com chave `"imperialState"` — leitura apenas; reutiliza `chamadas[]` existente sem alteração de esquema (011-training-dashboard)
- HTML5 + JavaScript ES Modules (navegadores 2023+); Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS + Tailwind CSS v3 (CDN), Chart.js v4 (CDN — `https://cdn.jsdelivr.net/npm/chart.js`) já em uso em `dashboard-treinos.html` e `student-eval.html` (012-student-dashboard)
- `sessionStorage` chave `imperialState` — leitura apenas (`state.alunos[]`, `state.chamadas[]`, `state.jogos[]`); reutiliza esquemas existentes das features 002/003/006/007/008/009/010 sem alteração (012-student-dashboard)
- HTML5 + JavaScript ES Modules (navegadores 2023+); Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS + Tailwind CSS v3 (CDN) — nenhuma dependência nova (013-select-all-students)
- `sessionStorage` chave `imperialState` — apenas leitura de `state.alunos[]` e leitura/escrita de `state.jogos[]` (sem alteração de esquema; reaproveita tudo da feature 008) (013-select-all-students)
- JavaScript ES2020+ (ES Modules), HTML5 + Chart.js v4 via CDN (já incluso em `dashboard.html` linha 9), Tailwind CSS v3 via CDN (014-student-eval-chart)
- `sessionStorage` chave `imperialState` — leitura apenas de `state.avaliacoes[]`; sem escrita (014-student-eval-chart)
- TypeScript 5.x, Angular 18+ (standalone components, sem NgModules) + Angular CLI, Angular Router, Tailwind CSS v3 (integrado via build do Angular), Chart.js v4 (uso direto, sem wrapper como ng2-charts) (015-adopt-angular-frontend)
- `sessionStorage` chave `imperialState` — mesmo esquema atual (`alunos`, `avaliacoes`, `chamadas`, `jogos`), agora acessado via `StateService` Angular injetável (015-adopt-angular-frontend)
- C# 12 / .NET 8 (novo projeto de backend); TypeScript 5.x / Angular 18 (integração no frontend existente) + `Microsoft.AspNetCore.Identity` (abstrações core, sem `Identity.EntityFrameworkCore`), `MongoDB.Driver`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Swashbuckle.AspNetCore` (Swagger) (016-user-authentication)
- MongoDB — novas coleções `users` e `roles`; dados de domínio (alunos, avaliações, chamadas, jogos) continuam em `sessionStorage` no frontend, sem alteração (016-user-authentication)
- C# 12 / .NET 8 (backend, projeto existente `Imperial.Api`); TypeScript 5.x / Angular 18 (frontend existente) + `MongoDB.Driver` (já presente), `Microsoft.AspNetCore.Authentication.JwtBearer` (já configurado); Angular `HttpClient` (já presente via `provideHttpClient()`) (017-student-api)
- MongoDB — nova coleção `students`; `sessionStorage` (`imperialState`) mantida para `avaliacoes`, `chamadas`, `jogos` (intocados por esta feature) (017-student-api)

- HTML5 + JavaScript ES Modules (navegadores modernos 2023+) + Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) — zero instalação (001-home-login-page)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

HTML5 + JavaScript ES Modules (navegadores modernos 2023+): Follow standard conventions

## Recent Changes
- 017-student-api: Added C# 12 / .NET 8 (backend, projeto existente `Imperial.Api`); TypeScript 5.x / Angular 18 (frontend existente) + `MongoDB.Driver` (já presente), `Microsoft.AspNetCore.Authentication.JwtBearer` (já configurado); Angular `HttpClient` (já presente via `provideHttpClient()`)
- 016-user-authentication: Added C# 12 / .NET 8 (novo projeto de backend); TypeScript 5.x / Angular 18 (integração no frontend existente) + `Microsoft.AspNetCore.Identity` (abstrações core, sem `Identity.EntityFrameworkCore`), `MongoDB.Driver`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Swashbuckle.AspNetCore` (Swagger)
- 015-adopt-angular-frontend: Added TypeScript 5.x, Angular 18+ (standalone components, sem NgModules) + Angular CLI, Angular Router, Tailwind CSS v3 (integrado via build do Angular), Chart.js v4 (uso direto, sem wrapper como ng2-charts)


<!-- MANUAL ADDITIONS START -->

## Frontend Angular (015-adopt-angular-frontend)

O frontend (`src/frontend/`) é um projeto Angular 18 (standalone components, sem NgModules).
Todas as 7 páginas (`home`, `login`, `students`, `student-eval`, `training`, `games`, `dashboard`)
foram migradas do HTML/JS estático original; o HTML legado (`pages/*.html`, `css/imperial.css`)
foi removido após a migração. A página `users` (016-user-authentication) foi adicionada depois,
exclusiva ao papel Administrador.

### Comandos

```bash
cd src/frontend
npm install        # primeira vez / após pull com mudanças de dependências
ng serve            # dev server em http://localhost:4200
ng build            # build de produção em dist/imperial-frontend
```

### Estrutura

```text
src/frontend/src/app/
├── pages/          # um componente por rota (home, login, students, student-eval, training, games, dashboard)
├── components/     # compartilhados: category-selector, metric-card, evolution-chart, empty-state
├── services/       # state.service.ts — único ponto de acesso a sessionStorage (chave imperialState)
├── models/         # interfaces TypeScript (Aluno, Avaliacao, Chamada, Jogo) + categoria.constants.ts
└── app.routes.ts
```

### Notas

- `StateService` é a única forma de ler/escrever `sessionStorage`; nenhum componente deve acessar `sessionStorage` diretamente.
- `tsconfig.json` usa `strict: true` (herda `noImplicitAny`/`strictNullChecks`) — erros de tipo falham o build.
- Chart.js é importado via `chart.js/auto` (auto-registro), sem wrapper Angular (ex.: ng2-charts).
- Orçamento de bundle ajustado em `angular.json` (`maximumWarning: 750kB`) por causa do Chart.js.

## Backend .NET (016-user-authentication)

Primeiro backend real do projeto: `backend/Imperial.Api` (API) + `backend/Imperial.Api.Tests` (xUnit),
referenciados por `backend/Imperial.slnx`. Autenticação via ASP.NET Core Identity com **stores
customizados sobre `MongoDB.Driver` direto** (sem Entity Framework Core — proibido pela
constituição). Autorização via claims do JWT (`role`), não via `RoleManager`/`IRoleStore` —
o papel do usuário é um campo simples embutido em `ApplicationUser.Role` (ver
`specs/016-user-authentication/data-model.md`).

### Comandos

```bash
cd backend
dotnet build Imperial.slnx     # build de toda a solução
dotnet test Imperial.slnx      # roda os testes xUnit (requer MongoDB local em localhost:27017)

cd Imperial.Api
dotnet user-secrets set "Jwt:Key" "<chave-secreta-forte>"          # primeira vez
dotnet user-secrets set "AdminSeed:Email" "admin@imperial.com"     # primeira vez
dotnet user-secrets set "AdminSeed:Senha" "<senha-forte-inicial>"  # primeira vez
dotnet run                     # API em http://localhost:5179, Swagger em /swagger
```

### Notas

- **Nunca** commitar `Jwt:Key` nem `AdminSeed:*` em `appsettings.json` — sempre via `dotnet user-secrets`
  (dev) ou variável de ambiente (produção).
- `options.MapInboundClaims = false` é obrigatório em `Program.cs` — sem isso, o
  `JwtSecurityTokenHandler` remapeia claims curtas ("role"/"name") para as URIs longas de
  `ClaimTypes.*`, e `[Authorize(Roles=...)]` para de funcionar mesmo com token válido (causa real
  de um bug 403 encontrado durante a implementação desta feature).
- CORS configurado em `Program.cs` (`AddCors`/`UseCors`) liberando a origem do Angular dev server
  (`Cors:AllowedOrigins` em `appsettings.json`, default `http://localhost:4200`) — sem isso, o
  browser bloqueia as chamadas do frontend com erro de preflight (`curl` não pega esse problema,
  pois CORS é uma política aplicada pelo navegador, não pelo servidor sozinho). Se o frontend rodar
  em outra porta/host, adicione a origem em `Cors:AllowedOrigins`.
- O Admin inicial é criado automaticamente no startup (`AdminSeedService`) apenas se nenhum
  Administrador ativo existir — idempotente entre reinícios.
- Testes de backend rodam contra uma instância MongoDB real em bancos dedicados
  (`imperial_soccer_test*`), limpos a cada execução — sem mocks do driver.

<!-- MANUAL ADDITIONS END -->
