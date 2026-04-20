# Research: Especificações do Treino

**Branch**: `009-training-drill-specs` | **Date**: 2026-04-20

## Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Modelo de dados | Estender `Chamada` existente com campos `momentos: []` e `principiosFundamentos: []` | Criar entidade separada `SessaoDeTreino` — adicionaria complexidade de join/referência sem necessidade nesta fase mock |
| Layout de momentos | Grid 2×2 com cards clicáveis (conforme protótipo) | Lista vertical; tabs — protótipo define 2×2 como padrão visual |
| Layout de princípios/fundamentos | Chips/tags com wrap, agrupados por categoria (conforme protótipo) | Checkboxes em lista; accordion por grupo — chips são mais rápidos para touch e seguem o protótipo |
| Seleção de momentos | Multi-select (toggle on/off, sem limite) | Single-select — a spec permite múltiplos momentos simultâneos |
| Seleção de princípios/fundamentos | Multi-select (toggle on/off) com contador global | Seleção vinculada ao momento ativo — a spec e o protótipo mostram princípios independentes dos momentos |
| Chamada collapsible | Accordion nativo com header clicável + chevron de estado | `<details>/<summary>` HTML5 — funciona, mas difícil de estilizar com Tailwind; accordion manual é consistente com o visual do app |
| Botão salvar | "Salvar Treino" (substitui "Salvar Presença"), persiste chamada + especificações em uma operação | Dois botões separados — viola SC-005 (botão único) |
| Persistência | Campos `momentos` e `principiosFundamentos` adicionados ao objeto `Chamada` existente em `state.chamadas` | Array separado `state.treinos` — duplicaria chave data+categoria e complicaria sincronização |
| Lista fixa de itens | Arrays constantes no JS (mesma abordagem de `CATEGORIAS`) | Carregar de config externo — overengineering para lista estática |
| Inicialização das especificações | Se campos ausentes no objeto chamada existente, inicializar como `[]` (backward-compatible) | Migrar chamadas existentes — desnecessário, graceful fallback é suficiente |

## Pesquisa: Collapsible/Accordion

**Abordagem escolhida**: Accordion manual com `classList.toggle('hidden')` no conteúdo e rotação de ícone chevron.

- Consistente com os padrões do app (ex.: `painelSeletorAlunos` em `games.html` usa toggle de visibilidade)
- Não requer dependência externa
- Chevron SVG com `transform: rotate(180deg)` para indicar estado
- Header com contadores de resumo (presentes/faltas) visíveis quando recolhido

**Alternativa rejeitada**: `<details>/<summary>` — styling inconsistente entre browsers; não permite animação suave; marker padrão é difícil de customizar com Tailwind.

## Pesquisa: Dados Fixos dos Momentos e Princípios

Conforme o protótipo (`Design/prototipo.png`):

### Momentos do Jogo (4)

| ID | Label | Descrição |
|---|---|---|
| `org_ofensiva` | Org. Ofensiva | Equipe com a posse, construindo jogadas |
| `org_defensiva` | Org. Defensiva | Equipe sem a posse, organizada para defender |
| `trans_ofensiva` | Trans. Ofensiva | Momento da recuperação da posse de bola |
| `trans_defensiva` | Trans. Defensiva | Momento da perda da posse de bola |

### Princípios Táticos Defensivos (5)

Contenção, Cobertura Defensiva, Unidade Defensiva, Concentração, Equilíbrio

### Princípios Táticos Ofensivos (6)

Espaço sem Bola, Espaço com Bola, Cobertura Ofensiva, Unidade Ofensiva, Penetração, Mobilidade

### Fundamentos Técnicos (7)

Controle de Bola no Chão, Controle de Bola no Alto, Drible, Passe, Domínio, Finalização, Cabeceio

**Total**: 18 itens selecionáveis em 3 grupos.

## Pesquisa: Impacto na Chamada Existente

A funcionalidade de chamada de presença (`training.html`) permanece 100% funcional. As alterações são:

1. **Visual**: Conteúdo da chamada envolvido em container collapsible
2. **Botão**: "Salvar Presença" → "Salvar Treino"
3. **Dados**: Objeto `Chamada` estendido com `momentos` e `principiosFundamentos` (arrays de strings)
4. **Backward-compatible**: Chamadas salvas sem esses campos continuam funcionando — `loadState` inicializa como `[]`

Nenhum NEEDS CLARIFICATION remanescente.
