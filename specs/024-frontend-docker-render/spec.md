# Feature Specification: Containerização do Frontend para Deploy no Render

**Feature Branch**: `024-frontend-docker-render`  
**Created**: 2026-07-28  
**Status**: Draft  
**Input**: User description: "vamos fazer o docker file para rodar o front no render, como foi feito com o backend criando um novo web service plano free"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publicar o frontend como container no Render (Priority: P1)

Como responsável pela operação, quero empacotar o frontend em uma imagem de container e
publicá-lo no Render como um novo Web Service (plano free), para que a interface fique
acessível na internet por uma URL HTTPS, sem depender de uma máquina local.

**Why this priority**: É o objetivo central — sem a imagem publicável e servindo a aplicação,
não há interface pública para os usuários. Espelha o que foi feito com o backend (feature 023).

**Independent Test**: Construir a imagem a partir do repositório e executá-la; abrir a URL
pública e confirmar que a aplicação carrega (tela inicial/login) e os recursos estáticos são
servidos corretamente.

**Acceptance Scenarios**:

1. **Given** o código do frontend no repositório, **When** a imagem é construída, **Then** a
   construção conclui com sucesso e produz uma imagem que serve a aplicação.
2. **Given** a imagem publicada no Render, **When** o serviço inicia, **Then** ele escuta na
   porta atribuída pela plataforma e responde às requisições.
3. **Given** o serviço no ar, **When** um usuário acessa a URL pública HTTPS, **Then** a
   aplicação carrega no navegador (HTML, estilos e scripts).

---

### User Story 2 - Conectar o frontend implantado ao backend implantado (Priority: P2)

Como usuário, quero que a aplicação hospedada converse com a API já publicada (feature 023),
para conseguir efetuar login e usar as telas ponta a ponta — e não com um endereço local que
não existe em produção.

**Why this priority**: Uma interface que não fala com o backend certo é inútil em produção. O
endereço da API precisa apontar para o backend implantado, de forma configurável.

**Independent Test**: Com o frontend implantado apontando para a URL pública do backend,
efetuar login e navegar por uma tela que consome dados; confirmar que as chamadas à API
funcionam (sem erro de rede/CORS e sem tentar `localhost`).

**Acceptance Scenarios**:

1. **Given** o frontend implantado, **When** a aplicação faz chamadas à API, **Then** elas vão
   para a URL pública do backend (não para um endereço local).
2. **Given** o endereço do backend, **When** ele precisa mudar, **Then** é ajustável por
   configuração do ambiente, sem alterar o código-fonte.
3. **Given** as credenciais válidas, **When** o usuário faz login pela interface hospedada,
   **Then** a autenticação ocorre com sucesso e ele acessa as telas protegidas.

---

### User Story 3 - Navegação SPA (deep links e refresh) funcionando (Priority: P3)

Como usuário, quero acessar diretamente uma rota interna (por link salvo ou recarregando a
página) e continuar vendo a tela correta, em vez de um erro "não encontrado", para navegar sem
fricção.

**Why this priority**: Uma aplicação de página única servida como arquivos estáticos precisa
redirecionar rotas desconhecidas para o ponto de entrada; sem isso, deep links e F5 quebram.

**Independent Test**: Acessar diretamente uma URL de rota interna (ex.: a página de alunos) e
recarregar a página nessa rota; confirmar que a aplicação carrega a tela correta e não retorna
erro de página inexistente.

**Acceptance Scenarios**:

1. **Given** a aplicação hospedada, **When** o usuário abre diretamente uma rota interna,
   **Then** a aplicação carrega e exibe a tela correspondente.
2. **Given** uma rota interna aberta, **When** o usuário recarrega a página, **Then** ele
   permanece na mesma tela, sem erro "não encontrado".

---

### Edge Cases

- **Porta**: o servidor deve escutar na porta atribuída pela plataforma em tempo de execução,
  não em uma porta fixa.
- **Endereço da API não configurado**: se o endereço do backend não for informado para o
  ambiente hospedado, a aplicação tentaria um endereço local inválido — a configuração do
  endereço é pré-requisito para o funcionamento em produção.
- **CORS no backend**: o backend só aceita chamadas de origens configuradas; a URL pública do
  frontend precisa constar na lista de origens permitidas do backend (dependência cruzada).
- **Cache de assets vs. index**: os arquivos versionados podem ser cacheados, mas o ponto de
  entrada deve refletir a versão implantada mais recente após um novo deploy.
- **Rota inexistente**: URLs que não correspondem a nenhuma rota da aplicação devem resolver
  para o ponto de entrada (comportamento de SPA), sem erro do servidor.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O frontend MUST ser empacotável como uma imagem de container construída a partir
  do repositório, sem passos manuais fora dessa construção.
- **FR-002**: O serviço MUST escutar na porta atribuída pela plataforma em tempo de execução
  (não uma porta fixa embutida).
- **FR-003**: A aplicação MUST ficar acessível por uma URL pública HTTPS após o deploy, como um
  Web Service no Render (plano free).
- **FR-004**: O container MUST servir os arquivos estáticos da aplicação já construída (HTML,
  estilos, scripts e demais assets).
- **FR-005**: O endereço da API (backend) usado pela aplicação hospedada MUST apontar para o
  backend implantado e MUST ser ajustável por configuração do ambiente, sem alterar o
  código-fonte.
- **FR-006**: A aplicação hospedada MUST permitir o fluxo de login e o uso das telas que
  consomem a API de ponta a ponta.
- **FR-007**: Requisições a rotas internas da aplicação (deep link ou refresh) MUST resolver
  para o ponto de entrada da aplicação, preservando a navegação SPA (sem erro de página
  inexistente).
- **FR-008**: A imagem MUST conter apenas os artefatos necessários para servir a aplicação (não
  incluir o backend nem ferramentas de build no resultado final).
- **FR-009**: O deploy do frontend MUST ser independente do deploy do backend (serviços
  separados no Render).

### Key Configuration (superfície de configuração)

- **Endereço público da API (backend)** — usado pela aplicação para as chamadas; ajustável para
  o ambiente hospedado (ex.: `https://<backend>.onrender.com/api/v1`).
- **Porta** — atribuída pela plataforma em tempo de execução.
- **(Dependência no backend)** — a URL pública do frontend deve estar entre as origens
  permitidas de CORS do backend (feature 023).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A partir do repositório, é possível construir a imagem e colocar o frontend no ar
  no Render (Web Service, plano free) **sem alterar o código-fonte** — apenas construção +
  configuração.
- **SC-002**: A URL pública HTTPS carrega a aplicação em 100% das verificações de
  disponibilidade após um deploy bem-sucedido.
- **SC-003**: O usuário consegue efetuar login pela interface hospedada e acessar uma tela que
  consome dados, **sem erros de rede/CORS** e sem chamadas a `localhost`.
- **SC-004**: Acessar diretamente uma rota interna e recarregar a página funciona em 100% dos
  casos, sem erro "não encontrado".
- **SC-005**: Alterar o endereço do backend é feito **por configuração**, sem editar o
  código-fonte da aplicação.

## Assumptions

- **Plataforma**: hospedagem no Render como **Web Service baseado em container** (imagem a
  partir de um Dockerfile no repositório), plano **free** — espelhando a feature 023 do backend.
- **Backend**: já implantado (feature 023); esta feature apenas conecta o frontend a ele. O
  backend e o banco não fazem parte deste escopo.
- **Configuração do endereço da API**: por consistência com o backend ("como foi feito com o
  backend"), o endereço do backend é fornecido como **configuração do ambiente** para não exigir
  recompilar a aplicação ao trocar de backend; a forma exata (injeção em tempo de execução vs.
  valor de build) fica para o plano técnico.
- **TLS/HTTPS**: certificado e terminação TLS providos pela plataforma na borda.
- **CORS**: a URL pública do frontend será adicionada às origens permitidas do backend
  (variável de CORS da feature 023) — passo de operação, dependência cruzada.
- **Sem segredos**: o frontend não guarda segredos; o endereço público da API não é sensível.
- **Escopo**: cobre apenas a containerização e a publicação do **frontend**; o deploy do backend
  e o provisionamento do banco estão fora de escopo.
- **Plano free do Render**: o serviço pode "hibernar" após período sem tráfego, com atraso na
  primeira requisição — comportamento aceito.
