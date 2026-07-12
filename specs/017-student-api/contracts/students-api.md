# API Contract: Cadastro de Alunos

**Branch**: `017-student-api` | **Date**: 2026-07-12

Todos os endpoints requerem autenticação (`Authorization: Bearer <token>`).  
Todas as respostas seguem o envelope padrão da constituição (Princípio IV):

```json
{ "success": true,  "data": { ... }, "message": null,  "errors": null }
{ "success": false, "data": null,    "message": "...", "errors": ["..."] }
```

Base path: `/api/v1/`

---

## GET `/api/v1/students`

Lista todos os alunos da escola. Não aceita parâmetros de query (filtragem é client-side — research.md decisão #3).

**Auth**: Bearer token obrigatório (FR-011).

**Response 200** — FR-003, US2 Acceptance Scenario 1:

```json
{
  "success": true,
  "data": [
    { "id": "b3c9a21f-...", "nome": "João Silva",   "dataNascimento": "2015-03-20", "categoria": "Sub09" },
    { "id": "c4d8b32e-...", "nome": "Maria Santos", "dataNascimento": "2016-07-11", "categoria": "Sub10" }
  ],
  "message": null,
  "errors": null
}
```

**Response 200** com lista vazia — US2 Acceptance Scenario 4 (sem mock data):

```json
{ "success": true, "data": [], "message": null, "errors": null }
```

---

## POST `/api/v1/students`

Cadastra um novo aluno. Valida todos os campos antes de persistir.

**Auth**: Bearer token obrigatório (FR-011).

**Request**:

```json
{ "nome": "João Silva", "dataNascimento": "2015-03-20", "categoria": "Sub09" }
```

**Response 201** — US1 Acceptance Scenario 1:

```json
{
  "success": true,
  "data": { "id": "b3c9a21f-...", "nome": "João Silva", "dataNascimento": "2015-03-20", "categoria": "Sub09" },
  "message": "Aluno cadastrado com sucesso.",
  "errors": null
}
```

**Response 400** — FR-005, FR-007: campo obrigatório ausente ou inválido:

```json
{ "success": false, "data": null, "message": "Dados inválidos.", "errors": ["O nome deve ter pelo menos 2 caracteres."] }
```

**Response 400** — FR-006: data de nascimento futura:

```json
{ "success": false, "data": null, "message": "Dados inválidos.", "errors": ["A data de nascimento não pode ser uma data futura."] }
```

**Response 400** — categoria inválida:

```json
{ "success": false, "data": null, "message": "Dados inválidos.", "errors": ["Categoria inválida."] }
```

---

## DELETE `/api/v1/students/{id}`

Exclui um aluno pelo seu identificador.

**Auth**: Bearer token obrigatório (FR-011).

**Response 200** — US3 Acceptance Scenario 1:

```json
{ "success": true, "data": null, "message": "Aluno excluído com sucesso.", "errors": null }
```

**Response 404** — aluno não encontrado:

```json
{ "success": false, "data": null, "message": "Aluno não encontrado.", "errors": null }
```

---

## Convenções transversais

- Requisição sem token ou com token expirado → `401 Unauthorized` com envelope padrão.
- Endpoint documentado via Swagger/OpenAPI em `/swagger` (já configurado em `Program.cs`).
- JSON serializado em camelCase (padrão ASP.NET Core `AddControllers()`): `Nome` → `nome`, `DataNascimento` → `dataNascimento`.
