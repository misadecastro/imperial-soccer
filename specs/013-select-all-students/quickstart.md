# Quickstart — Validação Manual: Selecionar Todos os Alunos no Cadastro de Jogo

**Branch**: `013-select-all-students` | **Date**: 2026-05-03

## Pré-requisitos

- Servir `src/frontend/` localmente (qualquer servidor estático: `npx serve`, `python -m http.server`, Live Server do VS Code).
- Navegador desktop (Chrome/Edge/Firefox 2023+) e/ou modo dispositivo do DevTools (iPhone SE 375 × 667).
- Limpar `sessionStorage` da aba antes de começar (`DevTools → Application → Storage → Clear`).

## Setup de dados

1. Abrir `students.html`.
2. Cadastrar **8 alunos** distribuídos em pelo menos 2 categorias:
   - 4 alunos em **Sub11** (ex.: João, Pedro, Lucas, Marcos).
   - 3 alunos em **Sub12** (ex.: Ana, Beatriz, Carla).
   - 1 aluno em **Sub13** (ex.: Davi).
3. Navegar para `games.html` (botão "Jogos" no nav inferior).

## Cenário 1 — Selecionar todos (caminho-feliz, sem filtros) [US1, P1]

1. Clicar **Novo Jogo**.
2. Preencher **Data** (hoje) e **Nome do Jogo** ("Quickstart 1").
3. Clicar **Adicionar Alunos**.
4. **Verificar**: o painel abre e exibe acima da lista um cabeçalho `[ ] Selecionar todos` (checkbox desmarcado, label visível).
5. Clicar no checkbox **Selecionar todos**.
6. **Verificar**: todos os 8 alunos da lista ficam marcados.
7. Clicar **Adicionar Selecionados**.
8. **Verificar**: o painel fecha e a lista de participantes mostra os 8 alunos.
9. Salvar o jogo.
10. **Verificar**: o jogo aparece na lista com texto "8 alunos".

## Cenário 2 — Selecionar todos respeita filtro de categoria [US2, P2]

1. Clicar **Novo Jogo** → preencher data/nome ("Quickstart 2") → **Adicionar Alunos**.
2. No filtro de categoria, escolher **Sub 11**.
3. **Verificar**: lista mostra apenas os 4 alunos Sub11; checkbox "Selecionar todos" continua desmarcado.
4. Clicar **Selecionar todos**.
5. **Verificar**: somente os 4 alunos Sub11 ficam marcados.
6. Mudar filtro para **Todas as categorias**.
7. **Verificar**: a lista mostra os 8 alunos novamente; os 4 Sub11 continuam marcados; os 4 não-Sub11 estão desmarcados; o checkbox "Selecionar todos" mudou para **estado parcial** (indeterminado — visualmente: traço/quadrado preenchido, não check).
8. Clicar **Adicionar Selecionados**.
9. **Verificar**: apenas os 4 Sub11 entram na lista de participantes. Salvar e confirmar "4 alunos" no card.

## Cenário 3 — Estado parcial (indeterminate) [US3, P3]

1. Clicar **Novo Jogo** → preencher → **Adicionar Alunos**.
2. Marcar manualmente **3 alunos quaisquer** entre os 8 visíveis (clicar nos checkboxes individuais).
3. **Verificar**: o checkbox "Selecionar todos" muda para **indeterminado** (estado visual diferente de marcado e diferente de desmarcado).
4. Clicar uma vez no checkbox **Selecionar todos**.
5. **Verificar**: ele passa para **marcado** e os 8 alunos ficam marcados (convenção: clique sobre indeterminado = "marcar tudo").
6. Clicar novamente em **Selecionar todos**.
7. **Verificar**: ele passa para **desmarcado** e todos os 8 ficam desmarcados.
8. Cancelar o formulário (botão **Cancelar**).

## Cenário 4 — "Selecionar todos" ignora alunos já adicionados [US3, P3]

1. **Pré-condição**: ter um jogo previamente salvo (qualquer um dos cenários anteriores). Editar esse jogo na lista clicando **Editar**.
2. Clicar **Adicionar Alunos**.
3. **Verificar**: na lista, os alunos já participantes aparecem **com opacidade reduzida (50%) e checkbox desabilitado**.
4. **Verificar**: o checkbox "Selecionar todos" reflete corretamente — se todos os elegíveis estão desmarcados, ele está desmarcado; nunca mostra os já-participantes como contribuindo para "todos".
5. Clicar **Selecionar todos**.
6. **Verificar**: apenas os alunos elegíveis (não-desabilitados) ficam marcados; os já participantes permanecem desabilitados e seu estado visual não muda.
7. Clicar **Adicionar Selecionados**.
8. **Verificar**: a lista de participantes do jogo cresceu apenas pelos elegíveis recém-marcados; **nenhuma duplicata**.

## Cenário 5 — Filtro vazio [Edge case]

1. Novo Jogo → **Adicionar Alunos**.
2. Digitar no campo "Buscar por nome" um termo que não corresponda a ninguém (ex.: "zzzzz").
3. **Verificar**: lista mostra "Nenhum aluno encontrado"; checkbox **Selecionar todos** fica **desabilitado** (cinza, não clicável).
4. Limpar o filtro.
5. **Verificar**: o checkbox volta a estar **habilitado** e desmarcado.

## Cenário 6 — Cadastro de alunos vazio [Edge case]

1. Em `DevTools → Application → Storage`, deletar `imperialState` ou apagar todos os alunos (re-criar manualmente até `state.alunos = []`).
2. Recarregar `games.html` → **Novo Jogo** → **Adicionar Alunos**.
3. **Verificar**: painel mostra "Nenhum aluno cadastrado no sistema."; tanto o controle **Selecionar todos** quanto o botão **Adicionar Selecionados** estão **escondidos** (não apenas desabilitados).

## Cenário 7 — Acessibilidade (teclado e leitor de tela)

1. Novo Jogo → **Adicionar Alunos**.
2. Navegar com **Tab** até o checkbox **Selecionar todos**.
3. Pressionar **Espaço**.
4. **Verificar**: o checkbox é acionado; o foco permanece no controle.
5. (Opcional, se houver leitor de tela) **Verificar**: o leitor anuncia "Selecionar todos, checkbox marcado" / "desmarcado" / "parcialmente marcado" conforme o estado.

## Cenário 8 — Performance

1. Cadastrar (ou semear via console) 100+ alunos numa mesma categoria.
2. Novo Jogo → filtrar por essa categoria → **Adicionar Alunos**.
3. Clicar **Selecionar todos**.
4. **Verificar (subjetivo)**: a marcação é instantânea (< 100ms percebido).
5. Marcar/desmarcar individualmente alguns checkboxes.
6. **Verificar (subjetivo)**: o estado tri-state do controle se atualiza sem lag perceptível.

## Critérios de Aceite Globais

- [ ] Cenário 1 (US1) passou — todos os alunos visíveis são marcados de uma vez e adicionados ao jogo.
- [ ] Cenário 2 (US2) passou — "Selecionar todos" respeita o filtro de categoria; estado tri-state recalcula ao limpar filtro.
- [ ] Cenário 3 (US3-1) passou — estado indeterminado é visível e clique sobre ele marca tudo.
- [ ] Cenário 4 (US3-2 e US3-3) passou — alunos já participantes não são afetados nem duplicados.
- [ ] Cenário 5 passou — filtro vazio desabilita o controle.
- [ ] Cenário 6 passou — cadastro vazio esconde o controle.
- [ ] Cenário 7 passou — controle é operável por teclado e tem nome acessível.
- [ ] Cenário 8 passou — sem lag perceptível em listas até 200 alunos.
- [ ] Nenhum erro no console do DevTools em nenhum cenário.
- [ ] Layout permanece estável (sem saltos) em mobile (375 × 667) e desktop.

## Rollback

- Não há mudanças em `sessionStorage`. Para reverter a feature, basta `git checkout main -- src/frontend/pages/games.html`.
