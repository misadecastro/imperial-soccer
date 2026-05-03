# Research: Dashboard de Treinos

**Branch**: `011-training-dashboard` | **Date**: 2026-05-03

## Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Página | Nova `dashboard-treinos.html` standalone | Reaproveitar `training.html` com seção colapsável — mistura CRUD com visualização agregada e dificulta navegação |
| Biblioteca de gráficos | Chart.js v4 via CDN (já em uso em `student-eval.html`) | Recharts/D3/ApexCharts — adicionam peso, exigem build/bundle ou rompem o princípio "sem build step" |
| Top 8 — gráfico ou lista | Lista HTML com barras horizontais (`width: %`) sem Chart.js | Bar chart Chart.js horizontal — overhead desnecessário; lista se aproxima visualmente do protótipo e é mais legível |
| Categorias exibidas no seletor | Reutilizar `CATEGORIAS = ['Sub09','Sub10','Sub11','Sub12','Sub13','Sub14']` | 9 botões do protótipo (Sub07, 09–15, 17) — sem dados; geraria 3 botões inertes |
| Cálculo de "Minutos" | Constante `DURACAO_TREINO_MIN = 60` aplicada por chamada | Adicionar campo `duracao` em Chamada — quebra schema; estende escopo para `training.html` |
| Cálculo de "Presença média" | Média ponderada por sessão de `presentes/total` (ignora chamadas sem `registros`) | Soma global presentes ÷ soma global total — distorce categorias com elencos diferentes |
| Origem dos dados mock | Reutilizar `state.chamadas` existente; injetar mock se vazio | Mock isolado paralelo — duplicação e divergência com dados gravados pelo usuário |
| Atualização ao trocar categoria | Destruir/recriar instâncias de Chart.js | `chart.update()` parcial — risco de estados visuais inconsistentes; ganho desprezível para 4–10 pontos |
| Item de navegação | 4ª aba "Dashboard" no nav inferior das 3 páginas + da nova página | Link no header — fora do padrão; menu hambúrguer — exagero |
| Default de categoria | `Sub09` (primeira categoria do protótipo, com dados mock) | Primeira categoria com dados — aceitável, mas adiciona lógica desnecessária para um valor estável |
| Ordenação de empates no top 8 | Alfabética crescente (estável) | Ordem de inserção — não-determinística; salta entre renderizações |
| Famílias do gráfico de rosca | 3 fixas: Princípios Táticos Defensivos, Princípios Táticos Ofensivos, Fundamentos Técnicos (alinhadas a `PRINCIPIOS_GRUPOS`) | 2 famílias agregadas (Tático × Fundamentos) — perde granularidade já presente no domínio |
| Persistência da categoria entre páginas | Não persistir nesta entrega | `sessionStorage` — ganho marginal; default fixo basta para protótipo |

## Pesquisa: Padrões Reutilizáveis

### Cabeçalho, nav inferior e Tailwind config
Reutilizar verbatim de `training.html`:
- Header verde com logo + título + subtítulo
- `tailwind.config` com paleta `imperial`
- Toast (oculto, embora o dashboard não escreva nada — mantido por consistência)
- Nav inferior fixa, agora com 4 abas (`flex-1` em cada `<a>`)

### Chart.js setup
Padrão exato de `student-eval.html` (linha 8 do arquivo):
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```
Carregado **fora** de `<script type="module">` para que `Chart` esteja em escopo global antes do módulo executar.

### Cores das paletas
- Bar chart "Volume por momento": cores fortes derivadas do protótipo
  - Org. Ofensiva → `#16a34a` (imperial-green-mid)
  - Org. Defensiva → `#dc2626` (imperial-red)
  - Trans. Ofensiva → `#f59e0b` (amber-500)
  - Trans. Defensiva → `#6b7280` (gray-500)
- Doughnut "Distribuição": três fatias
  - Princípios Táticos Defensivos → `#dc2626`
  - Princípios Táticos Ofensivos → `#16a34a`
  - Fundamentos Técnicos → `#f59e0b`
- Top 8 (barras horizontais): `#16a34a` com fundo `#dcfce7`

## Pesquisa: Cálculo de Agregados

### Volume por momento do jogo
```
para cada momentoId em ['org_ofensiva', 'org_defensiva', 'trans_ofensiva', 'trans_defensiva']:
  count[momentoId] = chamadasFiltradas.filter(c => c.momentos.includes(momentoId)).length
```
Cada chamada conta uma vez por momento que selecionou (uma chamada com 2 momentos contribui 1 a cada um).

### Distribuição por família de conteúdo
```
para cada chamada em chamadasFiltradas:
  para cada itemId em chamada.principiosFundamentos:
    grupo = lookup(itemId).filtro  // 'defensivo' | 'ofensivo' | 'sempre'
    familia[grupo] += 1
```
A família para o gráfico é a do grupo de origem do item — distinção entre "Defensivos" e "Ofensivos" preservada.

### Top princípios/fundamentos
```
contagem[itemId] = soma de ocorrências em todas as chamadas filtradas
ordenar por (contagem DESC, label ASC)
slice(0, TOP_PRINCIPIOS_LIMITE)
```

### Presença média
```
sessoesComChamada = chamadasFiltradas.filter(c => c.registros.length > 0)
percentuais = sessoesComChamada.map(c => presentes(c) / c.registros.length)
presencaMedia = (média de percentuais) × 100   // arredondado para inteiro
se sessoesComChamada.length === 0 → 0
```

### Sessões recentes
```
chamadasFiltradas
  .slice()                          // não mutar
  .sort((a,b) => b.data.localeCompare(a.data))   // ISO date → comparação lexicográfica
  .slice(0, SESSOES_RECENTES_LIMITE)
```

## Pesquisa: Mock Data

Cenário: usuário abre o app pela primeira vez e nunca registrou um treino. O dashboard precisa mostrar números plausíveis para validar o protótipo.

**Estratégia escolhida**: `ensureMockData()` injeta `MOCK_CHAMADAS_DASHBOARD` em `state.chamadas` apenas se o array estiver vazio. Não sobrescreve dados reais.

**Distribuição alvo dos mocks** (≈30 chamadas):
- Sub 09: 6 chamadas (espelha protótipo)
- Sub 10: 5 chamadas
- Sub 11: 5 chamadas
- Sub 12: 5 chamadas
- Sub 13: 5 chamadas
- Sub 14: 4 chamadas

**Forma de cada chamada mock**: estrutura mínima válida do schema feature 010 — `id`, `data` (ISO), `categoria`, `registros[]` (presença mockada), `momentos[]`, `principiosFundamentos[]`. Sem `duracao` (cai no padrão `DURACAO_TREINO_MIN`).

## Pesquisa: Comportamento Responsivo

- Seletor de categoria: `flex flex-wrap gap-2` — quebra em múltiplas linhas em telas estreitas; cada botão `w-[88px]` (~3 por linha em 375px).
- Cards de resumo: grid `grid-cols-2 sm:grid-cols-4`.
- Charts: container com `w-full` e `aspect-ratio` definido para não quebrar em mobile.
- Lista de top princípios: stacked vertical sempre (sem grid); barras `width: %` calculado por `max(contagens)`.

## Pesquisa: Acessibilidade Mínima

- Botões de categoria: `<button>` com `aria-pressed` indicando seleção.
- Charts: cada `<canvas>` precedido por `<h3>` com título da seção; descrição textual abaixo (mesmo conteúdo plotado em prosa breve para leitores de tela).
- Lista de sessões: `role="list"` + `aria-live="polite"` para anunciar mudanças ao trocar categoria.
- Foco visível: classes Tailwind `focus:ring-2 focus:ring-imperial-green` nos botões de categoria (padrão do projeto).

## Itens em Aberto

Nenhum NEEDS CLARIFICATION remanescente. Todos os itens marcados como Assumptions na spec foram resolvidos pelas decisões acima.
