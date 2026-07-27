# Implementation Plan: Configuração de Treino com Persistência Real

**Branch**: `020-training-config-api` | **Date**: 2026-07-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/020-training-config-api/spec.md`

## Summary

Migrar a configuração de treino (Princípios/Fundamentos com Itens Trabalhados e Momentos do Jogo com seus vínculos), hoje mantida em um serviço Angular em memória (feature 019, perdida ao recarregar), para persistência real no backend .NET/MongoDB, e integrar o frontend para consumir a API em vez do mock. Duas coleções MongoDB novas (`training_principles`, `game_moments`) com documentos que **embutem** seus filhos (itens dentro do princípio; vínculos dentro do momento — Princípio V). Leitura liberada a qualquer usuário autenticado (a tela de montagem de treino é usada por professores); escrita restrita ao Administrador (mantém o gate da 019). Seed idempotente no startup replica os dados hoje fixos. O `TrainingConfigService` do frontend passa a orquestrar chamadas HTTP mantendo um cache em memória para os templates, no mesmo padrão de `evaluations.service.ts`.

## Technical Context

**Language/Version**: C# 12 / .NET 8 (backend existente `Imperial.Api`); TypeScript 5.x / Angular 18 (frontend existente)
**Primary Dependencies**: `MongoDB.Driver` (já presente); `Microsoft.AspNetCore.Authentication.JwtBearer` (já configurado); Angular `HttpClient` (já provido via `provideHttpClient()`)
**Storage**: MongoDB — novas coleções `training_principles` e `game_moments`; encerra o uso do serviço mock em memória da feature 019 como fonte da verdade
**Testing**: xUnit no backend (`Imperial.Api.Tests`, contra MongoDB real em bancos dedicados); validação manual do fluxo do professor/admin no frontend (quickstart.md)
**Target Platform**: API ASP.NET Core em `http://localhost:5179`; SPA Angular em `http://localhost:4200`
**Project Type**: Web (backend .NET + frontend Angular) — estrutura existente
**Performance Goals**: carregamento da configuração completa < 3s (SC-002); operações CRUD com resposta imediata na UI
**Constraints**: envelope de resposta padrão `{ success, data, message, errors }` (Princípio IV); endpoints versionados sob `/api/v1/`; acesso ao Mongo somente via driver oficial (sem EF/ORM); leitura autenticada, escrita admin-only
**Scale/Scope**: configuração global/compartilhada da escola — ordem de dezenas de princípios/itens/momentos; 2 controllers, 2 modelos raiz + 2 embutidos, 1 seed service, ~10 endpoints, 1 refactor de serviço Angular + ajustes em 2 componentes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Complexidade justificada pelo domínio?** Sim. Duas entidades de domínio (configuração de treino) que hoje só existem mockadas ganham persistência real — requisito direto do usuário. Sem camadas extras: controllers finos + acesso direto ao `IMongoCollection`, no mesmo molde de `EvaluationsController`.
- [x] **Professor opera sem suporte técnico?** Sim. A tela de configuração (admin) e a de montagem de treino (professor) já existem (019); esta feature apenas troca a origem dos dados. UX inalterada.
- [x] **Dados do aluno permanecem consistentes?** N/A diretamente (não toca alunos); mas a integridade referencial interna (vínculos órfãos) é garantida no backend em cascata (FR-006/FR-007).
- [x] **API segue o envelope padrão e está documentada?** Sim. `ApiResponse<T>` reutilizado; endpoints sob `/api/v1/`, expostos no Swagger existente.
- [x] **Acesso ao MongoDB via driver oficial sem abstrações desnecessárias?** Sim. `IMongoCollection<T>` direto nos controllers, sem repositório extra (consistente com features 017/018). Sem EF/ORM.
- [x] **Embeddings vs. referências (Princípio V)?** Itens são sempre acessados junto do seu Princípio → embutidos. Vínculos são sempre acessados junto do seu Momento → embutidos. Momentos e Princípios têm ciclo de vida independente → coleções separadas, vínculos referenciam Princípios/Itens por id (string).
- [x] **Sem lógica de negócio no Controller?** As validações e cascatas são simples e específicas de cada endpoint; seguindo o precedente de `EvaluationsController` (validação inline no controller), mantemos o mesmo nível. Nenhuma regra de negócio compartilhada complexa que exija extração para Service dedicado além do `TrainingConfigSeedService`.

**Resultado**: PASS — nenhuma violação. Sem entradas na Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/020-training-config-api/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões técnicas
├── data-model.md        # Phase 1 — entidades e coleções
├── quickstart.md        # Phase 1 — roteiro de validação manual
├── contracts/           # Phase 1 — contratos dos endpoints
│   ├── training-principles.md
│   └── game-moments.md
├── checklists/
│   └── requirements.md  # (já criado pelo /speckit.specify)
└── tasks.md             # Phase 2 (/speckit.tasks — NÃO criado aqui)
```

### Source Code (repository root)

```text
backend/Imperial.Api/
├── Models/
│   ├── PrincipioGrupo.cs        # NOVO — raiz da coleção training_principles (embute ItemTrabalhado)
│   ├── ItemTrabalhado.cs        # NOVO — embutido em PrincipioGrupo
│   ├── Momento.cs               # NOVO — raiz da coleção game_moments (embute VinculoMomentoPrincipio)
│   └── VinculoMomentoPrincipio.cs # NOVO — embutido em Momento
├── DTOs/
│   └── TrainingConfigDtos.cs    # NOVO — requests/responses dos dois controllers
├── Controllers/
│   ├── TrainingPrinciplesController.cs # NOVO — /api/v1/training-principles (+ /items)
│   └── GameMomentsController.cs        # NOVO — /api/v1/game-moments (+ /vinculos)
├── Services/
│   └── TrainingConfigSeedService.cs    # NOVO — seed idempotente das duas coleções
└── Program.cs                   # AJUSTE — registrar e executar o seed no startup

frontend/src/app/
├── models/
│   └── training-config.model.ts # AJUSTE — adicionar DTOs de request se necessário (reusa interfaces existentes)
├── services/
│   └── training-config.service.ts # REFACTOR — de mock em memória para HttpClient + cache
└── pages/
    ├── training-config/         # AJUSTE — carregar via API on init; ops assíncronas + feedback
    └── training/                # AJUSTE — montagem de treino carrega config do backend on init
```

**Structure Decision**: Projeto Web existente (backend .NET + frontend Angular). Backend segue exatamente a estrutura de `EvaluationsController`/`StudentsController` (controller fino sobre `IMongoCollection`, DTOs em `DTOs/`, modelos em `Models/`). Frontend refatora o serviço existente `training-config.service.ts` sem mover arquivos, no padrão de `evaluations.service.ts` (HttpClient + cache em memória exposto por getters).

## Complexity Tracking

> Sem violações do Constitution Check — seção não aplicável.
