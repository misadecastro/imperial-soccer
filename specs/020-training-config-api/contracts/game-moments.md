# Contract: Game Moments API

**Base**: `/api/v1/game-moments`
**Coleção**: `game_moments`
**Auth**: `GET` → qualquer usuário autenticado; `POST/PUT/DELETE` → `Administrador`.
**Envelope**: todas as respostas usam `ApiResponse<T>` → `{ success, data, message, errors }`.

Corpos JSON camelCase, casando com `training-config.model.ts`.

---

## GET `/api/v1/game-moments`

Lista todos os Momentos do Jogo com seus vínculos.

- **200** → `data`: `Momento[]`
  ```json
  { "success": true, "data": [
    { "id": "org_ofensiva", "label": "Org. Ofensiva", "desc": "Equipe com a posse, construindo jogadas",
      "tipo": "ofensivo", "vinculos": [
        { "grupoId": "principios_ofensivos", "itemIds": ["espaco_com_bola", "mobilidade"] }
      ] }
  ], "message": null, "errors": null }
  ```
- **401** → não autenticado.

## POST `/api/v1/game-moments`  *(Administrador)*

Cria um novo Momento (vínculos iniciam vazios).

- **Body**: `{ "label": string, "desc"?: string, "tipo"?: "ofensivo"|"defensivo" }` (default `tipo` = `ofensivo`, `desc` = "")
- **201** → `data`: `Momento` criado (com `id` gerado, `vinculos: []`).
- **400** → label vazio ou duplicado (`errors`).
- **403** → não Administrador.

## PUT `/api/v1/game-moments/{id}`  *(Administrador)*

Atualiza nome e descrição do Momento (não altera vínculos).

- **Body**: `{ "label": string, "desc"?: string }`
- **200** → `data`: `Momento` atualizado.
- **400** → label vazio ou duplicado. **404** → momento inexistente. **403**.

## DELETE `/api/v1/game-moments/{id}`  *(Administrador)*

Remove o Momento.

- **200** → `data`: null, `message` de sucesso.
- **404** → momento inexistente. **403**.

---

## PUT `/api/v1/game-moments/{id}/vinculos`  *(Administrador)*

**Substitui em bloco** todos os vínculos do Momento (mapeia o fluxo de rascunho do form — `definirVinculos` da feature 019). Aplica RI-5: descarta vínculos a `grupoId` inexistente e `itemIds` fora do grupo.

- **Body**: `{ "vinculos": [ { "grupoId": string, "itemIds": string[] } ] }`
- **200** → `data`: `Momento` atualizado com os vínculos saneados.
- **404** → momento inexistente. **403**.
- **Exemplo**:
  ```json
  { "vinculos": [
    { "grupoId": "principios_ofensivos", "itemIds": ["espaco_com_bola"] },
    { "grupoId": "fundamentos_tecnicos", "itemIds": [] }
  ] }
  ```

---

### Validações (RI-3/RI-4/RI-5)

- Label de momento: obrigatório (não vazio após trim); único entre momentos, case-insensitive + trim.
- `PUT .../vinculos`: sanea referências — remove vínculos cujo `grupoId` não existe em `training_principles`; remove `itemIds` que não pertencem ao grupo.
- Mensagens de erro em `errors[]` (pt-BR), no padrão de `EvaluationsController`.
