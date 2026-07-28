# Data Model: Migração do Frontend para Angular

**Branch**: `015-adopt-angular-frontend` | **Date**: 2026-06-27

Esta feature não cria nem altera nenhum campo de dados existente — apenas tipa, em
TypeScript, as estruturas já gravadas em `sessionStorage` (chave `imperialState`).
Os modelos abaixo são o contrato entre `StateService` e os componentes Angular.

## `imperialState` (raiz)

```ts
export interface ImperialState {
  alunos: Aluno[];
  avaliacoes: Avaliacao[];
  chamadas: Chamada[];
  jogos: Jogo[];
}
```

## Aluno (`models/aluno.model.ts`)

| Campo | Tipo | Origem |
|-------|------|--------|
| `id` | `string` | feature 002 |
| `nome` | `string` | feature 002 |
| `dataNascimento` | `string` (ISO `YYYY-MM-DD`) | feature 002 |
| `categoria` | `string` (uma das chaves de `CATEGORIAS`, ex.: `Sub09`...`Sub17F`) | feature 002 |

```ts
export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string;
  categoria: string;
}
```

## Avaliacao (`models/avaliacao.model.ts`)

| Campo | Tipo | Restrição | Origem |
|-------|------|-----------|--------|
| `id` | `string` | UUID | feature 002 |
| `alunoId` | `string` | FK → `Aluno.id` | feature 002 |
| `data` | `string` | ISO `YYYY-MM-DD` | feature 002 |
| `tatico` | `number` | 2–5 | feature 002 |
| `tecnico` | `number` | 2–5 | feature 002 |
| `mental` | `number` | 2–5 | feature 002 |

```ts
export interface Avaliacao {
  id: string;
  alunoId: string;
  data: string;
  tatico: number;
  tecnico: number;
  mental: number;
}
```

## Chamada (`models/chamada.model.ts`)

| Campo | Tipo | Origem |
|-------|------|--------|
| `id` | `string` | feature 007 |
| `data` | `string` (ISO) | feature 007 |
| `categoria` | `string` | feature 007 |
| `registros` | `RegistroPresenca[]` | feature 007 |
| `momentos` | `string[]` (ids de momento de treino) | feature 009 |
| `principiosFundamentos` | `string[]` (ids de princípios/fundamentos trabalhados) | feature 009 |

```ts
export interface RegistroPresenca {
  alunoId: string;
  status: 'pendente' | 'presente' | 'falta'; // corrigido após leitura de training.html — não é 'ausente'
}

export interface Chamada {
  id: string;
  data: string;
  categoria: string;
  registros: RegistroPresenca[];
  momentos: string[];
  principiosFundamentos: string[];
}
```

## Jogo (`models/jogo.model.ts`)

| Campo | Tipo | Origem |
|-------|------|--------|
| `id` | `string` | feature 008 |
| `data` | `string` (ISO) | feature 008 |
| `nome` | `string` (nome/adversário do jogo) | feature 008 |
| `participacoes` | `Participacao[]` | feature 008/013 |

```ts
export interface Participacao {
  alunoId: string;
  minutos: number;
}

export interface Jogo {
  id: string;
  data: string;
  nome: string;
  participacoes: Participacao[];
}
```

## Relacionamentos

```
Aluno (1) ──< Avaliacao (N)      via Avaliacao.alunoId
Aluno (1) ──< RegistroPresenca (N) via RegistroPresenca.alunoId, dentro de Chamada
Aluno (1) ──< Participacao (N)   via Participacao.alunoId, dentro de Jogo
```

Nenhuma relação usa referência por objeto (ObjectId/ponteiro) — todas as ligações são
por `id` em string, replicando exatamente o padrão já usado em `sessionStorage`.

## Validações herdadas (sem mudança)

- `Avaliacao.tatico|tecnico|mental` ∈ {2, 3, 4, 5}.
- `Aluno.categoria` ∈ valores de `CATEGORIAS` (inclui `Sub15F`, `Sub17F` desde a feature mais recente de categorias).
- `RegistroPresenca.status` ∈ {`presente`, `ausente`}.
- Nenhuma entidade é deletada fisicamente — comportamento de exclusão (quando existente) sempre foi remoção do array em memória/sessão; esta migração não altera essa regra.
