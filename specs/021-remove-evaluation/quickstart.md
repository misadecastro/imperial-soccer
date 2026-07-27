# Quickstart: Validação da Remoção da Avaliação

**Feature**: 021-remove-evaluation | **Date**: 2026-07-27

Roteiro de verificação manual + automática após a remoção. Todos os passos devem passar.

## 1. Gates automáticos de build

```bash
# Frontend — build de tipos deve ficar verde (strict: true)
cd src/frontend
ng build

# Backend — build da solução deve ficar verde
cd backend
dotnet build Imperial.slnx
```

## 2. Verificação de resíduos (grep = 0 em código de produção)

```bash
# Nenhum símbolo de avaliação deve restar no código do app frontend
rg -i "avaliac|evaluation|evolution-chart|EvolutionChart" src/frontend/src/app

# Nenhum símbolo de avaliação deve restar no backend de produção
rg -i "avaliacao|evaluation" backend/Imperial.Api
```

Esperado: **nenhum resultado** em código (ocorrências apenas em `specs/` são aceitáveis).

## 3. Validação funcional (fluxo do professor)

Suba API (`dotnet run` em `Imperial.Api`) e frontend (`ng serve`), autentique-se e valide:

| # | Ação | Resultado esperado |
|---|---|---|
| 1 | Abrir **Alunos** | Cards de aluno **sem** chips de notas Téc/Tát/Ment e **sem** botão "Avaliar" |
| 2 | Excluir um aluno | Exclusão conclui com sucesso; mensagem de confirmação **não** menciona "avaliações" |
| 3 | Acessar URL antiga `/student-eval` | Não exibe a tela de avaliação — cai em página válida (home), sem erro |
| 4 | Abrir **Dashboard** de um aluno | **Sem** seção "Evolução Técnico-Tática-Mental"; frequência e minutagem exibidas normalmente |
| 5 | Abrir **Home** | Texto descritivo não promete funcionalidade de "avaliações" |
| 6 | Conferir **Swagger** (`/swagger`) | Grupo `Evaluations` ausente; `GET/POST/PUT/DELETE /evaluations` retornam 404 |

## 4. Regressão das features vizinhas

Confirmar que continuam funcionando: cadastro/edição/listagem de alunos, frequência
(chamadas), minutagem em jogos, configuração de treinos, gestão de usuários e
login/logout. Nenhuma deve apresentar erro ou seção quebrada.

## 5. Limpeza opcional de dados

```javascript
// No shell do MongoDB — descarta dados órfãos de avaliação (opcional)
db.evaluations.drop()
```
