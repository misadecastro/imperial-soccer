# Research: Students Listing — Evaluation Display & Registration Toggle

**Feature**: `003-students-eval-display`  
**Date**: 2026-04-04

---

## Tema 1: Ícones SVG inline para os aspectos Técnico, Tático e Mental

**Decision**: Usar ícones SVG inline minimalistas dentro dos cards — bola de futebol para Técnico, campo/tática (losango) para Tático, cabeça/cérebro para Mental.

**Rationale**: O projeto já usa SVG inline no header (logo da bola). Não há dependência de biblioteca de ícones. SVG inline permite controle total de cor via Tailwind (`currentColor`), mantém zero dependências e funciona offline.

**Alternatives considered**:
- Emoji Unicode (⚽ 🧠 🗺️) — simples mas sem controle de cor/tamanho consistente entre SOs.
- Heroicons via CDN — evitado para manter zero dependências externas além do Tailwind CDN.
- Letras/abreviações (T, Tat, M) — funcional mas menos legível visualmente para o professor.

---

## Tema 2: Estratégia de toggle para a seção de cadastro

**Decision**: Ocultar a `<section aria-labelledby="tituloCadastro">` com a classe Tailwind `hidden` por padrão. Um botão "Novo Aluno" (posicionado no cabeçalho da seção "Alunos Cadastrados") chama `toggleCadastro()`. Após submit bem-sucedido, `fecharCadastro()` reaplica `hidden`.

**Rationale**: `hidden` (equivale a `display: none`) é a abordagem mais simples e semântica no Tailwind, sem necessidade de CSS customizado. É reversível e não afeta o estado do formulário (campos preservados se o professor ocultar sem submeter — ou limpos após submit, como já acontece).

**Alternatives considered**:
- `classList.toggle('hidden')` no botão — simples, adotado.
- Animação de slide/fade — descartado por adicionar complexidade sem valor funcional relevante para o professor em campo.
- Remover/reinserir o DOM — desnecessário e destrutivo ao estado do form.

---

## Tema 3: Layout dos indicadores de avaliação no card

**Decision**: Adicionar uma linha inferior no card com três "chips" lado a lado — cada chip contém: ícone SVG (16×16) + rótulo curto (Téc / Tát / Ment) + nota numérica. Quando sem avaliação: chip com cor acinzentada e "–" no lugar da nota.

**Rationale**: Layout compacto que cabe em mobile sem quebrar o grid flex existente. Reutiliza a mesma linguagem visual dos badges já presentes (pill com cor de fundo transparente + borda). Não exige refactor da função `renderAlunos()` além de substituir o bloco do badge "✓ Avaliado".

**Alternatives considered**:
- Barras de progresso (1–5 mapeadas em %) — visual mais rico mas complexo e sem valor adicional para leitura rápida.
- Ícones com tooltip ao hover — descartado: professor pode usar touch/mobile onde hover não é confiável.
- Linha separada abaixo do card — mantido como segunda linha dentro do mesmo card para não aumentar altura excessivamente.

---

## Resolução de Unknowns

| Unknown | Resolução |
|---------|-----------|
| Ícone para "Técnico" | SVG bola de futebol (círculo com pentagrama simplificado) |
| Ícone para "Tático" | SVG losango/campo (4 linhas em X representando marcação tática) |
| Ícone para "Mental" | SVG cabeça com engrenagem ou cérebro simplificado |
| Escala exibida | Valor numérico direto (2–5), não percentual |
| Posição do botão "Novo Aluno" | À direita do `<h2>` "Alunos Cadastrados", usando `flex justify-between` |
| Ocultar form após cancelar | Não especificado — não há botão cancelar no form atual; comportamento mantido: oculta apenas após submit bem-sucedido ou novo clique no toggle |
