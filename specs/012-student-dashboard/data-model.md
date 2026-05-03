# Data Model — Dashboard do Aluno (012)

**Branch**: `012-student-dashboard`
**Date**: 2026-05-03
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md) | **Research**: [research.md](research.md)

## Princípio

**Sem alteração de esquema.** O Dashboard do Aluno é leitura-somente sobre o estado já existente em `sessionStorage` (chave `imperialState`), construído pelas features 002/003/006/007/008/009/010. Os agregados são projeções derivadas em tempo real.

## Entidades existentes (reutilizadas, sem alteração)

### Aluno (`state.alunos[i]`)

| Campo | Tipo | Origem | Uso no dashboard |
|---|---|---|---|
| `id` | string (UUID) | feature 002 | Cruzamento com `registros[].alunoId` e `participacoes[].alunoId` |
| `nome` | string | feature 002 | Exibição no cabeçalho do aluno + busca por nome (case-insensitive) |
| `categoria` | string (ex.: `'Sub09'`) | feature 002 | Filtragem por categoria selecionada |
| (outros) | — | features 002/003/006 | Não utilizados pelo dashboard |

### Chamada (`state.chamadas[i]`)

| Campo | Tipo | Origem | Uso no dashboard |
|---|---|---|---|
| `id` | string (UUID) | feature 007 | Identificador (não exibido) |
| `categoria` | string | feature 007 | Filtragem por categoria do aluno |
| `data` | string `YYYY-MM-DD` | feature 007 | Não exibida diretamente no Dashboard do Aluno (somente via histórico de jogos para Jogos) |
| `registros` | `Array<Registro>` | feature 007 | Cruzamento por `alunoId` para determinar presença |
| `momentos` | `Array<string>` | feature 009 | Volume de treino por momento |
| `principiosFundamentos` | `Array<string>` | feature 009 | Itens trabalhados + Princípios absorvidos |

#### Registro (`state.chamadas[i].registros[j]`)

| Campo | Tipo | Valores | Uso |
|---|---|---|---|
| `alunoId` | string | UUID de Aluno | Cruzamento com `aluno.id` |
| `status` | string | `'presente' \| 'falta' \| 'pendente'` | Conta como presença somente quando `=== 'presente'` |

### Jogo (`state.jogos[i]`)

| Campo | Tipo | Origem | Uso no dashboard |
|---|---|---|---|
| `id` | string (UUID) | feature 008 | Identificador |
| `data` | string `YYYY-MM-DD` | feature 008 | Ordenação cronológica + label do gráfico de minutagem + label do histórico |
| `nome` | string | feature 008 | Histórico de jogos |
| `participacoes` | `Array<Participacao>` | feature 008 | Cruzamento por `alunoId` |

#### Participação (`state.jogos[i].participacoes[j]`)

| Campo | Tipo | Uso |
|---|---|---|
| `alunoId` | string | Cruzamento com `aluno.id` |
| `minutos` | number (≥ 0) | Soma de minutos + plotagem no gráfico de minutagem + linha do histórico |

## Constantes de domínio (compartilhadas com a aba Treinos)

Mesmas listadas em `dashboard-treinos.html` (`CATEGORIAS`, `CATEGORIAS_LABELS`, `MOMENTOS`, `PRINCIPIOS_GRUPOS`, `STATE_KEY`, `FAMILIAS_LABEL`, `FAMILIAS_COR`, `MOMENTOS_COR`). Reutilizadas integralmente — sem alteração nesta feature.

## Estado de UI (variáveis de módulo da aba Alunos)

| Variável | Tipo | Default | Mutado por |
|---|---|---|---|
| `categoriaAluno` | string | primeira categoria com alunos cadastrados em `state.alunos` (fallback `CATEGORIAS[0]`) | `selectCategoriaAluno()` |
| `termoBusca` | string | `''` | `onBuscaInput()` |
| `alunoSelecionado` | string \| null | `null` (estado vazio guiado) | `selectAluno()` / `selectCategoriaAluno()` (limpa) |
| `chartVolumeAluno` | Chart.js instance \| null | `null` | `renderVolumeMomentoAluno()` |
| `chartMinutagem` | Chart.js instance \| null | `null` | `renderMinutagemChart()` |
| `alunoTabInicializada` | boolean | `false` | `initAlunoTab()` (idempotente) |

## Estrutura derivada — `AlunoDashboardData`

Retornada por `computeAlunoData(aluno)`. Estrutura única que alimenta todos os renders.

```text
AlunoDashboardData = {
  aluno: { id, nome, categoria, iniciais, categoriaLabel },

  // Treinos
  presencas:               number,           // chamadas da categoria onde aluno está presente
  convocacoes:             number,           // total de chamadas da categoria (Clarification Q1 — Opção A)
  frequenciaPct:           number | null,    // null se convocacoes === 0
  totalItens:              number,           // ocorrências em chamadas presentes
  volumePorMomento:        { [momentoId]: number },  // 4 chaves fixas
  principiosAbsorvidos:    Array<{ id, label, count, familia }>,  // ordenado desc, desempate alfabético

  // Jogos
  jogosDisputados:         number,
  minutosTotal:            number,
  mediaPorJogo:            number | null,    // null se jogosDisputados === 0
  minutagemSeries:         Array<{ data: string, label: string, minutos: number }>,  // ordem cronológica ASC
  historicoJogos:          Array<{ id, data, nome, minutos }>,    // ordem cronológica DESC
}
```

## Algoritmo `computeAlunoData(aluno)`

```text
function computeAlunoData(aluno):
  // ─── Preparação ──────────────────────────────────────────────────────
  iniciais       = primeiras letras de cada palavra de aluno.nome (max 2)
  categoriaLabel = CATEGORIAS_LABELS[aluno.categoria] || aluno.categoria

  // ─── Treinos ─────────────────────────────────────────────────────────
  chamadasCategoria = state.chamadas.filter(c => c.categoria === aluno.categoria)
  chamadasPresente  = chamadasCategoria.filter(c =>
                        c.registros?.some(r => r.alunoId === aluno.id && r.status === 'presente'))

  presencas    = chamadasPresente.length
  convocacoes  = chamadasCategoria.length
  frequenciaPct = convocacoes === 0 ? null : Math.round(presencas / convocacoes * 100)

  totalItens   = sum(c.principiosFundamentos?.length ?? 0 for c in chamadasPresente)

  // Volume por momento (ordem fixa MOMENTOS)
  volumePorMomento = { org_ofensiva: 0, org_defensiva: 0, trans_ofensiva: 0, trans_defensiva: 0 }
  for c in chamadasPresente:
    for mid in (c.momentos ?? []):
      if mid in volumePorMomento: volumePorMomento[mid] += 1

  // Princípios absorvidos
  contagem = Map<id, count>
  for c in chamadasPresente:
    for id in (c.principiosFundamentos ?? []):
      contagem[id] += 1
  principiosAbsorvidos = entries(contagem)
    .map(([id, count]) => {
      info = getPrincipioInfo(id)
      return { id, label: info?.label ?? id, count, familia: info?.filtro }
    })
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'))

  // ─── Jogos ───────────────────────────────────────────────────────────
  jogosDoAluno = state.jogos.filter(j =>
                   j.participacoes?.some(p => p.alunoId === aluno.id))

  jogosOrdAsc = jogosDoAluno.slice().sort((a, b) =>
                   a.data.localeCompare(b.data) || (indexOf(a) - indexOf(b)))
  jogosOrdDesc = jogosOrdAsc.slice().reverse()

  minutosFor = (j) => {
    const p = j.participacoes.find(p => p.alunoId === aluno.id)
    return p?.minutos ?? 0
  }

  jogosDisputados = jogosDoAluno.length
  minutosTotal    = sum(minutosFor(j) for j in jogosDoAluno)
  mediaPorJogo    = jogosDisputados === 0 ? null : Math.round(minutosTotal / jogosDisputados)

  minutagemSeries = jogosOrdAsc.map(j => ({
    data: j.data,
    label: formatDDMM(j.data),
    minutos: minutosFor(j),
  }))

  historicoJogos = jogosOrdDesc.map(j => ({
    id: j.id,
    data: j.data,
    nome: j.nome,
    minutos: minutosFor(j),
  }))

  return { aluno: { id, nome, categoria, iniciais, categoriaLabel },
           presencas, convocacoes, frequenciaPct, totalItens,
           volumePorMomento, principiosAbsorvidos,
           jogosDisputados, minutosTotal, mediaPorJogo,
           minutagemSeries, historicoJogos }
```

### Notas de implementação

- **Estabilidade da ordenação cronológica**: `localeCompare` em strings ISO `YYYY-MM-DD` é equivalente a comparação cronológica. Em caso de empate (mesma data), usa o índice no array original (ordem de criação) — implementado via `Array.prototype.indexOf` ou armazenando o índice antes do sort.
- **Ausência de `momentos` ou `principiosFundamentos`** numa chamada: tratada como `[]` via `?? []`.
- **Ausência de `participacoes`** num jogo: tratada como `[]` via `?? []`.
- **Aluno não está em `participacoes`** mas o jogo está em `state.jogos`: filtrado fora por `.some(...)`. Não conta para `jogosDisputados`.
- **Aluno está em `participacoes` com `minutos: 0`**: conta para `jogosDisputados`, contribui 0 para `minutosTotal`, plotado em 0 no chart de minutagem, listado no histórico com `0 min`.

## Mapeamento de Validações da Spec

| Requisito | Onde validado no algoritmo |
|---|---|
| FR-007 (3 cards de treinos) | `presencas`, `frequenciaPct`, `totalItens` |
| FR-008 (volume por momento) | `volumePorMomento` |
| FR-009 (princípios absorvidos — somente sessões com presença) | `chamadasPresente` filtrado antes do agregado |
| FR-010 (3 cards de jogos) | `jogosDisputados`, `minutosTotal`, `mediaPorJogo` |
| FR-011 (gráfico minutagem por partida) | `minutagemSeries` (ordem ASC) |
| FR-012 (histórico) | `historicoJogos` (ordem DESC) |
| FR-014 (origem dos dados) | Algoritmo lê apenas `state.alunos`, `state.chamadas`, `state.jogos`; nenhum mock |
| FR-018 (read-only) | Algoritmo é puro: nenhuma operação de write em `state` |
| Edge: aluno sem presenças | `presencas = 0`, `frequenciaPct = 0` (ou `null` se também 0 convocações), `totalItens = 0`, `volumePorMomento` zerado, `principiosAbsorvidos = []` |
| Edge: aluno sem jogos | `jogosDisputados = 0`, `minutosTotal = 0`, `mediaPorJogo = null`, `minutagemSeries = []`, `historicoJogos = []` |
| Edge: convocações zero | `frequenciaPct = null` → exibido como `—%` |
| Edge: jogos disputados zero | `mediaPorJogo = null` → exibido como `—` |

## Renderização — contrato de cada bloco

| Bloco | Função | Comportamento esperado | Estado vazio |
|---|---|---|---|
| Cabeçalho do aluno | `renderHeaderAluno(aluno)` | Avatar (iniciais) + nome + categoria label | Oculto quando `alunoSelecionado === null` |
| Cards de Treinos | `renderResumoTreinos(data)` | 3 cards: Presenças (`presencas`), Frequência (`frequenciaPct ?? '—'` + `%`), Itens Trabalhados (`totalItens`) | Substituído por mensagem "Selecione um aluno…" quando vazio |
| Volume por momento | `renderVolumeMomentoAluno(data)` | Chart.js Bar com 4 barras coloridas por `MOMENTOS_COR` | Canvas oculto + texto "Sem treinos registrados" quando soma `volumePorMomento === 0` |
| Princípios absorvidos | `renderPrincipiosAbsorvidos(data)` | Lista `<ul>` com barras horizontais; cor da barra herdada da família via `FAMILIAS_COR` | Texto "Nenhum princípio ou fundamento absorvido" quando `principiosAbsorvidos.length === 0` |
| Cards de Jogos | `renderResumoJogos(data)` | 3 cards: Jogos disputados (`jogosDisputados`), Min em Jogo (`minutosTotal`), Média por jogo (`mediaPorJogo ?? '—'`) | Mesmo bloco com zeros / `—` quando `jogosDisputados === 0` |
| Minutagem em jogos | `renderMinutagemChart(data)` | Chart.js Line com pontos visíveis (radius ≥ 4); X = ordinal com label `DD/MM`; Y = minutos | Canvas oculto + texto "Sem jogos registrados" quando `minutagemSeries.length === 0` |
| Histórico de Jogos | `renderHistoricoJogos(data)` | `<ul>` com itens `DD/MM/AAAA — Nome` à esquerda e `N min` à direita | Texto "Nenhum jogo registrado" quando `historicoJogos.length === 0` |

## Performance

- `computeAlunoData(aluno)` é O(N + M + K) onde N = chamadas da categoria, M = jogos do aluno, K = itens nos arrays embutidos. Em datasets típicos (N≈30, M≈10, K≈3 cada), <5ms.
- `renderListaAlunos()` itera `state.alunos` filtrado por categoria + termo de busca: O(A) com A = alunos da categoria. Em A≈20, <2ms.
- Recriação dos charts via `chart.destroy()` + `new Chart()`: <10ms para datasets pequenos.

**Total esperado** por mudança de aluno: <50ms (folga para SC-002 de 300ms).

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| `state.alunos` ou `state.chamadas` corrompido / com campos faltantes | `loadState()` (já existente) preenche arrays vazios; `computeAlunoData` usa `?? []` em todos os arrays embutidos |
| Aluno foi deletado mas ainda aparece em `registros` ou `participacoes` antigos | Não afeta o dashboard: o aluno só é processado se aparecer em `state.alunos` |
| Categoria de um aluno mudou (`state.alunos[i].categoria` foi editada) | Dashboard sempre filtra `state.chamadas` pela categoria *atual* do aluno; histórico de chamadas em categorias anteriores não aparece — comportamento aceitável (FR-009 fala em "sessões da categoria" do aluno selecionado) |
| Empate de datas no histórico de jogos | Desempate por índice no array original (ordem de criação) — estável e determinístico |
| Aluno selecionado e troca de categoria | `selectCategoriaAluno()` limpa `alunoSelecionado` antes de renderizar — coberto por FR-005 e US1 cenário 6 |
