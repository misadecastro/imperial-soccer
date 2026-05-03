# Data Model: Dashboard de Treinos

**Branch**: `011-training-dashboard` | **Date**: 2026-05-03

## Entidades

### Chamada (existente — sem alteração de esquema)

A entidade `Chamada` (que representa um Treino) já tem todos os campos necessários para o dashboard. Nenhuma migração ou novo campo é adicionado.

| Campo | Tipo | Origem | Uso no Dashboard |
|---|---|---|---|
| `id` | string (UUID) | feature 007 | Chave para `key`/iteração |
| `data` | string (`YYYY-MM-DD`) | feature 007 | Ordenação de "Sessões recentes"; rótulo `DD/MM/AAAA` |
| `categoria` | string (`Sub09`...) | feature 007 | Filtro principal do dashboard |
| `registros` | `RegistroPresenca[]` | feature 007 | Cálculo de presença média e razão `presentes/total` |
| `momentos` | `string[]` | feature 009 | Cálculo do gráfico "Volume por momento do jogo" |
| `principiosFundamentos` | `string[]` | feature 009 | Cálculo de "Top 8", "Distribuição por família" e fundamentos da lista de sessões recentes |

### RegistroPresenca (existente — sem alteração)

| Campo | Tipo | Uso no Dashboard |
|---|---|---|
| `alunoId` | string (UUID) | Não usado diretamente |
| `status` | `'presente' \| 'falta'` | Contagem de presentes |

---

## Constantes Adicionadas (escopo da página)

```js
const DURACAO_TREINO_MIN = 60;        // minutos por chamada (default)
const TOP_PRINCIPIOS_LIMITE = 8;       // tamanho da lista "Top princípios e fundamentos"
const SESSOES_RECENTES_LIMITE = 6;     // tamanho da lista "Sessões recentes"

const FAMILIAS_LABEL = {
  defensivo: 'Princípios Táticos Defensivos',
  ofensivo:  'Princípios Táticos Ofensivos',
  sempre:    'Fundamentos Técnicos',
};

const FAMILIAS_COR = {
  defensivo: '#dc2626',
  ofensivo:  '#16a34a',
  sempre:    '#f59e0b',
};

const MOMENTOS_COR = {
  org_ofensiva:    '#16a34a',
  org_defensiva:   '#dc2626',
  trans_ofensiva:  '#f59e0b',
  trans_defensiva: '#6b7280',
};
```

Reutilizadas (importadas conceitualmente — replicadas na página, padrão do projeto):
- `CATEGORIAS`, `CATEGORIAS_LABELS` — de `training.html`
- `MOMENTOS` — de `training.html` (mantém ordem fixa Org.Of/Org.Def/Trans.Of/Trans.Def)
- `PRINCIPIOS_GRUPOS` — de `training.html`

---

## Estrutura Computada `DashboardData`

Estrutura consolidada produzida por `computeDashboardData(categoriaSelecionada)` e consumida por todas as funções de render.

```js
{
  categoria: "Sub09",
  totalTreinos: 6,
  totalMinutos: 360,
  presencaMedia: 88,        // inteiro (0–100); 0 se nenhuma chamada com registros
  totalItens: 18,           // soma de chamada.principiosFundamentos.length

  volumePorMomento: {
    org_ofensiva: 3,
    org_defensiva: 1,
    trans_ofensiva: 1,
    trans_defensiva: 1,
  },

  distribuicaoFamilia: {
    defensivo: 5,
    ofensivo: 7,
    sempre: 6,
  },

  topPrincipios: [
    { id: 'passe',              label: 'Passe',              count: 3 },
    { id: 'penetracao',         label: 'Penetração',         count: 2 },
    { id: 'contencao',          label: 'Contenção',          count: 2 },
    { id: 'espaco_com_bola',    label: 'Espaço com Bola',    count: 1 },
    { id: 'dominio',            label: 'Domínio',            count: 1 },
    { id: 'cobertura_defensiva', label: 'Cobertura Defensiva', count: 1 },
    { id: 'equilibrio',         label: 'Equilíbrio',         count: 1 },
    { id: 'mobilidade',         label: 'Mobilidade',         count: 1 },
  ],

  sessoesRecentes: [
    {
      id: 'uuid-1',
      data: '2026-04-26',
      momentoLabel: 'Org. Ofensiva',
      fundamentosLabels: ['Espaço com Bola', 'Penetração', 'Finalização'],
      presentes: 6,
      total: 7,
    },
    // … até 6 itens
  ],
}
```

### Notas de cálculo

- **`momentoLabel`** de `sessoesRecentes`: se uma chamada tem múltiplos momentos, usar o **primeiro** em ordem de `MOMENTOS` (Org. Ofensiva → Org. Defensiva → Trans. Ofensiva → Trans. Defensiva). Se não tiver momentos, exibir "—".
- **`fundamentosLabels`**: derivado de `chamada.principiosFundamentos` mapeando por `PRINCIPIOS_GRUPOS`. Itens não encontrados são ignorados.
- **`presentes`**: `chamada.registros.filter(r => r.status === 'presente').length`. Se `registros` vazio, exibir "—/—" no rendering.
- **Empate no `topPrincipios`**: ordem secundária `label.localeCompare(label, 'pt-BR')` (alfabética estável).

---

## Mock Data — `MOCK_CHAMADAS_DASHBOARD`

Injetado por `ensureMockData()` quando `state.chamadas.length === 0`. **Não sobrescreve** chamadas existentes.

### Forma de cada item

```js
{
  id: crypto.randomUUID(),
  data: 'YYYY-MM-DD',
  categoria: 'Sub09',
  registros: [
    { alunoId: 'mock-1', status: 'presente' },
    { alunoId: 'mock-2', status: 'presente' },
    { alunoId: 'mock-3', status: 'falta' },
    // ...
  ],
  momentos: ['org_ofensiva'],
  principiosFundamentos: ['espaco_com_bola', 'penetracao', 'finalizacao'],
}
```

### Distribuição alvo

| Categoria | Chamadas | Datas (ISO) |
|---|---|---|
| Sub09 | 6 | 2026-04-26, 2026-04-19, 2026-04-14, 2026-04-12, 2026-04-07, 2026-04-05 |
| Sub10 | 5 | datas em abril/2026 |
| Sub11 | 5 | datas em abril/2026 |
| Sub12 | 5 | datas em abril/2026 |
| Sub13 | 5 | datas em março/abril 2026 |
| Sub14 | 4 | datas em março/abril 2026 |

A categoria Sub09 reproduz aproximadamente os números do protótipo (6 treinos, ≈360 minutos, ≈88% presença, ≈18 itens) e o rótulo do top 8 (Passe×3, Penetração×2, Contenção×2, demais ×1).

### Algoritmo de injeção

```
function ensureMockData() {
  if (state.chamadas.length > 0) return;
  state.chamadas = MOCK_CHAMADAS_DASHBOARD.map(c => ({ ...c, id: generateId() }));
  saveState();
}
```

---

## Estado da Página (in-memory, não persistido)

```js
let categoriaSelecionada = 'Sub09';
let chartVolume = null;        // instância Chart.js
let chartDistribuicao = null;  // instância Chart.js
```

Convenção: antes de criar nova instância de Chart.js, chamar `chartXxx?.destroy()` para evitar canvases órfãos.

---

## Funções do Módulo (todas locais à página)

| Função | Entrada | Saída | Descrição |
|---|---|---|---|
| `loadState()` | — | object | **Reuso**: idêntica às páginas existentes; lê `imperialState` |
| `saveState()` | — | void | **Reuso**: persiste `state` em `sessionStorage` |
| `ensureMockData()` | — | void | Injeta `MOCK_CHAMADAS_DASHBOARD` se `state.chamadas` vazio |
| `formatDate(iso)` | string | string | **Reuso**: ISO → `DD/MM/AAAA` |
| `getMomentoLabel(id)` | string | string | Lookup em `MOMENTOS` |
| `getPrincipioLabel(id)` | string | `{label, filtro} \| null` | Lookup em `PRINCIPIOS_GRUPOS` |
| `computeDashboardData(cat)` | string | DashboardData | Função pura; agrega tudo o que os renders precisam |
| `renderCategorySelector()` | — | void | Botões com `aria-pressed` |
| `renderSummaryCards(data)` | DashboardData | void | Atualiza 4 elementos por id |
| `renderVolumeChart(data)` | DashboardData | void | Destrói/cria Bar chart |
| `renderDistribuicaoChart(data)` | DashboardData | void | Destrói/cria Doughnut chart |
| `renderTopPrincipios(data)` | DashboardData | void | Lista HTML com barras `width: %` |
| `renderSessoesRecentes(data)` | DashboardData | void | Lista HTML; estado vazio amigável |
| `selectCategoria(cat)` | string | void | Atualiza estado + chama `refresh()` |
| `refresh()` | — | void | Pipeline completo: compute → render todos os blocos |
| `init()` | — | void | `ensureMockData()` → `renderCategorySelector()` → `selectCategoria(default)` |

---

## Estados Vazios

| Bloco | Condição | Renderização |
|---|---|---|
| Cards | `totalTreinos === 0` | "0", "0", "0%", "0" — sem mensagem extra |
| Bar chart | todos os `volumePorMomento` zero | Canvas com 4 barras de altura zero + texto "Sem dados de momentos para esta categoria" sobreposto |
| Doughnut | todas as famílias zero | Texto "Sem itens trabalhados nesta categoria" no lugar do canvas |
| Top princípios | lista vazia | Texto "Nenhum princípio ou fundamento registrado" |
| Sessões recentes | lista vazia | Texto "Nenhuma sessão registrada para esta categoria" |

---

## Impacto nas Páginas Existentes

| Página | Modificação |
|---|---|
| `src/frontend/pages/dashboard-treinos.html` | **Nova** — toda a feature |
| `src/frontend/pages/training.html` | Nav inferior: `flex` de 3 → 4 abas; adicionar `<a href="dashboard-treinos.html">` |
| `src/frontend/pages/students.html` | Idêntica modificação no nav inferior |
| `src/frontend/pages/games.html` | Idêntica modificação no nav inferior |

Demais arquivos (`index.html`, `student-eval.html`, `login.html`, `imperial.css`, `MEMORY.md` etc.): **sem alteração**.
