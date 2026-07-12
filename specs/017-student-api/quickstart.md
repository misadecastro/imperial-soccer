# Quickstart: Cadastro de Alunos com Persistência Real

**Branch**: `017-student-api` | **Date**: 2026-07-12

## Pré-requisitos

1. Backend rodando: `cd backend/Imperial.Api && dotnet run`
2. Frontend rodando: `cd src/frontend && ng serve`
3. MongoDB local ativo (serviço Windows já configurado na feature 016)
4. Token JWT válido (obtido via login com `admin@imperial.com`)

## Cenários de validação

| Cenário | Como reproduzir | Resultado esperado |
|---------|----------------|--------------------|
| **Lista vazia inicial** | Acessar `/students` após login, sem nenhum aluno no banco | Mensagem "Nenhum aluno cadastrado ainda" — sem mock data fictício (FR-012) |
| **Cadastrar aluno** | Clicar em "Novo Aluno", preencher nome/data/categoria, salvar | Aluno aparece na lista imediatamente (US1 Scenario 1) |
| **Persistência após reload** | Fechar e reabrir o navegador, fazer login novamente | Aluno cadastrado continua visível (SC-001) |
| **Filtro por nome** | Com alunos cadastrados, digitar parte de um nome | Lista filtra em tempo real (US2 Scenario 2) |
| **Filtro por categoria** | Selecionar uma categoria no dropdown | Lista mostra só alunos daquela categoria (US2 Scenario 3) |
| **Campo obrigatório em branco** | Tentar cadastrar sem nome | Erro de validação exibido, nenhum aluno criado (US1 Scenario 3) |
| **Data de nascimento futura** | Informar data posterior a hoje | Erro de validação (US1 Scenario 4 / FR-006) |
| **Excluir aluno** | Clicar em "Excluir", confirmar | Aluno desaparece e não volta após reload (US3 Scenario 1) |
| **Visibilidade entre usuários** | Criar outro usuário via `/users`, logar com ele em outra aba | Alunos cadastrados pelo Admin aparecem (US1 Scenario 2, SC-005) |
| **Dados compartilhados no dashboard** | Cadastrar aluno, ir ao Dashboard aba Alunos | Novo aluno aparece na lista de seleção do dashboard |

## Testar via curl

```bash
# Obter token
TOKEN=$(curl -s -X POST http://localhost:5179/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@imperial.com","senha":"ImperialAdmin#2026"}' \
  | grep -o '"token":"[^"]*"' | sed 's/"token":"//;s/"$//')

# Listar alunos
curl -s http://localhost:5179/api/v1/students -H "Authorization: Bearer $TOKEN"

# Cadastrar aluno
curl -s -X POST http://localhost:5179/api/v1/students \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","dataNascimento":"2015-03-20","categoria":"Sub09"}'

# Excluir aluno (substituir <id> pelo id retornado no POST)
curl -s -X DELETE "http://localhost:5179/api/v1/students/<id>" \
  -H "Authorization: Bearer $TOKEN"
```

## Critério de "feature concluída"

1. Todos os cenários da tabela acima passam.
2. `dotnet build` (backend) e `ng build` (frontend) sem erros.
3. Nenhum aluno mock é gerado automaticamente ao abrir a tela de alunos vazia.
4. Dados de alunos persistem entre sessões distintas do navegador.
