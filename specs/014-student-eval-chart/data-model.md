# Data Model: Gráfico de Evolução do Aluno

**Branch**: `014-student-eval-chart` | **Date**: 2026-05-03

## Entities

### Avaliacao (state.avaliacoes[])

Registro de desempenho de um aluno em uma data específica. Produzida em `student-eval.html`; consumida (leitura) por esta feature.

| Campo    | Tipo   | Restrições        | Descrição |
|----------|--------|-------------------|-----------|
| `id`     | string | UUID, obrigatório | Identificador único da avaliação |
| `alunoId`| string | FK → Aluno.id     | Aluno avaliado |
| `data`   | string | ISO 8601 (`YYYY-MM-DD`), obrigatório | Data da avaliação |
| `tatico` | number | 2 \| 3 \| 4 \| 5  | Score dimensão Tático |
| `tecnico`| number | 2 \| 3 \| 4 \| 5  | Score dimensão Técnico |
| `mental` | number | 2 \| 3 \| 4 \| 5  | Score dimensão Mental |

**Escala de scores**:

| Valor | Label |
|-------|-------|
| 5 | Excelente |
| 4 | Bom |
| 3 | Regular |
| 2 | Precisa Melhorar |

---

### Aluno (state.alunos[])

Entidade principal do dashboard. O gráfico é filtrado para o `id` do aluno atualmente selecionado.

| Campo      | Tipo   | Uso nesta feature |
|------------|--------|-------------------|
| `id`       | string | Chave de filtro para `state.avaliacoes[]` |
| `nome`     | string | Exibido no cabeçalho (já existente) |
| `categoria`| string | Seleção de categoria (já existente) |

---

## Data Flow para o gráfico (computeAlunoData → renderEvolucaoAluno)

```
state.avaliacoes[]
  │
  ├─ filter(av => av.alunoId === aluno.id)
  ├─ sort((a, b) => b.data.localeCompare(a.data))   ← mais recente primeiro
  ├─ slice(0, 6)                                     ← máx 6
  └─ reverse()                                       ← ascendente para eixo X

  → avaliacoesRecentes: Avaliacao[]    (0–6 itens)
```

Este array entra em `data.avaliacoesRecentes` e é consumido por `renderEvolucaoAluno(data)`.

---

## Validações de estado

| Condição | Comportamento |
|----------|---------------|
| `avaliacoesRecentes.length === 0` | Ocultar `<canvas>`, exibir `<p id="emptyEvolucaoAluno">` |
| `avaliacoesRecentes.length === 1` | Exibir 1 ponto por série (sem linha conectando) — Chart.js nativo |
| Campo score nulo/undefined | Chart.js omite o ponto naquela posição (dataset `spanGaps: false`) |
| `aluno` não encontrado | `clearAlunoView()` já trata; `renderEvolucaoAluno` nunca é chamada |
