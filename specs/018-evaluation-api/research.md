# Research: Avaliações com Persistência Real

**Branch**: `018-evaluation-api` | **Date**: 2026-07-12

## Decisões

### 1. Carregamento lazy por alunoId (não global)

**Decision**: `GET /api/v1/evaluations?alunoId={id}` carrega avaliações sob demanda por aluno, não todas de uma vez. Populado em `stateService.state.avaliacoes` quando `StudentEvalComponent` inicializa.

**Rationale**: Uma escola pode ter 200+ alunos × 10+ avaliações = 2.000+ registros. Carregar tudo upfront é desnecessário para a escala atual e viola Princípio I (complexidade sem necessidade real). Os chips de avaliação na lista de alunos mostrando "—" é uma regressão de UX aceitável nesta versão — o histórico detalhado só importa ao abrir a tela de avaliação específica.

**Alternatives considered**: Carregar todas as avaliações junto com os alunos em `StudentsService.listar()` — rejeitado: payload excessivo e acoplamento desnecessário entre as duas entidades.

---

### 2. Estado de cache via `stateService.state.avaliacoes`

**Decision**: Mesma estratégia da feature 017 — `EvaluationsService` usa `stateService.state.avaliacoes` como cache em memória, substituído/atualizado a cada operação. Não chama `stateService.save()` para avaliações.

**Rationale**: DashboardComponent e outros consumidores leem `state.avaliacoes` sem mudança. A estratégia garante compatibilidade com toda a base de código existente sem refatoração adicional.

---

### 3. Validação de notas no backend: lista fixa {2, 3, 4, 5}

**Decision**: `EvaluationsController` valida que `Tatico`, `Tecnico` e `Mental` são exatamente um dos valores `{2, 3, 4, 5}` (inteiros).

**Rationale**: Esses são os únicos valores semanticamente válidos do sistema (FR-006). Qualquer outro inteiro ou decimal seria inválido. A validação backend garante integridade dos dados independentemente do frontend.

---

### 4. Cascata na exclusão de aluno via `StudentsController` modificado

**Decision**: O método `Delete` do `StudentsController` (feature 017) é extendido para também excluir todas as avaliações do aluno via `IMongoCollection<Avaliacao>` injetado.

**Rationale**: Garante FR-013 sem criar um endpoint separado. A cascata é uma responsabilidade natural do backend ao excluir uma entidade pai. A alternativa (limpeza client-side via sessionStorage) já não é suficiente agora que avaliações estão no backend.

---

### 5. Sem paginação server-side (client-side)

**Decision**: `GET /api/v1/evaluations?alunoId=xxx` retorna TODAS as avaliações do aluno; paginação (10/página) e ordenação (data desc) são feitas client-side no `StudentEvalComponent`, igual ao comportamento atual.

**Rationale**: Para um único aluno, o número de avaliações é raramente superior a 50-100 registros — paginação server-side seria sobrengenharada para essa escala (Princípio I). A lógica de paginação existente no componente permanece inalterada.

---

### 6. Sem testes automatizados (validação manual)

**Decision**: Consistente com features 016/017 — validação via curl e browser.

---

### 7. `StudentEvalComponent` recebe `alunoId` via query param na URL

**Decision**: Sem mudança no mecanismo de navegação — `StudentsComponent.avaliar(alunoId)` continua navegando para `/student-eval?alunoId=xxx`. O `EvaluationsService.listarPorAluno(alunoId)` é chamado no `ngOnInit` com esse `alunoId`.

**Rationale**: A URL query param já existe (feature 015) — reutilizar sem mudança é o caminho mais simples.
