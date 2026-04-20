# Data Model: Listagem e CRUD de Treinos com Filtro de Fundamentos

**Branch**: `010-training-crud-list` | **Date**: 2026-04-20

## Entidades

### Chamada / Treino (existente — sem alteração de esquema)

A entidade Chamada (que na prática representa um Treino) já possui todos os campos necessários. Nenhuma migração é necessária.

| Campo | Tipo | Descrição | Validação | Status |
|---|---|---|---|---|
| `id` | string (UUID) | Identificador único | Gerado por `crypto.randomUUID()` | Existente |
| `data` | string (YYYY-MM-DD) | Data do treino | Obrigatória; não pode ser futura | Existente |
| `categoria` | string | Categoria do treino | Obrigatória; deve existir em CATEGORIAS | Existente |
| `registros` | RegistroPresença[] | Lista de presenças | Gerada ao selecionar categoria | Existente |
| `momentos` | string[] | IDs dos momentos selecionados | Subset de MOMENTOS IDs; pode ser vazio | Existente (feat 009) |
| `principiosFundamentos` | string[] | IDs dos princípios/fundamentos | Subset válido; pode ser vazio | Existente (feat 009) |

**Chave de negócio**: `data + categoria` — sem alteração.

---

### Constantes de Domínio (existentes — estendidas com classificação)

#### MOMENTOS_TIPO (novo)

Mapa de classificação dos momentos por tipo tático:

```js
const MOMENTOS_TIPO = {
  org_ofensiva:   'ofensivo',
  org_defensiva:  'defensivo',
  trans_ofensiva: 'ofensivo',
  trans_defensiva: 'defensivo',
};
```

#### PRINCIPIOS_GRUPOS (existente — sem alteração de dados)

Cada grupo recebe uma classificação de filtro para a lógica de visibilidade:

| Grupo | Tipo de Filtro | Condição de Visibilidade |
|---|---|---|
| Princípios Táticos Defensivos | `defensivo` | Visível quando há momento defensivo selecionado |
| Princípios Táticos Ofensivos | `ofensivo` | Visível quando há momento ofensivo selecionado |
| Fundamentos Técnicos | `sempre` | Sempre visível |

---

## Estado Completo em sessionStorage (sem alteração)

```js
// Chave: "imperialState"
{
  alunos: [...],
  avaliacoes: [...],
  chamadas: [
    {
      id: "uuid",
      data: "2026-04-05",
      categoria: "Sub09",
      registros: [
        { alunoId: "uuid-lucas", status: "presente" },
        { alunoId: "uuid-pedro", status: "falta" }
      ],
      momentos: ["org_ofensiva", "trans_defensiva"],
      principiosFundamentos: ["contencao", "passe", "mobilidade"]
    }
  ],
  jogos: [...]
}
```

---

## Funções do Módulo `training.html` (novas/modificadas)

| Função | Entrada | Saída | Descrição | Status |
|---|---|---|---|---|
| `renderListaTreinos()` | — | void | Renderiza lista de treinos ordenada por data DESC com data, categoria, presentes e princípios | **NOVA** |
| `renderFormTreino(chamada?)` | `Chamada \| null` | void | Renderiza formulário; null = novo, objeto = edição | **NOVA** |
| `deleteTreino(id)` | string | void | Remove treino de `state.chamadas` e persiste | **NOVA** |
| `getGruposVisiveis()` | — | string[] | Retorna tipos visíveis ('ofensivo', 'defensivo') com base nos momentos selecionados | **NOVA** |
| `renderPrincipios()` | — | void | **MODIFICADA**: filtra grupos com base em `getGruposVisiveis()`, auto-desmarca princípios de grupos ocultos | Modificada |
| `renderMomentos()` | — | void | **MODIFICADA**: após toggle, chama `renderPrincipios()` para atualizar filtro | Modificada |
| `renderEspecificacoes()` | — | void | Existente — sem alteração significativa | Existente |
| `toggleChamada()` | — | void | Existente — sem alteração | Existente |
| `salvarTreino()` | — | void | **NOVA**: coleta dados do formulário, valida, salva e volta para lista | Nova |

---

## Dados Derivados para a Lista

Para cada treino na lista, os seguintes dados são derivados:

| Dado | Derivação |
|---|---|
| Data formatada | `formatDate(chamada.data)` |
| Categoria label | `CATEGORIAS_LABELS[chamada.categoria]` |
| Qtd. presentes | `chamada.registros.filter(r => r.status === 'presente').length` |
| Total alunos | `chamada.registros.length` |
| Labels de princípios | Mapear `chamada.principiosFundamentos` → labels via lookup em `PRINCIPIOS_GRUPOS` |

---

## Lógica de Filtro de Princípios

```
Entrada: momentosSelecionados (string[])

1. temOfensivo = momentosSelecionados.some(id => MOMENTOS_TIPO[id] === 'ofensivo')
2. temDefensivo = momentosSelecionados.some(id => MOMENTOS_TIPO[id] === 'defensivo')

3. Para cada grupo em PRINCIPIOS_GRUPOS:
   - Se grupo.filtro === 'ofensivo' → visível se temOfensivo
   - Se grupo.filtro === 'defensivo' → visível se temDefensivo
   - Se grupo.filtro === 'sempre' → sempre visível

4. Para cada grupo que ficou OCULTO:
   - Remover de principiosSelecionados todos os IDs pertencentes a esse grupo
   - Atualizar contador
```

---

## Impacto nas Páginas Existentes

| Página | Modificação necessária |
|---|---|
| `src/frontend/pages/training.html` | Reestruturação completa: lista + formulário CRUD + filtro de princípios |
| Demais páginas | Nenhuma alteração |
