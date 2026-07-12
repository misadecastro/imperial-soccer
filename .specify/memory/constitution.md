<!--
SYNC IMPACT REPORT
==================
Version change: 2.0.0 → 2.1.0 (MINOR — clarificação/restrição adicional, nenhum princípio redefinido)
Added clarifications:
  - Restrições de Arquitetura → autenticação (ASP.NET Core Identity) DEVE usar stores
    customizados sobre MongoDB.Driver; PROIBIDO usar os providers padrão do Identity
    baseados em Entity Framework Core. Esclarece, não redefine, a proibição de EF/ORM
    já existente no Princípio V e nas Restrições de Arquitetura.
  - Entidades do Domínio → adicionados Usuário, Papel e Sessão (autenticação).
Rationale: feature 016-user-authentication introduz a primeira camada de backend do
  projeto (ASP.NET Core Identity). O ASP.NET Core Identity padrão assume Entity
  Framework Core como armazenamento; esta emenda formaliza, antes do /speckit.plan,
  que a implementação DEVE usar stores customizados (IUserStore/IRoleStore) sobre
  MongoDB.Driver direto — mantendo os princípios já vigentes sem necessidade de
  redefini-los.
Templates updated:
  - .specify/templates/plan-template.md ✅ (Constitution Check gate inalterado)
  - .specify/templates/spec-template.md ✅ (sem impacto)
  - .specify/templates/tasks-template.md ✅ (sem impacto)
Follow-up TODOs: nenhum — todos os placeholders resolvidos.
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
O frontend em Angular (TypeScript) + Tailwind CSS consome exclusivamente essa API — nenhuma lógica de
negócio reside no frontend; componentes e serviços Angular lidam apenas com apresentação e orquestração
de chamadas.
A API DEVE versionar seus endpoints a partir de `/api/v1/`.
Respostas DEVEM seguir envelope padrão: `{ success, data, message, errors }`.
Enquanto a integração com a API não for implementada para uma página, o frontend Angular PODE persistir
dados em `sessionStorage` (chave `imperialState`) como camada de transição — esse uso é temporário e
DEVE ser substituído por chamadas à API conforme cada feature migrar.

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
| Frontend | Angular (TypeScript) + Tailwind CSS v3, via Angular CLI |
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
    └── src/
        ├── app/
        │   ├── pages/          # Componentes de página (rota), um por feature
        │   ├── components/     # Componentes compartilhados/reutilizáveis
        │   ├── services/       # Serviços Angular (chamadas à API e/ou sessionStorage)
        │   └── models/         # Interfaces TypeScript das entidades de domínio
        ├── styles/             # Tailwind CSS
        └── main.ts
```

### Entidades do Domínio

- **Aluno** — ficha completa (nome, data de nascimento, posição, responsável, contato, foto opcional)
- **Avaliação** — pontuação por aspecto: Técnico, Tático, Mental (1–10, com observações)
- **Frequência** — registro de presença/falta por treino (data, aluno, presente/ausente, justificativa)
- **MinutagemJogo** — minutos jogados por aluno em cada jogo do mês (data, adversário, minutos)
- **SessãoDeTreino** — treino realizado com distribuição de minutos por aspecto
  (Técnico, Tático, Físico, Mental, Recreativo)
- **Usuário** — conta de acesso ao sistema (nome, identificador de login, senha com hashing seguro,
  papel, status ativo/inativo); distinto de Aluno — Usuário é quem opera o sistema, Aluno é quem é gerido
- **Papel** — nível de permissão de um Usuário: Administrador (acesso total, incluindo gestão de
  usuários) ou Professor (acesso operacional, sem gestão de usuários)
- **Sessão (autenticação)** — período de acesso autenticado de um Usuário, criado no login e finalizado
  no logout ou por expiração

### Restrições de Arquitetura

- PROIBIDO usar Entity Framework ou qualquer ORM — acesso direto via MongoDB.Driver.
- PROIBIDO lógica de negócio nos Controllers — DEVE residir nos Services.
- PROIBIDO estado global ou singleton mutable nos serviços — usar injeção de dependência.
- Frontend usa Angular CLI; build step é parte normal do fluxo de desenvolvimento e deploy
  (substitui o modelo anterior de CDN sem build).
- PROIBIDO duplicar HTML/lógica entre páginas quando o padrão de UI já existir como componente
  Angular reutilizável — extrair para `components/` em vez de copiar.
- Tailwind CSS é integrado via build do Angular (não mais via CDN).
- Autenticação (ASP.NET Core Identity) DEVE usar implementações customizadas de
  `IUserStore`/`IRoleStore` sobre MongoDB.Driver direto — PROIBIDO usar os providers padrão do
  Identity baseados em Entity Framework Core (`Microsoft.AspNetCore.Identity.EntityFrameworkCore`),
  consistente com a proibição geral de EF/ORM já vigente.
- Endpoints protegidos DEVEM exigir um token/sessão de autenticação válido; o envelope de resposta
  padrão (`{ success, data, message, errors }`) aplica-se também às respostas de autenticação/erro.

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
- Componentes Angular: arquivo `kebab-case.component.ts`, classe `PascalCaseComponent`,
  seletor `app-kebab-case` (ex.: `student-card.component.ts` → `StudentCardComponent` → `app-student-card`).
- Serviços Angular: arquivo `kebab-case.service.ts`, classe `PascalCaseService`
  (ex.: `student.service.ts` → `StudentService`).
- Interfaces de modelo: arquivo `kebab-case.model.ts`, interface `PascalCase`
  (ex.: `avaliacao.model.ts` → `Avaliacao`).

## Governance

Esta constituição é a fonte de verdade para decisões de design e arquitetura do Imperial Soccer.
Ela DEVE ser consultada antes de iniciar qualquer nova feature ou mudança estrutural.

**Amendamentos**:
- MAJOR (x.0.0): remoção ou redefinição de princípio existente — requer justificativa documentada.
- MINOR (x.y.0): adição de princípio, seção ou restrição relevante.
- PATCH (x.y.z): clarificações, correções de texto, ajustes de nomenclatura.

Toda PR DEVE verificar o Constitution Check do `plan.md` correspondente antes do merge.
Complexidade adicional DEVE ser registrada na tabela de Complexity Tracking do plano.

**Version**: 2.1.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-06-27
