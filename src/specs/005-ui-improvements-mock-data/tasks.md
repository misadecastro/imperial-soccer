# Tasks: Melhorias de UI, Dados Mocados e Fluxo de Acesso

**Input**: Design documents from `/specs/005-ui-improvements-mock-data/`  
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação manual via `quickstart.md`.

**Organization**: Tarefas agrupadas por user story. Todas as stories são independentes entre si — podem ser implementadas em qualquer ordem após o Setup.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivo diferente ou sem dependências)
- **[Story]**: US1–US5 conforme spec.md
- Caminhos relativos à raiz do repositório: `frontend/pages/`

---

## Phase 1: Setup

**Purpose**: Nenhuma infraestrutura nova é necessária — todos os arquivos já existem. Esta fase valida o ponto de partida.

- [x] T001 Verificar que `frontend/pages/login.html`, `frontend/pages/students.html` e `frontend/pages/student-eval.html` existem e carregam sem erros no browser antes de iniciar as modificações

**Checkpoint**: Três páginas abrem sem erros de console.

---

## Phase 2: Foundational (Pré-requisitos Bloqueantes)

**Purpose**: Não há dependências técnicas cross-story. Cada US pode começar imediatamente após Phase 1. Esta phase é declarada vazia por design.

> Todas as US são independentes — podem ser implementadas em paralelo após T001.

---

## Phase 3: User Story 1 — Painel de Nova Avaliação Ocultável (Priority: P1) 🎯 MVP

**Goal**: Formulário de nova avaliação oculto por padrão; exibido apenas ao clicar em "Nova Avaliação"; ocultado após salvar ou cancelar.

**Independent Test**: Abrir `student-eval.html?alunoId=<qualquer>` e confirmar que o formulário está oculto. Clicar em "Nova Avaliação" → aparece. Cancelar → oculta. Salvar avaliação válida → oculta.

### Implementation for User Story 1

- [x] T002 [US1] Em `frontend/pages/student-eval.html`: adicionar classe `hidden` à `<section aria-labelledby="tituloNovaAvaliacao">` para ocultá-la por padrão no carregamento da página
- [x] T003 [US1] Em `frontend/pages/student-eval.html`: adicionar botão `<button id="btnNovaAvaliacao">Nova Avaliação</button>` na seção de cabeçalho do aluno (após `<p id="subtituloAluno">`), com estilo verde imperial consistente com o botão "Novo Aluno" de `students.html`
- [x] T004 [US1] Em `frontend/pages/student-eval.html`: no `<script type="module">`, adicionar listener no `btnNovaAvaliacao` que remove a classe `hidden` da seção do formulário e define foco no campo `inputDataAvaliacao`
- [x] T005 [US1] Em `frontend/pages/student-eval.html`: modificar o handler de submit do `formNovaAvaliacao` para, após o `showToast` e reset do formulário, re-adicionar a classe `hidden` à seção do formulário
- [x] T006 [US1] Em `frontend/pages/student-eval.html`: no campo `id="btnCancelarAvaliacao"` (botão Cancelar do formulário), adicionar comportamento de ocultar a seção do formulário via classe `hidden` ao ser clicado (atualmente o botão não existe no formulário — criar botão "Cancelar" ao lado do botão "Salvar Avaliação")

**Checkpoint**: US1 completamente funcional — formulário não aparece no carregamento; aparece ao clicar "Nova Avaliação"; desaparece ao salvar ou cancelar.

---

## Phase 4: User Story 2 — Lista Ordenada por Mais Recente com Paginação (Priority: P2)

**Goal**: Avaliações exibidas da mais recente para a mais antiga, 10 por página, com controles de navegação.

**Independent Test**: Com aluno que tem 15+ avaliações, confirmar: 1ª página mostra as 10 mais recentes no topo; navegar para a 2ª página mostra as restantes; botão "Anterior" desabilitado na 1ª página; botão "Próxima" desabilitado na última.

### Implementation for User Story 2

- [x] T007 [US2] Em `frontend/pages/student-eval.html`: modificar `getAvaliacoesDoAluno(alunoId)` para ordenar por `data` DESC em vez de ASC (trocar `a.data.localeCompare(b.data)` por `b.data.localeCompare(a.data)`)
- [x] T008 [US2] Em `frontend/pages/student-eval.html`: declarar variável `let paginaAtual = 0` no escopo do módulo (junto com `chartInstance`)
- [x] T009 [US2] Em `frontend/pages/student-eval.html`: modificar `renderListaAvaliacoes()` para: calcular `totalPaginas = Math.ceil(avaliacoes.length / 10)`, fatiar `const pagina = avaliacoes.slice(paginaAtual * 10, (paginaAtual + 1) * 10)` e renderizar apenas os itens de `pagina` (em vez de todos)
- [x] T010 [US2] Em `frontend/pages/student-eval.html`: adicionar elemento `<div id="controlesPaginacao" class="flex items-center justify-between mt-4"></div>` após `<div id="listaAvaliacoes">` no HTML, e em `renderListaAvaliacoes()` preencher este div com: botão "← Anterior" (desabilitado se `paginaAtual === 0`), texto "Página X de Y", botão "Próxima →" (desabilitado se `paginaAtual === totalPaginas - 1`); ocultar o div inteiro se `totalPaginas <= 1`
- [x] T011 [US2] Em `frontend/pages/student-eval.html`: adicionar listeners nos botões de paginação: "Anterior" decrementa `paginaAtual` e chama `renderListaAvaliacoes()`; "Próxima" incrementa `paginaAtual` e chama `renderListaAvaliacoes()`
- [x] T012 [US2] Em `frontend/pages/student-eval.html`: no submit handler de nova avaliação (T005), no `salvarEdicao()` e em `excluirAvaliacao()`, adicionar `paginaAtual = 0` antes de chamar `renderListaAvaliacoes()` para retornar à 1ª página após qualquer mutação

**Checkpoint**: US2 completamente funcional — ordenação invertida, paginação navegável, reset ao mutar dados.

---

## Phase 5: User Story 3 — Botão Voltar no Final da Lista (Priority: P3)

**Goal**: Botão "Voltar" visível abaixo dos controles de paginação, com mesmo comportamento do botão do header.

**Independent Test**: Com lista paginada visível, rolar até o final da página e confirmar que um botão "Voltar" está presente. Clicar e confirmar retorno para `students.html` com estado preservado.

### Implementation for User Story 3

- [x] T013 [P] [US3] Em `frontend/pages/student-eval.html`: adicionar elemento HTML `<div class="mt-6 flex justify-start"><button type="button" id="btnVoltarRodape" class="inline-flex items-center gap-1 text-sm font-medium text-imperial-green-light hover:text-white transition-colors">← Voltar para Alunos</button></div>` após `<div id="controlesPaginacao">` no HTML
- [x] T014 [P] [US3] Em `frontend/pages/student-eval.html`: no `<script type="module">`, adicionar listener no `btnVoltarRodape` com o mesmo comportamento do `btnVoltar`: `saveState(); window.location.href = 'students.html'`

**Checkpoint**: US3 completamente funcional — botão presente no rodapé, navega para `students.html` preservando estado.

---

## Phase 6: User Story 4 — Dados Mocados de Alunos e Avaliações (Priority: P4)

**Goal**: ~40 alunos com avaliações entre jan/2025 e abr/2026 carregados automaticamente quando não há dados na sessão.

**Independent Test**: Abrir `students.html` em aba anônima → ~40 alunos listados. Acessar avaliação de qualquer aluno → múltiplas avaliações com datas no intervalo. Recarregar a página → dados persistem. Abrir nova aba anônima → dados gerados novamente mas não duplicados.

### Implementation for User Story 4

- [x] T015 [US4] Em `frontend/pages/students.html`: implementar função `gerarNomeAleatorio()` usando arrays de ~20 primeiros nomes masculinos e femininos brasileiros (ex: Lucas, Gabriel, Pedro, Ana, Beatriz, Julia...) e ~15 sobrenomes (ex: Silva, Santos, Oliveira, Souza, Lima...) — retorna combinação aleatória
- [x] T016 [US4] Em `frontend/pages/students.html`: implementar função `gerarDataAleatoria(inicio, fim)` que recebe duas strings `YYYY-MM-DD` e retorna uma data aleatória no intervalo como string `YYYY-MM-DD`
- [x] T017 [US4] Em `frontend/pages/students.html`: implementar função `gerarMockData()` que cria 40 objetos `Aluno` com `generateId()`, nome via `gerarNomeAleatorio()`, `dataNascimento` entre 2010 e 2018, categoria distribuída ciclicamente entre as 6 categorias, e para cada aluno entre 5 e 15 avaliações com `gerarDataAleatoria('2025-01-01', '2026-04-04')` sem repetição de datas por aluno, e pontuações aleatórias inteiras entre 2 e 5 para `tatico`, `tecnico` e `mental` — retorna `{ alunos, avaliacoes }`
- [x] T018 [US4] Em `frontend/pages/students.html`: na função de boot (após `initCategoriaDropdowns()`), adicionar: `if (state.alunos.length === 0) { const mock = gerarMockData(); state.alunos.push(...mock.alunos); state.avaliacoes.push(...mock.avaliacoes); saveState(); }` antes de `renderAlunos()`

**Checkpoint**: US4 completamente funcional — dados mocados carregados na 1ª visita; persistidos na sessão; não duplicados ao recarregar.

---

## Phase 7: User Story 5 — Fluxo de Login → students.html (Priority: P5)

**Goal**: Clicar em "Entrar" na tela de login redireciona para `students.html`.

**Independent Test**: Abrir `login.html`, clicar em "Entrar" (campos vazios ou preenchidos) → confirmar redirecionamento para `students.html`.

### Implementation for User Story 5

- [x] T019 [P] [US5] Em `frontend/pages/login.html`: adicionar `<script>` antes do `</body>` que intercepta o submit do formulário: `document.querySelector('form').addEventListener('submit', function(e) { e.preventDefault(); window.location.href = 'students.html'; })`

**Checkpoint**: US5 completamente funcional — clicar "Entrar" navega para `students.html`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Ajustes visuais e validação final.

- [x] T020 Em `frontend/pages/student-eval.html`: garantir que o botão "Nova Avaliação" (T003) fica desabilitado/oculto enquanto o formulário já está visível (evitar duplo-clique que não faz nada visível)
- [ ] T021 Validação manual completa seguindo `specs/005-ui-improvements-mock-data/quickstart.md` — percorrer todos os 5 cenários de teste

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Sem dependências
- **Phase 2 (Foundational)**: N/A — sem pré-requisitos cross-story
- **US1–US5 (Phases 3–7)**: Todas independentes entre si; podem iniciar após T001
- **Polish (Phase 8)**: Após todas as US

### User Story Dependencies

Todas as stories são **completamente independentes**:

- **US1**: Apenas `student-eval.html`
- **US2**: Apenas `student-eval.html` (sem conflito com US1 se feitas sequencialmente)
- **US3**: Apenas `student-eval.html` (sem conflito com US1/US2 se feitas sequencialmente)
- **US4**: Apenas `students.html`
- **US5**: Apenas `login.html`

### Parallel Opportunities

- **US4 (T015–T018)** e **US5 (T019)** podem ser feitas em paralelo (arquivos diferentes)
- **US1, US2, US3** tocam o mesmo arquivo (`student-eval.html`) — implementar sequencialmente na mesma sessão de edição

---

## Parallel Example

```
# Paralelizável (arquivos diferentes):
Tarefa A: US4 — students.html (mock data)
Tarefa B: US5 — login.html (fluxo de acesso)

# Sequencial (mesmo arquivo):
US1 → US2 → US3 (todas em student-eval.html)
```

---

## Implementation Strategy

### MVP First (US1 apenas)

1. T001 (verificar páginas)
2. T002–T006 (toggle formulário)
3. **VALIDAR**: Formulário oculto por padrão, abre e fecha corretamente
4. Demo

### Incremental Delivery

1. US1 → formulário ocultável (**MVP visual imediato**)
2. US5 → fluxo de login funcional (arquivo diferente, rápido)
3. US4 → dados mocados (enriquece demonstração)
4. US2 → paginação + ordenação (necessita dados mocados para testar com >10 registros)
5. US3 → botão Voltar no rodapé

### Ordem Recomendada de Implementação

```
T001 → T019 (US5, login) → T015–T018 (US4, mock data) →
T002–T006 (US1, toggle) → T007–T012 (US2, paginação) →
T013–T014 (US3, botão voltar) → T020–T021 (polish)
```

---

## Notes

- `[P]` = diferentes arquivos, sem dependências — podem ser feitas em paralelo
- US1, US2 e US3 editam `student-eval.html`; fazer na mesma sessão evita conflitos
- `paginaAtual` deve ser resetado para `0` em **toda** mutação de avaliação (add/edit/delete)
- Dados mocados: usar `state.alunos.length === 0` como guarda — nunca sobrescrever dados existentes
- O botão "Cancelar" (T006) precisa ser criado no HTML do formulário — atualmente não existe em `student-eval.html`
