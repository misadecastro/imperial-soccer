# Quickstart: Listagem e CRUD de Treinos com Filtro de Fundamentos

**Branch**: `010-training-crud-list` | **Date**: 2026-04-20

## Pré-requisitos

1. Abrir `src/frontend/index.html` no navegador
2. Fazer login como professor
3. Navegar para a tela de Treino via menu inferior

## Fluxo de Validação — 22 passos

### Lista de Treinos

1. Na tela de Treino, confirmar que a lista de treinos é exibida (pode estar vazia com mensagem "Nenhum treino registrado ainda.")
2. Verificar que o botão "Novo Treino" está visível no topo

### Criar Primeiro Treino

3. Clicar em "Novo Treino" → formulário é exibido com campos de data e categoria
4. Selecionar data de hoje e categoria "Sub 09"
5. Observar que a seção de chamada (accordion) está disponível com os alunos da categoria
6. Marcar 3 alunos como "Presente"

### Filtro de Princípios por Momento

7. Na seção de especificações, observar "Momento do jogo" com 4 cards
8. Observar que na seção de princípios, apenas "Fundamentos Técnicos" é visível (nenhum momento selecionado)
9. Selecionar "Org. Ofensiva" → verificar que "Princípios Táticos Ofensivos" aparece; "Defensivos" continua oculto
10. Selecionar "Org. Defensiva" → verificar que agora AMBOS os grupos de princípios táticos são visíveis
11. Selecionar chips: "Penetração" (ofensivo) e "Contenção" (defensivo) e "Passe" (técnico)
12. Desmarcar "Org. Defensiva" → verificar que "Princípios Táticos Defensivos" desaparece e "Contenção" é automaticamente desmarcada; contador atualiza para 2

### Salvar e Verificar Lista

13. Clicar "Salvar Treino" → toast de sucesso
14. Verificar que a lista exibe o treino recém-criado com: data de hoje, "Sub 09", "3 presentes", chips "Penetração" e "Passe"

### Criar Segundo Treino

15. Clicar "Novo Treino", selecionar data de ontem e categoria "Sub 10", salvar sem especificações
16. Verificar que a lista agora tem 2 treinos, com o de hoje primeiro (ordem decrescente)

### Editar Treino

17. Clicar "Editar" no primeiro treino → formulário pré-preenchido com data de hoje, Sub 09, chamada e especificações
18. Verificar que "Org. Ofensiva" está selecionado, "Penetração" e "Passe" estão marcados
19. Adicionar "Mobilidade" aos princípios, salvar → lista atualizada com 3 chips

### Excluir Treino

20. Clicar "Excluir" no segundo treino → diálogo de confirmação
21. Confirmar → treino removido, lista agora tem 1 treino, toast de exclusão exibido

### Validação Final

22. Verificar zero regressões: menu de navegação funcional em todas as páginas, filtro de princípios responsivo a 375px

## Resultado Esperado

- Lista de treinos com data, categoria, presentes e princípios
- CRUD completo funcional (criar, editar, excluir)
- Filtro de princípios reage instantaneamente aos momentos selecionados
- Auto-desmarcação de princípios quando grupo é oculto
- Fundamentos Técnicos sempre visíveis
- Backward-compat: treinos antigos (feature 009) aparecem na lista
