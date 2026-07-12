# Data Model: Avaliações com Persistência Real

**Branch**: `018-evaluation-api` | **Date**: 2026-07-12

Nova coleção MongoDB `evaluations`. A coleção `students` (feature 017) é modificada apenas indiretamente via cascata na exclusão (FR-013). As coleções `users`/`roles` e sessionStorage `chamadas`/`jogos` não são alteradas.

## Avaliacao (coleção `evaluations`)

| Campo | Tipo | Restrições | Origem |
|-------|------|------------|--------|
| `_id` (mapeado como `Id`) | string (GUID) | único; gerado na criação | gerado pelo backend |
| `AlunoId` | string | obrigatório; referência ao `Id` da coleção `students` | FR-001 |
| `Data` | string (ISO `YYYY-MM-DD`) | obrigatório; não pode ser data futura | FR-001, FR-005 |
| `Tatico` | int | obrigatório; valor em {2, 3, 4, 5} | FR-001, FR-006 |
| `Tecnico` | int | obrigatório; valor em {2, 3, 4, 5} | FR-001, FR-006 |
| `Mental` | int | obrigatório; valor em {2, 3, 4, 5} | FR-001, FR-006 |

```csharp
// backend/Imperial.Api/Models/Avaliacao.cs
public sealed class Avaliacao
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string AlunoId { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
    public int Tatico { get; set; }
    public int Tecnico { get; set; }
    public int Mental { get; set; }
}
```

## DTOs

### `CreateEvaluationRequest` (entrada — POST)
```json
{ "alunoId": "xxx", "data": "2026-07-12", "tatico": 4, "tecnico": 3, "mental": 5 }
```

### `UpdateEvaluationRequest` (entrada — PUT)
```json
{ "data": "2026-07-10", "tatico": 5, "tecnico": 4, "mental": 4 }
```

### `EvaluationResponse` (saída — GET / POST / PUT)
```json
{ "id": "abc123", "alunoId": "xxx", "data": "2026-07-12", "tatico": 4, "tecnico": 3, "mental": 5 }
```

## Frontend (atualização em `avaliacao.model.ts`)

```ts
// src/frontend/src/app/models/avaliacao.model.ts — adicionar:
export interface CreateEvaluationRequest {
  alunoId: string;
  data: string;
  tatico: number;
  tecnico: number;
  mental: number;
}

export interface UpdateEvaluationRequest {
  data: string;
  tatico: number;
  tecnico: number;
  mental: number;
}
```

## Validações (backend)

| Regra | FR | HTTP |
|-------|----|------|
| `alunoId` obrigatório | FR-001 | 400 |
| `data` obrigatório, não futuro | FR-001, FR-005 | 400 |
| `tatico`/`tecnico`/`mental` obrigatórios, em {2,3,4,5} | FR-001, FR-006 | 400 |

## Relacionamentos

```
Aluno (1, collection:students) ──< Avaliacao (N, collection:evaluations) via Avaliacao.AlunoId
```

Ao excluir um `Aluno`, todas as `Avaliacao` com `AlunoId == aluno.Id` são excluídas em cascata (FR-013).
