# Implementation Plan: Ficha do Aluno com Avaliações Dinâmicas

**Branch**: `022-student-profile-card` | **Date**: 2026-07-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/022-student-profile-card/spec.md`

## Summary

Criar a **Ficha do Aluno**: uma página acessível pelo botão "Ficha" na lista de alunos,
organizada em 3 colunas (1 no celular). Coluna 1 traz o quadro "Aluno" (dados do atleta com
edição inline: foto, pé dominante, massa corporal, estatura + nome/nascimento/idade calculada)
e o quadro "Avaliação Geral" (texto livre). Colunas 2 e 3 exibem quadros para **tipos de
avaliação dinâmicos** — cada tipo tem nome e itens, é gerido pelo administrador (engrenagem) e
gera um quadro por aluno com botão "Avaliar" (pontuação 1–5 por item, data), gráfico de radar
(estado atual), gráfico de evolução por item e histórico. Exclusão de tipo é **soft delete**.

**Abordagem técnica**: reaproveitar diretamente o padrão da feature 020 (config de treino) —
coleção-raiz com itens embutidos + controller com escrita restrita a Administrador e leitura
autenticada + serviço Angular com cache em memória. Estende-se `students` com os campos da
ficha (embutidos, acessados sempre juntos); criam-se as coleções `evaluation_types`
(soft-deletable) e `evaluations` (histórico, ciclo de vida próprio). Gráficos via Chart.js
(`chart.js/auto` — já usado no dashboard), tipos radar e line. Nenhuma dependência nova.

## Technical Context

**Language/Version**: C# 12 / .NET 8 (backend `Imperial.Api`); TypeScript 5.x / Angular 18 (frontend `src/frontend`)  
**Primary Dependencies**: `MongoDB.Driver`, `Microsoft.AspNetCore.Authentication.JwtBearer` (já presentes); Angular `HttpClient` (já provido), Chart.js via `chart.js/auto` (já usado no dashboard) — **sem dependência nova**  
**Storage**: MongoDB — estende a coleção `students` (campos da ficha embutidos); novas coleções `evaluation_types` (soft delete) e `evaluations` (registros/histórico). Foto do atleta como **data URI base64** embutida no documento do aluno (sem blob storage)  
**Testing**: xUnit (`Imperial.Api.Tests`) contra MongoDB real em bancos dedicados; `ng build`/`tsc` (strict) como gate de tipos no frontend  
**Target Platform**: API ASP.NET Core (localhost:5179) + SPA Angular (localhost:4200)  
**Project Type**: Web (backend + frontend)  
**Performance Goals**: interações instantâneas para escala escolar (dezenas de alunos, poucos tipos, histórico curto por aluno/tipo)  
**Constraints**: TS `strict: true`; gestão de tipos restrita a Administrador; exclusão de tipo = soft delete (nenhum registro apagado fisicamente); foto comprimida no cliente antes do upload  
**Scale/Scope**: ~3 rotas novas no frontend (ficha, gestão de tipos, avaliar), ~5 componentes, 3 serviços; 3 controllers/áreas no backend; 3 coleções afetadas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Simplicidade Funcional** — ✅ Reusa o padrão consolidado da feature 020; sem novas
  camadas/dependências. Foto em base64 evita infra de storage (justificado pela escala).
- [x] **II. Professor como Ator Central** — ✅ Fluxo do professor (abrir ficha, avaliar,
  preencher avaliação geral) em poucos cliques; gestão de tipos fica com o administrador.
- [~] **III. Aluno como Núcleo do Domínio** — ⚠️ A constituição nomeia
  `AvaliaçãoTécnicoTáticaMental` como entidade central (modelo fixo, removido na feature 021).
  Esta feature a substitui por **Avaliação dinâmica** (tipos configuráveis). É uma
  generalização coerente com o domínio (tudo gira em torno do Aluno), mas o **nome da
  entidade na constituição deve ser atualizado** — ver Complexity Tracking (emenda recomendada,
  não bloqueia). Soft delete de tipos respeita a orientação de não apagar dados de domínio.
- [x] **IV. API-First com Frontend Desacoplado** — ✅ Endpoints REST versionados `/api/v1/*`
  com envelope `{ success, data, message, errors }`; Angular consome via serviços, sem lógica
  de negócio no frontend (radar/evolução são apresentação).
- [x] **V. Persistência Orientada a Documentos** — ✅ Itens embutidos no tipo (acessados
  juntos); campos da ficha embutidos no aluno; `evaluations` referenciando `alunoId`/`tipoId`
  por terem ciclo de vida próprio (histórico).
- [~] **Restrições de Arquitetura** — ⚠️ A constituição proíbe "lógica de negócio nos
  Controllers". O backend atual (Students, TrainingPrinciples — feature 020) coloca validação
  diretamente nos controllers. Para **consistência com o código existente** e simplicidade,
  esta feature segue o mesmo padrão (validação no controller). Registrado em Complexity
  Tracking. Demais restrições atendidas: sem EF/ORM (MongoDB.Driver direto), DI, sem singleton
  mutável, Tailwind via build, componentes reutilizáveis extraídos.

**Gate**: PASS (com 2 desvios documentados e autorizados por consistência/decisão do usuário).

## Project Structure

### Documentation (this feature)

```text
specs/022-student-profile-card/
├── plan.md              # Este arquivo
├── research.md          # Phase 0 — decisões técnicas
├── data-model.md        # Phase 1 — entidades e coleções
├── quickstart.md        # Phase 1 — roteiro de validação
├── contracts/
│   ├── students-profile-api.md    # PUT dos campos da ficha no aluno
│   ├── evaluation-types-api.md    # CRUD de tipos (admin) + soft delete
│   └── evaluations-api.md         # criar/listar avaliações (histórico)
└── tasks.md             # Phase 2 (/speckit.tasks — NÃO criado aqui)
```

### Source Code (repository root)

**Backend** (`backend/Imperial.Api/`):

```text
Models/
├── Aluno.cs                     # EDITAR — add Foto, PeDominante, MassaCorporal, Estatura, AvaliacaoGeral
├── EvaluationType.cs            # NOVO — raiz de `evaluation_types` (embute EvaluationItem); campo Arquivado (soft delete)
├── EvaluationItem.cs            # NOVO — item embutido (Id, Nome)
└── Evaluation.cs                # NOVO — registro em `evaluations` (AlunoId, TipoId, Data, Pontuacoes[])
DTOs/
├── StudentDtos.cs               # EDITAR/NOVO — UpdateStudentProfileRequest + resposta estendida
└── EvaluationDtos.cs            # NOVO — Create/Update EvaluationType, Create Evaluation, responses
Controllers/
├── StudentsController.cs        # EDITAR — PUT `/students/{id}/profile` (campos da ficha) + Map estendido
├── EvaluationTypesController.cs # NOVO — CRUD de tipos (escrita: Administrador; leitura: autenticado); DELETE = soft delete
└── EvaluationsController.cs     # NOVO — POST criar, GET listar por aluno/tipo
```

**Frontend** (`src/frontend/src/app/`):

```text
models/
├── aluno.model.ts               # EDITAR — add peDominante, massaCorporal, estatura, foto, avaliacaoGeral
├── evaluation-type.model.ts     # NOVO — EvaluationType + EvaluationItem
└── evaluation.model.ts          # NOVO — Evaluation + Pontuacao
services/
├── students.service.ts          # EDITAR — atualizarFicha(id, dados)
├── evaluation-types.service.ts  # NOVO — cache + CRUD (padrão training-config.service)
└── evaluations.service.ts       # NOVO — criar/listar avaliações
pages/
├── students/                    # EDITAR — botão "Ficha" → /student-profile
├── student-profile/             # NOVO — a ficha (3 colunas)
├── evaluation-types/            # NOVO — gestão de tipos (admin; via engrenagem)
└── student-evaluation/          # NOVO — tela "Avaliar" (data + itens 1–5 + evolução + histórico)
components/
├── student-info-card/           # NOVO — quadro "Aluno" com edição inline
├── general-evaluation/          # NOVO — quadro "Avaliação Geral"
├── evaluation-type-panel/       # NOVO — quadro por tipo (radar OU botão Avaliar)
└── radar-chart/                 # NOVO — gráfico de radar reutilizável (Chart.js)
app.routes.ts                    # EDITAR — rotas student-profile, evaluation-types (admin), student-evaluation
```

**Structure Decision**: Projeto Web existente. A feature reaproveita o padrão da feature 020
para os tipos dinâmicos e o padrão de gráfico do dashboard (Chart.js) para radar/linha. Novas
rotas seguem o `authGuard` (e `data: { papel: 'Administrador' }` para a gestão de tipos, como
`training-config`/`users`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Substituição da entidade `AvaliaçãoTécnicoTáticaMental` (nomeada na constituição) por `Avaliação` dinâmica | Pedido do usuário: tipos de avaliação configuráveis dinamicamente, não mais 3 dimensões fixas. Generaliza o domínio mantendo o Aluno como núcleo | Manter o modelo fixo contraria o pedido. Recomenda-se emenda (MINOR) da constituição renomeando a entidade para `Avaliação` (com tipos/itens dinâmicos) — fora do escopo desta feature |
| Validação nos Controllers (a constituição pede lógica nos Services) | Consistência com os 3 controllers existentes (Students, TrainingPrinciples, etc.), que já validam no controller; introduzir Services só nesta feature criaria divergência de padrão | Extrair Services agora quebraria a uniformidade do backend atual sem ganho funcional; a lógica é CRUD/validação simples. Alinhamento total à constituição seria uma refatoração transversal, fora do escopo |
