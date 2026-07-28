# API Contract: Avaliações

**Branch**: `018-evaluation-api` | **Date**: 2026-07-12

Todos os endpoints requerem `Authorization: Bearer <token>`.  
Respostas seguem o envelope padrão: `{ "success": bool, "data": ..., "message": ..., "errors": [...] }`.

Base path: `/api/v1/`

---

## GET `/api/v1/evaluations?alunoId={alunoId}`

Lista todas as avaliações de um aluno específico. Parâmetro `alunoId` obrigatório.

**Response 200** — FR-003, US2 Scenario 1:
```json
{
  "success": true,
  "data": [
    { "id": "abc1", "alunoId": "xxx", "data": "2026-07-10", "tatico": 4, "tecnico": 3, "mental": 5 },
    { "id": "abc2", "alunoId": "xxx", "data": "2026-06-05", "tatico": 3, "tecnico": 3, "mental": 4 }
  ],
  "message": null, "errors": null
}
```

**Response 200** com lista vazia — US2 Scenario 2 (sem mock data):
```json
{ "success": true, "data": [], "message": null, "errors": null }
```

**Response 400** — `alunoId` ausente:
```json
{ "success": false, "data": null, "message": "O parâmetro alunoId é obrigatório.", "errors": null }
```

---

## POST `/api/v1/evaluations`

Registra uma nova avaliação.

**Request**:
```json
{ "alunoId": "xxx", "data": "2026-07-12", "tatico": 4, "tecnico": 3, "mental": 5 }
```

**Response 201** — US1 Scenario 1:
```json
{
  "success": true,
  "data": { "id": "abc1", "alunoId": "xxx", "data": "2026-07-12", "tatico": 4, "tecnico": 3, "mental": 5 },
  "message": "Avaliação registrada com sucesso.", "errors": null
}
```

**Response 400** — validação (US1 Scenarios 2, 3, 4):
```json
{ "success": false, "data": null, "message": "Dados inválidos.", "errors": ["A data não pode ser futura."] }
```

---

## PUT `/api/v1/evaluations/{id}`

Atualiza data e/ou notas de uma avaliação existente.

**Request**:
```json
{ "data": "2026-07-10", "tatico": 5, "tecnico": 4, "mental": 4 }
```

**Response 200** — US3 Scenario 1:
```json
{
  "success": true,
  "data": { "id": "abc1", "alunoId": "xxx", "data": "2026-07-10", "tatico": 5, "tecnico": 4, "mental": 4 },
  "message": "Avaliação atualizada com sucesso.", "errors": null
}
```

**Response 404** — avaliação não encontrada:
```json
{ "success": false, "data": null, "message": "Avaliação não encontrada.", "errors": null }
```

---

## DELETE `/api/v1/evaluations/{id}`

Exclui uma avaliação pelo seu identificador.

**Response 200** — US4 Scenario 1:
```json
{ "success": true, "data": null, "message": "Avaliação excluída com sucesso.", "errors": null }
```

**Response 404**:
```json
{ "success": false, "data": null, "message": "Avaliação não encontrada.", "errors": null }
```

---

## DELETE `/api/v1/students/{id}` — extensão (FR-013)

Endpoint existente da feature 017, agora também exclui em cascata todas as avaliações do aluno.  
Comportamento externo **inalterado** (resposta 200/404 idêntica à feature 017).  
Mudança é puramente interna: `StudentsController.Delete` passa a deletar também da coleção `evaluations`.
