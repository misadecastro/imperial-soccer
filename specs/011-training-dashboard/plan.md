# Implementation Plan: Dashboard de Treinos

**Branch**: `011-training-dashboard` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/011-training-dashboard/spec.md`

## Summary

Nova página `dashboard-treinos.html` que consolida, **por categoria**, o volume de conteúdo trabalhado nos treinos. A página apresenta um seletor de categoria, 4 cards de resumo (Treinos / Minutos / Presença média / Itens trabalhados), gráfico de barras "Volume por momento do jogo" (Chart.js Bar), gráfico de rosca "Distribuição por categoria de conteúdo" (Chart.js Doughnut), lista "Top 8 princípios e fundamentos mais trabalhados" (barras horizontais via HTML/CSS, sem Chart.js) e lista "Sessões recentes". Os dados são derivados em tempo real da estrutura `state.chamadas[]` já em `sessionStorage` (sem alterações de esquema), com mock data opcionalmente injetado quando o estado está vazio. Sem backend nesta entrega.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+); Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS
**Primary Dependencies**: Tailwind CSS v3 via CDN, Chart.js v4 via CDN (`https://cdn.jsdelivr.net/npm/chart.js`) — já utilizado em `student-eval.html`
**Storage**: `sessionStorage` com chave `"imperialState"` — leitura apenas; reutiliza `chamadas[]` existente sem alteração de esquema
**Testing**: Manual — DevTools mobile (iPhone SE 375 × 667) + desktop ≥ 1024px; checklist `quickstart.md` validado antes de fechar
**Target Platform**: Mobile browser (primário, prototipagem em iPhone SE) e desktop browser (secundário)
**Project Type**: web-app — frontend-only (mock/protótipo; backend planejado em fase futura)
**Performance Goals**: Renderização inicial < 2s; troca de categoria atualiza todos os blocos em < 300ms
**Constraints**: Zero build step; sem dependências adicionais além de Tailwind + Chart.js (já presentes); compatível com 360–1440px
**Scale/Scope**: ≈40 chamadas mock × 6 categorias com dados; 4 momentos do jogo; 18 princípios/fundamentos; uma página nova + 3 alterações pontuais de navegação

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justificativa |
|---|---|---|
| A feature adiciona complexidade justificada pelo domínio? | PASS | Visualização agregada de SessãoDeTreino é necessidade direta do treinador para planejar volume tático/técnico. Sem novas entidades. |
| O professor consegue operar o fluxo sem suporte técnico? | PASS | Página leitura-somente, um clique para trocar categoria. Padrão visual de cards/charts já validado em `student-eval.html`. |
| Os dados do aluno permanecem consistentes? | PASS | Dashboard é leitura-somente; jamais altera `state.chamadas`, `state.alunos` ou `state.avaliacoes`. |
| A API segue envelope padrão e está documentada? | EXCEÇÃO | Sem API nesta fase — prototipagem frontend. Ver Complexity Tracking. |
| O acesso ao MongoDB usa o driver oficial sem abstrações? | EXCEÇÃO | Sem MongoDB nesta fase — `sessionStorage` como substituto temporário. Ver Complexity Tracking. |

**Resultado**: 3/5 gates passam. 2 exceções herdadas das features 002–010 (mesma fase de prototipagem frontend).

## Project Structure

### Documentation (this feature)

```text
specs/011-training-dashboard/
├── plan.md              # Este arquivo
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks — não criado por /speckit.plan)
```

### Source Code

```text
src/frontend/
├── index.html                       # Sem alteração
├── css/
│   └── imperial.css                 # Sem alteração
└── pages/
    ├── dashboard-treinos.html       # NOVO — página do dashboard
    ├── training.html                # Modificada: link para dashboard no nav inferior
    ├── students.html                # Modificada: link para dashboard no nav inferior
    ├── games.html                   # Modificada: link para dashboard no nav inferior
    ├── student-eval.html            # Sem alteração
    └── login.html                   # Sem alteração
```

**Structure Decision**: Uma página nova (`dashboard-treinos.html`) seguindo o padrão de página standalone das demais (Tailwind CDN inline + Chart.js CDN + módulo JS no rodapé). Três alterações mínimas e mecânicas no nav inferior das páginas existentes (`training.html`, `students.html`, `games.html`) para inserir o item "Dashboard" como 4ª aba. Nenhuma outra página é tocada. Sem nova pasta, sem novo módulo compartilhado.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Sem backend .NET (viola Princípio IV) | MVP de validação do dashboard com dados mock; o usuário pediu explicitamente "sem ainda atuar no backend". | Implementar backend agora atrasaria o feedback visual do treinador sobre o protótipo do designer. |
| Sem MongoDB (viola Princípio V) | `sessionStorage` cobre as necessidades de leitura desta fase, consistente com features 002–010. | Subir MongoDB exigiria Docker/setup desproporcional ao escopo de prototipagem. |
| 4ª aba no nav inferior (toca 3 páginas) | Acessibilidade: o dashboard é um destino de primeiro nível tão importante quanto Alunos/Treino/Jogos. | "Botão dentro de Treino": esconde a feature; "header link": inconsistente com o padrão atual de navegação. |

## Phase 0: Research

> **Status**: Completo — ver [research.md](research.md)

### Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Página | Nova `dashboard-treinos.html` standalone (padrão das demais) | Reaproveitar `training.html` com seção colapsável — confunde fluxo CRUD com visualização agregada |
| Biblioteca de gráficos | Chart.js v4 via CDN (já em uso em `student-eval.html`) | Recharts/D3 — adiciona peso e rompe princípio "sem build" |
| Top 8 — gráfico ou lista? | Lista HTML com barras horizontais via `width: %` (sem Chart.js) | Bar chart Chart.js — overkill para 8 itens; lista é mais legível e segue o protótipo |
| Categorias exibidas no seletor | Reutilizar `CATEGORIAS = ['Sub09'..'Sub14']` do projeto (6 botões) | 9 botões do protótipo (Sub07, 09–15, 17) — sem dados; adiciona ruído visual |
| Cálculo de "Minutos" | Constante `DURACAO_TREINO_MIN = 60` aplicada a cada chamada da categoria | Adicionar campo `duracao` em Chamada — quebra schema existente; fora do escopo |
| Cálculo "Presença média" | Média ponderada por sessão de `presentes/total` (ignora sessões sem chamada) | Soma global de presentes / soma global de total — distorce categorias com tamanhos de elenco diferentes |
| Origem dos dados mock | Reutilizar `state.chamadas` existente; injetar mock se vazio (≈30 chamadas distribuídas) | Mock isolado paralelo — duplicação e divergência com dados reais já gravados pelo usuário |
| Atualização ao trocar categoria | Recomputar agregados + destruir/recriar instâncias de Chart.js | `chart.update()` parcial — risco de estados visuais inconsistentes para custo desprezível em 4–10 pontos |
| Item de navegação | Adicionar 4ª aba "Dashboard" no nav inferior das 3 páginas existentes + da nova página | Link no header — fora do padrão; menu hambúrguer — exagero |

## Phase 1: Design & Contracts

> **Status**: Completo — ver [data-model.md](data-model.md) e [quickstart.md](quickstart.md)

### Resumo do Modelo de Dados

**Sem alteração de esquema.** A entidade `Chamada` (alimentada pelas features 007/009/010) já tem `data`, `categoria`, `registros[]`, `momentos[]`, `principiosFundamentos[]` — base suficiente para todos os cálculos.

**Constantes adicionadas**:
- `DURACAO_TREINO_MIN = 60` — duração padrão por sessão para o card "Minutos".
- `TOP_PRINCIPIOS_LIMITE = 8` — limite da lista de top princípios/fundamentos.
- `SESSOES_RECENTES_LIMITE = 6` — número de sessões exibidas no rodapé.
- `MOCK_CHAMADAS_DASHBOARD` — array de chamadas mock injetadas quando `state.chamadas` está vazio.

**Lógica derivada (per categoria)**:

```
1. chamadasFiltradas = state.chamadas.filter(c => c.categoria === selecionada)
2. totalTreinos = chamadasFiltradas.length
3. totalMinutos = totalTreinos * DURACAO_TREINO_MIN
4. presencaMedia = média (presentes/total) das chamadas com registros
5. totalItens = soma de chamada.principiosFundamentos.length
6. volumePorMomento[momentoId] = nº de chamadas que contêm aquele momento
7. distribuicaoFamilia[familia] = nº de ocorrências de itens daquela família
8. topPrincipios = ranking decrescente de itens (top 8, empate alfabético)
9. sessoesRecentes = chamadasFiltradas ordenadas por data DESC, top 6
```

### Contracts

Não aplicável — projeto frontend puro; nenhuma API exposta nesta fase.

### Funções Públicas (na nova página)

| Função | Entrada | Saída | Descrição |
|---|---|---|---|
| `renderCategorySelector()` | — | void | Renderiza botões de categoria com a selecionada destacada |
| `selectCategoria(cat)` | string | void | Atualiza `categoriaSelecionada` e re-renderiza todos os blocos |
| `computeDashboardData(cat)` | string | DashboardData | Agrega `state.chamadas` em estrutura única para a categoria |
| `renderSummaryCards(data)` | DashboardData | void | Atualiza os 4 cards |
| `renderVolumeChart(data)` | DashboardData | void | (Re)cria bar chart "Volume por momento do jogo" |
| `renderDistribuicaoChart(data)` | DashboardData | void | (Re)cria doughnut chart "Distribuição por categoria de conteúdo" |
| `renderTopPrincipios(data)` | DashboardData | void | Renderiza lista HTML com até 8 itens + barras de progresso |
| `renderSessoesRecentes(data)` | DashboardData | void | Renderiza lista das 6 sessões mais recentes |
| `ensureMockData()` | — | void | Injeta `MOCK_CHAMADAS_DASHBOARD` em `state.chamadas` se vazio |
| `refresh()` | — | void | Pipeline: compute → render summary → render charts → render lists |

### UI Flow

```
DASHBOARD DE TREINOS
  ├─ Header (logo + título)
  ├─ Seletor de Categoria (6 botões)
  ├─ 4 Cards de resumo (Treinos / Minutos / Presença média / Itens trabalhados)
  ├─ Bar Chart (Volume por momento do jogo)
  ├─ Doughnut Chart (Distribuição por categoria de conteúdo)
  ├─ Lista "Princípios e fundamentos mais trabalhados" (top 8)
  ├─ Lista "Sessões recentes" (top 6)
  └─ Nav inferior (Alunos / Treino / Jogos / Dashboard*)

Eventos:
  - Clique em botão de categoria → selectCategoria(cat) → refresh()
  - Carga inicial → ensureMockData() → selectCategoria(default) → refresh()
```

### Update do Agent Context

Executado via `update-agent-context.ps1 -AgentType claude` — adiciona Chart.js v4 (já presente) e a página nova ao bloco "Active Technologies" do `CLAUDE.md`.

## Post-Design Constitution Check

| Gate | Status | Notas |
|---|---|---|
| Dados do aluno consistentes? | PASS | Dashboard é leitura-somente; `state.alunos` jamais é modificado. |
| Fluxo operável sem suporte técnico? | PASS | Quickstart de 18 passos; uma única ação possível (trocar categoria). |
| Simplicidade funcional? | PASS | Uma página nova; 3 nav inferiores atualizados de forma idêntica; zero abstrações novas. |
| Exceções de stack documentadas? | PASS | Complexity Tracking preenchido (3 itens, todos herdados). |

---

**Artifacts gerados nesta fase**:

| Arquivo | Status |
|---|---|
| [plan.md](plan.md) | Este arquivo |
| [research.md](research.md) | Completo |
| [data-model.md](data-model.md) | Completo |
| [quickstart.md](quickstart.md) | Completo |
| tasks.md | Pendente — executar `/speckit.tasks` |
