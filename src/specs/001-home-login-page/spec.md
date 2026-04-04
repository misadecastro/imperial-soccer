# Feature Specification: Página Inicial e Tela de Login

**Feature Branch**: `001-home-login-page`
**Created**: 2026-04-04
**Status**: Draft
**Input**: Página inicial simples sobre a escolinha de futebol Imperial Soccer com botão de login que leva à página de autenticação (sem implementar lógica de autenticação — apenas as páginas).

---

## User Scenarios & Testing

### User Story 1 — Visitante acessa a página inicial (Priority: P1)

Um visitante (professor ou qualquer pessoa) acessa a URL raiz da aplicação e vê uma página de apresentação
da Imperial Soccer com informações básicas sobre a escolinha e um botão de acesso ao sistema.

**Why this priority**: É o ponto de entrada de toda a aplicação. Sem esta página nenhum fluxo começa.

**Independent Test**: Abrir a URL raiz no navegador e verificar que a página exibe o nome "Imperial Soccer",
uma descrição e o botão de acesso.

**Acceptance Scenarios**:

1. **Given** o usuário acessa a URL raiz da aplicação, **When** a página carrega, **Then** ele vê o nome "Imperial Soccer", uma breve descrição da escolinha e um botão de acesso ao sistema.
2. **Given** o usuário está na página inicial, **When** a página carrega em dispositivo móvel, **Then** o layout é responsivo e todos os elementos são legíveis.

---

### User Story 2 — Visitante navega até a tela de autenticação (Priority: P1)

Ao clicar no botão de acesso da página inicial, o visitante é redirecionado para a página de autenticação.

**Why this priority**: É a única ação disponível na home; sem ela o usuário não tem como continuar na aplicação.

**Independent Test**: Clicar no botão "Entrar" e confirmar que a URL muda para `/login` e a tela de autenticação é exibida com o formulário de credenciais.

**Acceptance Scenarios**:

1. **Given** o usuário está na página inicial, **When** clica no botão "Entrar", **Then** é redirecionado para a página de autenticação (`/login` ou `login.html`).
2. **Given** o usuário está na página de autenticação, **When** a página carrega, **Then** ele vê um formulário com campos de usuário/e-mail e senha e um botão de envio visível.

---

### Edge Cases

- O que acontece se o usuário acessar `/login` diretamente? A página de autenticação deve ser exibida normalmente sem erros.
- O que acontece em telas muito pequenas (abaixo de 360px de largura)? O layout deve permanecer legível e o botão deve ser acionável.
- O que acontece se o JavaScript estiver desativado? A navegação entre páginas deve funcionar via links `href` nativos, sem depender de JS para o redirecionamento básico.

---

## Requirements

### Functional Requirements

- **FR-001**: A aplicação DEVE exibir uma página inicial acessível na URL raiz.
- **FR-002**: A página inicial DEVE exibir o nome "Imperial Soccer" em posição de destaque.
- **FR-003**: A página inicial DEVE exibir uma breve descrição sobre a escolinha de futebol.
- **FR-004**: A página inicial DEVE conter um botão de acesso ao sistema (texto sugerido: "Entrar" ou "Acessar o Sistema").
- **FR-005**: Ao clicar no botão de acesso, o usuário DEVE ser redirecionado para a página de autenticação.
- **FR-006**: A página de autenticação DEVE ser acessível em uma URL dedicada (ex.: `/login`).
- **FR-007**: A página de autenticação DEVE exibir um formulário com campo de usuário/e-mail, campo de senha e botão de envio.
- **FR-008**: O formulário de autenticação NÃO precisa ter lógica de validação ou submissão real nesta fase — apenas estrutura visual.
- **FR-009**: Ambas as páginas DEVEM ser responsivas e utilizáveis em dispositivos móveis e desktop.
- **FR-010**: O estilo visual DEVE ser coerente com a identidade de uma escola de futebol, utilizando cores e tipografia adequadas.

### Key Entities

- **Página Inicial (Home)**: Ponto de entrada público; apresenta a escolinha e oferece acesso ao sistema.
- **Página de Autenticação (Login)**: Tela de credenciais; exibe formulário para futura implementação de login real.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: O visitante visualiza a página inicial completamente carregada em menos de 2 segundos em conexão padrão.
- **SC-002**: O visitante chega à página de autenticação com exatamente um clique a partir da página inicial.
- **SC-003**: Ambas as páginas são exibidas sem quebra de layout em resoluções de 360px a 1920px de largura.
- **SC-004**: A página inicial comunica o propósito da aplicação de forma que 100% dos professores-alvo entendam sem explicação adicional.
- **SC-005**: O fluxo home → login funciona sem erros em Chrome, Firefox, Edge e Safari modernos.

---

## Assumptions

- A aplicação frontend é servida como arquivos estáticos (HTML, CSS, JS) sem servidor de renderização no lado do servidor.
- A navegação entre páginas usa redirecionamento simples de URL via `href`; não há SPA router implementado nesta fase.
- O estilo usa Tailwind CSS via CDN, sem processo de build local nesta fase.
- A logo oficial ou identidade visual completa da Imperial Soccer não está disponível; texto estilizado será usado como placeholder.
- O formulário de login é puramente visual — sem submissão real, validação ou integração com backend nesta feature.
- O idioma da interface é português brasileiro.
- Apenas um tipo de usuário acessa o sistema (o professor); não há distinção de perfis nesta fase.
