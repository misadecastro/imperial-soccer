# Tasks: Especificações do Treino

**Input**: Design documents from `/specs/009-training-drill-specs/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Não solicitados — validação por inspeção visual manual e fluxo funcional (ver quickstart.md).

**Organization**: Tarefas agrupadas por user story para implementação incremental e testável.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos distintos, sem dependências)
- **[Story]**: User story correspondente da spec.md

## Path Conventions

```text
src/frontend/
├── index.html
├── css/
│   └── imperial.css              ← sem alteração
└── pages/
    ├── students.html             ← sem alteração
    ├── student-eval.html         ← sem alteração
    ├── training.html             ← MODIFICADA (único arquivo afetado)
    ├── games.html                ← sem alteração
    └── login.html                ← sem alteração
```

---

## Phase 1: Setup (Constantes e Estado)

**Purpose**: Adicionar as constantes de domínio (momentos e princípios/fundamentos) e estender as funções de estado para suportar os novos campos.

- [ ] T001 Adicionar constante `MOMENTOS` em `src/frontend/pages/training.html` — array de 4 objetos `{ id, label, desc }`: `org_ofensiva` ("Org. Ofensiva", "Equipe com a posse, construindo jogadas"), `org_defensiva` ("Org. Defensiva", "Equipe sem a posse, organizada para defender"), `trans_ofensiva` ("Trans. Ofensiva", "Momento da recuperação da posse de bola"), `trans_defensiva` ("Trans. Defensiva", "Momento da perda da posse de bola"); posicionar logo após as constantes `CATEGORIAS_LABELS` e `AVATAR_COLORS` existentes
- [ ] T002 Adicionar constante `PRINCIPIOS_GRUPOS` em `src/frontend/pages/training.html` — array de 3 grupos, cada um com `titulo` (string) e `itens` (array de `{id, label}`): grupo 1 "Princípios Táticos Defensivos" com 5 itens (`contencao`, `cobertura_defensiva`, `unidade_defensiva`, `concentracao`, `equilibrio`); grupo 2 "Princípios Táticos Ofensivos" com 6 itens (`espaco_sem_bola`, `espaco_com_bola`, `cobertura_ofensiva`, `unidade_ofensiva`, `penetracao`, `mobilidade`); grupo 3 "Fundamentos Técnicos" com 7 itens (`controle_chao`, `controle_alto`, `drible`, `passe`, `dominio`, `finalizacao`, `cabeceio`); posicionar logo após `MOMENTOS`
- [ ] T003 Estender função `getOrCreateChamada(data, categoria)` em `src/frontend/pages/training.html` — ao criar nova chamada via `criarChamada()`, adicionar campos `momentos: []` e `principiosFundamentos: []` ao objeto retornado; na `findChamada()`, quando o objeto existente não possuir esses campos, inicializá-los como `[]` (backward-compatible)
- [ ] T004 Declarar variáveis de estado da UI para especificações em `src/frontend/pages/training.html` — `let momentosSelecionados = []` (IDs dos momentos ativos) e `let principiosSelecionados = []` (IDs dos princípios/fundamentos ativos); posicionar logo após `let chamadaAtual = null` e `let categoriaAtiva = null`

**Checkpoint**: Constantes e estado prontos — user stories podem iniciar.

---

## Phase 2: User Story 2 — Chamada em Seção Recolhível (Priority: P1) 🎯

**Goal**: Reorganizar a chamada existente dentro de um accordion para liberar espaço visual para as especificações.

**Independent Test**: Abrir tela de Treino com data e categoria selecionadas → chamada aparece em accordion expandido → clicar no header para recolher → lista de alunos e controles desaparecem → clicar novamente → expandem com dados preservados.

### Implementation for User Story 2

- [ ] T005 [US2] Criar container collapsible para a chamada em `src/frontend/pages/training.html` — envolver os elementos existentes (`#controlesGlobais`, `#painelResumo`, `#listaAlunos`) em um novo `<div id="chamadaContainer" class="mx-4 mt-3">` com: header clicável `<div id="chamadaHeader" class="bg-imperial-card rounded-t-xl border border-imperial-border px-4 py-3 flex items-center justify-between cursor-pointer select-none">` contendo `<div class="flex items-center gap-2"><span class="text-sm font-semibold text-imperial-text">Chamada</span><span id="chamadaResumo" class="text-xs text-imperial-text-muted"></span></div>` e `<svg id="chamadaChevron" class="w-4 h-4 text-imperial-text-muted transition-transform duration-200" ...>` (chevron down); conteúdo em `<div id="chamadaConteudo">` que envolve os controles globais, painel de resumo e lista de alunos; remover as classes `mx-4 mt-3` dos elementos filhos agora que estão dentro do container; atualizar classes do painel de resumo e lista de alunos para remover `mx-4` redundante e ajustar bordas (rounded-b-xl no container quando expandido, sem rounded-t nos filhos)
- [ ] T006 [US2] Implementar função `toggleChamada()` em `src/frontend/pages/training.html` — alterna visibilidade de `#chamadaConteudo` com `classList.toggle('hidden')`; rotaciona o chevron: quando recolhido `chamadaChevron.classList.add('rotate-180')`, quando expandido `chamadaChevron.classList.remove('rotate-180')`; atualizar `#chamadaResumo` com resumo inline quando recolhido (ex.: "5 presentes · 2 faltas") usando contadores de `chamadaAtual`
- [ ] T007 [US2] Ligar evento de click em `#chamadaHeader` em `src/frontend/pages/training.html` — `document.getElementById('chamadaHeader').addEventListener('click', toggleChamada)`; garantir que ao boot a chamada inicia expandida (estado padrão)
- [ ] T008 [US2] Atualizar `renderChamada()` em `src/frontend/pages/training.html` — após `renderLista(chamadaAtual)`, atualizar o texto de `#chamadaResumo` com o resumo de presentes/faltas da chamada atual (visível quando recolhido); exibir `#chamadaContainer` quando há categoria ativa; ocultar quando não há

**Checkpoint**: Chamada recolhível funcional — accordion expande/recolhe com 1 toque, dados preservados. US2 entregável.

---

## Phase 3: User Story 1 — Registrar Especificações do Treino (Priority: P1) 🎯 MVP

**Goal**: O professor seleciona momentos do jogo e princípios/fundamentos trabalhados, e salva junto com a chamada.

**Independent Test**: Selecionar data e categoria, selecionar "Org. Ofensiva" como momento, marcar "Contenção" e "Passe" como princípios, clicar "Salvar Treino" → toast sucesso → trocar de categoria e voltar → seleções restauradas.

### Implementation for User Story 1

- [ ] T009 [US1] Criar seção HTML "Especificações do Treino" em `src/frontend/pages/training.html` — após o `#chamadaContainer` e antes da `</main>`, inserir `<section id="secaoEspecificacoes" class="hidden mx-4 mt-4 space-y-4">` com: subsection "Momento do Jogo" contendo `<div class="bg-imperial-card rounded-xl border border-imperial-border p-4"><h3 class="text-sm font-semibold text-imperial-text mb-3">Momento do jogo</h3><div id="gridMomentos" class="grid grid-cols-2 gap-2"></div></div>` e subsection "Princípios e fundamentos" contendo `<div class="bg-imperial-card rounded-xl border border-imperial-border p-4"><div class="flex items-center justify-between mb-3"><h3 class="text-sm font-semibold text-imperial-text">Princípios e fundamentos trabalhados</h3><span id="contadorPrincipios" class="text-xs text-imperial-green font-medium">0 selecionado(s)</span></div><div id="listaPrincipios" class="space-y-4"></div></div></section>`
- [ ] T010 [US1] Adicionar ícones SVG inline para os 4 momentos em `src/frontend/pages/training.html` — definir objeto `MOMENTOS_ICONS` com SVGs inline para cada momento: `org_ofensiva` (ícone de setas cruzadas/tática ofensiva, `w-5 h-5`), `org_defensiva` (ícone de escudo, `w-5 h-5`), `trans_ofensiva` (ícone de setas para frente, `w-5 h-5`), `trans_defensiva` (ícone de setas para trás, `w-5 h-5`); posicionar como constante junto com MOMENTOS
- [ ] T011 [US1] Implementar `renderMomentos()` em `src/frontend/pages/training.html` — limpa `#gridMomentos`; para cada item de `MOMENTOS` gera card `<button type="button" class="momento-card text-left rounded-xl border p-3 transition-all ${selecionado ? 'border-imperial-green bg-imperial-green-light' : 'border-imperial-border bg-imperial-card'}" data-momento-id="${m.id}">` com: `<div class="flex items-center gap-2 mb-1">${MOMENTOS_ICONS[m.id]}<span class="text-sm font-semibold">${m.label}</span></div><div class="text-xs text-imperial-text-muted">${m.desc}</div></button>`; verifica seleção via `momentosSelecionados.includes(m.id)`; adiciona listeners nos cards para toggle: se presente em `momentosSelecionados` remove, senão adiciona; após toggle chama `renderMomentos()` para atualizar visual
- [ ] T012 [US1] Implementar `renderPrincipios()` em `src/frontend/pages/training.html` — limpa `#listaPrincipios`; para cada grupo de `PRINCIPIOS_GRUPOS` gera `<div><h4 class="text-xs font-bold text-imperial-text-muted uppercase tracking-wide mb-2">${grupo.titulo}</h4><div class="flex flex-wrap gap-2">` com chips para cada item: `<button type="button" class="principio-chip px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${selecionado ? 'border-imperial-green bg-imperial-green-light text-imperial-green' : 'border-imperial-border bg-imperial-bg text-imperial-text-muted'}" data-principio-id="${item.id}">${item.label}</button>`; verifica seleção via `principiosSelecionados.includes(item.id)`; adiciona listeners nos chips para toggle: se presente remove, senão adiciona; após toggle chama `renderPrincipios()` para atualizar visual; atualiza `#contadorPrincipios` com `${principiosSelecionados.length} selecionado(s)`
- [ ] T013 [US1] Implementar `renderEspecificacoes()` em `src/frontend/pages/training.html` — mostra `#secaoEspecificacoes`; sincroniza `momentosSelecionados` e `principiosSelecionados` com os dados de `chamadaAtual` (`chamadaAtual.momentos || []` e `chamadaAtual.principiosFundamentos || []`); chama `renderMomentos()` e `renderPrincipios()`
- [ ] T014 [US1] Integrar `renderEspecificacoes()` no fluxo de `renderChamada()` em `src/frontend/pages/training.html` — ao final de `renderChamada()`, após `renderHistorico(categoriaAtiva, data)`, chamar `renderEspecificacoes()`; em `ocultarConteudo()`, ocultar `#secaoEspecificacoes` e resetar `momentosSelecionados = []` e `principiosSelecionados = []`
- [ ] T015 [US1] Atualizar fluxo de salvar em `src/frontend/pages/training.html` — no handler de `#btnSalvar`: antes de chamar `salvarChamada(chamadaAtual)`, copiar `chamadaAtual.momentos = [...momentosSelecionados]` e `chamadaAtual.principiosFundamentos = [...principiosSelecionados]`
- [ ] T016 [US1] Alterar texto do botão de salvar em `src/frontend/pages/training.html` — no HTML, mudar o texto de `#btnSalvar` de "Salvar Presença" para "Salvar Treino"; atualizar também a mensagem do toast em `salvarChamada()` de "Presença salva com sucesso!" para "Treino salvo com sucesso!"

**Checkpoint**: Especificações completas funcional — momentos + princípios/fundamentos selecionáveis, persistidos com a chamada, restaurados ao recarregar. US1 + US2 = MVP entregável.

---

## Phase 4: User Story 3 — Desmarcar Seleções (Priority: P2)

**Goal**: Professor pode desmarcar momentos e princípios/fundamentos previamente selecionados com um toque.

**Independent Test**: Selecionar "Org. Ofensiva" e "Contenção", depois tocar novamente em cada → ambos voltam ao estado visual neutro, contador decrementado.

### Implementation for User Story 3

- [ ] T017 [US3] Verificar e ajustar toggle-off de momentos em `src/frontend/pages/training.html` — confirmar que em `renderMomentos()` o listener de click em `.momento-card` remove o ID de `momentosSelecionados` quando já presente (toggle off); verificar que o card volta ao visual neutro (`border-imperial-border bg-imperial-card`); se já implementado em T011, marcar como verificação
- [ ] T018 [US3] Verificar e ajustar toggle-off de princípios/fundamentos em `src/frontend/pages/training.html` — confirmar que em `renderPrincipios()` o listener de click em `.principio-chip` remove o ID de `principiosSelecionados` quando já presente (toggle off); verificar que o chip volta ao visual neutro; verificar que `#contadorPrincipios` decrementa corretamente; se já implementado em T012, marcar como verificação

**Checkpoint**: Toggle on/off funcional em todos os elementos selecionáveis. US3 completa.

---

## Phase 5: Polish & Cross-Cutting

**Purpose**: Validações, responsividade, edge cases e fluxo completo.

- [ ] T019 Garantir que a seção de especificações é acessível mesmo sem alunos na categoria em `src/frontend/pages/training.html` — em `renderChamada()`, mesmo quando `chamadaAtual.registros.length === 0` (nenhum aluno na categoria), `#secaoEspecificacoes` deve ser visível e funcional; o `#containerSalvar` deve ser visível quando há especificações OU registros (ajustar lógica de `renderLista` se necessário)
- [ ] T020 Garantir que trocar de categoria reseta especificações para a nova chamada em `src/frontend/pages/training.html` — ao clicar em outra aba de categoria, `renderChamada()` deve carregar os dados de especificações da nova combinação data+categoria; `momentosSelecionados` e `principiosSelecionados` devem ser reinicializados a partir de `chamadaAtual.momentos` e `chamadaAtual.principiosFundamentos`
- [ ] T021 Validar responsividade de `src/frontend/pages/training.html` em 375 px no DevTools — confirmar: grid 2×2 de momentos sem overflow horizontal; chips de princípios/fundamentos fazem wrap corretamente; accordion header e conteúdo usáveis; botão "Salvar Treino" acessível acima da barra de navegação
- [ ] T022 Executar fluxo completo de validação conforme `specs/009-training-drill-specs/quickstart.md` — 18 passos: data e categoria → accordion expande/recolhe → selecionar momentos → selecionar princípios → salvar treino → restaurar seleções → zero regressões na chamada de presença existente

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — iniciar imediatamente (T001–T004)
- **US2 (Phase 2)**: Depende de T001–T004 — reestruturação HTML da chamada (T005–T008)
- **US1 (Phase 3)**: Depende de US2 (seção de especificações posicionada após o accordion) — T009–T016
- **US3 (Phase 4)**: Depende de US1 (toggle é construído no US1, US3 verifica/ajusta) — T017–T018
- **Polish (Phase 5)**: Depende de todas as user stories — T019–T022

### User Story Dependencies

- **US2 (P1)**: Depende somente de Setup — pode ser implementada primeiro
- **US1 (P1)**: Depende de US2 (precisa do accordion criado para posicionar especificações abaixo)
- **US3 (P2)**: Depende de US1 (verifica toggle construído em US1)

### Within Each User Story

- HTML structure antes de render functions
- Render functions antes de event listeners
- Event listeners antes de integração com fluxo existente

### Notas sobre Paralelismo

Todas as tarefas afetam o mesmo arquivo (`training.html`), portanto **não há oportunidade de paralelismo real entre tarefas**. A execução é necessariamente sequencial. Entretanto, dentro de cada fase, as tarefas seguem ordem lógica de dependência.

---

## Implementation Strategy

### MVP First (US2 + US1)

1. Concluir Phase 1: Setup (T001–T004)
2. Concluir Phase 2: US2 — Chamada Recolhível (T005–T008)
3. Concluir Phase 3: US1 — Especificações do Treino (T009–T016)
4. **PARAR e VALIDAR**: Professor vê accordion + momentos + princípios, salva e restaura ✓
5. MVP entregável: especificações de treino registráveis

### Incremental Delivery

1. Setup → constantes e estado prontos
2. US2 → chamada em accordion funcional → **Demo visual**
3. US1 → momentos + princípios + salvamento → **Demo MVP**
4. US3 → toggle off verificado → **Demo completa**
5. Polish → responsividade e edge cases → **Entrega final**

---

## Notes

- **Único arquivo modificado**: `src/frontend/pages/training.html` — todas as alterações são neste arquivo
- Backward-compatible: chamadas existentes sem `momentos`/`principiosFundamentos` funcionam normalmente (inicializados como `[]`)
- O `tailwind.config` já existe em `training.html` com os tokens de cor necessários
- Em caso de dúvida sobre o visual esperado, consultar `Design/prototipo.png` como referência
- Ícones SVG dos momentos devem ser simples e inline (sem dependências externas)
- Commitar após cada phase concluída
