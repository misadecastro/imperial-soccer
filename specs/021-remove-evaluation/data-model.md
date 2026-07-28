# Data Model: Remoção da Avaliação de Alunos

**Feature**: 021-remove-evaluation | **Date**: 2026-07-27

Esta feature **remove** um modelo de dados. Documenta-se aqui a entidade eliminada e o
impacto nas estruturas que a referenciavam.

## Entidade removida: Avaliação

Representava uma medição técnico-tática-mental de um aluno em uma data.

**Backend** (`backend/Imperial.Api/Models/Avaliacao.cs` — a REMOVER):
- `Id` (ObjectId/string)
- `AlunoId` (referência ao aluno)
- `Data` (data da avaliação)
- `Tecnico` (nota 1–10)
- `Tatico` (nota 1–10)
- `Mental` (nota 1–10)
- `Observacoes` (texto opcional)

**Frontend** (`src/frontend/src/app/models/avaliacao.model.ts` — a REMOVER):
- Interface `Avaliacao` (`id`, `alunoId`, `data`, `tecnico`, `tatico`, `mental`, `observacoes`)
- `CreateEvaluationRequest`, `UpdateEvaluationRequest`

**Coleção MongoDB**: `evaluations` — deixa de ser lida/escrita. Dados órfãos podem ser
descartados manualmente (`db.evaluations.drop()`); nenhum código volta a acessá-la.

## Impacto em estruturas que permanecem

### `ImperialState` (frontend, `models/imperial-state.model.ts`)

| Campo | Antes | Depois |
|---|---|---|
| `alunos` | `Aluno[]` | mantido |
| `avaliacoes` | `Avaliacao[]` | **removido** |
| `chamadas` | `Chamada[]` | mantido |
| `jogos` | `Jogo[]` | mantido |

- `criarEstadoVazio()` deixa de inicializar `avaliacoes`.
- `state.service.ts` deixa de ler `parsed.avaliacoes`. Chaves `avaliacoes` presentes em
  `sessionStorage` legado são ignoradas (não desserializadas).

### `Aluno` (entidade preservada)

Sem alteração de esquema. Perde apenas **relações derivadas** que viviam fora dele:
- notas "última avaliação" exibidas na lista (deixam de ser calculadas);
- navegação "Avaliar";
- cascata de exclusão de avaliações (o aluno é excluído sem essa etapa).

### `AlunoData` (view-model do dashboard, `dashboard.component.ts`)

| Campo | Ação |
|---|---|
| `avaliacoesRecentes: Avaliacao[]` | **removido** da interface e do objeto retornado |
| demais campos (presenças, frequência, minutagem, momentos, princípios) | mantidos |

### `EvalChip` (view-model interno de `students.component.ts`)

Interface e método `evalChips()` **removidos** por completo (existiam só para as notas).

## Regras de consistência pós-remoção

- **RC-001**: Nenhum símbolo `Avaliacao`/`avaliacoes`/`evaluation` deve permanecer em código
  de produção do frontend (`src/frontend/src/app`) nem do backend (`Imperial.Api`).
- **RC-002**: A exclusão de aluno permanece atômica do ponto de vista do usuário e não
  referencia a coleção `evaluations`.
- **RC-003**: O build de tipos (`ng build` / `dotnet build`) permanece verde.
