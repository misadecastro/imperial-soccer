# Implementation Plan: Remoção da Avaliação de Alunos

**Branch**: `021-remove-evaluation` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-remove-evaluation/spec.md`

## Summary

Remover completamente a funcionalidade de Avaliação Técnico-Tática-Mental do sistema —
interface (tela dedicada, botão "Avaliar", notas na lista de alunos, seção do dashboard),
serviço/endpoint de dados, estado/armazenamento e textos residuais. É uma feature de
**exclusão de escopo**: nenhum comportamento novo é introduzido; o trabalho consiste em
apagar arquivos exclusivos da avaliação e editar os pontos onde outras telas a referenciam,
garantindo que o restante do sistema (alunos, frequência, jogos, treinos, usuários, auth)
continue sem regressão.

## Technical Context

**Language/Version**: C# 12 / .NET 8 (backend `Imperial.Api`); TypeScript 5.x / Angular 18 (frontend `src/frontend`)  
**Primary Dependencies**: `MongoDB.Driver` (backend), Angular `HttpClient`/`Router` (frontend) — nenhuma dependência nova; possivelmente **remover** dependências que ficam órfãs (Chart.js só se nenhum outro gráfico permanecer — ver research)  
**Storage**: MongoDB — coleção `evaluations` deixa de ser usada (drop opcional dos dados); `sessionStorage` (`imperialState`) perde o campo `avaliacoes`  
**Testing**: xUnit (`Imperial.Api.Tests`) — não há testes de avaliação existentes; `ng build`/`tsc` como gate de tipos no frontend  
**Target Platform**: API ASP.NET Core (localhost:5179) + SPA Angular (localhost:4200)  
**Project Type**: Web (backend + frontend)  
**Performance Goals**: N/A (remoção não altera metas de desempenho)  
**Constraints**: Build de tipos DEVE permanecer verde (`strict: true` no frontend); exclusão de aluno DEVE continuar funcional sem a cascata de avaliações  
**Scale/Scope**: ~7 arquivos removidos + ~9 arquivos editados (5 frontend de código, 2 backend, 2 de texto/estado)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Simplicidade Funcional** — ✅ Reforçada: a remoção reduz complexidade e superfície do sistema.
- [x] **II. Professor como Ator Central** — ✅ Fluxos do professor permanecem; apenas some uma tela que deixará de existir por decisão do usuário.
- [~] **III. Aluno como Núcleo do Domínio** — ⚠️ **Desvio deliberado**: a constituição lista `Avaliação`/`AvaliaçãoTécnicoTáticaMental` entre as entidades centrais. O usuário pediu explicitamente a remoção total dessa entidade. Ver Complexity Tracking — requer emenda futura da constituição (não bloqueia esta feature; a decisão é do usuário).
- [x] **IV. API-First com Frontend Desacoplado** — ✅ Removemos endpoint + serviço juntos; nenhuma lógica de negócio migra para o frontend.
- [x] **V. Persistência Orientada a Documentos** — ✅ Coleção `evaluations` deixa de ser referenciada; sem novas abstrações.
- [x] **Restrições de Arquitetura** — ✅ Sem EF/ORM, sem lógica em controller, sem singleton mutável introduzido.

**Gate**: PASS (com desvio documentado no Princípio III, autorizado pelo usuário).

## Project Structure

### Documentation (this feature)

```text
specs/021-remove-evaluation/
├── plan.md              # Este arquivo (/speckit.plan)
├── research.md          # Phase 0 — decisões de remoção
├── data-model.md        # Phase 1 — entidade removida + impacto no estado
├── quickstart.md        # Phase 1 — roteiro de validação manual pós-remoção
├── contracts/
│   └── removed-evaluations-api.md  # Contrato descontinuado (endpoints removidos)
└── tasks.md             # Phase 2 (/speckit.tasks — NÃO criado aqui)
```

### Source Code (repository root)

**Arquivos a REMOVER (exclusivos de avaliação):**

```text
src/frontend/src/app/
├── pages/student-eval/                     # tela dedicada (ts, html, css)
├── services/evaluations.service.ts         # serviço HTTP de avaliação
├── models/avaliacao.model.ts               # interface Avaliacao + DTOs
└── components/evolution-chart/             # gráfico técnico-tático-mental (ts, html, css)

backend/Imperial.Api/
├── Controllers/EvaluationsController.cs     # CRUD de avaliação
├── DTOs/EvaluationDtos.cs                   # DTOs de avaliação
└── Models/Avaliacao.cs                      # modelo de domínio
```

**Arquivos a EDITAR (referenciam avaliação, mas permanecem):**

```text
src/frontend/src/app/
├── app.routes.ts                           # remover rota + import de student-eval
├── models/imperial-state.model.ts          # remover campo avaliacoes[]
├── services/state.service.ts               # remover leitura de avaliacoes
├── services/students.service.ts            # remover cascata de exclusão de avaliacoes
├── pages/students/students.component.ts     # remover EvalChip, evalChips, avaliar, ultimaAvaliacao, import
├── pages/students/students.component.html   # remover chips de notas + botão "Avaliar"; ajustar texto do confirm
├── pages/dashboard/dashboard.component.ts    # remover avaliacoesRecentes, import Avaliacao/EvolutionChart
├── pages/dashboard/dashboard.component.html  # remover seção "Evolução Técnico-Tática-Mental"
└── pages/home/home.component.html           # revisar texto que menciona "avaliações"

backend/Imperial.Api/
└── Controllers/StudentsController.cs        # remover coleção _avaliacoes + DeleteManyAsync na exclusão
```

**Structure Decision**: Projeto Web existente (backend `.NET` + frontend Angular). Nenhuma
estrutura nova; a feature apenas subtrai. A regra de ouro é: **um arquivo é excluído somente
se for exclusivo de avaliação; caso contrário, é editado cirurgicamente** para remover apenas
as referências de avaliação, preservando o resto.

## Complexity Tracking

> Registrado por haver um desvio ao Princípio III (entidade central da constituição).

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Remoção da entidade `Avaliação`, listada como central no Princípio III e na seção "Entidades do Domínio" da constituição | Solicitação explícita e direta do usuário: "tudo referente a avaliação deve ser removido". Reduz escopo e complexidade (alinhado ao Princípio I) | Manter a entidade "só no backend/oculta" foi rejeitado porque contraria o pedido de remoção total e deixaria dívida (código/coleção órfãos). Recomenda-se emenda MAJOR/MINOR da constituição removendo `Avaliação` das entidades centrais — fora do escopo desta feature, mas registrada aqui. |
