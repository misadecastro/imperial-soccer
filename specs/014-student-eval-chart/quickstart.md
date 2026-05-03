# Quickstart: Testar o Gráfico de Evolução

**Branch**: `014-student-eval-chart` | **Date**: 2026-05-03

## Pré-requisito

Ter dados de avaliação registrados na sessão. O estado é inicializado em `student-eval.html` — cadastre pelo menos um aluno e duas avaliações antes de abrir o dashboard.

## Passos

1. Abra `src/frontend/pages/student-eval.html` em um browser.
2. Cadastre um aluno (ou use os dados mock existentes).
3. Registre 2–6 avaliações para esse aluno, variando os scores de Tático, Técnico e Mental.
4. Abra `src/frontend/pages/dashboard.html` no **mesmo** browser (mantém sessionStorage).
5. Clique na aba **Alunos**.
6. Selecione o aluno cadastrado na etapa 2.

**Resultado esperado**: a seção "Evolução Técnico-Tática-Mental" aparece ao final do painel do aluno, com o gráfico de linha exibindo até 6 pontos por dimensão, em ordem cronológica (mais antiga à esquerda).

## Cenários de teste

| Cenário | Como reproduzir | Resultado esperado |
|---------|----------------|--------------------|
| Aluno sem avaliações | Cadastre um aluno sem registrar avaliação | Seção exibe mensagem "Nenhuma avaliação registrada" |
| Aluno com 1 avaliação | Registre exatamente 1 avaliação | Gráfico exibe 3 pontos isolados (1 por dimensão), sem linha |
| Aluno com 3 avaliações | Registre 3 avaliações | Gráfico exibe 3 pontos conectados por linha |
| Aluno com 8 avaliações | Registre 8 avaliações | Gráfico exibe apenas as 6 mais recentes |
| Troca de aluno | Selecione outro aluno com avaliações diferentes | Gráfico é destruído e rerenderizado para o novo aluno |

## Como iniciar servidor local (opcional)

```bash
# Na raiz do projeto, usando Python (disponível na maioria dos sistemas):
python -m http.server 8080

# Depois abra: http://localhost:8080/src/frontend/pages/student-eval.html
```

Ou use a extensão **Live Server** no VS Code.
