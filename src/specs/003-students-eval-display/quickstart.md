# Quickstart: Students Listing — Evaluation Display & Registration Toggle

**Feature**: `003-students-eval-display`  
**Date**: 2026-04-04

---

## Pré-requisitos

- Navegador moderno (Chrome/Firefox/Edge/Safari 2023+)
- Nenhuma instalação necessária — sem build step

---

## Testando a feature

1. Abrir `frontend/pages/students.html` diretamente no navegador (ou via servidor local).

2. **Verificar toggle do formulário:**
   - A seção de cadastro deve estar **oculta** no carregamento inicial.
   - Clicar no botão **"Novo Aluno"** → seção de cadastro aparece.
   - Clicar novamente no botão → seção se oculta.

3. **Cadastrar um aluno de teste:**
   - Clicar "Novo Aluno", preencher nome, data de nascimento e categoria.
   - Submeter → aluno aparece na listagem; formulário se oculta automaticamente.

4. **Verificar card sem avaliação:**
   - O card do aluno recém-cadastrado deve exibir os três ícones (Técnico, Tático, Mental) em estado inativo ("–").

5. **Registrar uma avaliação:**
   - Clicar no botão **"Avaliar"** do aluno → modal abre.
   - Selecionar notas para os três aspectos e confirmar.

6. **Verificar card com avaliação:**
   - O card deve exibir os três ícones com as notas selecionadas (valores 2–5).
   - O badge "✓ Avaliado" (ou substituto) deve refletir a avaliação.

7. **Verificar múltiplas avaliações:**
   - Avaliar o mesmo aluno novamente com notas diferentes.
   - O card deve exibir apenas os valores da **última** avaliação.

---

## Arquivos modificados

| Arquivo | Tipo de mudança |
|---------|-----------------|
| `frontend/pages/students.html` | HTML: ocultar section, adicionar botão; JS: atualizar `renderAlunos()` |

---

## Notas de implementação

- A função `renderAlunos()` deve ser atualizada para incluir os chips de avaliação no HTML de cada card.
- O botão "Novo Aluno" deve ser inserido no cabeçalho da seção "Alunos Cadastrados" (ao lado do `<h2>`).
- A section `#formCadastro` (ou sua `<section>` pai) recebe a classe `hidden` no HTML e é toggled via JS.
- Após submit bem-sucedido no `formCadastro`, chamar `fecharCadastro()` para ocultar o formulário.
