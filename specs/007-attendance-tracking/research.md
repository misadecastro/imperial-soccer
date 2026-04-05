# Research: Chamada de Treino

**Branch**: `007-attendance-tracking` | **Date**: 2026-04-05

## Decisões de Design

### 1. Estrutura de dados das chamadas em sessionStorage

**Decision**: Adicionar campo `chamadas` ao objeto de estado existente em `sessionStorage`:

```js
// Estado atual
{ alunos: [], avaliacoes: [] }

// Novo estado
{ alunos: [], avaliacoes: [], chamadas: [] }
```

Cada chamada tem a estrutura:

```js
{
  id: "uuid",                          // gerado por crypto.randomUUID()
  data: "2026-04-05",                  // ISO date string (YYYY-MM-DD)
  categoria: "Sub09",                   // chave da categoria
  registros: [
    { alunoId: "uuid", status: "presente" | "falta" | "pendente" }
  ]
}
```

**Rationale**: Segue exatamente o padrão já estabelecido pelo projeto (`avaliacoes` usa a mesma estrutura referenciando `alunoId`). Consistente com o Princípio I (Simplicidade Funcional).

**Alternatives considered**: Array plano com um registro por aluno — rejeitado por dificultar a consulta "todas as chamadas de uma data+categoria". Objeto indexado por "data_categoria" — rejeitado por complexidade desnecessária de serialização.

---

### 2. Chave única para chamada

**Decision**: A combinação `data + categoria` identifica univocamente uma chamada. Ao salvar, o sistema verifica se já existe uma chamada para essa combinação e atualiza; caso contrário, insere.

```js
function findChamada(data, categoria) {
  return state.chamadas.find(c => c.data === data && c.categoria === categoria);
}
```

**Rationale**: Requisito FR-008 (carregar chamada existente ao reabrir a mesma data/categoria). Simples e sem ID composto.

---

### 3. Categorias disponíveis

**Decision**: Usar as mesmas categorias já existentes no projeto:

```js
const CATEGORIAS = ['Sub09', 'Sub10', 'Sub11', 'Sub12', 'Sub13', 'Sub14'];
const CATEGORIAS_LABELS = {
  Sub09: 'Sub 09', Sub10: 'Sub 10', Sub11: 'Sub 11',
  Sub12: 'Sub 12', Sub13: 'Sub 13', Sub14: 'Sub 14',
};
```

**Rationale**: Consistência com `students.html`. Não criar nova fonte de verdade para categorias.

---

### 4. Layout da página `training.html`

**Decision**: Baseado na imagem `Novo-Design/Pagina-Exemplo.png`, o layout é:

```
┌─────────────────────────────────────┐
│ HEADER VERDE: logo + "Chamada do    │
│ Treino"                             │
├─────────────────────────────────────┤
│ Data do treino: [input date]        │
├─────────────────────────────────────┤
│ [Sub07] [Sub08] [Sub09] [Sub10] ··· │  ← abas horizontais roláveis
├─────────────────────────────────────┤
│ Sub 09 — N alunos   [Todos pres.]   │
│          [N Pres.] [N Falt.] [N Pen.]│
├─────────────────────────────────────┤
│ ● Lucas Silva              [Pres.][Falta] │
│ ● Pedro Henrique           [Pres.][Falta] │
│ ···                                  │
├─────────────────────────────────────┤
│       [  SALVAR PRESENÇA  ]         │  ← botão fixo no rodapé
└─────────────────────────────────────┘
```

**Rationale**: Cópia fiel da imagem de referência. Usa os tokens de design já definidos em `imperial.css` e no `tailwind.config` da feature 006.

---

### 5. Menu de navegação

**Decision**: Barra de navegação inferior fixo com dois ícones + label:

```
┌──────────────────────────┐
│  🏠 Alunos  |  📅 Treino │  ← fixo no fundo, visível em todas as páginas
└──────────────────────────┘
```

Implementação: `<nav>` com `position: fixed; bottom: 0` em cada página. Item ativo com `text-imperial-green font-bold`; inativo com `text-imperial-text-muted`.

**Rationale**: Padrão mobile-first (bottom navigation bar). Elimina a necessidade de botão "Voltar" para navegação entre as seções principais.

**Note**: `login.html` e `index.html` **não recebem** o menu (são telas de pré-autenticação). O menu aparece em `students.html`, `student-eval.html` e `training.html`.

---

### 6. Botão Salvar — posição fixa

**Decision**: O botão "Salvar Presença" fica em `position: fixed; bottom: 64px` (logo acima da barra de navegação de 64px de altura).

**Rationale**: Segue a imagem de referência. Sempre acessível sem scroll, mesmo com listas longas.

---

### 7. Estado dos botões Presente / Falta

| Estado | Classes |
|---|---|
| Pendente (default) | `border border-imperial-border text-imperial-text-muted bg-imperial-card` |
| Presente ativo | `border border-imperial-green-mid bg-imperial-green-light text-imperial-green-mid font-semibold` |
| Falta ativa | `border border-imperial-red bg-imperial-red-light text-imperial-red font-semibold` |

Transição via classe `btn-attendance` (já definida em `imperial.css`).

---

## Conclusão

Sem NEEDS CLARIFICATION. Todos os padrões derivam do código existente ou da imagem de referência. Implementação é HTML + JS puro — zero risco de regressão de dependências.
