# Research: Ficha do Aluno com Avaliações Dinâmicas

**Feature**: 022-student-profile-card | **Date**: 2026-07-27

Sem tecnologia nova. As decisões abaixo definem como reaproveitar padrões existentes e
resolvem os pontos em aberto do Technical Context.

## Decisão 1 — Padrão de tipos dinâmicos reaproveita a feature 020

- **Decision**: Modelar `EvaluationType` como coleção-raiz `evaluation_types` embutindo
  `EvaluationItem`, exatamente como `PrincipioGrupo`/`ItemTrabalhado` (feature 020). Controller
  com leitura `[Authorize]` (autenticado) e escrita `[Authorize(Roles = Roles.Administrador)]`.
  Serviço Angular com cache em memória e getters síncronos (padrão `TrainingConfigService`).
- **Rationale**: Padrão já validado no projeto; minimiza risco e mantém uniformidade.
- **Alternatives considered**: Coleção separada de itens com referência — rejeitada; itens são
  sempre acessados com o tipo (constituição, embedding preferido).

## Decisão 2 — Create/Update do tipo carregam a lista de itens no payload

- **Decision**: `POST /evaluation-types` e `PUT /evaluation-types/{id}` recebem `nome` + a lista
  completa de `itens` (nomes). O backend reconcilia itens (mantém Id de itens preexistentes por
  correspondência, cria novos, remove ausentes).
- **Rationale**: O fluxo "Novo" da spec é um formulário único (nome + adicionar itens antes de
  salvar); um único payload é mais simples que endpoints por item (que a 020 usou para um fluxo
  diferente). Menos idas ao servidor.
- **Alternatives considered**: Endpoints `POST/PUT/DELETE .../items/{itemId}` (como na 020) —
  rejeitado por não casar com o modal de criação e adicionar complexidade desnecessária.
- **Cuidado**: preservar `Id` de itens já avaliados ao editar, para não órfãos no histórico
  (ver Decisão 5).

## Decisão 3 — Exclusão de tipo = soft delete (campo `Arquivado`)

- **Decision**: `DELETE /evaluation-types/{id}` marca `Arquivado = true` (não remove o
  documento). `GET /evaluation-types` retorna apenas ativos por padrão. As `evaluations` já
  registradas com o tipo permanecem intactas.
- **Rationale**: Decisão do usuário + orientação de soft delete da constituição. Preserva
  histórico e evita quadros/registros órfãos.
- **Alternatives considered**: Cascade delete (perde histórico) e bloqueio (pior UX) — ambos
  rejeitados pela escolha do usuário.

## Decisão 4 — Campos da ficha e Avaliação Geral embutidos no aluno

- **Decision**: Estender o documento `students` com `Foto` (base64 data URI), `PeDominante`
  ("Direito"|"Esquerdo"|"Ambidestro"), `MassaCorporal` (decimal, kg), `Estatura` (decimal, m) e
  `AvaliacaoGeral` (string longa). Um endpoint `PUT /students/{id}/profile` atualiza esses
  campos (edição inline na ficha). Idade **não** é armazenada — derivada no frontend a partir de
  `DataNascimento`.
- **Rationale**: São sempre lidos junto com o aluno (constituição: embedding). Um único endpoint
  cobre a edição inline. Cadastro de aluno permanece inalterado (decisão do usuário).
- **Alternatives considered**: Coleção `student_profiles` separada — rejeitada (1:1 com aluno,
  sempre acessada junta). Idade armazenada — rejeitada (dado derivável, evita inconsistência).

## Decisão 5 — Foto como base64 data URI, comprimida no cliente

- **Decision**: Armazenar a foto como string data URI (`data:image/...;base64,...`) no documento
  do aluno. O frontend redimensiona/comprime a imagem (ex.: ~400px, JPEG) via canvas antes do
  upload.
- **Rationale**: Sem infraestrutura de blob storage (Princípio I — simplicidade). Para escala
  escolar (dezenas de alunos), imagens comprimidas (~50–150 KB) cabem folgadamente no limite de
  16 MB do documento MongoDB.
- **Alternatives considered**: GridFS ou storage externo — rejeitados por adicionarem
  infraestrutura desproporcional à escala.
- **Risco/mitigação**: imagem grande sem compressão incharia o documento → compressão no cliente
  é obrigatória; validar tamanho máximo antes de enviar.

## Decisão 6 — Registro de avaliação e fontes dos gráficos

- **Decision**: `Evaluation` (coleção `evaluations`) guarda `AlunoId`, `TipoId`, `Data` e
  `Pontuacoes: [{ ItemId, Nota (1–5) }]`. 
  - **Radar** do quadro: pontuações por item da **avaliação mais recente** (maior `Data`) do
    aluno naquele tipo.
  - **Evolução por item**: série temporal — para cada item, a `Nota` em cada `Data`, ordenada
    cronologicamente (gráfico de linha).
  - **Histórico**: lista das avaliações do aluno/tipo por data (desc).
- **Rationale**: Atende FR-020/FR-021 diretamente; agregação é trivial no frontend a partir da
  lista retornada por `GET /evaluations?alunoId=&tipoId=`.
- **Alternatives considered**: Pré-agregar no backend — desnecessário na escala; frontend agrega.

## Decisão 7 — Rotas e componentes no frontend

- **Decision**: 3 rotas novas em `app.routes.ts`:
  - `/student-profile` (ficha) — `authGuard`.
  - `/evaluation-types` (gestão de tipos) — `authGuard` + `data: { papel: 'Administrador' }`.
  - `/student-evaluation` (tela Avaliar) — `authGuard`.
  Componentes reutilizáveis: `student-info-card`, `general-evaluation`,
  `evaluation-type-panel`, `radar-chart`. A engrenagem na ficha (visível só a admin) navega a
  `/evaluation-types`; o botão "Avaliar" navega a `/student-evaluation?alunoId=&tipoId=`.
- **Rationale**: Segue o padrão de páginas admin existentes (`training-config`, `users`) e o
  Princípio de não duplicar UI (componentes extraídos). Chart.js já disponível para radar/linha.
- **Alternatives considered**: Modais em vez de rotas — a spec fala em "página" para a gestão de
  tipos e a imagem `avaliacao.png` mostra a avaliação como tela cheia; rotas casam melhor.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Editar itens de um tipo com histórico e quebrar referências | Reconciliar por `ItemId` no update; nunca reusar Ids; histórico mantém os itens com que foi gravado |
| Radar com 1 item fica sem sentido | Quadro exibe fallback legível (valor/lista) quando o tipo tem < 3 itens |
| Documento do aluno inchar com a foto | Compressão/redimensionamento no cliente + limite de tamanho antes do upload |
| Reuso do nome de coleção `evaluations` (a antiga foi descartada na 021) | Novo esquema é incompatível; assumir base limpa ou dropar `evaluations` legada antes de usar |
| Tipos arquivados aparecerem em fichas | `GET /evaluation-types` filtra `Arquivado = false`; quadros só renderizam tipos ativos |
