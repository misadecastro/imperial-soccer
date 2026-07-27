# Contrato descontinuado: Evaluations API

**Feature**: 021-remove-evaluation | **Date**: 2026-07-27

Esta feature **remove** o contrato de API introduzido pela feature 018-evaluation-api.
Nenhum endpoint novo é criado. Os endpoints abaixo deixam de existir após a remoção do
`EvaluationsController`.

## Endpoints removidos (base `/api/v1`)

| Método | Rota | Descrição (removida) |
|---|---|---|
| `GET` | `/evaluations?alunoId={id}` | Listava avaliações de um aluno |
| `POST` | `/evaluations` | Criava uma avaliação |
| `PUT` | `/evaluations/{id}` | Atualizava uma avaliação |
| `DELETE` | `/evaluations/{id}` | Excluía uma avaliação |

**Comportamento esperado pós-remoção**: qualquer requisição às rotas acima retorna
`404 Not Found` (rota inexistente) — nenhum handler registrado.

## Contrato alterado: exclusão de aluno (efeito colateral removido)

`DELETE /api/v1/students/{id}` **permanece**, mas deixa de executar a exclusão em cascata
das avaliações vinculadas (`db.evaluations.DeleteMany(alunoId)`). A resposta e o envelope
padrão `{ success, data, message, errors }` não mudam; apenas o efeito colateral interno
sobre a coleção `evaluations` é eliminado.

## Verificação

- Swagger/OpenAPI (`/swagger`) não lista mais o grupo `Evaluations`.
- `DELETE /students/{id}` continua retornando sucesso e removendo o aluno.
