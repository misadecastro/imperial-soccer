# Contract: Training Principles API

**Base**: `/api/v1/training-principles`
**Coleção**: `training_principles`
**Auth**: `GET` → qualquer usuário autenticado; `POST/PUT/DELETE` → `Administrador`.
**Envelope**: todas as respostas usam `ApiResponse<T>` → `{ success, data, message, errors }`.

Todos os corpos são JSON camelCase, casando com `training-config.model.ts`.

---

## GET `/api/v1/training-principles`

Lista todos os Princípios/Fundamentos com seus itens.

- **200** → `data`: `PrincipioGrupo[]`
  ```json
  { "success": true, "data": [
    { "id": "principios_ofensivos", "titulo": "Princípios Táticos Ofensivos", "filtro": "ofensivo",
      "itens": [ { "id": "espaco_com_bola", "label": "Espaço com Bola" } ] }
  ], "message": null, "errors": null }
  ```
- **401** → não autenticado.

## POST `/api/v1/training-principles`  *(Administrador)*

Cria um novo grupo (sem itens).

- **Body**: `{ "titulo": string, "filtro"?: "defensivo"|"ofensivo"|"sempre" }` (default `filtro` = `sempre`)
- **201** → `data`: `PrincipioGrupo` criado (com `id` gerado).
- **400** → título vazio ou duplicado (`errors`).
- **403** → não Administrador.

## PUT `/api/v1/training-principles/{id}`  *(Administrador)*

Renomeia/atualiza o grupo (título e filtro).

- **Body**: `{ "titulo": string, "filtro"?: "defensivo"|"ofensivo"|"sempre" }`
- **200** → `data`: `PrincipioGrupo` atualizado.
- **400** → título vazio ou duplicado. **404** → grupo inexistente. **403**.

## DELETE `/api/v1/training-principles/{id}`  *(Administrador)*

Remove o grupo e **em cascata** (RI-1) todos os vínculos a ele em `game_moments`.

- **200** → `data`: null, `message` de sucesso.
- **404** → grupo inexistente. **403**.

---

## POST `/api/v1/training-principles/{id}/items`  *(Administrador)*

Adiciona um Item Trabalhado ao grupo.

- **Body**: `{ "label": string }`
- **201** → `data`: `PrincipioGrupo` atualizado (contendo o novo item).
- **400** → label vazio ou duplicado no grupo. **404** → grupo inexistente. **403**.

## PUT `/api/v1/training-principles/{id}/items/{itemId}`  *(Administrador)*

Renomeia um Item Trabalhado.

- **Body**: `{ "label": string }`
- **200** → `data`: `PrincipioGrupo` atualizado.
- **400** → label vazio ou duplicado no grupo. **404** → grupo ou item inexistente. **403**.

## DELETE `/api/v1/training-principles/{id}/items/{itemId}`  *(Administrador)*

Remove um Item Trabalhado e **em cascata** (RI-2) remove seu id dos `itemIds` de vínculos em `game_moments`.

- **200** → `data`: `PrincipioGrupo` atualizado (sem o item).
- **404** → grupo ou item inexistente. **403**.

---

### Validações (RI-3/RI-4)

- Título de grupo e label de item: obrigatórios (não vazios após trim).
- Unicidade case-insensitive + trim: títulos de grupo entre si; labels de item dentro do mesmo grupo.
- Mensagens de erro retornadas em `errors[]` (pt-BR), no padrão de `EvaluationsController`.
