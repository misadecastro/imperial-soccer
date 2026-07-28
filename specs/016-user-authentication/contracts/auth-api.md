# API Contract: Autenticação e Gestão de Usuários

**Branch**: `016-user-authentication` | **Date**: 2026-06-27

Primeira superfície de API REST do projeto. Todas as respostas seguem o envelope padrão
definido na constituição (Princípio IV):

```json
{ "success": true, "data": { /* ... */ }, "message": null, "errors": null }
```

Em erro:

```json
{ "success": false, "data": null, "message": "Credenciais inválidas.", "errors": ["..."] }
```

Base path: `/api/v1/`

## POST `/api/v1/auth/login`

**Auth**: Não requer (endpoint público).

**Request**:

```json
{ "email": "treinador@imperial.com", "senha": "********" }
```

**Response 200** — FR-001, US1 Acceptance Scenario 1:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOi...",
    "expiraEm": "2026-06-27T20:00:00Z",
    "usuario": { "id": "...", "nome": "...", "email": "...", "papel": "Professor" }
  },
  "message": null,
  "errors": null
}
```

**Response 401** — credenciais inválidas (FR-009, US1 Acceptance Scenario 2):

```json
{ "success": false, "data": null, "message": "E-mail ou senha inválidos.", "errors": null }
```

**Response 423** (Locked) — conta bloqueada por tentativas excessivas (FR-012, Edge Case):

```json
{ "success": false, "data": null, "message": "Conta temporariamente bloqueada. Tente novamente mais tarde.", "errors": null }
```

---

## POST `/api/v1/auth/logout`

**Auth**: Requer token Bearer válido.

**Response 200** — US1 Acceptance Scenario 4. Como a autenticação é stateless (JWT), o
logout é primariamente uma ação do cliente (descartar o token); o endpoint existe para
simetria de contrato e para uso futuro caso uma lista de revogação seja necessária.

```json
{ "success": true, "data": null, "message": "Sessão finalizada.", "errors": null }
```

---

## GET `/api/v1/users`

**Auth**: Requer token Bearer com papel `Administrador` (FR-004, FR-013). Outros papéis → 403.

**Response 200**:

```json
{
  "success": true,
  "data": [
    { "id": "...", "nome": "Maria Treinadora", "email": "maria@imperial.com", "papel": "Professor", "ativo": true }
  ],
  "message": null,
  "errors": null
}
```

**Response 403** — usuário autenticado sem papel Administrador (US2 Acceptance Scenario 4):

```json
{ "success": false, "data": null, "message": "Acesso restrito a administradores.", "errors": null }
```

---

## POST `/api/v1/users`

**Auth**: Requer token Bearer com papel `Administrador` (FR-005, FR-006).

**Request**:

```json
{ "nome": "Maria Treinadora", "email": "maria@imperial.com", "senha": "********", "papel": "Professor" }
```

**Response 201** — US2 Acceptance Scenario 2:

```json
{
  "success": true,
  "data": { "id": "...", "nome": "Maria Treinadora", "email": "maria@imperial.com", "papel": "Professor", "ativo": true },
  "message": "Usuário cadastrado com sucesso.",
  "errors": null
}
```

**Response 409** — e-mail já cadastrado (FR-007, US2 Acceptance Scenario 3):

```json
{ "success": false, "data": null, "message": "Este e-mail já está em uso.", "errors": null }
```

---

## PUT `/api/v1/users/{id}`

**Auth**: Requer token Bearer com papel `Administrador` (FR-014).

**Request** (todos os campos opcionais — atualização parcial):

```json
{ "nome": "Maria T. Silva", "papel": "Administrador", "novaSenha": "********", "ativo": true }
```

**Response 200**:

```json
{
  "success": true,
  "data": { "id": "...", "nome": "Maria T. Silva", "email": "maria@imperial.com", "papel": "Administrador", "ativo": true },
  "message": "Usuário atualizado com sucesso.",
  "errors": null
}
```

**Response 409** — tentativa de desativar/remover papel Admin do último Administrador ativo (Edge Case):

```json
{ "success": false, "data": null, "message": "Não é possível remover o último administrador ativo.", "errors": null }
```

---

## Convenções transversais

- Todas as rotas protegidas exigem header `Authorization: Bearer <token>`.
- Requisição sem token ou com token expirado/inválido → `401 Unauthorized` com o envelope padrão de erro.
- Documentação interativa disponível via Swagger/OpenAPI em `/swagger` (Princípio IV).
