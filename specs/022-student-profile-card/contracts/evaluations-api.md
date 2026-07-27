# Contrato: Evaluations API (registros/histórico)

**Feature**: 022-student-profile-card | Base: `/api/v1` | Envelope: `{ success, data, message, errors }`

Registro e consulta de avaliações de um aluno em um tipo. Autenticação obrigatória
(professor ou administrador). Novo esquema (a coleção `evaluations` da feature 018 foi
descartada na 021).

## GET `/evaluations?alunoId={id}&tipoId={id}`

Lista as avaliações de um aluno. `tipoId` opcional (filtra por tipo). Ordenadas por `data`.

- `200` → `{ success: true, data: [ { id, alunoId, tipoId, data, pontuacoes: [{ itemId, nota }] } ] }`

Usado para: radar (avaliação mais recente), evolução por item (série temporal) e histórico.

## POST `/evaluations`

Cria uma avaliação.

```json
{
  "alunoId": "aluno-1",
  "tipoId": "tipo-1",
  "data": "2026-07-27",
  "pontuacoes": [
    { "itemId": "item-a", "nota": 4 },
    { "itemId": "item-b", "nota": 3 }
  ]
}
```

**Validação**:
- `alunoId`, `tipoId`, `data` obrigatórios; o tipo deve existir e estar ativo.
- Cada `nota` é inteiro de 1 a 5.
- `pontuacoes` devem referenciar itens válidos do tipo.

**Respostas**:
- `201` → `{ success: true, data: <Evaluation>, message: "Avaliação registrada." }`
- `400` → validação (nota fora de 1–5, item inexistente, tipo arquivado/inexistente).
- `404` → aluno ou tipo não encontrado.

## Observações

- Um aluno pode ter várias avaliações por tipo (histórico); `data` não é única.
- Edição/exclusão de um registro individual **não** faz parte do escopo desta feature.
- A agregação para radar/evolução é feita no frontend a partir do `GET`.
