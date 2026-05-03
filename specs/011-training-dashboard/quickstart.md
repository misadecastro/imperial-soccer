# Quickstart: Dashboard de Treinos

**Branch**: `011-training-dashboard` | **Date**: 2026-05-03

## Pré-requisitos

1. Abrir `src/frontend/index.html` no navegador (Chrome/Firefox/Edge 2023+).
2. Fazer login como professor (qualquer credencial — login mockado).
3. Garantir que **DevTools** está aberto em modo **iPhone SE (375 × 667)** para validar o layout mobile.

## Fluxo de Validação — 18 passos

### Acesso e Carga Inicial

1. A partir de qualquer página com nav inferior (Alunos / Treino / Jogos), confirmar que existe agora uma 4ª aba **"Dashboard"** com ícone de gráfico.
2. Tocar em **"Dashboard"** → abre `dashboard-treinos.html`. A aba Dashboard está destacada como ativa.
3. Verificar header verde com título **"Dashboard de Treinos"** e subtítulo **"Volume e conteúdo trabalhado por categoria"**.

### Seletor de Categoria + Cards de Resumo (US1 — P1)

4. Verificar barra de categorias com 6 botões: **Sub 09, Sub 10, Sub 11, Sub 12, Sub 13, Sub 14**. **Sub 09** está selecionada por padrão (botão verde preenchido, demais com borda).
5. Confirmar os 4 cards exibindo, para Sub 09, números próximos a: **Treinos = 6**, **Minutos = 360**, **Presença média = 88%**, **Itens trabalhados = 18** (valores podem variar ±10% se o usuário tiver registrado outras chamadas previamente).
6. Tocar em **Sub 14** → todos os cards atualizam **em menos de 300ms** para os números daquela categoria. O destaque visual muda da Sub 09 para a Sub 14.
7. Tocar de volta em **Sub 09** → valores voltam aos do passo 5.

### Gráfico Volume por Momento do Jogo (US2 — P2)

8. Confirmar bloco **"Volume por momento do jogo"** com subtítulo "Quantas sessões trabalham cada momento" e gráfico de barras com 4 colunas rotuladas: **Org. Ofensiva, Org. Defensiva, Trans. Ofensiva, Trans. Defensiva** — nesta ordem.
9. As alturas das barras refletem a contagem de chamadas que selecionaram cada momento. Em Sub 09 (mock), Org. Ofensiva é a mais alta.
10. Trocar para uma categoria com momentos diferentes (ex.: **Sub 12**) → as barras se reordenam em altura, mantendo a ordem dos rótulos no eixo X.

### Distribuição por Categoria de Conteúdo (US3 — P2)

11. Confirmar gráfico de **rosca** "Distribuição por categoria de conteúdo" com legenda exibindo três famílias: **Princípios Táticos Defensivos** (vermelho), **Princípios Táticos Ofensivos** (verde), **Fundamentos Técnicos** (laranja).
12. As fatias têm proporções coerentes com `topPrincipios` (ver passo 13). Passar o mouse/dedo sobre uma fatia → tooltip mostra o nome da família e a contagem.

### Top 8 Princípios e Fundamentos (US4 — P2)

13. Confirmar lista **"Princípios e fundamentos mais trabalhados"** com subtítulo "Top 8 itens", até 8 linhas com **nome à esquerda**, **barra horizontal verde proporcional** e **contagem à direita**. Em Sub 09 (mock), os primeiros itens são **Passe = 3**, **Penetração = 2**, **Contenção = 2**.
14. Trocar para uma categoria com poucos dados (ex.: **Sub 14**) → a lista mostra apenas os itens existentes (sem placeholders) preservando a ordem decrescente.

### Sessões Recentes (US5 — P3)

15. Rolar para o final → confirmar bloco **"Sessões recentes"** com até 6 itens. Cada linha exibe: **`DD/MM/AAAA — Momento`**, lista de **fundamentos/princípios** abaixo, e **`Presentes X/Y`** alinhado à direita.
16. Verificar ordenação por data **decrescente** (mais recente no topo).

### Estados Vazios e Edge Cases

17. Limpar `sessionStorage` (DevTools → Application → Clear) e recarregar `dashboard-treinos.html` → o mock é **reinjetado automaticamente** e o dashboard volta a exibir Sub 09 com os valores do passo 5.
18. Ainda na página, abrir DevTools, executar no console:
    ```js
    sessionStorage.setItem('imperialState', JSON.stringify({ alunos:[], avaliacoes:[], chamadas:[{id:'x',data:'2026-04-01',categoria:'Sub09',registros:[],momentos:[],principiosFundamentos:[]}] }));
    location.reload();
    ```
    → verificar que Sub 09 mostra **Treinos = 1**, **Presença média = 0%**, gráficos com mensagens "Sem dados…" / "Sem itens trabalhados…", e "Sessões recentes" mostra a única linha.

## Validação Adicional (Mobile e Regressões)

- **Mobile (iPhone SE 375 × 667)**: barra de categorias quebra em múltiplas linhas; cards 2×2; gráficos legíveis; nav inferior 4 abas com `flex-1`.
- **Desktop ≥ 1024 px**: cards em 4 colunas; charts maiores; nada quebra.
- **Regressões**: navegar para Alunos, Treino, Jogos pelo nav inferior → cada página continua funcional e o item "Dashboard" aparece em cada uma.
- **Performance**: o painel Performance do DevTools registra a primeira renderização **abaixo de 2s** em conexão local; troca de categoria **abaixo de 300ms**.

## Resultado Esperado

- Dashboard exibe métricas consistentes por categoria.
- Troca de categoria atualiza 4 cards + 2 gráficos + 2 listas instantaneamente.
- Sem regressões nas páginas existentes (nav inferior continua funcional em todas).
- Estados vazios não causam erro nem layout quebrado.
- Mock data é idempotente: só é injetado quando não há chamadas.
