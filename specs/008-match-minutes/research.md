# Research: Minutagem de Jogos

**Branch**: `008-match-minutes` | **Date**: 2026-04-20

## Decisões de Design

### 1. Estrutura de dados dos jogos em sessionStorage

**Decision**: Adicionar campo `jogos` ao objeto de estado existente em `sessionStorage`:

```js
// Estado atual (feature 007)
{ alunos: [], avaliacoes: [], chamadas: [] }

// Novo estado
{ alunos: [], avaliacoes: [], chamadas: [], jogos: [] }
```

Cada jogo tem a estrutura:

```js
{
  id: "uuid",                          // gerado por crypto.randomUUID()
  data: "2026-04-20",                  // ISO date string (YYYY-MM-DD)
  nome: "vs. América",                 // nome do jogo (string livre)
  participacoes: [
    { alunoId: "uuid", minutos: 45 }   // minutos: inteiro ≥ 0, padrão 0
  ]
}
```

**Rationale**: Segue exatamente o padrão já estabelecido pelo projeto (`chamadas` usa a mesma estrutura com array embarcado). Consistente com o Princípio I (Simplicidade Funcional).

**Alternatives considered**: Objeto indexado por ID — rejeitado por dificultar a iteração e serialização. Array plano de participações com `jogoId` — rejeitado por duplicidade desnecessária e consultas mais complexas.

---

### 2. Menu de navegação com 3 itens

**Decision**: O menu fixo inferior passa de 2 para 3 itens, cada um ocupando `flex-1` (1/3 do espaço):

```
┌──────────────────────────────────────┐
│  👤 Alunos  |  📅 Treino  |  ⚽ Jogos │
└──────────────────────────────────────┘
```

Ícone proposto para "Jogos": campo de futebol ou bola — SVG inline consistente com os ícones já usados nas outras abas.

**Rationale**: Padrão `flex-1` já utilizado nos 2 itens existentes — adicionar um terceiro não requer mudança de estrutura, apenas incluir o novo `<a>` no `<nav>`. Largura de 375 px suporta 3 itens de ~125 px cada.

**Alternatives considered**: Hambúrguer para menu adicional — rejeitado por aumentar o número de toques (meta SC-004: 1 toque). Abas no topo — rejeitado por inconsistência com o padrão visual já estabelecido.

---

### 3. Seleção de alunos: painel flutuante vs modal

**Decision**: Usar um painel inline expansível dentro da própria `games.html`, oculto por padrão, revelado ao clicar "Adicionar Alunos":

```
┌──────────────────────────────────────┐
│ [Buscar por nome...]  [Categoria ▼]  │
│ ─────────────────────────────────    │
│ ☐ Lucas Silva    Sub 09              │
│ ☐ Pedro Henrique Sub 09              │
│ ☐ Ana Lima       Sub 10              │
│ ─────────────────────────────────    │
│      [Adicionar Selecionados]        │
└──────────────────────────────────────┘
```

**Rationale**: Um painel inline é mais simples de implementar em HTML puro (sem z-index complexo de modal) e mantém o contexto do formulário visível. Compatível com mobile-first.

**Alternatives considered**: Modal overlay com backdrop — rejeitado por complexidade extra (fechar ao clicar fora, foco management) desnecessária para um seletor simples. Página separada de seleção — rejeitado por aumentar o número de navegações.

---

### 4. Campo de minutagem

**Decision**: `<input type="number" min="0" max="120">` com valor padrão 0. Valores em branco salvos como 0. Sem bloqueio para valores > 120 (prorrogação possível; responsabilidade do professor).

**Rationale**: Simplicidade operacional (FR-008). Não travar o salvamento por minutagem "estranha" — professor pode ter motivos (prorrogação, jogo abandonado, etc.).

**Alternatives considered**: Slider de 0–90 — rejeitado por dificultar entrada rápida de valores precisos. Validação rígida > 120 — rejeitado por impedir registro de jogos com prorrogação.

---

### 5. Formulário de criação vs edição

**Decision**: Reutilizar o mesmo formulário para criação e edição. Ao clicar "Editar" em um jogo da lista, o formulário é exibido preenchido com os dados existentes. A distinção é feita por uma variável `jogoEditando` (null = novo, objeto = edição).

```js
let jogoEditando = null; // null = novo jogo; objeto Jogo = edição

function saveJogo(dados) {
  if (jogoEditando) {
    // atualizar existente
    Object.assign(jogoEditando, dados);
  } else {
    // criar novo
    state.jogos.push({ id: crypto.randomUUID(), ...dados });
  }
  saveState();
}
```

**Rationale**: Evita duplicação de template HTML. Padrão comum em SPA-like pages sem framework.

---

### 6. Ordem de exibição da lista de jogos

**Decision**: Ordenação por `data` decrescente (mais recente primeiro), usando `localeCompare` inverso:

```js
state.jogos.sort((a, b) => b.data.localeCompare(a.data));
```

**Rationale**: Professores consultam partidas recentes com mais frequência. Consistente com o comportamento do histórico de chamadas (feature 007) e do histórico de avaliações (feature 004).

---

### 7. Exclusão de aluno de um jogo

**Decision**: Ao editar um jogo, cada participação exibe um botão "×" que remove o aluno da lista `participacoes` do formulário (sem salvar imediatamente). A remoção só é persistida ao clicar "Salvar".

**Rationale**: Permite desfazer remoções acidentais antes do salvamento. Consistente com o padrão "save explícito" já usado em toda a aplicação.

---

## Conclusão

Sem NEEDS CLARIFICATION. Todos os padrões derivam do código existente (features 004–007) ou de boas práticas de HTML/JS puro. Nenhuma dependência nova além do Tailwind e `imperial.css` já presentes.
