# Data Model: Minutagem de Jogos

**Branch**: `008-match-minutes` | **Date**: 2026-04-20

## Entidades

### Jogo (nova)

Representa uma partida realizada com registro de minutagem dos alunos participantes.

| Campo | Tipo | Descrição | Validação |
|---|---|---|---|
| `id` | string (UUID) | Identificador único | Gerado por `crypto.randomUUID()` |
| `data` | string (YYYY-MM-DD) | Data de realização | Obrigatória |
| `nome` | string | Nome do jogo (ex.: "vs. América") | Obrigatório; mínimo 1 caractere |
| `participacoes` | Participacao[] | Lista de participações dos alunos | Pode ser vazia |

**Chave de negócio**: `id` — identificador único por jogo. Não há unicidade por data (múltiplos jogos na mesma data são permitidos).

---

### Participacao (nova)

Vínculo entre um aluno e um jogo, com registro de minutos jogados.

| Campo | Tipo | Descrição | Validação |
|---|---|---|---|
| `alunoId` | string (UUID) | Referência ao aluno | Deve existir em `state.alunos`; único por jogo |
| `minutos` | number (integer) | Minutos jogados | Inteiro ≥ 0; padrão 0 se omitido |

**Unicidade**: Um `alunoId` pode aparecer apenas uma vez em `participacoes` por jogo — duplicidade é ignorada pelo sistema.

---

### Aluno (existente — sem alteração)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | string (UUID) | Identificador único |
| `nome` | string | Nome completo |
| `dataNascimento` | string (YYYY-MM-DD) | Data de nascimento |
| `categoria` | string | Categoria (Sub09, Sub10, etc.) |

---

## Estado Completo em sessionStorage

```js
// Chave: "imperialState"
{
  alunos: [
    { id: "uuid", nome: "Lucas Silva", dataNascimento: "2012-03-15", categoria: "Sub09" },
    // ...
  ],
  avaliacoes: [
    { id: "uuid", alunoId: "uuid", data: "2026-04-01", tatico: 4, tecnico: 3, mental: 5 },
    // ...
  ],
  chamadas: [
    { id: "uuid", data: "2026-04-05", categoria: "Sub09", registros: [...] },
    // ...
  ],
  jogos: [                                       // ← NOVO
    {
      id: "uuid",
      data: "2026-04-20",
      nome: "vs. América",
      participacoes: [
        { alunoId: "uuid-lucas", minutos: 45 },
        { alunoId: "uuid-pedro", minutos: 90 },
        { alunoId: "uuid-gabriel", minutos: 0 }
      ]
    }
  ]
}
```

---

## Relacionamentos

```
Aluno (1) ──────────────── (N) Participacao
                                    │
                             (N)    │
                          Jogo ─────┘
                        (data + nome)
```

- Um **Aluno** pode ter N **Participações** (uma por jogo em que participou).
- Um **Jogo** contém N **Participações** (uma por aluno convocado).
- **Participação** referencia o aluno por `alunoId` — não duplica dados do aluno.

---

## Funções do Módulo `games.html`

| Função | Entrada | Saída | Descrição |
|---|---|---|---|
| `loadState()` | — | estado | Lê sessionStorage; inicializa `jogos: []` se ausente |
| `saveState()` | — | void | Persiste estado em sessionStorage |
| `findJogo(id)` | string | `Jogo \| undefined` | Busca jogo por ID |
| `saveJogo(dados, id?)` | objeto, string? | void | Cria novo jogo ou atualiza existente (upsert) |
| `deleteJogo(id)` | string | void | Remove jogo do array e persiste |
| `renderLista()` | — | void | Renderiza lista de jogos ordenada por data DESC |
| `renderFormJogo(jogo?)` | `Jogo \| null` | void | Renderiza formulário; null = novo, objeto = edição |
| `renderSeletorAlunos()` | — | void | Renderiza painel de seleção de alunos com filtros |
| `renderParticipacoes(participacoes)` | array | void | Renderiza lista de participantes + campo minutos |
| `getAlunosSelecionados()` | — | `string[]` | Retorna IDs dos alunos com checkbox marcado |

---

## Validações

- **data**: obrigatória (string não vazia).
- **nome**: obrigatório (string não vazia).
- **participacoes**: opcional — jogo sem participantes é válido.
- **minutos**: inteiro ≥ 0; campo em branco = 0 ao salvar.
- **Unicidade de alunoId** dentro de `participacoes`: o sistema ignora adição duplicada.

---

## Impacto nas Páginas Existentes

| Página | Modificação necessária |
|---|---|
| `src/frontend/pages/students.html` | Menu inferior: adicionar 3º item "Jogos" (`href="games.html"`) |
| `src/frontend/pages/student-eval.html` | Menu inferior: adicionar 3º item "Jogos" |
| `src/frontend/pages/training.html` | Menu inferior: adicionar 3º item "Jogos" |
| `src/frontend/pages/games.html` | **NOVA** — página completa de gestão de jogos |
