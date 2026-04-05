# Research: Redesign da Aplicação

**Branch**: `006-app-redesign` | **Date**: 2026-04-05

## Análise da Referência Visual

### Fonte primária: `Novo-Design/Pagina-Exemplo.png`

A imagem mostra a tela de "Chamada do Treino" em layout mobile. Análise pixel-level das cores:

| Elemento | Cor observada | Token proposto |
|---|---|---|
| Fundo do cabeçalho | Verde escuro sólido (~#2a7a3d) | `--imperial-header: #2a7a3d` |
| Fundo da página | Cinza esverdeado muito claro (~#f0f4f1) | `--imperial-bg: #f0f4f1` |
| Cartão de aluno | Branco (#ffffff) com sombra leve | `--imperial-card: #ffffff` |
| Aba ativa | Verde médio (~#2a7a3d) com texto branco | (igual ao header) |
| Aba inativa | Branco/cinza claro com texto escuro | `#ffffff` / `#374151` |
| Avatar aluno | Cores variadas por posição na lista | Ver paleta de avatars |
| Botão "Presente" ativo | Verde claro com contorno verde | `#16a34a` |
| Botão "Falta" ativo | Vermelho claro com contorno vermelho | `#dc2626` |
| Botão "Salvar Presença" | Verde sólido, largura total | `#2a7a3d` |
| Contadores resumo | Números destacados em preto/verde/vermelho | ver tokens abaixo |
| Texto principal | Preto/cinza escuro (#111827) | `--imperial-text: #111827` |

### Fonte secundária: `Novo-Design/App.css`

O arquivo CSS fornecido é o padrão Vite/React (`#root`, `.logo`, `.card`, `.read-the-docs`). **Não é CSS específico do redesign** — foi incluído como referência de estrutura de arquivo e indicação da intenção de "novo CSS". Os tokens e classes reais devem ser derivados da imagem.

**Decisão**: ignorar o conteúdo literal do `App.css` como guia de implementação; usar apenas a imagem `Pagina-Exemplo.png` como especificação visual.

---

## Decisões de Design

### 1. Mudança de tema: escuro → claro/mobile

**Decision**: Substituir o tema escuro (`bg-imperial-dark: #0f172a`) por tema claro com acentuação verde, conforme a imagem.

**Rationale**: O design de referência é claramente voltado para uso em campo (celular ao sol), onde fundos claros têm melhor legibilidade. Alinha-se ao Princípio II da Constituição (Professor como Ator Central).

**Alternatives considered**: Manter tema escuro com ajustes menores — rejeitado porque a imagem referência é inequivocamente um tema claro.

---

### 2. Nova paleta de tokens Tailwind

**Decision**: Atualizar o `tailwind.config` em todos os HTMLs para a seguinte paleta:

```js
colors: {
  imperial: {
    green:       '#2a7a3d',   // header, aba ativa, btn salvar
    'green-mid': '#16a34a',   // btn presente, contorno verde
    'green-light': '#dcfce7', // fundo btn presente (estado ativo)
    red:         '#dc2626',   // btn falta
    'red-light': '#fee2e2',   // fundo btn falta (estado ativo)
    bg:          '#f0f4f1',   // fundo geral da página
    card:        '#ffffff',   // cartão de aluno
    text:        '#111827',   // texto principal
    'text-muted':'#6b7280',   // texto secundário (data, subtítulo)
    border:      '#e5e7eb',   // bordas de card e separadores
  }
}
```

**Rationale**: Mantém o namespace `imperial` existente (sem quebrar referências no JS que possam ler classes CSS) e adiciona os novos tokens. Tokens antigos (`dark`, `dark-2`) serão removidos pois não se aplicam ao novo tema.

**Alternatives considered**: CSS Variables puras sem Tailwind — rejeitado para manter consistência com o padrão do projeto.

---

### 3. Arquivo CSS compartilhado `imperial.css`

**Decision**: Criar `src/frontend/css/imperial.css` com estilos que o Tailwind CDN não suporta:

- Paleta de cores para avatars (rotação entre 8 cores)
- Scrollbar invisível para abas horizontais (`::-webkit-scrollbar`)
- Transição suave para botões de presença/falta

**Rationale**: Tailwind via CDN não permite `@layer components` personalizado em runtime. Estilos repetitivos (avatar colors) ficam mais limpos em CSS puro.

**Alternatives considered**: Classes Tailwind inline para cada avatar — rejeitado por verbosidade; estilos inline via JS — rejeitado por misturar preocupações.

---

### 4. Estrutura do cabeçalho

**Decision**: Cabeçalho fixo verde com logo SVG (bola de futebol já existente) à esquerda e título "Chamada do Treino" (ou título da página) em branco. Sub-título em branco semi-transparente abaixo do título.

**Rationale**: Corresponde exatamente ao que a imagem mostra.

---

### 5. Abas de categoria (turmas)

**Decision**: `<div>` com `overflow-x: auto; display: flex; scrollbar-width: none` contendo botões `<button>` estilizados. Aba ativa: `bg-imperial-green text-white`. Inativa: `bg-white text-imperial-text border`.

**Rationale**: Solução simples, sem JS extra além do que já existe para filtrar turmas.

---

### 6. Cartão de aluno

**Decision**: `<div class="bg-white rounded-xl shadow-sm flex items-center gap-3 px-4 py-3 border border-imperial-border">` com:
- Avatar circular 40 px com inicial e cor de fundo rotativa
- Nome do aluno
- Botões "Presente" / "Falta" à direita

**Rationale**: Corresponde à estrutura visual da imagem. Simples e sem novos componentes JS.

---

### 7. Paleta de avatars

**Decision**: 8 cores de fundo para avatars, atribuídas por `index % 8`:

```js
const avatarColors = [
  '#16a34a', // verde
  '#f97316', // laranja
  '#ec4899', // rosa
  '#8b5cf6', // violeta
  '#06b6d4', // ciano
  '#eab308', // amarelo
  '#ef4444', // vermelho
  '#6366f1', // índigo
]
```

**Rationale**: Consistente com a variedade de cores observadas na imagem de referência.

---

### 8. Páginas fora da chamada (index, login, student-eval)

**Decision**: Aplicar o mesmo sistema de tokens (header verde, fundo claro, cartões brancos). Adaptar cada página individualmente, preservando a estrutura HTML e lógica JS.

- **index.html**: remover hero escuro; usar fundo claro com card centralizado (similar ao login)
- **login.html**: já tem estrutura de card centralizado; adaptar cores
- **students.html**: lista de alunos em cards brancos sobre fundo cinza claro
- **student-eval.html**: manter Chart.js; adaptar cores do gráfico para o novo tema

**Rationale**: Consistência visual entre todas as páginas (FR-009).

---

## Conclusão

Todos os NEEDS CLARIFICATION resolvidos. Nenhuma dependência nova necessária. Implementação é puramente CSS/HTML — zero risco de regressão de comportamento.
