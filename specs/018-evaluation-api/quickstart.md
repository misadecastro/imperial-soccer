# Quickstart: Avaliações com Persistência Real

**Branch**: `018-evaluation-api` | **Date**: 2026-07-12

## Pré-requisitos

1. Backend rodando: `cd backend/Imperial.Api && dotnet run`
2. Frontend rodando: `cd src/frontend && ng serve`
3. MongoDB local ativo
4. Pelo menos um aluno cadastrado (feature 017)
5. Token JWT válido (`admin@imperial.com`)

## Cenários de validação

| Cenário | Como reproduzir | Resultado esperado |
|---------|----------------|--------------------|
| **Lista vazia inicial** | Acessar avaliação de aluno recém-criado | "Nenhuma avaliação registrada ainda" — sem mock data (FR-012) |
| **Registrar avaliação** | Clicar "Nova Avaliação", preencher data + notas, salvar | Aparece no histórico imediatamente |
| **Persistência após reload** | Fechar e reabrir o navegador, fazer login, acessar o aluno | Avaliação persiste (SC-001) |
| **Paginação** | Registrar 11+ avaliações | Paginação funciona sobre dados reais |
| **Gráfico de evolução** | Ver gráfico após registrar avaliações | Gráfico com curvas Tático/Técnico/Mental reais |
| **Nota inválida** | Tentar salvar nota fora de {2,3,4,5} | Erro de validação sem criar registro |
| **Data futura** | Informar data posterior a hoje | Erro de validação (FR-005) |
| **Editar avaliação** | Clicar "Editar", alterar valores, salvar | Versão atualizada persiste após reload |
| **Excluir avaliação** | Clicar "Excluir", confirmar | Não retorna após reload (US4 Scenario 1) |
| **Cascata na exclusão de aluno** | Excluir aluno com avaliações em `/students` | Avaliações do aluno também são removidas do backend |

## Testar via curl

```bash
# Login
curl -s -X POST http://localhost:5179/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imperial.com","senha":"ImperialAdmin#2026"}' \
  -o /tmp/login.json
TOKEN=$(grep -o '"token":"[^"]*"' /tmp/login.json | sed 's/"token":"//;s/"$//')

# Listar alunos para obter um alunoId real
curl -s http://localhost:5179/api/v1/students -H "Authorization: Bearer $TOKEN"

# Registrar avaliação (substituir <alunoId> pelo id real)
curl -s -X POST http://localhost:5179/api/v1/evaluations \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"alunoId":"<alunoId>","data":"2026-07-10","tatico":4,"tecnico":3,"mental":5}'

# Listar avaliações do aluno
curl -s "http://localhost:5179/api/v1/evaluations?alunoId=<alunoId>" \
  -H "Authorization: Bearer $TOKEN"

# Editar avaliação (substituir <id> pelo id da avaliação)
curl -s -X PUT "http://localhost:5179/api/v1/evaluations/<id>" \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"data":"2026-07-08","tatico":5,"tecnico":4,"mental":4}'

# Excluir avaliação
curl -s -X DELETE "http://localhost:5179/api/v1/evaluations/<id>" \
  -H "Authorization: Bearer $TOKEN"
```
