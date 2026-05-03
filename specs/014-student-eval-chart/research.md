# Research: Gráfico de Evolução do Aluno no Dashboard

**Branch**: `014-student-eval-chart` | **Date**: 2026-05-03

## Findings

### 1. Gráfico de evolução já existe em `student-eval.html`

**Decision**: Reutilizar exatamente a mesma configuração Chart.js de `student-eval.html` (linhas 371–448), adaptando apenas o filtro de dados (últimas 6 avaliações do aluno selecionado).

**Rationale**: A implementação em `student-eval.html` já usa as cores, escala (min 2 / max 5), tension e labels corretas para o domínio. Duplicar o padrão é preferível a criar uma abstração compartilhada — o projeto proíbe build step e abstração prematura.

**Alternatives considered**: Extrair a função para um módulo JS compartilhado (`chartUtils.js`). Rejeitado — acrescentaria um arquivo novo e um import desnecessários para uma única reutilização; a Constitution exige simplicidade funcional.

---

### 2. `state.avaliacoes[]` — estrutura do objeto

**Decision**: Filtrar por `alunoId === aluno.id`, ordenar por `data` (desc), tomar os 6 primeiros, reverter para ordem ascendente ao renderizar.

**Rationale**: A ordenação desc garante "as 6 mais recentes"; a reversão para asc mantém a legibilidade temporal do eixo X (passado → presente, da esquerda para a direita).

**Schema do objeto avaliação** (conforme `student-eval.html` linhas 725–733):

```js
{
  id:      string,   // UUID
  alunoId: string,   // FK para state.alunos[].id
  data:    string,   // "YYYY-MM-DD"
  tatico:  number,   // 2 | 3 | 4 | 5
  tecnico: number,   // 2 | 3 | 4 | 5
  mental:  number    // 2 | 3 | 4 | 5
}
```

---

### 3. Chart.js já carregado em `dashboard.html`

**Decision**: Nenhuma dependência nova. Chart.js v4 já está na linha 9 de `dashboard.html` via CDN `https://cdn.jsdelivr.net/npm/chart.js`.

**Rationale**: Sem version pinning explícito no CDN — compatível com o padrão das features anteriores (011, 012).

---

### 4. Paleta de cores das dimensões

**Decision**: Manter as cores já estabelecidas em `student-eval.html`:

| Dimensão | Cor de borda | Cor de fundo |
|----------|-------------|-------------|
| Tático   | `#eab308`   | `rgba(234,179,8,0.08)` |
| Técnico  | `#2a7a3d`   | `rgba(42,122,61,0.08)` |
| Mental   | `#6366f1`   | `rgba(99,102,241,0.08)` |

**Rationale**: Consistência visual entre `student-eval.html` e `dashboard.html` — o professor verá as mesmas cores em ambas as telas.

---

### 5. Posição da nova seção no dashboard

**Decision**: Inserir após a seção "Histórico de Jogos" (ao final de `#blocosAluno`).

**Rationale**: O fluxo de leitura natural vai de resumos agregados (topo) para detalhes longitudinais (base). Dados de jogos e histórico são contextualizadores imediatos; o gráfico de evolução é análise comparativa — naturalmente no final.

**Alternatives considered**: Inserir logo após o cabeçalho do aluno. Rejeitado — quebraria a hierarquia visual atual que vai de resumo para detalhe.

---

### 6. `computeAlunoData` vs. leitura direta em `renderEvolucaoAluno`

**Decision**: Adicionar `avaliacoesRecentes` ao objeto retornado por `computeAlunoData()`, e consumi-lo em `renderEvolucaoAluno(data)`.

**Rationale**: Consistência com o padrão existente — todas as renders do dashboard leem de `data` (retorno de `computeAlunoData`), nunca acessam `state` diretamente. Facilita testes futuros ao manter um único ponto de computação.

---

### 7. Sem contratos de API nesta feature

**Decision**: Nenhum arquivo em `contracts/` é necessário.

**Rationale**: Feature é frontend-only com sessionStorage. Quando o backend .NET for integrado, o endpoint correspondente será `/api/v1/students/{id}/evaluations` — documentado no momento da integração.
