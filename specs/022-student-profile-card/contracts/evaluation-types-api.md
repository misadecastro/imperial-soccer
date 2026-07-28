# Contrato: Evaluation Types API

**Feature**: 022-student-profile-card | Base: `/api/v1` | Envelope: `{ success, data, message, errors }`

Gestão dos tipos de avaliação dinâmicos. Leitura: qualquer autenticado. Escrita: **Administrador**.
Segue o padrão de `TrainingPrinciplesController` (feature 020).

## GET `/evaluation-types`

Lista os tipos **ativos** (`arquivado = false`), cada um com seus itens.

- `200` → `{ success: true, data: [ { id, nome, itens: [{ id, nome }], arquivado } ] }`

## POST `/evaluation-types`  *(Administrador)*

Cria um tipo com nome e itens.

```json
{ "nome": "Técnico-Tático", "itens": ["Passe", "Controle", "Finalização"] }
```

- `201` → `{ success: true, data: <EvaluationType>, message: "Tipo de avaliação criado." }`
- `400` → nome vazio/duplicado (entre ativos) ou lista de itens vazia.
- `403` → usuário não é Administrador.

## PUT `/evaluation-types/{id}`  *(Administrador)*

Renomeia e/ou redefine os itens. Reconciliação por `id` de item (preexistentes mantêm `id`;
novos itens vêm sem `id`; itens ausentes são removidos da definição).

```json
{
  "nome": "Técnico-Tático",
  "itens": [
    { "id": "abc-123", "nome": "Passe" },
    { "nome": "Drible" }
  ]
}
```

- `200` → `{ success: true, data: <EvaluationType>, message: "Tipo de avaliação atualizado." }`
- `400` → validação (nome/itens). `404` → tipo não encontrado. `403` → não Administrador.

## DELETE `/evaluation-types/{id}`  *(Administrador)*  — soft delete

Marca `arquivado = true`. Não remove o documento nem as avaliações associadas.

- `200` → `{ success: true, data: null, message: "Tipo de avaliação arquivado." }`
- `404` → tipo não encontrado. `403` → não Administrador.

## Regras

- Nome obrigatório e único (case-insensitive) entre tipos ativos.
- Ao menos 1 item por tipo; nome de item obrigatório e único dentro do tipo.
- Tipos arquivados não são listados e não recebem novas avaliações.
