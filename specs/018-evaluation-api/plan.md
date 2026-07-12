# Implementation Plan: Avaliações com Persistência Real

**Branch**: `018-evaluation-api` | **Date**: 2026-07-12 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/018-evaluation-api/spec.md`

## Summary

Criar os endpoints REST de avaliações (`GET`, `POST`, `PUT`, `DELETE /api/v1/evaluations`) e atualizar o `StudentEvalComponent` Angular para consumir esses endpoints via um novo `EvaluationsService` — eliminando o uso de `sessionStorage` para avaliações. Extender também o `DELETE /api/v1/students/{id}` para excluir em cascata as avaliações do aluno (FR-013). Segue exatamente o padrão da feature 017 (alunos).

## Technical Context

**Language/Version**: C# 12 / .NET 8 (backend existente `Imperial.Api`); TypeScript 5.x / Angular 18 (frontend existente)  
**Primary Dependencies**: `MongoDB.Driver` (já presente); Angular `HttpClient` (já presente)  
**Storage**: MongoDB — nova coleção `evaluations`; `sessionStorage` (`imperialState`) mantida para `chamadas` e `jogos` (intocados por esta feature)  
**Testing**: Validação manual via curl e browser, conforme `quickstart.md`  
**Target Platform**: Backend Kestrel + frontend Angular 18 (inalterados)  
**Performance Goals**: Histórico de avaliações de um aluno carrega em ≤ 3 segundos (SC-002)  
**Constraints**: PROIBIDO EF/ORM; autenticação JWT obrigatória; avaliações de um aluno carregadas sob demanda (lazy, por `alunoId`), não globalmente

## Constitution Check

- [x] **Complexidade justificada?** Sim — persistência real é necessidade fundamental; CRUD simples sobre MongoDB.
- [x] **Professor opera sem suporte técnico?** Sim — UI do `StudentEvalComponent` permanece visualmente idêntica.
- [x] **Dados do aluno permanecem consistentes?** Sim — avaliações referenciadas por `alunoId` real (do backend), cascata de deleção garante integridade.
- [x] **API segue o envelope padrão e está documentada?** Sim — respostas seguem `{ success, data, message, errors }`.
- [x] **MongoDB via driver oficial sem abstrações desnecessárias?** Sim — `EvaluationsController` acessa `IMongoCollection<Avaliacao>` diretamente.

Sem violações.

## Project Structure

### Documentation

```text
specs/018-evaluation-api/
├── plan.md              # Este arquivo
├── research.md          # Decisões técnicas
├── data-model.md         # Entidade Avaliacao no MongoDB
├── contracts/
│   └── evaluations-api.md  # Contratos dos 4 endpoints REST
└── quickstart.md
```

### Source Code

```text
backend/Imperial.Api/
├── Controllers/
│   ├── EvaluationsController.cs     # NOVO — CRUD de avaliações
│   └── StudentsController.cs        # ATUALIZADO — cascade delete (FR-013)
├── Models/
│   └── Avaliacao.cs                 # NOVO — modelo MongoDB
└── DTOs/
    └── EvaluationDtos.cs            # NOVO — CreateEvaluationRequest, UpdateEvaluationRequest, EvaluationResponse

src/frontend/src/app/
├── services/
│   └── evaluations.service.ts       # NOVO — encapsula chamadas HTTP
├── models/
│   └── avaliacao.model.ts           # ATUALIZADO — adiciona CreateEvaluationRequest, UpdateEvaluationRequest
└── pages/
    └── student-eval/
        └── student-eval.component.ts  # ATUALIZADO — usa EvaluationsService; sem sessionStorage para avaliacoes
```

## Decisão de design: carregamento lazy por alunoId

As avaliações são carregadas sob demanda quando o professor abre a tela de avaliação de um aluno específico (`GET /api/v1/evaluations?alunoId=xxx`). Isso evita carregar centenas de avaliações de todos os alunos de uma só vez. A consequência aceitável é que os chips de avaliação na tela de alunos (`StudentsComponent`) mostram "—" quando as avaliações ainda não foram carregadas — o professor precisa clicar em "Avaliar" para ver o histórico completo.

`EvaluationsService.listarPorAluno(alunoId)` popula `stateService.state.avaliacoes` com as avaliações daquele aluno. O `DashboardComponent` lê `state.avaliacoes` via `alunoData.avaliacoesRecentes` (calculado quando o aluno é selecionado no dashboard) — funciona corretamente desde que o professor tenha visitado a tela de avaliação do aluno antes.
