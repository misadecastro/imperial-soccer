# Quickstart: Especificações do Treino

**Branch**: `009-training-drill-specs` | **Date**: 2026-04-20

## Pré-requisitos

1. Abrir `src/frontend/index.html` no navegador (ou `login.html`)
2. Fazer login como professor (qualquer credencial aceita no mock)
3. Navegar para a tela de Treino via menu inferior

## Fluxo de Validação — 18 passos

### Setup

1. Na tela de Treino, confirmar que a data está preenchida (hoje) e uma categoria está selecionada (ex.: Sub 09)

### Collapsible da Chamada

2. Observar que a seção de chamada possui um cabeçalho clicável com título "Chamada" e um ícone chevron
3. Clicar no cabeçalho da chamada → a lista de alunos e controles (Todos Presentes/Ausentes) devem ser recolhidos
4. Verificar que o chevron mudou de direção, indicando estado recolhido
5. Clicar novamente no cabeçalho → a chamada se expande com todos os dados preservados
6. Marcar 2 alunos como "Presente" para uso posterior na validação de salvamento

### Momentos do Jogo

7. Abaixo da chamada (recolha-a para facilitar), observar a seção "Momento do Jogo"
8. Verificar que 4 cards são exibidos em grid 2×2: Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva
9. Cada card deve ter ícone, nome abreviado e descrição curta
10. Clicar em "Org. Ofensiva" → o card deve ser destacado com borda verde e fundo diferenciado
11. Clicar em "Trans. Defensiva" → ambos os cards devem estar selecionados simultaneamente (multi-select)
12. Clicar novamente em "Org. Ofensiva" → apenas "Trans. Defensiva" permanece selecionado (toggle off)

### Princípios e Fundamentos

13. Abaixo dos momentos, observar a seção "Princípios e fundamentos trabalhados" com contador "0 selecionado(s)"
14. Verificar 3 grupos: "Princípios Táticos Defensivos" (5 chips), "Princípios Táticos Ofensivos" (6 chips), "Fundamentos Técnicos" (7 chips)
15. Clicar no chip "Contenção" → chip destacado, contador atualiza para "1 selecionado(s)"
16. Clicar em "Passe" e "Mobilidade" → contador atualiza para "3 selecionado(s)"
17. Clicar novamente em "Contenção" → chip volta ao normal, contador volta para "2 selecionado(s)"

### Salvamento

18. Clicar em "Salvar Treino" → toast de sucesso "Treino salvo com sucesso!"; ao trocar de categoria e voltar para Sub 09, os momentos e princípios previamente selecionados devem estar restaurados

## Resultado Esperado

- Chamada recolhível funciona com 1 toque
- 4 momentos selecionáveis em grid 2×2
- 18 chips de princípios/fundamentos organizados em 3 grupos
- Contador de selecionados atualiza em tempo real
- Salvamento único persiste chamada + especificações
- Dados restaurados ao revisitar mesma data + categoria
- Zero regressões na funcionalidade de chamada existente
