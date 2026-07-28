# Feature Specification: Containerização do Backend para Deploy no Render

**Feature Branch**: `023-backend-docker-render`  
**Created**: 2026-07-27  
**Status**: Draft  
**Input**: User description: "vamos criar um docker file para hospedar o backend no render, vamos colocar a connection string do banco e a url do front (configuração de cors) como variável"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar o backend como container no Render (Priority: P1)

Como responsável pela operação do sistema, quero empacotar o backend em uma imagem de
container e publicá-lo no Render, para que a API fique acessível na internet por uma URL
HTTPS, sem depender de uma máquina local rodando.

**Why this priority**: É o objetivo central — sem a imagem publicável e executando na
plataforma, nada mais entrega valor. Habilita o frontend a consumir a API em produção.

**Independent Test**: Construir a imagem a partir do repositório e executá-la na plataforma;
confirmar que a API sobe, inicia sem erros e responde a requisições pela URL HTTPS pública.

**Acceptance Scenarios**:

1. **Given** o código do backend no repositório, **When** a imagem é construída, **Then** a
   construção conclui com sucesso e produz uma imagem executável do backend.
2. **Given** a imagem publicada no Render, **When** o serviço inicia, **Then** a API fica
   escutando na porta atribuída pela plataforma e responde a requisições.
3. **Given** o serviço no ar, **When** um cliente acessa a URL pública HTTPS da API, **Then**
   recebe resposta da API (sem depender de execução local).
4. **Given** o serviço iniciado, **When** não há Administrador ativo, **Then** o Administrador
   inicial é criado automaticamente no startup (comportamento já existente, preservado).

---

### User Story 2 - Configurar banco e CORS por variáveis de ambiente (Priority: P2)

Como operador, quero informar a string de conexão do banco de dados e a URL do frontend
(origem permitida para CORS) por variáveis de ambiente, para trocar de banco ou de endereço
do frontend sem alterar o código nem reconstruir a imagem.

**Why this priority**: É a exigência explícita do usuário e o que torna a mesma imagem
reutilizável entre ambientes (local, teste, produção) apenas mudando configuração.

**Independent Test**: Definir a variável da string de conexão e a variável da origem do
frontend na plataforma; reiniciar o serviço; confirmar que a API passa a usar aquele banco e
que apenas o frontend daquela origem consegue chamá-la pelo navegador.

**Acceptance Scenarios**:

1. **Given** a variável de ambiente da string de conexão definida, **When** a API inicia,
   **Then** ela se conecta ao banco indicado nessa variável (e não a um valor fixo no código).
2. **Given** a variável de ambiente da origem do frontend definida, **When** o frontend
   hospedado nessa origem chama a API pelo navegador, **Then** a requisição é aceita (sem erro
   de CORS).
3. **Given** uma origem diferente da configurada, **When** ela tenta chamar a API pelo
   navegador, **Then** a requisição é bloqueada pela política de CORS.
4. **Given** uma mudança no valor da variável (novo banco ou nova origem), **When** o serviço é
   reiniciado/reimplantado, **Then** o novo valor passa a valer sem reconstruir a imagem nem
   alterar o código.
5. **Given** mais de uma origem de frontend necessária, **When** a variável permite múltiplos
   valores, **Then** todas as origens configuradas são aceitas.

---

### User Story 3 - Manter segredos fora do repositório e da imagem (Priority: P3)

Como responsável pela segurança, quero que nenhum segredo (string de conexão, chave de
assinatura de token, credenciais do Administrador inicial) fique gravado no repositório nem
embutido na imagem, para evitar vazamento de credenciais.

**Why this priority**: Complementa a configuração por variáveis garantindo que ela também
seja segura; sem isso, a conveniência viraria risco.

**Independent Test**: Inspecionar o repositório e a imagem construída e confirmar que não há
string de conexão real, chave de token nem senha de Administrador; confirmar que a API só
sobe quando esses valores são fornecidos por variáveis de ambiente no ambiente de execução.

**Acceptance Scenarios**:

1. **Given** o repositório, **When** inspecionado, **Then** não contém string de conexão real,
   chave de assinatura de token nem senha do Administrador inicial.
2. **Given** a imagem construída, **When** inspecionada, **Then** não contém esses segredos
   embutidos.
3. **Given** a chave de assinatura de token ausente, **When** a API tenta iniciar, **Then**
   ela falha de forma clara indicando a configuração faltante (não sobe com valor inseguro).

---

### Edge Cases

- **Variável obrigatória ausente** (string de conexão, chave do token ou credenciais do
  Administrador): o serviço deve falhar no startup com mensagem clara, em vez de subir num
  estado inseguro ou quebrado.
- **Banco indisponível/inatingível** no endereço configurado: as chamadas que dependem do
  banco devem falhar de forma controlada, com erro legível.
- **Origem do frontend não configurada**: o navegador bloqueará as chamadas com erro de
  preflight — a configuração da origem é pré-requisito para o frontend funcionar.
- **Origem configurada com barra final ou esquema divergente** (`http` vs `https`): a origem
  deve casar exatamente; divergências resultam em bloqueio de CORS (documentar o formato
  esperado).
- **Porta**: o serviço deve escutar na porta que a plataforma atribui em tempo de execução,
  não em uma porta fixa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O backend MUST ser empacotável como uma imagem de container construída a partir
  do repositório, sem passos manuais fora dessa construção.
- **FR-002**: O container MUST escutar na porta atribuída pela plataforma de hospedagem em
  tempo de execução (não uma porta fixa embutida).
- **FR-003**: A API MUST ficar acessível por uma URL pública HTTPS após o deploy.
- **FR-004**: A string de conexão do banco de dados MUST ser fornecida por variável de
  ambiente, e a API MUST usá-la em vez de qualquer valor fixo no código/imagem.
- **FR-005**: A(s) origem(ns) do frontend permitida(s) para CORS MUST ser fornecida(s) por
  variável de ambiente, suportando uma ou mais origens.
- **FR-006**: A API MUST aceitar chamadas do navegador vindas das origens configuradas e MUST
  bloquear as demais.
- **FR-007**: A chave de assinatura do token de autenticação e as credenciais do Administrador
  inicial MUST ser fornecidas por variáveis de ambiente (não commitadas, não embutidas).
- **FR-008**: Mudar o valor de uma variável de configuração (banco ou origem) MUST passar a
  valer com um reinício/reimplantação, sem alterar código nem reconstruir a imagem.
- **FR-009**: Nenhum segredo real (string de conexão, chave do token, senha do Administrador)
  MUST estar presente no repositório versionado nem embutido na imagem.
- **FR-010**: Na ausência de uma configuração obrigatória (chave do token/credenciais), a API
  MUST falhar no startup com uma mensagem clara, em vez de subir em estado inseguro.
- **FR-011**: O comportamento existente de criação automática do Administrador inicial no
  startup (quando não há Administrador ativo) MUST ser preservado no ambiente hospedado.
- **FR-012**: O nome do banco de dados, emissor/audiência e validade do token MUST permanecer
  configuráveis (com padrões atuais), sem exigir rebuild para ajuste.

### Key Configuration (superfície de variáveis de ambiente)

Configurações que passam a ser fornecidas por variável de ambiente no ambiente hospedado
(valores reais nunca versionados):

- **String de conexão do banco** — endereço do MongoDB (ex.: instância gerenciada externa).
- **Origem(ns) do frontend (CORS)** — URL(s) do frontend autorizadas a chamar a API.
- **Chave de assinatura do token** — segredo usado para assinar/validar a autenticação.
- **Credenciais do Administrador inicial** — e-mail e senha usados apenas no seed inicial.
- **Nome do banco / emissor / audiência / validade do token** — ajustáveis, com padrões atuais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir do repositório, é possível construir a imagem e colocar a API no ar no
  Render **sem alterar o código-fonte** — apenas construção + configuração de variáveis.
- **SC-002**: Trocar o banco de dados ou a origem do frontend é feito **alterando apenas uma
  variável de ambiente** e reiniciando/reimplantando, sem rebuild da imagem.
- **SC-003**: O frontend hospedado na origem configurada chama a API **sem erros de CORS**; uma
  origem não configurada é bloqueada.
- **SC-004**: **Zero** segredos reais presentes no repositório ou nas camadas da imagem.
- **SC-005**: A API responde por HTTPS na URL pública em 100% das verificações de disponibilidade
  após um deploy bem-sucedido.
- **SC-006**: Com a chave de assinatura do token ausente, o serviço **não sobe** e registra uma
  mensagem clara indicando a configuração faltante.

## Assumptions

- **Plataforma**: hospedagem no Render usando um serviço baseado em container (imagem
  construída a partir de um Dockerfile no repositório).
- **Banco de dados**: o MongoDB é hospedado externamente (ex.: serviço gerenciado), pois o
  Render não provê o banco; a string de conexão aponta para esse serviço.
- **Frontend**: hospedado separadamente; sua URL pública é informada como origem de CORS. A
  variável pode conter uma ou mais origens (formato exato definido no plano).
- **Ambiente de execução**: a aplicação roda em modo de produção na plataforma; a
  documentação interativa da API (Swagger) segue a política atual (habilitada só fora de
  produção), salvo decisão em contrário no plano.
- **TLS/HTTPS**: o certificado/terminação TLS é provido pela plataforma na borda; para o
  cliente a URL pública é HTTPS.
- **Segredos**: fornecidos como variáveis de ambiente/secret no painel da plataforma (e via
  `user-secrets`/variáveis locais em desenvolvimento), nunca commitados — consistente com a
  prática já vigente no projeto.
- **Escopo**: esta feature cobre apenas a containerização e a configuração por variáveis do
  **backend**; o deploy do frontend e o provisionamento do banco estão fora de escopo.
