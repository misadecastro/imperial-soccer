# Phase 0 Research — Dashboard do Aluno (012)

**Branch**: `012-student-dashboard`
**Date**: 2026-05-03
**Spec**: [spec.md](spec.md)

## Objetivo

Resolver dúvidas técnicas e de UX antes do design da Fase 1, com base em (a) requisitos da spec, (b) Clarifications 2026-05-03, (c) padrões já estabelecidos pelas features 002–011.

## R1 — Estrutura da página: única ou duas?

**Decision**: Página única `dashboard.html` com toggle de abas Treinos/Alunos via `display:none`. Substitui `dashboard-treinos.html`.

**Rationale**:
- FR-015 exige toggle "sem reload da página". Duas páginas com `<a>` cross-linking ou JS-driven `location.href` sempre causam reload.
- FR-015a exige seleção independente por aba na mesma sessão. Variáveis de módulo numa única página resolvem isso de forma natural; com duas páginas seria preciso persistir estado UI em sessionStorage (chaves novas, complexidade) ou aceitar que cada navegação reseta o outro lado (viola FR-015a).
- O conteúdo migrado da feature 011 é cópia 1:1 do markup e script — risco de regressão baixo se preservarmos IDs, classes, listeners e funções.
- A página resultante (`dashboard.html`) tem ~1100–1300 linhas, dentro do mesmo padrão de `games.html` e `student-eval.html`.

**Alternatives considered**:
- **Duas páginas, cross-linking via `<a>`**: rejeitada — viola FR-015 e FR-015a (sem trabalho extra de persistência).
- **Iframe entre as duas páginas**: rejeitada — overhead, problemas de roteamento, padrão alheio ao codebase.
- **Refatorar para SPA com router (hashchange)**: rejeitada — viola Princípio I (Simplicidade); o codebase é multi-page intencionalmente.

## R2 — Toggle UI: pill, tab clássica ou outro?

**Decision**: Dois botões pill horizontais no topo da `<main>`, com `aria-pressed="true"` no ativo. Estilo idêntico ao seletor de categoria atual (`bg-imperial-green text-white` para ativo, `bg-imperial-card` para inativo).

**Rationale**:
- Reuso do mesmo padrão visual do seletor de categoria de Treinos minimiza decisões de design e CSS adicional.
- `aria-pressed` é a convenção correta para botões de alternância (toggle), reutilizando o padrão da feature 011.
- Pill em wrapper `flex gap-2` reorganiza naturalmente em mobile sem custo.

**Alternatives considered**:
- **Tabs com underline (Material)**: requer CSS adicional e quebra a consistência visual com o seletor de categoria.
- **Dropdown/select**: oculta a opção alternativa; piora descoberta.

## R3 — Como compor o cabeçalho da página com o toggle?

**Decision**: Manter `<header>` global (logo + título "Dashboard"). Logo abaixo, dentro de `<main>`, colocar uma `<section>` específica de toggle ANTES das duas `<section>`s de view. O título do header passa a ser apenas "Dashboard" (subtítulo "Volume e conteúdo trabalhado") — neutro entre Treinos e Alunos.

**Rationale**:
- Mantém o layout responsivo do header sem precisar trocar texto dinamicamente.
- O título "Dashboard de Treinos" da feature 011 é absorvido pela aba Treinos — o subtítulo descritivo dentro da aba ainda contextualiza.
- O título "Dashboard do Aluno" da spec (FR-002) é exibido como subtítulo dentro da `<section id="view-alunos">`.

**Alternatives considered**:
- **Trocar texto do header dinamicamente** ao alternar aba: complexidade extra sem ganho de clareza.

## R4 — Default category na aba Alunos

**Decision**: Primeira categoria de `CATEGORIAS` (ordem fixa Sub09…Sub14) que tenha pelo menos 1 aluno em `state.alunos`. Se nenhuma categoria tem alunos, `CATEGORIAS[0]` é selecionada e a lista exibe estado vazio.

**Rationale**:
- Spec Assumption "primeira categoria com alunos mockados" — sem mocks dedicados (Clarification), traduzimos para "primeira categoria com alunos cadastrados em `state.alunos`".
- Determinismo: a ordem `CATEGORIAS` é fixa, então o usuário sempre vê a mesma categoria em runs idênticos.

**Alternatives considered**:
- **`CATEGORIAS[0]` sempre (Sub09)**: pode mostrar lista vazia mesmo havendo alunos em outras categorias — UX ruim.
- **Persistir última escolha em sessionStorage**: contradiz FR-015a ("estado da sessão de visualização"); adiciona chave de estado UI.

## R5 — Estado inicial: aluno pré-selecionado ou vazio?

**Decision**: Nenhum aluno pré-selecionado. Os blocos abaixo da lista de alunos exibem estado vazio guiado: "Selecione um aluno para visualizar seus dados".

**Rationale**:
- Spec US1 cenário 3: "vê (a) a barra de seleção de categoria, (b) o campo de busca por nome, (c) a lista de alunos da categoria padrão, e (d) um estado vazio amigável no lugar dos blocos de métricas".
- Auto-selecionar o primeiro aluno esconde a importância do passo de seleção e pode levar a interpretações erradas (ex.: o usuário pensa que aquele é o aluno "mais importante").

**Alternatives considered**:
- **Auto-selecionar o primeiro aluno da categoria**: rejeitada — mascara o passo de seleção.

## R6 — Busca por nome: algoritmo

**Decision**: `aluno.nome.toLowerCase().includes(termo.toLowerCase().trim())`. Sem normalização de acentos. Sem debounce explícito (input é local em memória, performance suficiente).

**Rationale**:
- Spec Assumption "Busca por nome: filtragem case-insensitive, sem normalização de acentos nesta entrega".
- Lista de alunos por categoria é tipicamente <30 entradas — filtragem síncrona em cada `input` event é instantânea.
- Trim evita que espaços acidentais causem zero matches.

**Alternatives considered**:
- **Normalização Unicode (NFD + strip diacritics)**: pode ser refinado em entrega futura; out of scope.
- **Debounce de 100ms**: desnecessário para datasets pequenos; SC-003 (<150ms) já é cumprido sem debounce.

## R7 — Cabeçalho do aluno: avatar/foto?

**Decision**: Avatar circular com **iniciais** do aluno (ex.: "LS" para "Lucas Silva"), fundo `bg-imperial-green`, texto branco. Sem foto real (não há campo de foto na entidade Aluno hoje).

**Rationale**:
- Protótipo mostra um círculo verde com pessoa estilizada — interpretação consistente é avatar com iniciais.
- Iniciais são deriváveis do `aluno.nome` sem mudança de schema.
- Evita o tópico de upload/storage de imagens (fora de escopo, exigiria backend).

**Alternatives considered**:
- **Ícone genérico de pessoa SVG**: aceitável, mas iniciais personalizam mais.
- **Adicionar campo `fotoUrl` em Aluno**: viola "sem alteração de esquema"; requer infra de upload.

## R8 — Volume de treino por momento (chart)

**Decision**: Chart.js Bar idêntico ao da aba Treinos (`barThickness: 28`, cores fixas por momento via `MOMENTOS_COR`), recriado a cada `selectAluno`/`selectCategoriaAluno` via `chart.destroy()` + `new Chart()`.

**Rationale**:
- Reaproveita o componente visual da feature 011 — consistência total.
- Recriação > update: ao trocar de aluno, o eixo Y (max scale) muda; recriar evita estados visuais transicionais.
- 4 pontos é dataset desprezível; custo de recriação <5ms.

**Alternatives considered**:
- **`chart.update()` parcial**: rejeitada — risco de inconsistência visual quando o eixo Y precisa redimensionar.

## R9 — Princípios e fundamentos absorvidos: chart ou lista?

**Decision**: Lista HTML com barras horizontais via `<div style="width: %">` (mesmo padrão do Top 8 da aba Treinos). Sem corte fixo (mostra todos os itens absorvidos).

**Rationale**:
- Protótipo mostra barras horizontais com label + count — padrão visual leve.
- Reaproveita estilo do Top 8 da aba Treinos para consistência.
- Sem Chart.js dependency adicional.
- Desempate alfabético em pt-BR (`localeCompare(b.label, 'pt-BR')`) — igual à feature 011.

**Alternatives considered**:
- **Chart.js horizontal bar**: overkill para 5–12 itens; pior em mobile.
- **Top 8 fixo**: spec assumption deixa explícito "sem corte fixo nesta entrega".

## R10 — Minutagem em jogos: tipo de gráfico

**Decision**: Chart.js Line, eixo X = ordinal (índice do jogo) com label `DD/MM`, eixo Y = minutos, `pointRadius: 4` para garantir visibilidade com 1–2 pontos.

**Rationale**:
- Protótipo mostra linha com pontos.
- Line é o tipo natural para evolução temporal.
- `pointRadius` explícito evita pontos invisíveis em datasets pequenos (default do Chart.js é 3, suficiente, mas reforçar 4 em mobile melhora touch targets).

**Alternatives considered**:
- **Bar chart**: factível, mas line é mais comunicativo de evolução.
- **Eixo X temporal contínuo (Chart.js time scale)**: requer adapter `date-fns`/`luxon` adicional; ordinal com label é equivalente para o caso de uso.

## R11 — Cálculo de Convocações para Frequência

**Decision** (Clarification 2026-05-03 — Q1 Opção A): Convocações = `state.chamadas.filter(c => c.categoria === aluno.categoria).length`. Considera todas as chamadas (sessões de treino registradas) da categoria como denominador.

**Rationale**:
- Resposta direta da Clarification: usuário escolheu Opção A com nota "Considere para frequencia apenas as chamadas dos treinos".
- Simples, determinístico, alinhado com o que o treinador percebe como "convocação" (sessão registrada).

**Alternatives considered**:
- **Sessões em que o aluno aparece em `registros`**: rejeitada pela Clarification.
- **Sessões a partir da data de cadastro do aluno**: não há campo `dataCadastro` em `state.alunos`; rejeitada.

## R12 — Itens Trabalhados (card)

**Decision**: Soma de `c.principiosFundamentos.length` em chamadas onde o aluno está marcado como `presente`. Conta ocorrências (não itens distintos).

**Rationale**:
- Spec Assumption "Itens Trabalhados (card): contagem de **ocorrências** de princípios e fundamentos somadas sobre as sessões em que o aluno esteve presente".
- Bate numericamente com o protótipo (~18 itens em 6 sessões com ~3 itens cada).

**Alternatives considered**:
- **Itens distintos (cardinalidade do Set)**: subestima; protótipo não bate.

## R13 — Princípios e fundamentos absorvidos (gráfico): regra de "presente"

**Decision**: Iterar apenas `chamadasPresente` (chamadas onde aluno está como `presente`). Para cada chamada, somar +1 em cada `id` de `c.principiosFundamentos`. Ordenar decrescente, desempate alfabético.

**Rationale**:
- Spec FR-009: "**somente nas sessões em que o aluno esteve presente**".
- Diferente do bloco da aba Treinos, que considera todas as chamadas da categoria.

**Alternatives considered**:
- **Considerar todas as chamadas da categoria**: viola FR-009.

## R14 — Histórico de Jogos: filtragem e ordenação

**Decision**: `state.jogos.filter(j => j.participacoes.some(p => p.alunoId === aluno.id))` ordenados por `data` DESC com desempate por índice no array (`indexOf` no array original = ordem de criação).

**Rationale**:
- Spec FR-012 + Acceptance Scenarios da US4.
- Ordem de criação é estável e determinística sem precisar de timestamp adicional.

**Alternatives considered**:
- **Ordenar por `j.id` UUID**: instável (UUIDs não correlacionam com ordem temporal).

## R15 — Origem dos dados (Clarification 2026-05-03 Q2)

**Decision**: Apenas `imperialState` em `sessionStorage`. Nenhuma semeadura, nenhum mock dedicado embutido na página. Se `state.alunos`, `state.chamadas` ou `state.jogos` estiverem vazios, o dashboard exibe estados vazios apropriados.

**Rationale**:
- Resposta direta da Clarification Q2: usuário escolheu Opção A.
- Diferente da aba Treinos (feature 011) que tem `MOCK_CHAMADAS_DASHBOARD` e `ensureMockData()` — a aba Alunos NÃO chama nenhum equivalente desse tipo.
- Para reproduzir cenários do protótipo, o usuário precisa cadastrar alunos, lançar chamadas e registrar jogos pelas telas existentes.

**Alternatives considered**:
- **Mocks dedicados, híbrido, ou sempre-com-mock**: rejeitados pela Clarification.

**Implicação para a aba Treinos**: a chamada existente de `ensureMockData()` (feature 011) **permanece inalterada na aba Treinos**, pois a Clarification 012 só governa o comportamento da aba Alunos. Isso é coerente com FR-015a (estado independente por aba).

## R16 — Migração de `dashboard-treinos.html` para `dashboard.html`

**Decision**: Cópia 1:1 do conteúdo de `dashboard-treinos.html` para dentro de `<section id="view-treinos">` em `dashboard.html`. IDs, classes, funções, listeners, constantes — tudo preservado. O `<header>`/`<nav>` global é movido para o topo de `dashboard.html`. Após a migração, `dashboard-treinos.html` é deletado e os 3 nav inferiores (`students.html`, `training.html`, `games.html`) têm seus links "Dashboard" atualizados de `dashboard-treinos.html` → `dashboard.html`.

**Rationale**:
- Garante zero regressão funcional para a aba Treinos.
- Migração mecânica e revisável.

**Alternatives considered**:
- **Manter `dashboard-treinos.html` como rota legacy**: cria dois pontos de entrada para "Dashboard" — confuso.
- **Reescrever a aba Treinos**: out of scope; risco de regressão sem necessidade.

## R17 — Toggle: encapsulamento de estado entre abas

**Decision**: Cada aba tem suas próprias variáveis de módulo declaradas no `<script type="module">` da página:
- Aba Treinos: `categoriaTreinos`, `chartVolume`, `chartDistribuicao`
- Aba Alunos: `categoriaAluno`, `termoBusca`, `alunoSelecionado`, `chartVolumeAluno`, `chartMinutagem`

`selectTab(tabId)` apenas alterna `display` entre as duas `<section>`s e atualiza o estilo dos botões pill — não toca em nenhuma variável de estado.

**Rationale**:
- FR-015a satisfeito por construção: toggle nunca lê nem escreve em variáveis da outra aba.
- Variáveis de Chart.js separadas (`chartVolume` da Treinos vs. `chartVolumeAluno` da aba Alunos) impedem interferência mútua, mesmo que ambos os charts sejam de tipo Bar.

## R18 — Performance: recálculo total vs. parcial

**Decision**: Recálculo total a cada mudança (selectAluno, selectCategoriaAluno, busca não recalcula nada além da lista). `computeAlunoData(aluno)` retorna estrutura única que alimenta todos os blocos.

**Rationale**:
- Datasets pequenos: ~30 chamadas, ~10 jogos por categoria. Recalcular tudo é <5ms.
- Simplicidade > otimização prematura (Princípio I).

**Alternatives considered**:
- **Memoização por aluno**: irrelevante para datasets desse tamanho; adiciona complexidade.

## R19 — Acessibilidade

**Decision**:
- Botões pill da aba: `role="button"` (implícito), `aria-pressed`, foco visível via `focus:ring-2 focus:ring-imperial-green`.
- Lista de alunos: `<button>` clicáveis com `aria-pressed` no aluno selecionado.
- Campo de busca: `<input type="search">` com `aria-label="Buscar aluno por nome"`.
- Charts: `<canvas>` com `aria-label` descritivo + `role="img"` (igual à feature 011).
- Estado vazio: regiões `aria-live="polite"` para anúncio em screenreaders.

**Rationale**: Mantém o padrão de acessibilidade já estabelecido nas features 007/011.

## R20 — Responsividade

**Decision**:
- `<main>` continua `max-w-2xl mx-auto px-4 py-6 space-y-4` (padrão da feature 011).
- Cards de resumo: `grid grid-cols-3 gap-3` (3 cards por aba — se ficar apertado em 360px, fallback para `grid-cols-1`).
- Toggle pill: `flex gap-2` em wrapper centralizado; em mobile 360px, 2 botões cabem confortavelmente.
- Charts: `h-48` ou `h-56` (igual feature 011) com `responsive: true` no Chart.js.

**Rationale**: Reuso integral do padrão visual da feature 011, validado em 360–1440px.

---

## Resumo: o que segue para Phase 1

- Página única `dashboard.html` com toggle pill + duas `<section>`s; `dashboard-treinos.html` deletado.
- Aba Treinos: cópia 1:1 do conteúdo atual (zero mudança lógica).
- Aba Alunos: novo pipeline de compute → render documentado em [data-model.md](data-model.md) e validado pelo [quickstart.md](quickstart.md).
- Sem novas dependências, sem alteração de schema, sem mocks dedicados.
