# Data Model: Chamada de Treino

**Branch**: `007-attendance-tracking` | **Date**: 2026-04-05

## Entidades

### Chamada (nova)

Representa o registro de presença de um treino específico.

| Campo | Tipo | Descrição | Validação |
|---|---|---|---|
| `id` | string (UUID) | Identificador único | Gerado por `crypto.randomUUID()` |
| `data` | string (YYYY-MM-DD) | Data do treino | Obrigatória; não pode ser futura |
| `categoria` | string | Categoria do treino (ex.: "Sub09") | Obrigatória; deve existir em CATEGORIAS |
| `registros` | RegistroPresença[] | Lista de registros por aluno | Gerada automaticamente ao carregar a chamada |

**Chave de negócio**: `data + categoria` — combinação única por chamada.

**Estado inicial**: Ao criar uma nova chamada para uma data/categoria, todos os alunos da categoria recebem status `"pendente"`.

---

### RegistroPresença (nova)

Vincula um aluno a uma chamada com seu status de presença.

| Campo | Tipo | Descrição | Validação |
|---|---|---|---|
| `alunoId` | string (UUID) | Referência ao aluno | Deve existir em `state.alunos` |
| `status` | `"presente"` \| `"falta"` \| `"pendente"` | Status de presença | Padrão: `"pendente"` |

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
  chamadas: [                                       // ← NOVO
    {
      id: "uuid",
      data: "2026-04-05",
      categoria: "Sub09",
      registros: [
        { alunoId: "uuid-lucas", status: "presente" },
        { alunoId: "uuid-pedro", status: "falta" },
        { alunoId: "uuid-gabriel", status: "pendente" },
      ]
    }
  ]
}
```

---

## Relacionamentos

```
Aluno (1) ──────────────── (N) RegistroPresença
                                      │
                               (N)    │
                            Chamada ──┘
                         (data + categoria)
```

- Um **Aluno** pode ter N **RegistrosPresença** (um por chamada em que está cadastrado).
- Uma **Chamada** contém N **RegistrosPresença** (um por aluno da categoria).
- A **Chamada** referencia alunos por `alunoId`; não duplica dados do aluno.

---

## Transições de Estado

```
[pendente] ──→ [presente]  (professor toca "Presente")
[pendente] ──→ [falta]     (professor toca "Falta")
[presente] ──→ [falta]     (professor troca marcação)
[falta]    ──→ [presente]  (professor troca marcação)
[presente] ──→ [pendente]  (não suportado — apenas para reset via "Todos Ausentes/Presentes")
```

---

## Regras de Validação

- **Data**: obrigatória; `data <= hoje` (não pode ser futura).
- **Categoria**: obrigatória; deve estar na lista `CATEGORIAS`.
- **Unicidade**: apenas uma chamada por `data + categoria`. Ao salvar, o sistema atualiza se já existir.
- **Alunos**: a lista de registros é gerada a partir dos alunos da categoria no momento de abertura; alunos adicionados depois de uma chamada salva não aparecem naquela chamada.
