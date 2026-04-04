# API Contract: Students

**Feature**: 002-student-register-eval  
**Base path**: `/api/v1/students`  
**Status**: Planned (not yet implemented — mock phase active)  
**Envelope**: `{ success: bool, data: any, message: string, errors: string[] }`

---

## POST /api/v1/students

Register a new student.

**Request body**:
```json
{
  "nome": "João da Silva",
  "dataNascimento": "2015-03-12",
  "categoria": "Sub09"
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "nome": "João da Silva",
    "dataNascimento": "2015-03-12",
    "categoria": "Sub09"
  },
  "message": "Aluno cadastrado com sucesso.",
  "errors": []
}
```

**Response 400** (validation error):
```json
{
  "success": false,
  "data": null,
  "message": "Dados inválidos.",
  "errors": ["O campo nome é obrigatório.", "A categoria informada não é válida."]
}
```

---

## GET /api/v1/students

List students with optional filters.

**Query parameters**:

| Parameter  | Type   | Required | Description                                     |
|------------|--------|----------|-------------------------------------------------|
| `nome`     | string | No       | Partial, case-insensitive match on student name |
| `categoria`| string | No       | Exact match: Sub09, Sub10, Sub11, Sub12, Sub13, Sub14 |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "64f1a2b3c4d5e6f7a8b9c0d1",
      "nome": "João da Silva",
      "dataNascimento": "2015-03-12",
      "categoria": "Sub09",
      "temAvaliacao": true
    }
  ],
  "message": null,
  "errors": []
}
```

---

## POST /api/v1/students/{id}/evaluations

Launch an evaluation for a student.

**Path parameter**: `id` — student ObjectId

**Request body**:
```json
{
  "tecnico": 5,
  "tatico": 4,
  "mental": 3
}
```

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "74g2b3c4d5e6f7a8b9c0d2e3",
    "alunoId": "64f1a2b3c4d5e6f7a8b9c0d1",
    "tecnico": 5,
    "tatico": 4,
    "mental": 3,
    "data": "2026-04-04T14:30:00Z"
  },
  "message": "Avaliação lançada com sucesso.",
  "errors": []
}
```

**Response 400** (missing aspect):
```json
{
  "success": false,
  "data": null,
  "message": "Avaliação incompleta.",
  "errors": ["O aspecto Mental não foi pontuado."]
}
```

**Response 404** (student not found):
```json
{
  "success": false,
  "data": null,
  "message": "Aluno não encontrado.",
  "errors": []
}
```

---

## Valid Note Values

| Value | Label            |
|-------|------------------|
| 5     | Excelente        |
| 4     | Bom              |
| 3     | Regular          |
| 2     | Precisa Melhorar |
