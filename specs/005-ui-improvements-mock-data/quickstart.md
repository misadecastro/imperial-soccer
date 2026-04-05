# Quickstart: Melhorias de UI, Dados Mocados e Fluxo de Acesso

**Feature**: 005-ui-improvements-mock-data  
**Date**: 2026-04-04

---

## Arquivos Modificados

| Arquivo | Mudanças |
|---------|----------|
| `frontend/pages/login.html` | Script de submit → redirect para `students.html` |
| `frontend/pages/students.html` | Função `generateMockData()` chamada na boot se `state.alunos.length === 0` |
| `frontend/pages/student-eval.html` | Toggle formulário, ordenação DESC, paginação, botão Voltar no rodapé |

---

## Roteiro de Validação Manual

### 1. Fluxo de Login
- Abrir `frontend/pages/login.html`
- Clicar em "Entrar" (com ou sem preencher campos)
- Confirmar redirecionamento para `students.html`

### 2. Dados Mocados
- Abrir `students.html` em aba anônima (sem sessionStorage)
- Confirmar ~40 alunos na lista
- Confirmar distribuição entre categorias Sub09–Sub14
- Acessar a tela de avaliação de qualquer aluno → confirmar múltiplas avaliações com datas entre jan/2025 e abr/2026

### 3. Toggle do Formulário
- Na tela de avaliação de qualquer aluno, confirmar que o formulário está oculto
- Clicar em "Nova Avaliação" → formulário aparece
- Clicar em "Cancelar" → formulário oculta
- Clicar em "Nova Avaliação" novamente, preencher e salvar → formulário oculta após sucesso

### 4. Paginação e Ordenação
- Acessar a tela de avaliação de um aluno que possui mais de 10 avaliações
- Confirmar que as avaliações mais recentes aparecem no topo (1ª página)
- Confirmar que controles "Anterior" / "Próxima" / "Página X de Y" estão visíveis
- Navegar para a última página e confirmar que "Próxima" está desabilitada
- Retornar à 1ª página e confirmar que "Anterior" está desabilitada

### 5. Botão Voltar no Rodapé
- Rolar até o final da lista de avaliações
- Confirmar que há um botão "Voltar" visível abaixo da paginação
- Clicar → confirmar retorno para `students.html` com dados preservados

---

## Comportamentos Esperados

- Dados mocados são carregados **apenas uma vez** por sessão do browser
- Recarregar a página **não** regenera os dados (usa os do `sessionStorage`)
- Abrir em aba anônima **regenera** os dados mocados
- A paginação retorna à página 1 após qualquer add/edit/delete de avaliação
