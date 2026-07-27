# Research: Remoção da Avaliação de Alunos

**Feature**: 021-remove-evaluation | **Date**: 2026-07-27

Feature de remoção: não há tecnologia nova a pesquisar. As "decisões" aqui delimitam o
que apagar, o que editar e o que preservar, evitando remoções em excesso (que quebrariam
telas remanescentes) ou de menos (que deixariam código órfão).

## Decisão 1 — Estratégia de remoção: apagar exclusivos, editar compartilhados

- **Decision**: Excluir integralmente apenas os arquivos cujo propósito único é avaliação
  (`pages/student-eval/`, `services/evaluations.service.ts`, `models/avaliacao.model.ts`,
  `components/evolution-chart/`, `Controllers/EvaluationsController.cs`, `DTOs/EvaluationDtos.cs`,
  `Models/Avaliacao.cs`). Nos arquivos compartilhados (rotas, estado, students, dashboard,
  home, StudentsController), remover cirurgicamente apenas as referências à avaliação.
- **Rationale**: Preserva sem regressão as features 002/007/008/017/019/020 que coabitam
  esses arquivos.
- **Alternatives considered**: "Comentar/ocultar em vez de apagar" — rejeitado por deixar
  dívida técnica e contrariar "tudo referente a avaliação deve ser removido".

## Decisão 2 — Chart.js permanece como dependência

- **Decision**: Manter Chart.js no projeto; remover apenas o componente `evolution-chart`.
- **Rationale**: `dashboard.component.ts` usa Chart.js diretamente para o gráfico de
  minutagem em jogos (série `minutagemSeries`), independente do gráfico de evolução. Grep
  confirmou dois consumidores de Chart.js: `evolution-chart` (removido) e `dashboard`
  (permanece). Logo o pacote continua necessário; o orçamento de bundle em `angular.json`
  não precisa mudar.
- **Alternatives considered**: Remover Chart.js e o ajuste de budget — rejeitado, quebraria
  o gráfico de minutagem do dashboard.

## Decisão 3 — Rota antiga `/student-eval` e links órfãos

- **Decision**: Remover a rota `student-eval` de `app.routes.ts`. Como as rotas existentes
  não têm rota curinga (`**`) de fallback, e o único ponto que navegava para `/student-eval`
  era o botão "Avaliar" (também removido), não há link interno remanescente. Acesso manual à
  URL antiga cairá no comportamento padrão do Angular Router para rota inexistente.
- **Rationale**: Sem navegação interna sobrando, um redirect dedicado é opcional. Para
  atender ao edge case do spec (não exibir erro ao usuário), adicionar uma rota curinga
  `{ path: '**', redirectTo: '' }` é uma melhoria barata e segura.
- **Alternatives considered**: Manter a rota redirecionando para `/students` — rejeitado por
  reintroduzir o nome "student-eval"; o curinga genérico cobre qualquer URL inválida.
- **Ação recomendada**: incluir `{ path: '**', redirectTo: '' }` ao final de `routes` (cobre
  o edge case de forma genérica, não só a avaliação).

## Decisão 4 — Dados da coleção `evaluations` no MongoDB

- **Decision**: Remover toda referência de código à coleção `evaluations` (no
  `StudentsController` e no `EvaluationsController` deletado). Não há migração automática de
  drop no código; os dados históricos ficam órfãos e podem ser descartados manualmente
  (`db.evaluations.drop()`), sem impacto no sistema.
- **Rationale**: O spec assume que dados históricos podem ser descartados (sem requisito de
  retenção/exportação). Como não há mais leitura/escrita da coleção, ela é inerte.
- **Alternatives considered**: Script automático de drop no startup — rejeitado por ser
  destrutivo e desnecessário; um comando manual documentado no quickstart basta.

## Decisão 5 — `sessionStorage`/`ImperialState` perde `avaliacoes`

- **Decision**: Remover o campo `avaliacoes` de `ImperialState`, de `criarEstadoVazio()` e
  a leitura tolerante em `state.service.ts`. Estados antigos em `sessionStorage` que ainda
  contenham `avaliacoes` são simplesmente ignorados (campo deixa de ser lido).
- **Rationale**: `strict: true` no TS exige que todas as referências ao campo sumam juntas;
  ignorar chaves extras no JSON persistido é inofensivo.
- **Alternatives considered**: Manter o campo "por compatibilidade" — rejeitado; contraria a
  remoção total e mantém tipo/import órfãos.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Sobrar import/tipo `Avaliacao` causando erro de build TS | Rodar `ng build`/`tsc` como gate final; grep por `Avaliacao`/`avaliac` no `src/app` deve retornar 0 em código. |
| Quebrar exclusão de aluno ao remover a cascata no backend | Editar `StudentsController` removendo `_avaliacoes` e o `DeleteManyAsync`; validar exclusão no quickstart. |
| Remover seção do dashboard e deixar layout quebrado | Remover o bloco HTML inteiro da seção de evolução (container + `<app-evolution-chart>`), não só o componente. |
| Texto residual "avaliações" na home/confirm | Revisar `home.component.html` e o `window.confirm` de exclusão de aluno. |
