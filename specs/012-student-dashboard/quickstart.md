# Quickstart — Dashboard do Aluno (012)

**Branch**: `012-student-dashboard`
**Date**: 2026-05-03
**Spec**: [spec.md](spec.md) | **Plan**: [plan.md](plan.md)

## Objetivo

Validar manualmente, em DevTools, todas as User Stories e Edge Cases da feature antes de fechá-la. Roteiro de ~25 passos cobrindo abas, filtros, seleção, gráficos, edge cases e responsividade.

## Pré-requisitos

- Branch `012-student-dashboard` checada.
- `src/frontend/pages/dashboard.html` implementado (substituiu `dashboard-treinos.html`).
- Nav inferior atualizado em `students.html`, `training.html`, `games.html`.
- Browser moderno (Chrome/Edge/Firefox).
- DevTools aberto; aba Application → Storage → sessionStorage limpa entre testes que exigem estado vazio.

## Setup mínimo de dados (para validar fluxos populados)

> Reproduzir cenários ricos requer cadastrar dados pelas telas existentes (Clarification 2026-05-03 — sem mocks dedicados na aba Alunos).

1. Abrir `index.html` → Login → seguir para `students.html`.
2. **Cadastrar alunos** em ao menos 2 categorias (ex.: 4 alunos em Sub09, 3 em Sub10):
   - Sub09: "Lucas Silva", "Pedro Henrique", "Gabriel Sermos", "Matheus Oliveira"
   - Sub10: "João Vitor", "Rafael Bastos", "Bernardo Lima"
3. Ir para `training.html` → criar 4–6 chamadas para Sub09 (datas distintas, momentos variados, princípios/fundamentos variados); marcar "Lucas Silva" como **presente** em 4 delas e **falta** em 1; deixar "Pedro Henrique" presente em todas.
4. Criar 1–2 chamadas para Sub10 sem incluir nenhum aluno como presente (todos pendentes ou falta).
5. Ir para `games.html` → criar 2 jogos com datas distintas, ambos com participação de "Lucas Silva" (minutos 30 e 28); criar 1 jogo só com alunos do Sub10 (Lucas não participa).

> **Nota**: este setup é apenas para os passos populados. Os passos de **estado vazio** abaixo exigem `sessionStorage` limpo.

## Roteiro de Validação

### A. Toggle Treinos/Alunos (US1 — Acceptance Scenarios 1, 2)

1. Acessar `dashboard.html` (via nav inferior em qualquer página). **Esperado**: header global "Dashboard"; logo abaixo, dois botões pill "Treinos" e "Alunos" com **Treinos ativo** (verde sólido); seção Treinos visível com seu seletor de categoria, 4 cards e gráficos da feature 011 — sem regressão visível.
2. Clicar no botão "Alunos". **Esperado**: o conteúdo da aba Treinos esconde-se; a aba Alunos aparece com seletor de categoria, campo de busca e lista de alunos da categoria default. Botão "Alunos" agora ativo, "Treinos" inativo. **Sem reload** (o ícone de refresh do browser não pisca).
3. Clicar de volta em "Treinos". **Esperado**: a aba Treinos volta a aparecer com a **mesma categoria selecionada anteriormente** (ex.: Sub09 ainda é a ativa) e os 4 cards e gráficos populados como antes — confirma FR-015a (estado independente).

### B. Aba Alunos — categoria default, busca e seleção (US1 — Acceptance Scenarios 3, 4, 5, 6)

4. Na aba Alunos com setup populado, observar o estado inicial. **Esperado**: categoria Sub09 está selecionada (primeira com alunos); lista de alunos exibe os 4 nomes do Sub09; nenhum aluno destacado; abaixo da lista aparece mensagem **"Selecione um aluno para visualizar seus dados"** no lugar dos blocos de métricas.
5. Digitar `luc` no campo de busca. **Esperado**: a lista filtra em tempo real para mostrar apenas "Lucas Silva". Apagar o campo restaura a lista completa.
6. Digitar `LUCAS` (maiúsculas). **Esperado**: o filtro é case-insensitive — "Lucas Silva" continua aparecendo.
7. Digitar `xyz`. **Esperado**: lista exibe estado vazio "Nenhum aluno encontrado para 'xyz'"; campo de busca permanece visível e editável.
8. Limpar a busca; clicar em "Lucas Silva". **Esperado**: aparece o cabeçalho do aluno (avatar com iniciais "LS", nome "Lucas Silva", categoria "Sub 09"); os blocos de métricas aparecem populados.
9. Trocar a categoria para Sub10. **Esperado**: a lista é refiltrada para alunos do Sub10; a seleção de Lucas é **limpa**; volta a aparecer "Selecione um aluno para visualizar seus dados".

### C. Resumo de Treinos (US1 — Cenário 5; FR-007)

10. Voltar para Sub09 e selecionar "Lucas Silva". Verificar os 3 cards de treinos:
    - **Presenças**: deve refletir o número de chamadas onde Lucas está como `presente` (ex.: 4 nas configurações do setup).
    - **Frequência**: `presenças ÷ total de chamadas Sub09 × 100` arredondado (ex.: 4 / 5 = 80%).
    - **Itens Trabalhados**: soma das ocorrências de princípios/fundamentos nas chamadas onde Lucas esteve presente (ex.: se as 4 chamadas tinham respectivamente 3, 2, 3, 4 itens → 12).
11. Selecionar "Pedro Henrique" (sem trocar categoria). **Esperado**: cards atualizam **sem reload da página**; cabeçalho muda para "Pedro Henrique" + "Sub 09"; valores refletem Pedro (frequência alta porque presente em todas).

### D. Gráfico de Volume de Treino por Momento (US2 — Cenário 1; FR-008)

12. Com Lucas selecionado, observar o gráfico "Volume de treino por momento". **Esperado**: 4 barras nomeadas Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva, em ordem fixa, com altura proporcional ao número de chamadas presentes em cada momento. Cores distintas por momento (verde, vermelho, laranja, cinza).
13. Trocar para um aluno cuja presença cubra apenas 1–2 momentos. **Esperado**: as barras dos momentos sem dados aparecem com altura 0; ordem das 4 colunas preservada.

### E. Princípios e Fundamentos Absorvidos (US2 — Cenário 2; FR-009)

14. Com Lucas selecionado, observar o bloco "Princípios e fundamentos absorvidos". **Esperado**: lista com barras horizontais (label + barra + count à direita), ordenada por contagem decrescente. Empates resolvidos em ordem alfabética pt-BR.
15. Conferir manualmente: para cada item da lista, contar quantas vezes ele aparece nas chamadas onde Lucas está presente. Os números devem bater.
16. Selecionar um aluno presente em 0 chamadas (criar um aluno novo no Sub09 sem chamadas). **Esperado**: bloco mostra "Nenhum princípio ou fundamento absorvido".

### F. Resumo de Jogos (US3 — Cenário 1; FR-010)

17. Com Lucas selecionado (que tem 2 jogos com 30 e 28 minutos):
    - **Jogos disputados**: 2
    - **Minutos em Jogo**: 58
    - **Média por jogo**: 29 (arredondado de 29.0)
18. Selecionar um aluno do Sub10 que **não participou** de nenhum jogo. **Esperado**: cards mostram `0`, `0`, `—`.

### G. Gráfico de Minutagem em Jogos (US3 — Cenário 2, 3; FR-011)

19. Com Lucas selecionado, observar o gráfico "Minutagem em jogos". **Esperado**: line chart com 2 pontos visíveis (radius ≥ 4), eixo X com labels `DD/MM` em ordem cronológica ASC, eixo Y mostrando minutos.
20. Cadastrar um terceiro jogo onde Lucas participa com 0 minutos. **Esperado**: ao retornar ao dashboard, o chart mostra 3 pontos, sendo o do novo jogo plotado em zero (não omitido).

### H. Histórico de Jogos (US4; FR-012)

21. Com Lucas selecionado, observar a lista "Histórico de Jogos". **Esperado**: linhas em ordem decrescente de data, formato `DD/MM/AAAA — Nome do Jogo` à esquerda e `N min` à direita.
22. Cadastrar dois jogos na mesma data (com nomes distintos). **Esperado**: ambos aparecem em posições adjacentes no histórico, com ordem estável (ordem de criação).
23. Selecionar um aluno sem jogos. **Esperado**: lista mostra "Nenhum jogo registrado".

### I. Edge Cases — estado vazio total (FR-014, Clarification Q2)

24. Limpar `sessionStorage` (DevTools → Application → Storage → Clear) e abrir `dashboard.html`.
    - Aba **Treinos**: dispara `ensureMockData()` da feature 011 (mocks injetados — comportamento existente preservado, conforme R15).
    - Limpar `sessionStorage` novamente, **abrir direto a aba Alunos** (clicar Alunos sem ter passado pela Treinos): a aba Treinos deve ter sido inicializada apenas se o usuário passou por ela; ao tentar abrir Alunos primeiro, ela exibe categoria default `CATEGORIAS[0]` e lista vazia ("Nenhum aluno nesta categoria"). **Não há semeadura**.
    - **Limpar novamente**, ir direto para Alunos, **selecionar uma categoria sem alunos**. **Esperado**: lista vazia, mensagem "Nenhum aluno nesta categoria"; nenhum bloco de métricas aparece (pois nenhum aluno foi selecionado); página não quebra.

### J. Estado independente entre abas (FR-015a; Clarification Q3)

25. Na aba Treinos, selecionar Sub11. Na aba Alunos, selecionar Sub13 e um aluno qualquer.
    - Voltar para Treinos. **Esperado**: Sub11 ainda selecionado, dados de Sub11 visíveis.
    - Voltar para Alunos. **Esperado**: Sub13 ainda selecionado, aluno ainda selecionado, dados intactos.
    - Verificação cruzada: trocar a categoria na aba Treinos para Sub09 NÃO altera nada na aba Alunos (continua Sub13).

### K. Responsividade (FR-016)

26. Abrir DevTools → Toolbar de dispositivo → emular iPhone SE (375 × 667). Validar que:
    - Os 2 botões pill do toggle cabem na linha sem quebrar.
    - Os botões de categoria fazem wrap quando necessário.
    - Os 3 cards (treinos / jogos) se reorganizam (`grid-cols-3` → eventualmente `grid-cols-1` em telas <360px se necessário, validar que não há overflow horizontal).
    - Os charts mantêm legibilidade (rótulos visíveis, sem truncar).
27. Emular Desktop 1440px. **Esperado**: layout centralizado em `max-w-2xl`, sem espaços vazios excessivos nem layout quebrado.

### L. Constitution Check final

28. Confirmar que **nenhuma operação de write** ocorre ao usar a aba Alunos:
    - DevTools → Application → Storage → comparar `imperialState` antes e depois de navegar pela aba Alunos. Tamanho e conteúdo devem ser idênticos.
    - Apenas a aba Treinos (via `ensureMockData()` herdado) pode escrever em `state.chamadas` ao primeira inicialização — comportamento da feature 011, não da 012.

## Critérios de aprovação

- [ ] A1–A3: toggle funciona sem reload e preserva estado por aba.
- [ ] B4–B9: filtros (categoria, busca) operam como esperado; seleção limpa ao trocar categoria.
- [ ] C10–C11: 3 cards de treinos batem numericamente.
- [ ] D12–D13: gráfico de volume por momento é correto.
- [ ] E14–E16: princípios absorvidos é correto e considera apenas presenças.
- [ ] F17–F18: 3 cards de jogos batem (incluindo `—` para média sem jogos).
- [ ] G19–G20: line chart de minutagem está correto, plota zero sem omitir.
- [ ] H21–H23: histórico em ordem decrescente, empate estável.
- [ ] I24: estado vazio total não quebra a página; aba Alunos não semeia mocks.
- [ ] J25: estado entre abas é independente.
- [ ] K26–K27: responsivo em 375px e 1440px.
- [ ] L28: nenhuma escrita em `imperialState` pela aba Alunos.

## Casos de regressão (verificar que NADA quebrou na feature 011)

- [ ] Aba Treinos exibe os 4 cards de resumo populados pelos mocks de feature 011.
- [ ] Bar chart "Volume por momento do jogo" da Treinos renderiza.
- [ ] Doughnut "Distribuição por categoria de conteúdo" da Treinos renderiza.
- [ ] Lista "Top 8 princípios e fundamentos mais trabalhados" da Treinos renderiza.
- [ ] Lista "Sessões recentes" da Treinos renderiza com ordem por data DESC.
- [ ] Trocar categoria na aba Treinos atualiza todos os blocos como antes.

## Notas finais

- Em produção, o uso real do dashboard depende de o usuário ter passado pelas telas de cadastro (Alunos, Treino, Jogos). Estado vazio é UX esperada para um primeiro acesso sem dados.
- A aba Treinos mantém seu comportamento de **semeadura automática** via `MOCK_CHAMADAS_DASHBOARD` (feature 011). A aba Alunos **não tem** equivalente — Clarification 2026-05-03 Q2.
