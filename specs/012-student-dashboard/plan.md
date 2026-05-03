# Implementation Plan: Dashboard do Aluno

**Branch**: `012-student-dashboard` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/012-student-dashboard/spec.md`

## Summary

Unifica os dashboards Treinos e Alunos numa **única página** `src/frontend/pages/dashboard.html`, com um seletor de aba "Treinos / Alunos" no topo. A aba **Treinos** preserva integralmente o comportamento atual da feature 011 (migração 1:1 do conteúdo de `dashboard-treinos.html`, sem alteração de lógica). A aba **Alunos** é nova: oferece seletor de categoria + busca por nome, lista de alunos da categoria, identificação do aluno selecionado, 3 cards de resumo de treinos (Presenças, Frequência, Itens Trabalhados), gráfico de barras "Volume de treino por momento", barras horizontais "Princípios e fundamentos absorvidos", 3 cards de resumo de jogos (Jogos disputados, Minutos em Jogo, Média por jogo), gráfico de linha "Minutagem em jogos" e lista "Histórico de Jogos". Os dados são derivados em tempo real de `state.alunos`, `state.chamadas` e `state.jogos` em `sessionStorage` (chave `imperialState`) — **sem mocks dedicados ou semeadura** (Clarification 2026-05-03). A unificação numa única página satisfaz FR-015 ("sem reload da página") e FR-015a (estado independente por aba via variáveis de módulo).

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+); Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS
**Primary Dependencies**: Tailwind CSS v3 (CDN), Chart.js v4 (CDN — `https://cdn.jsdelivr.net/npm/chart.js`) já em uso em `dashboard-treinos.html` e `student-eval.html`
**Storage**: `sessionStorage` chave `imperialState` — leitura apenas (`state.alunos[]`, `state.chamadas[]`, `state.jogos[]`); reutiliza esquemas existentes das features 002/003/006/007/008/009/010 sem alteração
**Testing**: Manual — DevTools mobile (iPhone SE 375 × 667) + desktop ≥ 1024px; checklist `quickstart.md` validado antes de fechar
**Target Platform**: Mobile browser (primário) e desktop browser (secundário)
**Project Type**: web-app — frontend-only (sem backend nesta fase, conforme features anteriores)
**Performance Goals**: Renderização inicial < 2s; troca de aluno/categoria atualiza todos os blocos em < 300ms; busca por nome filtra em < 150ms
**Constraints**: Zero build step; sem dependências adicionais além de Tailwind + Chart.js; compatível com 360–1440px; sem reload de página ao alternar abas (FR-015); estado de seleção independente por aba na mesma sessão (FR-015a)
**Scale/Scope**: 1 página unificada substitui `dashboard-treinos.html`; 3 nav inferiores atualizados (links de "Dashboard"); ≈10 funções JS novas para a aba Alunos; reutiliza ~700 linhas da aba Treinos sem modificação lógica

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justificativa |
|---|---|---|
| A feature adiciona complexidade justificada pelo domínio? | PASS | Visualização individual por aluno é necessidade direta do treinador (acompanhamento personalizado). Sem novas entidades — apenas projeções derivadas de `chamadas[]` e `jogos[]`. |
| O professor consegue operar o fluxo sem suporte técnico? | PASS | Página leitura-somente; um clique para alternar aba, um clique para escolher categoria, opcional busca por nome, um clique para escolher aluno. Padrão visual de cards/charts já validado em features 011/004. |
| Os dados do aluno permanecem consistentes? | PASS | Dashboard é leitura-somente (FR-018); jamais altera `state.alunos`, `state.chamadas` ou `state.jogos`. |
| A API segue envelope padrão e está documentada? | EXCEÇÃO | Sem API nesta fase — prototipagem frontend (igual features 002–011). Ver Complexity Tracking. |
| O acesso ao MongoDB usa o driver oficial sem abstrações? | EXCEÇÃO | Sem MongoDB nesta fase — `sessionStorage` como substituto temporário (igual features 002–011). Ver Complexity Tracking. |

**Resultado**: 3/5 gates passam. 2 exceções herdadas das features 002–011 (mesma fase de prototipagem frontend).

## Project Structure

### Documentation (this feature)

```text
specs/012-student-dashboard/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code

```text
src/frontend/
├── index.html                       # Sem alteração
├── css/
│   └── imperial.css                 # Sem alteração
└── pages/
    ├── dashboard.html               # NOVA — página unificada com toggle Treinos/Alunos
    ├── dashboard-treinos.html       # REMOVIDA — conteúdo migrado para dashboard.html (aba Treinos)
    ├── students.html                # Modificada: link "Dashboard" do nav inferior aponta para dashboard.html
    ├── training.html                # Modificada: link "Dashboard" do nav inferior aponta para dashboard.html
    ├── games.html                   # Modificada: link "Dashboard" do nav inferior aponta para dashboard.html
    ├── student-eval.html            # Sem alteração
    └── login.html                   # Sem alteração
```

**Structure Decision**: Uma página unificada `dashboard.html` substitui `dashboard-treinos.html`. A aba **Treinos** é uma migração 1:1 do markup + script atual de `dashboard-treinos.html` (todos os IDs, classes, funções e listeners preservados sem mudança de comportamento). A aba **Alunos** é um conjunto novo de seções, com um pipeline próprio de compute → render. As duas abas compartilham o mesmo `<header>` e `<nav>` inferior, e os mesmos blocos de constantes (`CATEGORIAS`, `MOMENTOS`, `PRINCIPIOS_GRUPOS`). A nav inferior das 3 páginas existentes é atualizada para apontar a `dashboard.html` (uma alteração mecânica de URL, sem mudança de estrutura de menu).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Sem backend .NET (viola Princípio IV) | MVP de visualização com dados existentes; o usuário pediu explicitamente "sem backend por enquanto". | Implementar backend agora atrasaria o feedback do treinador sobre o protótipo do designer. |
| Sem MongoDB (viola Princípio V) | `sessionStorage` cobre a leitura, consistente com features 002–011. | Subir MongoDB exigiria Docker/setup desproporcional ao escopo. |
| Migração de `dashboard-treinos.html` para `dashboard.html` (deleta arquivo da feature 011) | FR-015 exige "sem reload da página" no toggle Treinos/Alunos — uma única página é a única forma de respeitar essa restrição. FR-015a exige estado independente por aba: variáveis de módulo na mesma página resolvem isso sem persistir estado UI em sessionStorage. | Duas páginas com `<a>` cross-linking: uso de `<a>` causa reload; persistir estado UI em sessionStorage para sobreviver navegação adiciona complexidade e novas chaves de estado. |

## Phase 0: Research

> **Status**: Completo — ver [research.md](research.md)

### Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Estrutura da página | Página única `dashboard.html` com toggle de abas (não-roteável) | Duas páginas com `<a>` cross-linking — viola FR-015 ("sem reload"); persistir estado UI em sessionStorage para preservar seleção entre navegações adiciona complexidade desnecessária |
| Migração da Treinos | Cópia 1:1 do conteúdo de `dashboard-treinos.html` para `<section id="view-treinos">`; deleção do arquivo antigo | Manter `dashboard-treinos.html` como rota legacy — duplicação de menu/nav; ambiguidade sobre qual link "Dashboard" abre |
| Toggle UI | Dois botões pill no topo com classe `aria-pressed` (igual ao seletor de categoria existente) | Tabs Material/Bootstrap — não há framework UI; estilo pill é consistente com seletor de categoria |
| Estado independente por aba | Variáveis de módulo separadas (`categoriaTreinos`, `categoriaAluno`, `alunoSelecionado`); toggle apenas alterna `display` das `<section>`s, não toca em estado | Persistir estado UI em sessionStorage — desnecessário; estado vive enquanto a página estiver aberta, exatamente o escopo da Clarification |
| Default category na aba Alunos | Primeira categoria de `CATEGORIAS` que tenha pelo menos 1 aluno em `state.alunos`; se nenhuma tem aluno, fallback para `CATEGORIAS[0]` | Última categoria selecionada salva em sessionStorage — viola FR-015a (estado deve ser por sessão de visualização, não persistente) e adiciona chave de estado UI |
| Aluno selecionado inicial | Nenhum (estado vazio guiado: "Selecione um aluno para visualizar seus dados") | Primeiro aluno da categoria — esconde a importância do passo de seleção e faz a página parecer pré-carregada |
| Busca por nome | `nome.toLowerCase().includes(termo.toLowerCase())`; sem normalização de acentos nesta entrega | Normalização Unicode (NFD + strip diacritics) — pode ser refinado em entrega futura; spec assume comportamento sem normalização |
| Volume de treino por momento (chart) | Chart.js Bar (igual ao da aba Treinos), recriado a cada mudança de aluno | Reuso da instância via `chart.update()` — risco de inconsistência visual; custo desprezível para 4 pontos |
| Princípios e fundamentos absorvidos | Lista HTML com barras horizontais via `width: %` (igual ao Top 8 da aba Treinos) | Chart.js bar horizontal — overkill para 5–12 itens; menos legível em mobile |
| Minutagem em jogos (chart) | Chart.js Line, eixo X = ordinal (índice do jogo) com label `DD/MM`, eixo Y = minutos; com `pointRadius` visível para 1–N pontos | Bar chart — protótipo mostra linha com pontos; line é mais adequada para evolução temporal |
| Como contar Presenças | Filtrar `state.chamadas` por categoria do aluno e contar entradas onde `registros[i].alunoId === aluno.id && registros[i].status === 'presente'` | Reverter pelo `state.alunos` — mais lento e sem ganho |
| Como contar Convocações | `state.chamadas.filter(c => c.categoria === aluno.categoria).length` (Clarification 2026-05-03) | Por aluno (sessões em que ele aparece em `registros`) — invalidado pela Clarification: usuário escolheu denominador = total de chamadas da categoria |
| Itens Trabalhados (card) | Soma de `c.principiosFundamentos.length` em chamadas onde o aluno está marcado como `presente` | Contagem de itens distintos — protótipo mostra ocorrências (18 com 6 sessões cobrindo ~3 itens cada bate); spec assumption fixa "ocorrências" |
| Princípios absorvidos (gráfico) — limite | Sem corte fixo (mostrar todos); ordenação decrescente por contagem, desempate alfabético | Limitar a top 8 — protótipo mostra ~10–12 itens; a aba Alunos pode ter menos itens distintos por aluno do que a aba Treinos por categoria |
| Jogos disputados | `state.jogos.filter(j => j.participacoes.some(p => p.alunoId === aluno.id)).length` | Agrupar por data — não há regra de "1 jogo por dia" |
| Histórico de Jogos — ordenação | `data DESC`, desempate por ordem de criação (índice no array, estável) | `data ASC` — protótipo mostra mais recente em cima |
| Origem dos dados | Apenas `imperialState` em `sessionStorage` (Clarification 2026-05-03); SEM mocks dedicados e SEM semeadura | Mocks dedicados embutidos — invalidado pela Clarification: usuário escolheu reusar somente o estado existente |

## Phase 1: Design & Contracts

> **Status**: Completo — ver [data-model.md](data-model.md) e [quickstart.md](quickstart.md)

### Resumo do Modelo de Dados

**Sem alteração de esquema.** Reutiliza `state.alunos[]` (feature 002), `state.chamadas[]` (features 007/009/010) e `state.jogos[]` (feature 008) sem modificar nenhum campo. Os agregados do dashboard são projeções calculadas em tempo real.

**Constantes compartilhadas com a aba Treinos** (já presentes em `dashboard-treinos.html`):
`CATEGORIAS`, `CATEGORIAS_LABELS`, `MOMENTOS`, `PRINCIPIOS_GRUPOS`, `STATE_KEY`, `FAMILIAS_LABEL`, `FAMILIAS_COR`, `MOMENTOS_COR`.

**Constantes novas (aba Alunos)**:
- Nenhuma constante de domínio nova — todos os limiares são consequência dos dados.

**Lógica derivada (per aluno selecionado)**:

```text
1. presenteIn(chamada, alunoId) = chamada.registros.some(r => r.alunoId === alunoId && r.status === 'presente')
2. chamadasCategoria  = state.chamadas.filter(c => c.categoria === aluno.categoria)
3. chamadasPresente   = chamadasCategoria.filter(c => presenteIn(c, aluno.id))
4. presencas          = chamadasPresente.length
5. convocacoes        = chamadasCategoria.length                            // Clarification: chamadas da categoria
6. frequenciaPct      = convocacoes === 0 ? null : Math.round(presencas / convocacoes * 100)
7. totalItens         = sum(c.principiosFundamentos.length for c in chamadasPresente)
8. volumePorMomento[mid] = #chamadasPresente que contêm `mid` em c.momentos
9. principiosAbsorvidos[id] = #ocorrências de `id` em c.principiosFundamentos para c em chamadasPresente
10. jogosDoAluno      = state.jogos.filter(j => j.participacoes.some(p => p.alunoId === aluno.id))
11. minutosPorJogo[i] = jogosDoAluno[i].participacoes.find(p => p.alunoId === aluno.id).minutos ?? 0
12. jogosDisputados   = jogosDoAluno.length
13. minutosTotal      = sum(minutosPorJogo)
14. mediaPorJogo      = jogosDisputados === 0 ? null : Math.round(minutosTotal / jogosDisputados)
15. minutagemSeries   = jogosDoAluno ordenados por data ASC, mapeados em (data, minutos)
16. historicoJogos    = jogosDoAluno ordenados por data DESC, mapeados em (data, nome, minutos)
```

### Contracts

Não aplicável — projeto frontend puro; nenhuma API exposta nesta fase. As "interfaces" são funções JS internas documentadas abaixo.

### Funções Públicas — Aba Alunos

| Função | Entrada | Saída | Descrição |
|---|---|---|---|
| `renderTabs()` | — | void | Renderiza os 2 botões de aba (Treinos / Alunos) e cabeça `aria-pressed` |
| `selectTab(tabId)` | 'treinos' \| 'alunos' | void | Alterna `display` das `<section>`s; atualiza estilo dos botões; primeiro acesso à aba Alunos chama `initAlunoTab()` |
| `initAlunoTab()` | — | void | Idempotente: na primeira ativação, escolhe categoria default e renderiza seletor de categoria + lista de alunos. Não pré-seleciona aluno |
| `renderCategoriasAluno()` | — | void | Renderiza botões de categoria (idêntico ao da aba Treinos, mas com handler próprio) |
| `selectCategoriaAluno(cat)` | string | void | Atualiza `categoriaAluno`; limpa `alunoSelecionado`; re-renderiza lista de alunos e estado vazio dos blocos de métricas |
| `renderListaAlunos()` | — | void | Filtra `state.alunos` por `categoriaAluno` e por `termoBusca`; renderiza pills clicáveis; aplica destaque ao aluno selecionado |
| `onBuscaInput(termo)` | string | void | Atualiza `termoBusca` (lowercase, trim) e chama `renderListaAlunos()` |
| `selectAluno(alunoId)` | string | void | Atualiza `alunoSelecionado`; re-renderiza cabeçalho do aluno + todos os blocos de métricas |
| `computeAlunoData(aluno)` | Aluno | AlunoDashboardData | Agrega `state.chamadas` e `state.jogos` para o aluno; retorna estrutura única usada por todos os renders |
| `renderHeaderAluno(aluno)` | Aluno | void | Renderiza cabeçalho com avatar/iniciais + nome + categoria |
| `renderResumoTreinos(data)` | AlunoDashboardData | void | Atualiza os 3 cards de treinos (Presenças, Frequência, Itens Trabalhados) |
| `renderVolumeMomentoAluno(data)` | AlunoDashboardData | void | (Re)cria bar chart "Volume de treino por momento" |
| `renderPrincipiosAbsorvidos(data)` | AlunoDashboardData | void | Renderiza lista HTML com barras horizontais |
| `renderResumoJogos(data)` | AlunoDashboardData | void | Atualiza os 3 cards de jogos (Jogos disputados, Min em Jogo, Média por jogo) |
| `renderMinutagemChart(data)` | AlunoDashboardData | void | (Re)cria line chart "Minutagem em jogos" |
| `renderHistoricoJogos(data)` | AlunoDashboardData | void | Renderiza lista HTML do histórico em ordem decrescente |
| `refreshAluno()` | — | void | Pipeline completo: header + resumo treinos + chart momento + princípios + resumo jogos + chart minutagem + histórico |
| `clearAlunoView()` | — | void | Estado "selecione um aluno": header oculto, blocos exibem mensagem orientadora |

### UI Flow

```text
DASHBOARD (página unificada)
  ├─ Header (logo + título)
  ├─ Tabs: [Treinos] [Alunos]
  ├─ <section id="view-treinos">  ← idêntico ao atual dashboard-treinos.html
  │   ├─ Seletor de Categoria (Treinos)
  │   ├─ 4 Cards de resumo
  │   ├─ Bar Chart Volume por momento
  │   ├─ Doughnut + Top 8 Princípios
  │   └─ Sessões Recentes
  └─ <section id="view-alunos">    ← novo
      ├─ Seletor de Categoria (Alunos)
      ├─ Campo de busca por nome
      ├─ Lista de alunos da categoria (pills)
      ├─ [Bloco condicional — só após selectAluno()]
      │   ├─ Cabeçalho do aluno (avatar + nome + categoria)
      │   ├─ 3 Cards de Treinos (Presenças, Frequência, Itens Trabalhados)
      │   ├─ Bar Chart Volume de treino por momento
      │   ├─ Lista barras Princípios e fundamentos absorvidos
      │   ├─ 3 Cards de Jogos (Jogos disputados, Min em Jogo, Média por jogo)
      │   ├─ Line Chart Minutagem em jogos
      │   └─ Lista Histórico de Jogos
      └─ [Estado vazio — quando alunoSelecionado === null]
          └─ "Selecione um aluno para visualizar seus dados"

  └─ Nav inferior (Alunos / Treino / Jogos / Dashboard*)

Eventos:
  - Clique aba Treinos/Alunos    → selectTab(id)
  - Clique categoria (Treinos)   → selectCategoriaTreinos(cat) → refreshTreinos()
  - Clique categoria (Alunos)    → selectCategoriaAluno(cat)   → renderListaAlunos() + clearAlunoView()
  - Input busca (Alunos)         → onBuscaInput(termo)         → renderListaAlunos()
  - Clique aluno (Alunos)        → selectAluno(id)             → refreshAluno()
  - Carga inicial                → renderTabs() + selectTab('treinos')
```

### Update do Agent Context

Executado via `update-agent-context.ps1 -AgentType claude` — sem novas tecnologias além das já listadas para a feature 011 (Tailwind via CDN, Chart.js v4 via CDN, ES Modules), apenas reforça o uso na feature 012.

## Post-Design Constitution Check

| Gate | Status | Notas |
|---|---|---|
| Dados do aluno consistentes? | PASS | Dashboard é leitura-somente (FR-018); nenhum write em `state.alunos`, `state.chamadas`, `state.jogos`. |
| Fluxo operável sem suporte técnico? | PASS | Quickstart de ~25 passos; ações limitadas a (a) clicar aba, (b) clicar categoria, (c) digitar nome, (d) clicar aluno. |
| Simplicidade funcional? | PASS | Uma única página nova substitui a anterior; toggle = `display:none`; reusa todas as constantes de domínio existentes. |
| Exceções de stack documentadas? | PASS | Complexity Tracking preenchido (3 itens; 2 herdados + 1 novo de migração). |

---

**Artifacts gerados nesta fase**:

| Arquivo | Status |
|---|---|
| [plan.md](plan.md) | Este arquivo |
| [research.md](research.md) | Completo |
| [data-model.md](data-model.md) | Completo |
| [quickstart.md](quickstart.md) | Completo |
| tasks.md | Pendente — executar `/speckit.tasks` |
