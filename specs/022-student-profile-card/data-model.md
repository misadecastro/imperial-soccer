# Data Model: Ficha do Aluno com Avaliações Dinâmicas

**Feature**: 022-student-profile-card | **Date**: 2026-07-27

## Coleção `students` (ESTENDIDA)

Documento `Aluno` ganha os campos da ficha (embutidos — sempre acessados juntos).

| Campo | Tipo | Regras |
|---|---|---|
| `Id` | string | existente |
| `Nome` | string | existente |
| `DataNascimento` | string (ISO date) | existente; base para cálculo da idade |
| `Categoria` | string | existente |
| `Foto` | string? | **novo** — data URI base64 (`data:image/...`); nulo/placeholder se ausente |
| `PeDominante` | string? | **novo** — "Direito" \| "Esquerdo" \| "Ambidestro" |
| `MassaCorporal` | decimal? | **novo** — kg (> 0); opcional |
| `Estatura` | decimal? | **novo** — metros (> 0); opcional |
| `AvaliacaoGeral` | string? | **novo** — texto qualitativo livre (um por aluno) |

- **Idade**: derivada no frontend a partir de `DataNascimento` — **não** armazenada.
- **Validação** (`PUT /students/{id}/profile`): `PeDominante` ∈ conjunto válido quando
  informado; `MassaCorporal`/`Estatura` > 0 quando informados; `Foto` deve ser data URI de
  imagem; todos os campos são opcionais (edição incremental).

## Coleção `evaluation_types` (NOVA)

Raiz `EvaluationType`, embutindo os itens. Espelha `PrincipioGrupo` (feature 020).

| Campo | Tipo | Regras |
|---|---|---|
| `Id` | string | `Guid` gerado |
| `Nome` | string | obrigatório; único (case-insensitive) entre os **ativos** |
| `Itens` | `EvaluationItem[]` | ao menos 1 item |
| `Arquivado` | bool | soft delete; default `false` |

**`EvaluationItem`** (embutido):

| Campo | Tipo | Regras |
|---|---|---|
| `Id` | string | `Guid` gerado; **estável** (preservado em edições) |
| `Nome` | string | obrigatório; único (case-insensitive) dentro do tipo |

- **Soft delete**: `DELETE` marca `Arquivado = true`. `GET` lista apenas `Arquivado = false`.
- **Edição de itens**: reconciliação por `Id` — itens preexistentes mantêm `Id`; novos ganham
  `Id`; ausentes são removidos da definição (histórico já gravado não é afetado).

## Coleção `evaluations` (NOVA)

`Evaluation` — um registro por aluno/tipo/data. Ciclo de vida próprio (referência, não embed).
> Nota: reutiliza o nome da coleção `evaluations` da feature 018 (descartada na 021); o esquema
> é **novo e incompatível**. Assumir base limpa (ou dropar a coleção legada) antes de usar.

| Campo | Tipo | Regras |
|---|---|---|
| `Id` | string | `Guid` gerado |
| `AlunoId` | string | referência a `students.Id` (obrigatório) |
| `TipoId` | string | referência a `evaluation_types.Id` (obrigatório) |
| `Data` | string (ISO date) | obrigatória |
| `Pontuacoes` | `Pontuacao[]` | uma por item do tipo no momento do registro |

**`Pontuacao`** (embutido):

| Campo | Tipo | Regras |
|---|---|---|
| `ItemId` | string | referência ao `EvaluationItem.Id` |
| `Nota` | int | inteiro de 1 a 5 |

- Um aluno pode ter **várias** avaliações por tipo (histórico); `Data` não é única.

## Relacionamentos

```text
Aluno (students) 1 ──── N Evaluation (evaluations)   [via AlunoId]
EvaluationType (evaluation_types) 1 ──── N Evaluation [via TipoId]
EvaluationType 1 ──── N EvaluationItem  (embutido)
Evaluation 1 ──── N Pontuacao (embutido) ──→ referencia EvaluationItem.Id
Aluno ──contém── Foto, PeDominante, MassaCorporal, Estatura, AvaliacaoGeral (embutidos)
```

## Derivações e agregações (frontend)

- **Idade** = anos completos entre `DataNascimento` e hoje.
- **Radar** (quadro do tipo) = `Pontuacoes` da avaliação de maior `Data` do aluno naquele tipo;
  um eixo por item.
- **Evolução por item** = para cada `ItemId`, série `(Data → Nota)` ordenada por data (linha).
- **Histórico** = avaliações do aluno/tipo ordenadas por `Data` desc.

## Regras de consistência

- **RC-001**: Gestão de `evaluation_types` (POST/PUT/DELETE) exige papel Administrador.
- **RC-002**: `PUT /students/{id}/profile` e criação de avaliação exigem apenas autenticação
  (professor ou administrador).
- **RC-003**: Tipos arquivados não aparecem em fichas nem recebem novas avaliações; seu
  histórico permanece consultável.
- **RC-004**: `Nota` sempre inteiro 1–5; fora disso a criação é rejeitada.
- **RC-005**: Ids de itens são estáveis para manter a integridade referencial do histórico.
