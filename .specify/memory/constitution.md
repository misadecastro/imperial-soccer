<!--
SYNC IMPACT REPORT
==================
Version change: N/A → 1.0.0 (initial ratification)
Added sections:
  - Core Principles (I–V)
  - Stack & Architecture
  - Development Workflow
  - Governance
Templates updated:
  - .specify/templates/plan-template.md ✅ (aligned via Constitution Check gate)
  - .specify/templates/spec-template.md ✅ (no breaking changes; FR/SC structure compatible)
  - .specify/templates/tasks-template.md ✅ (web-app path convention matches backend/frontend split)
Follow-up TODOs: none — all placeholders resolved.
-->

# Imperial Soccer Constitution

## Core Principles

### I. Simplicidade Funcional

O sistema DEVE ser simples e direto ao ponto.
Não adicionar camadas de abstração desnecessárias; a arquitetura DEVE ser suficiente para o problema,
nunca superengenharada.
Complexidade só é justificada quando existe uma necessidade real e documentada.
Cada decisão de design DEVE ter um propósito funcional claro.

### II. Professor como Ator Central

O professor é o único usuário operacional do sistema.
Toda interface e fluxo DEVE ser otimizado para o uso do professor em campo ou escritório.
Operações DEVEM ser rápidas, com o mínimo de cliques/telas possível.
O sistema NÃO deve exigir conhecimento técnico do usuário.

### III. Aluno como Núcleo do Domínio

Toda funcionalidade gravita em torno do aluno (student).
As entidades centrais são: **Aluno**, **AvaliaçãoTécnicoTáticaMental**, **Frequência**, **MinutagemJogo** e **SessãoDeTreino**.
Dados de alunos DEVEM estar sempre consistentes e jamais ser deletados fisicamente (soft delete obrigatório).
Relacionamentos entre entidades DEVEM ser explícitos no modelo de domínio.

### IV. API-First com Frontend Desacoplado

O backend .NET Core DEVE expor uma API RESTful completa e autodocumentada (Swagger/OpenAPI).
O frontend em Tailwind CSS + JavaScript puro consome exclusivamente essa API — nenhuma lógica de negócio
reside no frontend.
A API DEVE versionar seus endpoints a partir de `/api/v1/`.
Respostas DEVEM seguir envelope padrão: `{ success, data, message, errors }`.

### V. Persistência Orientada a Documentos

MongoDB é o banco de dados exclusivo do sistema.
Cada coleção principal corresponde a uma entidade de domínio.
Embeddings são preferidos sobre referências quando os dados são sempre acessados juntos
(ex.: itens de avaliação dentro da ficha do aluno).
Referências (ObjectId) são usadas quando entidades têm ciclo de vida independente
(ex.: aluno ↔ sessão de treino).

## Stack & Arquitetura

### Tecnologias Obrigatórias

| Camada | Tecnologia |
|---|---|
| Backend | .NET 8+ (ASP.NET Core Web API, C#) |
| Banco de dados | MongoDB (driver oficial MongoDB.Driver) |
| Frontend | HTML5 + Tailwind CSS v3 + JavaScript (ES Modules, sem frameworks) |
| Documentação API | Swagger / Scalar (via Swashbuckle) |

### Estrutura de Projeto

```text
imperial/
├── backend/
│   ├── Imperial.Api/          # Projeto principal ASP.NET Core
│   │   ├── Controllers/
│   │   ├── Models/
│   │   ├── Services/
│   │   ├── Repositories/
│   │   └── Program.cs
│   └── Imperial.Api.Tests/    # Testes de integração e unidade
└── frontend/
    ├── index.html
    ├── pages/
    ├── components/
    └── services/              # Módulos JS de chamada à API
```

### Entidades do Domínio

- **Aluno** — ficha completa (nome, data de nascimento, posição, responsável, contato, foto opcional)
- **Avaliação** — pontuação por aspecto: Técnico, Tático, Mental (1–10, com observações)
- **Frequência** — registro de presença/falta por treino (data, aluno, presente/ausente, justificativa)
- **MinutagemJogo** — minutos jogados por aluno em cada jogo do mês (data, adversário, minutos)
- **SessãoDeTreino** — treino realizado com distribuição de minutos por aspecto
  (Técnico, Tático, Físico, Mental, Recreativo)

### Restrições de Arquitetura

- PROIBIDO usar Entity Framework ou qualquer ORM — acesso direto via MongoDB.Driver.
- PROIBIDO lógica de negócio nos Controllers — DEVE residir nos Services.
- PROIBIDO estado global ou singleton mutable nos serviços — usar injeção de dependência.
- Frontend DEVE funcionar sem build step (sem Webpack, Vite, etc.) — Tailwind via CDN em dev,
  build opcional para produção.

## Fluxo de Desenvolvimento

### Sequência Mandatória por Feature

1. Atualizar ou criar spec em `.specify/specs/` (`/speckit.specify`).
2. Gerar plano técnico (`/speckit.plan`) — incluindo Constitution Check.
3. Gerar lista de tarefas (`/speckit.tasks`).
4. Implementar seguindo as tarefas na ordem definida.
5. Validar manualmente o fluxo do professor antes de fechar a feature.

### Constitution Check (gate obrigatório no plan.md)

Antes de implementar qualquer feature, verificar:

- [ ] A feature adiciona complexidade justificada pelo domínio?
- [ ] O professor consegue operar o fluxo sem suporte técnico?
- [ ] Os dados do aluno permanecem consistentes após a operação?
- [ ] A API segue o envelope padrão e está documentada?
- [ ] O acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias?

### Nomenclatura

- Entidades e classes: `PascalCase` em português (ex.: `FichaAluno`, `SessaoDeTreino`).
- Endpoints REST: kebab-case em inglês (ex.: `/api/v1/students`, `/api/v1/training-sessions`).
- Coleções MongoDB: snake_case plural em inglês (ex.: `students`, `training_sessions`).
- Arquivos JS: camelCase (ex.: `studentService.js`).

## Governance

Esta constituição é a fonte de verdade para decisões de design e arquitetura do Imperial Soccer.
Ela DEVE ser consultada antes de iniciar qualquer nova feature ou mudança estrutural.

**Amendamentos**:
- MAJOR (x.0.0): remoção ou redefinição de princípio existente — requer justificativa documentada.
- MINOR (x.y.0): adição de princípio, seção ou restrição relevante.
- PATCH (x.y.z): clarificações, correções de texto, ajustes de nomenclatura.

Toda PR DEVE verificar o Constitution Check do `plan.md` correspondente antes do merge.
Complexidade adicional DEVE ser registrada na tabela de Complexity Tracking do plano.

**Version**: 1.0.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
