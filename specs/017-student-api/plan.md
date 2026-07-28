# Implementation Plan: Cadastro de Alunos com Persistência Real

**Branch**: `017-student-api` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/017-student-api/spec.md`

## Summary

Criar os endpoints REST de alunos no backend (`GET`/`POST`/`DELETE /api/v1/students`) sobre `MongoDB.Driver` direto, e atualizar o `StudentsComponent` Angular para consumir esses endpoints via um novo `StudentsService` — eliminando o uso de `sessionStorage` para alunos e a geração automática de dados fictícios (mock data). Os dados de alunos passam a ser persistidos no MongoDB e compartilhados entre sessões e usuários. As demais entidades de domínio (Avaliação, Chamada, Jogo) permanecem em `sessionStorage` nesta feature; a migração delas é futura.

## Technical Context

**Language/Version**: C# 12 / .NET 8 (backend, projeto existente `Imperial.Api`); TypeScript 5.x / Angular 18 (frontend existente)  
**Primary Dependencies**: `MongoDB.Driver` (já presente), `Microsoft.AspNetCore.Authentication.JwtBearer` (já configurado); Angular `HttpClient` (já presente via `provideHttpClient()`)  
**Storage**: MongoDB — nova coleção `students`; `sessionStorage` (`imperialState`) mantida para `avaliacoes`, `chamadas`, `jogos` (intocados por esta feature)  
**Testing**: xUnit para o backend (`StudentsController` via testes de integração, opcional); validação manual do fluxo Angular conforme `quickstart.md`  
**Target Platform**: Backend — Kestrel (ASP.NET Core); Frontend — browsers modernos 2023+ (inalterado)  
**Project Type**: Web application — backend e frontend já existentes; esta feature adiciona novos endpoints e atualiza o componente de alunos  
**Performance Goals**: Listagem de alunos carrega em ≤ 3 segundos (SC-003); escala de uma escola de futebol (~200 alunos)  
**Constraints**: PROIBIDO EF/ORM (MongoDB.Driver direto); autenticação JWT obrigatória em todos os endpoints; alunos compartilhados entre todos os usuários autenticados (sem segregação por professor)  
**Scale/Scope**: Uma única escola, dezenas a poucas centenas de alunos; dois endpoints de escrita (POST, DELETE) e um de leitura (GET)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Complexidade justificada?** Sim — persistência real é necessidade fundamental; CRUD simples sobre MongoDB sem abstração desnecessária.
- [x] **Professor opera sem suporte técnico?** Sim — UI do `StudentsComponent` permanece visualmente idêntica; a mudança é transparente para o professor.
- [x] **Dados do aluno permanecem consistentes?** Sim — exclusive source of truth passa para MongoDB; avaliacoes em sessionStorage ainda referenciam `alunoId`, mas como a migração de avaliacoes é futura, os IDs do MongoDB serão usados daqui em diante.
- [x] **API segue o envelope padrão e está documentada?** Sim — respostas seguem `{ success, data, message, errors }`; Swagger já configurado.
- [x] **MongoDB via driver oficial sem abstrações desnecessárias?** Sim — `StudentsController` acessa `IMongoCollection<Aluno>` diretamente.

Sem violações — Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/017-student-api/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas (cache, deleção em cascata, transição de mock data)
├── data-model.md         # Entidade Aluno no MongoDB + DTOs
├── contracts/
│   └── students-api.md  # Contrato dos 3 endpoints REST
└── quickstart.md        # Como testar o fluxo completo
```

### Source Code (repository root)

```text
backend/Imperial.Api/
├── Controllers/
│   └── StudentsController.cs        # NOVO — GET /POST /DELETE /api/v1/students
├── Models/
│   └── Aluno.cs                     # NOVO — modelo MongoDB (Id, Nome, DataNascimento, Categoria)
└── DTOs/
    └── StudentDtos.cs               # NOVO — CreateStudentRequest, StudentResponse

src/frontend/src/app/
├── services/
│   └── students.service.ts          # NOVO — encapsula chamadas HTTP à API de alunos
└── pages/
    └── students/
        └── students.component.ts    # ATUALIZADO — usa StudentsService; remove mock data
```

**Structure Decision**: Backend segue o mesmo padrão de `UsersController` já existente (Controller + DTOs + modelo direto no MongoDB). Frontend segue o mesmo padrão de `UsersService` já existente. A entidade `Aluno` no backend é um POCO simples (sem EF, sem Identity) armazenado diretamente na coleção `students` do MongoDB.

## Decisão de design: cache em memória via `StateService`

Os demais componentes do frontend (DashboardComponent aba Alunos, GamesComponent seletor de participantes, TrainingComponent lista de chamada) leem `stateService.state.alunos` para exibir dados de alunos. Para não quebrar esses componentes sem reescrevê-los, o `StudentsService` popula `stateService.state.alunos` como **cache em memória** após cada operação de listagem/cadastro/exclusão:

- `listar()` → faz `GET /api/v1/students`, substitui `state.alunos` pelo resultado, **não** chama `stateService.save()` (alunos não são mais persistidos em sessionStorage)
- `criar()` → faz `POST /api/v1/students`, adiciona o novo aluno a `state.alunos`
- `excluir()` → faz `DELETE /api/v1/students/{id}`, remove de `state.alunos` e também de `state.avaliacoes` (limpeza local da sessionStorage — FR-009)

Os outros componentes continuam lendo `state.alunos` sem qualquer mudança.

## Complexity Tracking

> Não se aplica — Constitution Check não identificou violações.
