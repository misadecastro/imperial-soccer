# Implementation Plan: Chamada de Treino

**Branch**: `007-attendance-tracking` | **Date**: 2026-04-05 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/007-attendance-tracking/spec.md`

## Summary

Adicionar ao Imperial Soccer a tela de **Chamada de Treino** (`training.html`) e um **menu de navegação inferior** presente em todas as telas pós-autenticação. O professor seleciona a data do treino e a categoria (Sub 09 … Sub 14), marca cada aluno como Presente/Falta/Pendente, usa atalhos "Todos Presentes"/"Todos Ausentes" e salva a chamada. Dados persistem em `sessionStorage` com a chave `"imperialState"` — extensão do estado já existente com o campo `chamadas: []`. Esta é uma fase de prototipagem frontend sem backend.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS  
**Storage**: `sessionStorage` com chave `"imperialState"` — estrutura estendida com campo `chamadas: []`  
**Testing**: Manual — DevTools mobile (iPhone SE 375 × 667); fluxo professor validado antes de fechar feature  
**Target Platform**: Mobile browser (primary); desktop browser (secondary)  
**Project Type**: web-app — frontend-only (mock/protótipo; backend planejado em fase futura)  
**Performance Goals**: Marcação individual responde em < 50 ms; lista de até 20 alunos renderiza sem lag perceptível  
**Constraints**: Zero build step; offline-capable (sessionStorage); compatível com iPhone SE (375 px)  
**Scale/Scope**: ~20 alunos por categoria; ~6 categorias; histórico de chamadas ilimitado em sessionStorage (~5 MB)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justificativa |
|---|---|---|
| A feature adiciona complexidade justificada pelo domínio? | ✅ PASS | Registro de presença é entidade central do domínio (Frequência); ausência desta tela impede o professor de operar o fluxo diário. |
| O professor consegue operar o fluxo sem suporte técnico? | ✅ PASS | Fluxo em 3 passos: selecionar data → selecionar categoria → marcar alunos → salvar. Atalho "Todos Presentes" reduz cliques para turmas com alta frequência. |
| Os dados do aluno permanecem consistentes após a operação? | ✅ PASS | Registros de presença referenciam `alunoId`; dados do aluno não são duplicados nem modificados. |
| A API segue o envelope padrão e está documentada? | ⚠️ EXCEÇÃO | Sem API nesta fase — prototipagem frontend. Ver Complexity Tracking. |
| O acesso ao MongoDB usa o driver oficial sem abstrações? | ⚠️ EXCEÇÃO | Sem MongoDB nesta fase — sessionStorage como substituto temporário. Ver Complexity Tracking. |

**Resultado**: 3/5 gates passam plenamente. 2 exceções documentadas na tabela de Complexity Tracking — fase de prototipagem frontend explicitamente declarada na `spec.md` (seção Assumptions).

## Project Structure

### Documentation (this feature)

```text
specs/007-attendance-tracking/
├── plan.md              # Este arquivo (/speckit.plan)
├── research.md          # Phase 0 (/speckit.plan)
├── data-model.md        # Phase 1 (/speckit.plan)
├── quickstart.md        # Phase 1 (/speckit.plan)
└── tasks.md             # Phase 2 (/speckit.tasks — gerado separadamente)
```

### Source Code

```text
src/frontend/
├── index.html                    # Sem alteração (pré-autenticação)
├── css/
│   └── imperial.css              # Sem alteração (usa .btn-attendance já definida)
└── pages/
    ├── login.html                # Sem alteração (pré-autenticação)
    ├── students.html             # Modificado: adiciona menu de navegação inferior
    ├── student-eval.html         # Modificado: adiciona menu de navegação inferior
    └── training.html             # NOVO: tela completa de chamada de treino
```

**Structure Decision**: Projeto frontend puro, option 2 simplificada (apenas `frontend/`). Sem `backend/` nesta fase. Todos os arquivos JS são inline (`<script type="module">`) dentro do HTML — sem módulos externos, sem build step.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Sem backend .NET (viola Princípio IV) | MVP de validação do fluxo professor em campo antes de investir em infraestrutura backend. Spec declara explicitamente: "persistência via sessionStorage — dados perdidos ao fechar o navegador". | Backend completo aumentaria tempo de entrega em semanas; a validação UX é o objetivo desta fase. |
| Sem MongoDB (viola Princípio V) | sessionStorage cobre 100% dos requisitos de persistência desta fase (dados por sessão de navegador). | Banco de dados exigiria Docker, migrations e setup de ambiente — overhead desproporcional para um protótipo. |

## Phase 0: Research

> **Status**: Completo — ver [research.md](research.md)

### Decisões Chave

| Decisão | Escolha | Alternativa Rejeitada |
|---|---|---|
| Estrutura de dados das chamadas | `chamadas[]` no estado existente, mesma estrutura de `avaliacoes[]` | Array plano por aluno; objeto indexado por "data_categoria" |
| Chave única de chamada | `data + categoria` (composta, sem ID extra) | ID composto ou UUID separado por combinação |
| Categorias | Reuso de `CATEGORIAS` / `CATEGORIAS_LABELS` já definidas em `students.html` | Nova fonte de verdade separada |
| Layout | Fidelidade à `Novo-Design/Pagina-Exemplo.png` + tokens de design da feature 006 | Redesign customizado |
| Menu de navegação | Bottom nav bar fixo (`fixed bottom-0 h-16`) em todas as páginas pós-auth | Hambúrguer / sidebar |
| Botão Salvar | Fixo em `bottom-16` (acima da nav bar) — sempre visível sem scroll | Scroll até o fim da lista |

Nenhum NEEDS CLARIFICATION — todos os padrões derivam do código existente ou da imagem de referência.

## Phase 1: Design & Contracts

> **Status**: Completo — ver [data-model.md](data-model.md) e [quickstart.md](quickstart.md)

### Resumo do Modelo de Dados

**Novas entidades** (adicionadas ao estado `sessionStorage`):

| Entidade | Chave de Negócio | Campos |
|---|---|---|
| `Chamada` | `data + categoria` | `id`, `data` (YYYY-MM-DD), `categoria`, `registros[]` |
| `RegistroPresença` | `alunoId` dentro de `Chamada` | `alunoId`, `status` (`"presente"` \| `"falta"` \| `"pendente"`) |

**Entidade existente sem alteração**: `Aluno` (`id`, `nome`, `dataNascimento`, `categoria`).

**Estado completo**:
```js
// sessionStorage["imperialState"]
{
  alunos: [...],       // existente
  avaliacoes: [...],   // existente
  chamadas: [          // NOVO
    {
      id: "uuid",
      data: "2026-04-05",
      categoria: "Sub09",
      registros: [
        { alunoId: "uuid", status: "presente" | "falta" | "pendente" }
      ]
    }
  ]
}
```

### Contracts

Não aplicável — projeto frontend puro sem API exposta nesta fase.  
Contratos de API REST serão definidos quando o backend .NET for implementado (fase futura).

### Funções Públicas do Módulo `training.html`

| Função | Entrada | Saída | Descrição |
|---|---|---|---|
| `findChamada(data, cat)` | string, string | `Chamada \| undefined` | Busca chamada existente no estado |
| `criarChamada(data, cat)` | string, string | `Chamada` | Cria nova chamada com todos os alunos da cat como "pendente" |
| `getOrCreateChamada(data, cat)` | string, string | `Chamada` | Retorna existente ou cria nova |
| `setStatus(chamada, alunoId, status)` | Chamada, string, string | void | Atualiza status de um aluno na chamada |
| `atualizarContadores(chamada)` | Chamada | void | Atualiza os contadores do painel de resumo no DOM |
| `salvarChamada(chamada)` | Chamada | void | Persiste (upsert) a chamada no estado e no sessionStorage |
| `renderLista(chamada)` | Chamada | void | Renderiza os cartões de aluno com botões Presente/Falta |
| `renderHistorico(cat, dataAtual)` | string, string | void | Renderiza histórico de chamadas da categoria |
| `renderChamada()` | — | void | Orquestra toda a renderização da tela atual |
| `initAbas()` | — | void | Cria as abas de categoria e registra listeners |

### UI State Machine

```
INITIAL
  └─→ [data selecionada + categoria ativa]
        ├─→ CHAMADA_NOVA (alunos todos "pendente")
        └─→ CHAMADA_CARREGADA (status existentes carregados)
              ↕  (marcações individuais / "Todos Presentes" / "Todos Ausentes")
          CHAMADA_MODIFICADA
              └─→ [Salvar Presença]
                    └─→ CHAMADA_SALVA → toast de confirmação
```

## Post-Design Constitution Check

| Gate | Status | Notas |
|---|---|---|
| Dados do aluno consistentes? | ✅ PASS | Chamadas referenciam `alunoId` — alunos excluídos não causam erro (filtro no `getOrCreateChamada`). |
| Fluxo operável sem suporte técnico? | ✅ PASS | Testado no quickstart: 13 passos, todos executáveis por usuário não técnico. |
| Simplicidade funcional? | ✅ PASS | Nenhuma abstração extra; funções são diretas ao estado. Sem biblioteca extra além do Tailwind já presente. |
| Exceções de stack documentadas? | ✅ PASS | Complexity Tracking preenchido com justificativa. |

---

**Artifacts gerados nesta fase**:

| Arquivo | Status |
|---|---|
| [plan.md](plan.md) | ✅ Este arquivo |
| [research.md](research.md) | ✅ Completo |
| [data-model.md](data-model.md) | ✅ Completo |
| [quickstart.md](quickstart.md) | ✅ Completo |
| tasks.md | ⏳ Pendente — executar `/speckit.tasks` |
