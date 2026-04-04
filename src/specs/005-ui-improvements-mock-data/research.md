# Research: Melhorias de UI, Dados Mocados e Fluxo de Acesso

**Feature**: 005-ui-improvements-mock-data  
**Date**: 2026-04-04

---

## 1. Toggle do Formulário de Nova Avaliação

**Decision**: Ocultar a `<section>` do formulário via classe `hidden` por padrão. O botão "Nova Avaliação" remove a classe `hidden`. Os handlers de salvar e cancelar re-adicionam a classe.

**Rationale**: Abordagem mais simples possível sem JS adicional. Consistente com o padrão já usado para o formulário de cadastro em `students.html` (`toggleCadastro`/`fecharCadastro`).

**Alternatives considered**:
- Animação CSS (height: 0 → auto): adiciona complexidade sem valor funcional relevante no contexto MVP.
- Remover/reinserir DOM: mais custoso e perde estado do formulário parcialmente preenchido.

---

## 2. Ordenação e Paginação Client-Side

**Decision**: Inverter a ordenação existente em `getAvaliacoesDoAluno()` para DESC (mais recente primeiro). Implementar estado de paginação com variável `paginaAtual` (number, começa em 0). A função `renderListaAvaliacoes()` recebe ou acessa `paginaAtual` e fatia o array: `avaliacoes.slice(paginaAtual * 10, (paginaAtual + 1) * 10)`.

**Rationale**: Paginação client-side é trivial com arrays JS. Não requer biblioteca externa. Página de tamanho fixo 10 conforme spec.

**Controles de paginação**: Botões "← Anterior" e "Próximo →" + texto "Página X de Y". Botão desabilitado quando na primeira/última página.

**Reset de paginação**: `paginaAtual = 0` é chamado antes de cada mutação (add, edit, delete) para retornar à primeira página, conforme FR-007.

**Alternatives considered**:
- Scroll infinito (IntersectionObserver): mais complexo, comportamento menos previsível para professores que querem navegar por data.

---

## 3. Botão Voltar no Rodapé da Lista

**Decision**: Adicionar um `<button>` com o mesmo comportamento do botão "Voltar" do header (`saveState()` + `window.location.href = 'students.html'`) imediatamente após o `<div id="listaAvaliacoes">` e os controles de paginação.

**Rationale**: Reusa lógica existente. Posicionamento após a paginação garante que está sempre visível após o final da lista independente do número de registros.

---

## 4. Dados Mocados

**Decision**: Função `generateMockData()` em `students.html` que cria ~40 alunos com avaliações. Chamada na inicialização somente se `state.alunos.length === 0`. Salva o estado gerado via `saveState()`.

**Nomes brasileiros**: Array de ~60 primeiros nomes e ~40 sobrenomes fictícios combinados aleatoriamente.

**Categorias**: Distribuição uniforme entre Sub09 e Sub14 (≈7 alunos por categoria).

**Avaliações por aluno**: Entre 5 e 15 avaliações, datas aleatórias entre 2025-01-01 e 2026-04-04. Sem duplicação de datas por aluno (garantida por Set de datas já usadas).

**Pontuações**: Valor aleatório entre 2 e 5 (inteiro) para cada aspecto, conforme escala existente.

**Rationale**: Dados mocados inline (sem fetch) são compatíveis com o constraint "sem build step". Gerados programaticamente para evitar JSON extenso inline.

**Alternatives considered**:
- Arquivo JSON separado com fetch: requer servidor local (não funciona com `file://`).
- Dados hardcoded: mais difícil de manter; array enorme no código.

---

## 5. Fluxo de Login → students.html

**Decision**: Adicionar `<script>` na `login.html` que intercepta o submit do formulário com `e.preventDefault()` e faz `window.location.href = 'students.html'`.

**Rationale**: Abordagem mais simples. Sem validação de credenciais (MVP). O `action="#"` atual já previne submit real.

**Alternatives considered**:
- Adicionar `onclick` inline no botão: mistura JS no HTML, menos limpo.
- Usar `<a href="students.html">` no lugar do botão: quebra a semântica de formulário.
