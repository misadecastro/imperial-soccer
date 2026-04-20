# Research: Listagem e CRUD de Treinos com Filtro de Fundamentos

**Branch**: `010-training-crud-list` | **Date**: 2026-04-20

## Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Fluxo de navegação | Lista → Formulário (show/hide de seções, padrão de `games.html`) | Formulário direto como na feature 009 — não suporta CRUD |
| Modelo de dados | Reutilizar `state.chamadas` sem alteração de esquema — entidade Chamada já possui `momentos[]` e `principiosFundamentos[]` | Criar entidade separada `Treino` — duplicaria dados e quebraria backward-compat |
| Classificação dos momentos | Constante `MOMENTOS_TIPO`: `org_ofensiva`/`trans_ofensiva` = `'ofensivo'`, `org_defensiva`/`trans_defensiva` = `'defensivo'` | Inferir do nome (contém "Ofensiva"/"Defensiva") — frágil e não escalável |
| Filtro de princípios | Derivar visibilidade dos grupos a partir dos momentos selecionados: tem ofensivo → mostra grupo ofensivo; tem defensivo → mostra grupo defensivo; técnicos sempre visíveis | Todos os grupos sempre visíveis — viola FR-006/FR-007/FR-009 |
| Auto-desmarcação | Ao ocultar um grupo de princípios, remover os IDs daquele grupo de `principiosSelecionados` | Manter seleções ocultas (persistem invisíveis) — confuso para o professor, pode salvar princípios não vistos |
| Lista: informações exibidas | Data formatada, categoria (badge), contagem de presentes, chips de princípios/fundamentos | Exibir momentos na lista — muito verboso; princípios são mais informativos |
| Edição: pré-preenchimento | Carregar chamada existente no formulário com todos os campos | Carregar apenas especificações — perderia chamada |
| Formulário: seleção de categoria | Dropdown `<select>` com CATEGORIAS (não abas) — formulário precisa salvar para uma categoria específica, diferente do fluxo de abas que carregava direto | Manter abas — não funciona em formulário que precisa ser preenchido antes de carregar alunos |

## Pesquisa: Padrão Lista + Formulário

Reutilizar o padrão já validado em `games.html`:
- `#secaoLista` visível por padrão com cards de treinos + botão "Novo Treino"
- `#secaoFormTreino` oculto, exibido ao clicar "Novo Treino" ou "Editar"
- Alternância via `classList.add/remove('hidden')`
- Variável `treinoEditando` (null = criação, objeto = edição)

## Pesquisa: Impacto na Página `training.html`

A feature 009 transformou `training.html` em um formulário direto (data + categoria abas + chamada accordion + especificações). Esta feature reorganiza para:

1. **Tela principal**: Lista de treinos + botão "Novo Treino"
2. **Formulário**: Data (input) + Categoria (select) + Chamada (accordion) + Especificações (momentos + princípios filtrados) + Salvar/Cancelar

A mudança é significativa — o fluxo de abas por categoria é substituído por um formulário com select de categoria. As abas eram convenientes para trocar entre categorias rapidamente, mas não se encaixam no padrão CRUD com lista.

## Pesquisa: Lógica de Filtro de Princípios

```
momentosSelecionados → derivar tipos presentes:
  - temOfensivo = momentos contém 'org_ofensiva' OU 'trans_ofensiva'
  - temDefensivo = momentos contém 'org_defensiva' OU 'trans_defensiva'

Visibilidade dos grupos:
  - "Princípios Táticos Ofensivos": visível se temOfensivo
  - "Princípios Táticos Defensivos": visível se temDefensivo
  - "Fundamentos Técnicos": sempre visível

Ao mudar visibilidade:
  - Se grupo ficou oculto → remover IDs daquele grupo de principiosSelecionados
  - Atualizar contador
```

Nenhum NEEDS CLARIFICATION remanescente.
