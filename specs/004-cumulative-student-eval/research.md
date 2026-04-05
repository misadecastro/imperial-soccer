# Research: Avaliação Acumulativa do Aluno com Histórico e Gráfico

**Feature**: 004-cumulative-student-eval  
**Date**: 2026-04-04

---

## 1. Compartilhamento de Estado entre Páginas (sem backend)

**Decision**: Usar `sessionStorage` para serializar e compartilhar `state.avaliacoes` entre `students.html` e `student-eval.html`.

**Rationale**: O projeto é frontend-only in-memory. Navegação entre páginas HTML reseta o `window`-scope. `sessionStorage` persiste durante a sessão da aba (fechada a aba, dados perdidos — comportamento idêntico ao atual). `localStorage` foi descartado pois implicaria persistência entre sessões, mudando o contrato atual ("dados perdidos ao recarregar").

**Alternatives considered**:
- `localStorage`: persistiria entre sessões — mudança de comportamento não especificada.
- URL params: inadequado para arrays de objetos.
- BroadcastChannel: desnecessariamente complexo para navegação simples.

**Implementation pattern**:
- `students.html`: ao navegar para `student-eval.html`, grava `state` em `sessionStorage` via `JSON.stringify`.
- `student-eval.html`: ao carregar, lê e parseia `state` de `sessionStorage`; ao sair (botão Voltar), grava o estado atualizado de volta.
- ID do aluno é passado via URL query param: `student-eval.html?alunoId=<uuid>`.

---

## 2. Biblioteca de Gráfico: Chart.js v4

**Decision**: Chart.js v4 via CDN (`https://cdn.jsdelivr.net/npm/chart.js`).

**Rationale**: 
- Zero build step — carrega via `<script>` tag no HTML.
- API simples para gráficos de linha com múltiplas séries (datasets).
- Altamente documentada, amplamente usada, sem dependências adicionais.
- Compatível com o padrão de "sem frameworks" do projeto.

**Alternatives considered**:
- D3.js: poderoso mas complexo demais para um gráfico de linha simples.
- uPlot: mais leve mas menos documentado para iniciantes.
- SVG manual: viável mas exige código significativo para eixos, escala, tooltips.

**Usage pattern**:
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```
```js
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['01/01/2026', '15/01/2026'],
    datasets: [
      { label: 'Tático',   data: [4, 5], borderColor: '#facc15', ... },
      { label: 'Técnico',  data: [3, 4], borderColor: '#4ade80', ... },
      { label: 'Mental',   data: [5, 5], borderColor: '#60a5fa', ... },
    ]
  },
  options: { responsive: true, scales: { y: { min: 0, max: 5 } } }
});
```

---

## 3. Escala de Pontuação

**Decision**: Manter a escala 2–5 existente (Excelente=5, Bom=4, Regular=3, Precisa Melhorar=2).

**Rationale**: A spec menciona pontuação sem especificar escala. O código atual já usa 2–5 com labels descritivos. Alterar para 0–10 quebraria semântica existente e exigiria migração. A spec foi escrita assumindo 0–10, mas como a implementação MVP existente usa 2–5 de forma consistente, manter é a escolha de menor atrito.

**Spec assumption override**: A assumption "escala 0–10" da spec é substituída pela realidade do código: escala 2–5. Isso deve ser comunicado no plano de tarefas.

---

## 4. Navegação: Nova Página vs. Modal

**Decision**: Nova página `student-eval.html` com query param `?alunoId=<uuid>`.

**Rationale**: A spec explicitamente pede "o professor será levado para tela de avaliação". Modal foi descartado pela complexidade de exibir lista + formulário + gráfico dentro de um modal. Página dedicada entrega experiência melhor e é mais alinhada ao princípio II (professor como ator central — fluxo limpo e focado).

**Alternatives considered**:
- Modal expandido: complexo, scroll difícil em mobile.
- SPA dinâmica (show/hide sections): mais complexo, sem benefício claro dado que já existe padrão de páginas separadas.

---

## 5. Formulário de Nova Avaliação

**Decision**: Formulário inline no topo (ou abaixo do gráfico) da `student-eval.html`, com campo `<input type="date">` para data e os mesmos radio-groups de nota (Tático, Técnico, Mental) já existentes em `students.html`.

**Rationale**: Reutilizar o padrão visual dos radio-groups mantém consistência com a UI existente. Campo de data é necessário pois avaliações são acumulativas com datas distintas.

---

## 6. Edição Inline vs. Modal de Edição

**Decision**: Edição inline — ao clicar em "Editar", a linha do registro se transforma em campos editáveis (data + scores); botões "Salvar" e "Cancelar" aparecem na mesma linha.

**Rationale**: Mais simples de implementar sem abrir um segundo modal. Mantém o contexto visual do registro. Alinhado ao princípio I (simplicidade funcional).

**Alternatives considered**:
- Modal de edição separado: adiciona uma camada extra de UI sem necessidade.
