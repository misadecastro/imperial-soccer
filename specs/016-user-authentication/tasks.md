# Tasks: Autenticação de Usuários com Perfil Admin

**Input**: Design documents from `/specs/016-user-authentication/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/auth-api.md ✅, quickstart.md ✅

**Tests**: Backend (xUnit) incluído para o store customizado de Identity e o `AdminSeedService` — é código novo de segurança, conforme decisão em `research.md` #8. Frontend permanece com validação manual (consistente com features 014/015).

**Organization**: Tarefas agrupadas por user story. US1 e US2 compartilham prioridade P1 na spec, mas US2 depende funcionalmente do pipeline de login de US1 estar pronto (um Admin precisa logar para cadastrar usuários) — por isso US1 é implementada primeiro.

> **Nota de revisão**: durante a implementação, eliminamos `ApplicationRole`/`MongoRoleStore`/`IRoleStore` do desenho original — a autorização é decidida pela claim `role` do JWT, não pelo mecanismo de roles do Identity. Com 2 papéis fixos, o papel é um campo embutido em `ApplicationUser.Role`. Ver `data-model.md` e `plan.md` (seção "Nota de implementação"). A numeração das tarefas abaixo já reflete essa simplificação.
>
> **Pós-entrega (encontrado ao testar com o Angular real, não via curl)**: faltava configurar **CORS** no backend — `curl` não aplica políticas de CORS (é uma proteção do navegador), então essa lacuna não apareceu durante a validação por T021/T029/T035. Corrigido com `AddCors`/`UseCors` em `Program.cs`, liberando `http://localhost:4200` via `Cors:AllowedOrigins` em `appsettings.json`. Validado com preflight `OPTIONS` simulado via curl (`Access-Control-Allow-Origin` presente) e uma chamada de login real com header `Origin`. Lição para o quickstart: validação via curl não substitui teste a partir do navegador/app real para problemas específicos de CORS.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência de tarefas incompletas)
- **[Story]**: US1, US2 ou US3 — mapeia para `spec.md`
- Caminhos relativos à raiz do repositório

## Path Conventions

Primeira feature com backend real: `backend/Imperial.Api/` (API) e `backend/Imperial.Api.Tests/` (testes), conforme estrutura da constituição. Frontend em `src/frontend/src/app/` (Angular, já existente desde a feature 015).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Criar o projeto de backend do zero (primeira vez no repositório) e preparar o terreno no frontend.

- [x] T001 Criar solução e projetos `dotnet new webapi -n Imperial.Api -o backend/Imperial.Api` e `dotnet new xunit -n Imperial.Api.Tests -o backend/Imperial.Api.Tests`; criar `backend/Imperial.slnx` referenciando ambos (SDK 10 gera `.slnx`, formato novo equivalente ao `.sln`)
- [x] T002 [P] Adicionar pacotes NuGet ao `Imperial.Api`: `Microsoft.AspNetCore.Identity`, `MongoDB.Driver`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Swashbuckle.AspNetCore`
- [x] T003 [P] Swagger/OpenAPI já configurado pelo template `webapi --use-controllers` em `Program.cs` (`AddSwaggerGen`/`UseSwagger`/`UseSwaggerUI`); removidos os arquivos de exemplo `WeatherForecastController.cs`/`WeatherForecast.cs`
- [x] T004 Configurada conexão MongoDB: `MongoDbSettings` em `Configuration/MongoDbSettings.cs`, `IMongoDatabase` registrado como singleton via DI em `Program.cs`, string de conexão (não sensível, `localhost:27017`) em `appsettings.json`; chave JWT e credenciais do seed do Admin via `dotnet user-secrets` (nunca no `appsettings.json` versionado)
- [x] T005 [P] Adicionado `provideHttpClient()` em `src/frontend/src/app/app.config.ts` (não estava presente; necessário para `AuthService` e `UsersComponent` chamarem a API)

**Checkpoint**: `dotnet run` inicia o backend vazio com Swagger acessível; MongoDB conectado.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Modelo de Identity, store customizado sobre MongoDB.Driver, JWT e seed do Admin — base para todas as user stories.

**⚠️ CRITICAL**: Nenhuma user story pode ser implementada até esta fase estar completa.

- [x] T006 [P] Criar `ApplicationUser` (`IdentityUser<string>` + `Nome`, `Ativo`, `Role`) em `backend/Imperial.Api/Identity/ApplicationUser.cs` — conforme `data-model.md`
- [x] T007 [P] Criar constantes de papel (`Roles.Administrador`, `Roles.Professor`) em `backend/Imperial.Api/Identity/Roles.cs`
- [x] T008 Implementar `MongoUserStore` (`IUserStore`, `IUserPasswordStore`, `IUserEmailStore`, `IUserLockoutStore`) sobre `MongoDB.Driver` em `backend/Imperial.Api/Identity/MongoUserStore.cs` — sem `IUserRoleStore`; índice único em `NormalizedEmail` criado no construtor (FR-007)
- [x] T009 Registrado Identity em `Program.cs`: `AddIdentityCore<ApplicationUser>().AddSignInManager()` + `MongoUserStore` (singleton, mapeado para `IUserStore<ApplicationUser>`), opções de lockout (5 tentativas/5 min) — sem `AddEntityFrameworkStores`, sem `AddRoles`
- [x] T010 Configurada autenticação JWT Bearer em `Program.cs` (chave via `user-secrets`) e implementado `JwtTokenService` em `backend/Imperial.Api/Services/JwtTokenService.cs` (claims `sub`/`name`/`email`/`role`)
- [x] T011 Implementado `AdminSeedService` em `backend/Imperial.Api/Services/AdminSeedService.cs`, chamado na inicialização do `Program.cs` — **validado contra MongoDB real**: 1ª execução cria o Admin (senha hasheada, confirmado via `mongosh`); 2ª execução (restart) não duplica (idempotente, `countDocuments()` permanece 1)
- [x] T012 [P] Criados DTOs em `backend/Imperial.Api/DTOs/AuthDtos.cs` (`LoginRequest`, `LoginResponse`, `CreateUserRequest`, `UpdateUserRequest`, `UserResponse`) e o envelope `ApiResponse<T>` em `ApiResponse.cs`
- [x] T013 [P] Implementado `AuthService` completo (não apenas esqueleto — feito junto com T018 nesta sessão) em `src/frontend/src/app/services/auth.service.ts`: `login()`/`logout()`/`isAuthenticated()`/`isAdmin()`, token em `sessionStorage` (`imperialAuthToken`), decodificação do payload do JWT para reidratar o usuário atual ao recarregar a página. Criados também `environments/environment.ts` (`apiUrl`) e `models/api-response.model.ts`
- [x] T014 [P] Criado `user.model.ts` (`Usuario`, `Papel`, `LoginRequest`, `LoginResponse`, `CreateUserRequest`, `UpdateUserRequest`) em `src/frontend/src/app/models/user.model.ts`

**Checkpoint**: Ao iniciar o backend, o Admin inicial é criado automaticamente; `MongoUserStore` operacional — testável isoladamente antes de qualquer endpoint existir.

---

## Phase 3: User Story 1 - Login de Usuário Autorizado (Priority: P1) 🎯 MVP

**Goal**: Um usuário cadastrado consegue logar com credenciais reais; credenciais inválidas são rejeitadas; logout funciona.

**Independent Test**: Cadastrar uma conta (via seed do Admin) e tentar logar com credenciais corretas (acesso concedido) e incorretas (acesso negado com mensagem genérica).

### Tests for User Story 1

- [x] T015 [P] [US1] Testes xUnit do `MongoUserStore` em `backend/Imperial.Api.Tests/Identity/MongoUserStoreTests.cs` — 6 testes (Create/FindById, FindByEmail normalizado, not-found, set/get password hash, increment/reset de lockout), executados contra MongoDB real (`imperial_soccer_test`, banco isolado, limpo a cada execução) — **6/6 aprovados**

### Implementation for User Story 1

- [x] T016 [US1] Implementado `AuthController.Login` (`POST /api/v1/auth/login`) em `backend/Imperial.Api/Controllers/AuthController.cs` — **testado end-to-end via curl**: login com Admin seedado retorna 200 + JWT válido (claims `sub`/`name`/`email`/`role`/`exp` decodificadas corretamente); senha incorreta retorna 401 com mensagem genérica (FR-009)
- [x] T017 [US1] Implementado `AuthController.Logout` (`POST /api/v1/auth/logout`)
- [x] T018 [US1] Implementado junto com T013 — `AuthService.login()`/`logout()`/`isAuthenticated()` reais, consumindo a API
- [x] T019 [US1] Criado `authInterceptor` (functional interceptor, anexa `Authorization: Bearer <token>`) em `src/frontend/src/app/interceptors/auth.interceptor.ts`, registrado via `provideHttpClient(withInterceptors([authInterceptor]))` em `app.config.ts`
- [x] T020 [US1] Atualizado `LoginComponent` (`.ts`/`.html`) para chamar `AuthService.login()` real com `[(ngModel)]` nos campos, exibir erro genérico (401) ou mensagem de bloqueio (423), e desabilitar o botão durante o envio — removido o comportamento de "qualquer clique libera acesso"
- [x] T021 [US1] Validado fluxo de login ponta a ponta via curl contra o backend real: (1) login com Admin seedado → 200 + JWT válido; (2) senha incorreta → 401 genérico; (3) 4 tentativas inválidas consecutivas → 423 "Conta temporariamente bloqueada" (FR-012); (4) reset manual do lockout no Mongo + login novamente → 200, confirmando que o bloqueio é temporário e reversível

**Checkpoint**: Login real funcional — credenciais corretas concedem acesso, incorretas são rejeitadas, logout finaliza a sessão.

---

## Phase 4: User Story 2 - Administrador Cadastra Novos Usuários (Priority: P1)

**Goal**: Um Administrador autenticado cadastra, lista e edita usuários; um Professor não tem acesso a essa área.

**Independent Test**: Logar como Admin, cadastrar um usuário com papel "Professor", logout, login com as credenciais recém-criadas — acesso concedido.

### Tests for User Story 2

- [x] T022 [P] [US2] Testes xUnit de unicidade de e-mail (FR-007) em `backend/Imperial.Api.Tests/Identity/UserManagerEmailUniquenessTests.cs` (DI montada igual a `Program.cs`: `AddIdentityCore` + `MongoUserStore` + `RequireUniqueEmail`) — **2/2 aprovados** (rejeita duplicado, aceita e-mails distintos). Regra "não desativar o último Admin" será validada via curl em T029, mesmo padrão usado para `AuthController`

### Implementation for User Story 2

- [x] T023 [US2] Implementado `UsersController.GetUsers` em `backend/Imperial.Api/Controllers/UsersController.cs`. **Bug real encontrado e corrigido**: `[Authorize(Roles=...)]` retornava 403 mesmo com token válido — `JwtSecurityTokenHandler` remapeia automaticamente claims curtas ("role") para as URIs longas de `ClaimTypes.*`, então `RoleClaimType = "role"` nunca casava. Corrigido com `options.MapInboundClaims = false;` em `Program.cs`. Validado via curl: sem token → 401; com token Admin → 200
- [x] T024 [US2] Implementado `UsersController.CreateUser` — validado via curl: cadastro de Professor → 201 + login imediato com as credenciais funciona (US2 Acceptance Scenario 2); e-mail duplicado → 409 (FR-007, Scenario 3)
- [x] T025 [US2] Implementado `UsersController.UpdateUser` — validado via curl: edição normal (nome) → 200; tentativa de desativar o único Admin → 409; tentativa de trocar o papel do único Admin para Professor → 409 (Edge Case)
- [x] T026 [US2] Criado `UsersComponent` (listagem + formulário de cadastro/edição inline) em `src/frontend/src/app/pages/users/users.component.ts`/`.html`, com `UsersService` dedicado (`src/frontend/src/app/services/users.service.ts`) e `environments/environment.ts` (`apiUrl`)
- [x] T027 [US2] Implementado `authGuard` (functional guard) em `src/frontend/src/app/guards/auth.guard.ts` — antecipa T030 da US3, já que é a mesma peça; aceita `data: { papel: '...' }` para checagem de papel. Rota `/users` adicionada em `app.routes.ts` com `canActivate: [authGuard]` e `data: { papel: 'Administrador' }`
- [x] T028 [US2] Adicionado link "Usuários" (`*ngIf="authService.isAdmin()"`) na navegação inferior de `students`, `training`, `games`, `dashboard` e `student-eval` — cada componente passou a injetar `AuthService` publicamente para o template
- [x] T029 [US2] Validado fluxo de US2 ponta a ponta via curl: GetUsers (sem token → 401; com token Admin → 200; com token Professor → 403); CreateUser (sucesso → 201 + login imediato funciona; e-mail duplicado → 409); UpdateUser (edição normal → 200; desativar/trocar papel do último Admin → 409 em ambos os casos)

**Checkpoint**: Administrador gerencia usuários completamente; Professor não acessa essa área.

---

## Phase 5: User Story 3 - Proteção Contínua das Telas Existentes (Priority: P2)

**Goal**: Todas as telas hoje desprotegidas (students, student-eval, training, games, dashboard) passam a exigir login, sem nenhuma regressão de comportamento.

**Independent Test**: Tentar acessar cada URL protegida sem login (deve redirecionar) e depois logado (deve funcionar exatamente como antes).

### Implementation for User Story 3

- [x] T030 [US3] Implementado junto com T027 — `authGuard` em `src/frontend/src/app/guards/auth.guard.ts`
- [x] T031 [US3] Implementado junto com T027 — `canActivate: [authGuard]` aplicado a `students`, `student-eval`, `training`, `games`, `dashboard` (e `users`) em `app.routes.ts`
- [x] T032 [US3] Validado por revisão de código que as mudanças em `students`/`student-eval`/`training`/`games`/`dashboard` são puramente aditivas: apenas import + parâmetro de construtor `AuthService` + um link de navegação condicional (`*ngIf`) foram adicionados — nenhuma propriedade, método ou lógica existente foi alterada. `ng build` final limpo (697 kB); 8/8 testes de backend aprovados

**Checkpoint**: Nenhuma tela é acessível sem login; todo o comportamento pré-existente preservado.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Cobertura de teste adicional e documentação do novo fluxo de backend.

- [x] T033 [P] Testes xUnit de idempotência do `AdminSeedService` em `backend/Imperial.Api.Tests/Services/AdminSeedServiceTests.cs` — 3 testes (cria quando não existe; não duplica em 3 execuções seguidas; não cria quando já existe outro Admin ativo) — **3/3 aprovados** (suíte completa: 11/11)
- [x] T034 [P] Atualizado `CLAUDE.md` com seção "Backend .NET" — comandos (`dotnet build`/`test`/`run`, `user-secrets`), e nota sobre o bug real do `MapInboundClaims` encontrado (para não ser reintroduzido)
- [x] T035 Executados os 10 cenários do `quickstart.md` (login Admin seedado, senha incorreta, acesso direto sem login, cadastro de usuário, e-mail duplicado, Professor bloqueado na gestão de usuários, lockout por tentativas, **logout** — testado nesta etapa final, último-Admin protegido, regressão de código nos fluxos existentes) — todos conforme esperado. Verificação final: backend `dotnet build`/`dotnet test` (11/11) e frontend `ng build` (697 kB), ambos limpos

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode começar imediatamente.
- **Foundational (Phase 2)**: Depende do Setup — **bloqueia todas as user stories**.
- **US1 (Phase 3)**: Depende da Phase 2 — é o bloco que habilita login real.
- **US2 (Phase 4)**: Depende de US1 (T018/T019 — `AuthService`/`AuthInterceptor` prontos; um Admin precisa logar para gerenciar usuários).
- **US3 (Phase 5)**: Depende de US1 (T018 — `AuthService`/`AuthGuard` usam a mesma base); independente de US2.
- **Polish (Final)**: Depende de US1, US2 e US3 completas.

### User Story Dependencies

- **US1 (P1)**: Depende apenas da Phase 2 — é o bloco fundamental, mesmo compartilhando prioridade máxima com US2 na spec.
- **US2 (P1)**: Depende de US1 (login funcional é prerequisito prático para um Admin operar a gestão de usuários).
- **US3 (P2)**: Depende de US1 (reaproveita `AuthService`/`AuthGuard`); pode ser feita em paralelo com US2 por times diferentes.

### Parallel Opportunities

```
Phase 2 completa
       │
       ├── US1 (T016–T021) ──┐
       │                     ├── ambas dependem apenas de US1 estar pronta (T018/T019)
       └─────────────────────┤
                              ├── US2 (T023–T029)
                              └── US3 (T030–T032)
```

```
# Dentro do Setup, em paralelo:
Task T002: Adicionar pacotes NuGet
Task T003: Configurar Swagger
Task T005: Confirmar provideHttpClient no Angular

# Dentro do Foundational, em paralelo:
Task T006: ApplicationUser
Task T007: Constantes de papel
Task T012: DTOs
Task T013: Esqueleto do AuthService
Task T014: user.model.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1: Setup (T001–T005)
2. Completar Phase 2: Foundational (T006–T014) — **crítico**
3. Completar Phase 3: US1 (T015–T021)
4. **PARAR E VALIDAR**: login real funcionando, telas ainda sem `AuthGuard` aplicado
5. MVP entregue: autenticação funcional, mas telas existentes ainda abertas (US3 pendente)

### Incremental Delivery

1. Setup + Foundational → base pronta (backend criado, Identity operacional)
2. US1 → login real funciona → **MVP de autenticação**
3. US2 → Admin cadastra usuários → sistema ganha utilidade prática (sem isso, só a conta seed existe)
4. US3 → todas as telas existentes protegidas → feature completa, sem brechas
5. Polish → testes de idempotência do seed, documentação, validação final completa

### Parallel Team Strategy

Com múltiplos desenvolvedores, após Phase 2:
- Dev A (backend): UsersController (US2) — T023–T025
- Dev B (frontend): AuthGuard + proteção de rotas (US3) — T030–T032, em paralelo com US2 já que ambas só dependem de US1
- Reconvergem na validação final (T035)

---

## Notes

- US1 e US2 compartilham prioridade P1 na spec — a ordem de implementação (US1 antes de US2) reflete dependência funcional, não diferença de prioridade de negócio.
- `AuthService`/`AuthInterceptor` (T018/T019) são a base compartilhada entre US2 e US3 — qualquer mudança ali afeta ambas.
- Testes xUnit cobrem apenas os componentes novos de segurança do backend (store de Identity, seed do Admin); o frontend segue a convenção de validação manual já usada nas features 014/015.
- Nenhuma credencial inicial (seed do Admin) deve ser hardcoded no código — sempre via configuração/`user-secrets`/variável de ambiente (T011).
- `ApplicationRole`/`MongoRoleStore`/`IRoleStore` foram eliminados do desenho original durante a implementação — ver nota no topo deste arquivo e em `plan.md`/`data-model.md`.
