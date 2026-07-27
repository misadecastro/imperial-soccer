# Phase 1 — Data Model: Configuração de Treino com Persistência Real

## Visão geral

Duas coleções MongoDB, cada uma com filhos **embutidos** (Princípio V). Momentos referenciam Princípios/Itens por `id` string dentro dos vínculos.

```text
training_principles (coleção)          game_moments (coleção)
└── PrincipioGrupo                     └── Momento
    ├── id                                 ├── id
    ├── titulo                             ├── label
    ├── filtro                             ├── desc
    └── itens: [ItemTrabalhado]            ├── tipo
        ├── id                             └── vinculos: [VinculoMomentoPrincipio]
        └── label                             ├── grupoId  ──► PrincipioGrupo.id
                                              └── itemIds: [ ─► ItemTrabalhado.id ]
```

## Entidade: PrincipioGrupo (coleção `training_principles`)

| Campo   | Tipo                              | Regras |
|---------|-----------------------------------|--------|
| `id`    | string (GUID; slug no seed)       | PK. Gerado no backend em criações via API. |
| `titulo`| string                            | Obrigatório, não vazio (trim). Único entre grupos, case-insensitive (FR-005). |
| `filtro`| string enum: `defensivo` \| `ofensivo` \| `sempre` | Default `sempre`. |
| `itens` | array de `ItemTrabalhado`         | Embutido. Pode ser vazio. |

### Embutido: ItemTrabalhado

| Campo  | Tipo                         | Regras |
|--------|------------------------------|--------|
| `id`   | string (GUID; slug no seed)  | Único dentro do grupo. Gerado no backend. |
| `label`| string                       | Obrigatório, não vazio (trim). Único dentro do mesmo grupo, case-insensitive (FR-005). |

## Entidade: Momento (coleção `game_moments`)

| Campo     | Tipo                              | Regras |
|-----------|-----------------------------------|--------|
| `id`      | string (GUID; slug no seed)       | PK. Gerado no backend em criações via API. |
| `label`   | string                            | Obrigatório, não vazio (trim). Único entre momentos, case-insensitive (FR-005). |
| `desc`    | string                            | Opcional (default vazio). |
| `tipo`    | string enum: `ofensivo` \| `defensivo` | Default `ofensivo`. |
| `vinculos`| array de `VinculoMomentoPrincipio`| Embutido. Pode ser vazio. |

### Embutido: VinculoMomentoPrincipio

| Campo     | Tipo             | Regras |
|-----------|------------------|--------|
| `grupoId` | string           | Referência a `PrincipioGrupo.id`. Um por grupo por momento (sem duplicatas). |
| `itemIds` | array de string  | Referências a `ItemTrabalhado.id` do grupo referenciado. Subconjunto dos itens do grupo. |

## Regras de Integridade (RI)

- **RI-1 (FR-006)**: ao remover um `PrincipioGrupo`, remover de **todos** os `Momento` os vínculos cujo `grupoId` == id removido.
- **RI-2 (FR-007)**: ao remover um `ItemTrabalhado`, remover esse `itemId` de **todos** os `itemIds` de vínculos (do grupo correspondente) em todos os momentos.
- **RI-3 (FR-005)**: unicidade case-insensitive + trim — títulos de grupos entre si; labels de itens dentro de um grupo; labels de momentos entre si.
- **RI-4 (FR-005)**: nomes não vazios após trim em grupos, itens e momentos.
- **RI-5 (leitura, robustez)**: ao substituir vínculos de um momento (`PUT .../vinculos`), descartar vínculos a `grupoId` inexistente e `itemIds` que não pertençam ao grupo (equivalente ao `definirVinculos` da feature 019).

## Seed inicial (FR-012) — idempotente por coleção

Replica exatamente os dados fixos da feature 019 (ids-slug preservados):

**`training_principles`** (3 grupos):
- `principios_defensivos` — "Princípios Táticos Defensivos" (`defensivo`): contencao, cobertura_defensiva, unidade_defensiva, concentracao, equilibrio.
- `principios_ofensivos` — "Princípios Táticos Ofensivos" (`ofensivo`): espaco_sem_bola, espaco_com_bola, cobertura_ofensiva, unidade_ofensiva, penetracao, mobilidade.
- `fundamentos_tecnicos` — "Fundamentos Técnicos" (`sempre`): controle_chao, controle_alto, drible, passe, dominio, finalizacao, cabeceio.

**`game_moments`** (4 momentos, vínculos vazios):
- `org_ofensiva` — "Org. Ofensiva" / "Equipe com a posse, construindo jogadas" (`ofensivo`).
- `org_defensiva` — "Org. Defensiva" / "Equipe sem a posse, organizada para defender" (`defensivo`).
- `trans_ofensiva` — "Trans. Ofensiva" / "Momento da recuperação da posse de bola" (`ofensivo`).
- `trans_defensiva` — "Trans. Defensiva" / "Momento da perda da posse de bola" (`defensivo`).

Inserção condicionada a coleção vazia (verificação independente por coleção); não sobrescreve edições feitas pelo administrador.

## Correspondência com o frontend

As interfaces TypeScript da feature 019 (`training-config.model.ts`) já correspondem 1:1 a este modelo (`PrincipioGrupo`, `ItemTrabalhado`, `Momento`, `VinculoMomentoPrincipio`), com os mesmos nomes de campo em camelCase. O backend serializa em camelCase para casar com o frontend (configuração de serialização padrão do projeto já usada por `Aluno`/`Avaliacao`).
