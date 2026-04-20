# Data Model: Especificações do Treino

**Branch**: `009-training-drill-specs` | **Date**: 2026-04-20

## Entidades

### Chamada (existente — estendida)

Representa o registro de um treino (presença + especificações) para uma data e categoria.

| Campo | Tipo | Descrição | Validação | Status |
|---|---|---|---|---|
| `id` | string (UUID) | Identificador único | Gerado por `crypto.randomUUID()` | Existente |
| `data` | string (YYYY-MM-DD) | Data do treino | Obrigatória; não pode ser futura | Existente |
| `categoria` | string | Categoria do treino | Obrigatória; deve existir em CATEGORIAS | Existente |
| `registros` | RegistroPresença[] | Lista de presenças | Gerada automaticamente | Existente |
| `momentos` | string[] | IDs dos momentos do jogo selecionados | Subset de MOMENTOS_IDS; pode ser vazio | **NOVO** |
| `principiosFundamentos` | string[] | IDs dos princípios/fundamentos selecionados | Subset de todos os IDs de princípios/fundamentos; pode ser vazio | **NOVO** |

**Chave de negócio**: `data + categoria` — sem alteração.

**Backward-compatibility**: Chamadas salvas sem `momentos` e `principiosFundamentos` são tratadas como `[]` ao carregar.

---

### RegistroPresença (existente — sem alteração)

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

## Constantes de Domínio

### MOMENTOS (4 itens)

```js
const MOMENTOS = [
  { id: 'org_ofensiva',    label: 'Org. Ofensiva',    desc: 'Equipe com a posse, construindo jogadas' },
  { id: 'org_defensiva',   label: 'Org. Defensiva',   desc: 'Equipe sem a posse, organizada para defender' },
  { id: 'trans_ofensiva',  label: 'Trans. Ofensiva',  desc: 'Momento da recuperação da posse de bola' },
  { id: 'trans_defensiva', label: 'Trans. Defensiva',  desc: 'Momento da perda da posse de bola' },
];
```

### PRINCIPIOS_FUNDAMENTOS (3 grupos, 18 itens)

```js
const PRINCIPIOS_GRUPOS = [
  {
    titulo: 'Princípios Táticos Defensivos',
    itens: [
      { id: 'contencao',            label: 'Contenção' },
      { id: 'cobertura_defensiva',  label: 'Cobertura Defensiva' },
      { id: 'unidade_defensiva',    label: 'Unidade Defensiva' },
      { id: 'concentracao',         label: 'Concentração' },
      { id: 'equilibrio',           label: 'Equilíbrio' },
    ]
  },
  {
    titulo: 'Princípios Táticos Ofensivos',
    itens: [
      { id: 'espaco_sem_bola',     label: 'Espaço sem Bola' },
      { id: 'espaco_com_bola',     label: 'Espaço com Bola' },
      { id: 'cobertura_ofensiva',  label: 'Cobertura Ofensiva' },
      { id: 'unidade_ofensiva',    label: 'Unidade Ofensiva' },
      { id: 'penetracao',          label: 'Penetração' },
      { id: 'mobilidade',          label: 'Mobilidade' },
    ]
  },
  {
    titulo: 'Fundamentos Técnicos',
    itens: [
      { id: 'controle_chao',       label: 'Controle de Bola no Chão' },
      { id: 'controle_alto',       label: 'Controle de Bola no Alto' },
      { id: 'drible',              label: 'Drible' },
      { id: 'passe',               label: 'Passe' },
      { id: 'dominio',             label: 'Domínio' },
      { id: 'finalizacao',         label: 'Finalização' },
      { id: 'cabeceio',            label: 'Cabeceio' },
    ]
  }
];
```

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
    {
      id: "uuid",
      data: "2026-04-05",
      categoria: "Sub09",
      registros: [
        { alunoId: "uuid-lucas", status: "presente" },
        { alunoId: "uuid-pedro", status: "falta" }
      ],
      momentos: ["org_ofensiva", "trans_defensiva"],              // ← NOVO
      principiosFundamentos: ["contencao", "passe", "mobilidade"] // ← NOVO
    }
  ],
  jogos: [
    // ... (feature 008, sem alteração)
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
                               │
                               ├── momentos: string[]        (IDs de MOMENTOS)
                               └── principiosFundamentos: string[]  (IDs de PRINCIPIOS)
```

- A **Chamada** agora inclui especificações do treino como campos adicionais.
- **Momentos** e **Princípios/Fundamentos** são armazenados como arrays de IDs (strings).
- As listas de opções são constantes fixas no código — não são entidades persistidas.

---

## Validações

- **momentos**: array de strings; cada valor deve estar em `MOMENTOS.map(m => m.id)`; pode ser vazio.
- **principiosFundamentos**: array de strings; cada valor deve estar na união de todos os `itens[].id` de `PRINCIPIOS_GRUPOS`; pode ser vazio.
- **Backward-compatibility**: ao carregar uma chamada sem `momentos` ou `principiosFundamentos`, inicializar como `[]`.
- **Independência**: especificações podem ser salvas sem registros de presença e vice-versa.

---

## Impacto nas Páginas Existentes

| Página | Modificação necessária |
|---|---|
| `src/frontend/pages/training.html` | Reorganizar chamada em collapsible; adicionar seção de especificações; estender lógica de salvar; alterar botão "Salvar Presença" → "Salvar Treino" |
| Demais páginas | Nenhuma alteração |

---

## Funções do Módulo `training.html` (novas/modificadas)

| Função | Entrada | Saída | Descrição | Status |
|---|---|---|---|---|
| `toggleChamada()` | — | void | Expande/recolhe a seção de chamada | **NOVA** |
| `renderMomentos()` | — | void | Renderiza grid 2×2 de momentos com estado de seleção | **NOVA** |
| `renderPrincipios()` | — | void | Renderiza chips de princípios/fundamentos com estado de seleção e contador | **NOVA** |
| `renderEspecificacoes()` | — | void | Orquestra renderMomentos + renderPrincipios | **NOVA** |
| `salvarChamada(chamada)` | Chamada | void | Estendida: salva também `momentos` e `principiosFundamentos` | **MODIFICADA** |
| `renderChamada()` | — | void | Estendida: chama `renderEspecificacoes()` após renderizar chamada | **MODIFICADA** |
| `getOrCreateChamada(data, cat)` | string, string | Chamada | Estendida: inicializa `momentos: []` e `principiosFundamentos: []` se ausentes | **MODIFICADA** |
