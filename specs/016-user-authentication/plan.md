# Implementation Plan: Autenticação de Usuários com Perfil Admin

**Branch**: `016-user-authentication` | **Date**: 2026-06-27 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/016-user-authentication/spec.md`

## Summary

Criar o primeiro backend do projeto (.NET 8 / ASP.NET Core Web API) com autenticação via ASP.NET Core Identity, usando stores customizados sobre `MongoDB.Driver` direto (sem Entity Framework Core, conforme emenda da constituição v2.1.0). O backend expõe endpoints de login/logout e gestão de usuários (exclusiva ao papel Administrador), protegidos por JWT Bearer. O frontend Angular existente passa a consumir esses endpoints reais no `LoginComponent` (substituindo o login simulado) e ganha um `AuthGuard` que protege as rotas hoje desprotegidas, além de uma nova página de gestão de usuários visível apenas a Administradores.

## Technical Context

**Language/Version**: C# 12 / .NET 8 (novo projeto de backend); TypeScript 5.x / Angular 18 (integração no frontend existente)  
**Primary Dependencies**: `Microsoft.AspNetCore.Identity` (abstrações core, sem `Identity.EntityFrameworkCore`), `MongoDB.Driver`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `Swashbuckle.AspNetCore` (Swagger)  
**Storage**: MongoDB — novas coleções `users` e `roles`; dados de domínio (alunos, avaliações, chamadas, jogos) continuam em `sessionStorage` no frontend, sem alteração  
**Testing**: xUnit para o backend (`Imperial.Api.Tests`); validação manual do fluxo Angular (consistente com a abordagem das features 014/015 — sem suíte automatizada de frontend nesta etapa)  
**Target Platform**: Backend — ASP.NET Core Web API (Kestrel); Frontend — browsers modernos 2023+ (inalterado)  
**Project Type**: Web application — primeiro backend real do projeto; frontend Angular existente passa a consumir uma API pela primeira vez (até aqui, 100% `sessionStorage`)  
**Performance Goals**: Login responde em condições normais sem atraso perceptível ao professor (sem requisito de carga/escala explícito na spec)  
**Constraints**: PROIBIDO Entity Framework/ORM — stores de Identity (`IUserStore`, `IRoleStore`, `IUserPasswordStore`) implementados diretamente sobre `MongoDB.Driver` (emenda v2.1.0); senha nunca em texto plano; ao menos 1 Admin sempre ativo; sem autocadastro  
**Scale/Scope**: Escopo pequeno — equipe de uma escola de futebol (poucas dezenas de contas no máximo); 2 papéis (Administrador, Professor)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

> Constituição emendada para v2.1.0 antes deste plano (clarificação, não redefinição de princípio): formaliza que Identity DEVE usar stores customizados sobre MongoDB.Driver, sem EF Core. Gate avaliado contra a versão emendada.

- [x] **Complexidade justificada?** Sim — autenticação é requisito de segurança explicitamente solicitado; stores customizados (em vez de EF) são a complexidade mínima compatível com a proibição de ORM já vigente.
- [x] **Professor opera sem suporte técnico?** Sim — login com usuário/senha é um padrão familiar; nenhuma mudança de fluxo para quem já possui conta, exceto a exigência de login (antes inexistente).
- [x] **Dados do aluno permanecem consistentes?** Sim — nenhuma entidade de domínio (Aluno, Avaliação, Chamada, Jogo) é alterada; a autenticação é uma camada de acesso adicional, não uma mudança de dados.
- [x] **API segue o envelope padrão e está documentada?** Sim — endpoints de autenticação e gestão de usuários seguem `{ success, data, message, errors }` e são documentados via Swagger/OpenAPI desde o primeiro endpoint.
- [x] **Acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias?** Sim — stores de Identity acessam `users`/`roles` diretamente via `MongoDB.Driver`, sem ORM.

Sem violações — Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/016-user-authentication/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas (stores customizados, JWT, seed do Admin)
├── data-model.md         # Entidades Usuário, Papel, Sessão — coleções MongoDB
├── contracts/            # Contratos dos endpoints REST (primeira API real do projeto)
│   └── auth-api.md
└── quickstart.md        # Como rodar o backend, seed do Admin, testar login end-to-end
```

### Source Code (repository root)

```text
backend/                              # NOVO — primeiro projeto de backend do repositório
├── Imperial.Api/
│   ├── Controllers/
│   │   ├── AuthController.cs            # POST /api/v1/auth/login, /logout
│   │   └── UsersController.cs           # GET/POST/PUT /api/v1/users (Admin only)
│   ├── Identity/
│   │   ├── ApplicationUser.cs           # IdentityUser<string> customizado (sem EF) + campo `Role` embutido
│   │   └── MongoUserStore.cs            # IUserStore, IUserPasswordStore, IUserEmailStore, IUserLockoutStore sobre MongoDB.Driver
│   ├── Services/
│   │   ├── JwtTokenService.cs           # Emissão/validação de token JWT
│   │   └── AdminSeedService.cs          # Garante 1 Admin ativo na inicialização (FR-011)
│   ├── DTOs/
│   │   ├── LoginRequest.cs / LoginResponse.cs
│   │   └── CreateUserRequest.cs / UpdateUserRequest.cs / UserResponse.cs
│   └── Program.cs                       # Configuração de Identity, JWT, MongoDB, Swagger
└── Imperial.Api.Tests/
    └── Identity/                        # Testes dos stores customizados e do AdminSeedService

frontend/src/app/
├── services/
│   └── auth.service.ts                  # login()/logout()/isAuthenticated(); token em sessionStorage
├── guards/
│   └── auth.guard.ts                    # Protege as rotas existentes (students, dashboard, etc.)
├── interceptors/
│   └── auth.interceptor.ts              # Anexa "Authorization: Bearer <token>" às chamadas à API
├── pages/
│   ├── login/                           # Atualizado: chama AuthService real em vez de redirecionar sempre
│   └── users/                           # NOVA página — gestão de usuários, visível só a Admin
└── models/
    └── user.model.ts, login-request.model.ts
```

**Structure Decision**: Primeira introdução de `backend/` no repositório, seguindo exatamente a árvore já prescrita pela constituição (`Imperial.Api` + `Imperial.Api.Tests`). No frontend, adiciona-se `guards/` e `interceptors/` (padrões Angular ainda não usados pelas features 001–015, pois não havia API real até agora); `pages/login/` é modificado, não recriado; `pages/users/` é nova.

## Complexity Tracking

> Não se aplica — Constitution Check não identificou violações.

## Nota de implementação

Durante a implementação, `ApplicationRole`/`MongoRoleStore`/`IRoleStore` foram eliminados do
desenho original: a autorização desta feature é decidida pela claim `role` do token JWT, não
pelo mecanismo de roles do Identity (`UserManager`/`RoleManager`). Com apenas 2 papéis fixos,
uma coleção `roles` separada seria complexidade sem necessidade real (Princípio I) — o papel
passou a ser um campo embutido (`role: string`) no próprio documento do usuário, consistente
com a preferência por embeddings do Princípio V. Ver `data-model.md` para o detalhamento.
