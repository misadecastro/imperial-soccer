# Research: Home e Login Pages

**Feature**: 001-home-login-page
**Date**: 2026-04-04

---

## Decision 1: Estrutura de arquivos do frontend

**Decision**: Dois arquivos HTML independentes — `frontend/index.html` (home) e `frontend/pages/login.html` (login).

**Rationale**: A constituição define `frontend/` como raiz do frontend estático com `pages/` para sub-rotas.
Arquivos HTML separados funcionam sem build step e sem router JS, atendendo à restrição da constituição.
O link entre as páginas é via `href` nativo (`<a href="pages/login.html">`), garantindo funcionamento mesmo sem JavaScript.

**Alternatives considered**:
- SPA com router JS: rejeitado — adiciona complexidade desnecessária para 2 páginas estáticas.
- Single file com `display:none` por estado: rejeitado — dificulta navegação direta por URL.

---

## Decision 2: Tailwind CSS via CDN

**Decision**: Usar Tailwind CSS v3 via CDN play (`https://cdn.tailwindcss.com`) em ambas as páginas.

**Rationale**: Constituição exige frontend sem build step em desenvolvimento. O CDN do Tailwind v3
(play.min.js) permite usar classes utilitárias sem instalação local, ideal para esta fase.

**Alternatives considered**:
- Tailwind CLI com output.css local: rejeitado para esta fase (build step), viável em produção.
- Bootstrap: rejeitado — não é parte da stack definida na constituição.

---

## Decision 3: Layout da Home

**Decision**: Hero section full-viewport com nome "Imperial Soccer" em destaque, tagline curta,
descrição breve da escolinha e CTA button "Entrar no Sistema".
Fundo escuro com acento em verde (cores associadas a futebol). Sem imagens externas (placeholder SVG de bola ou
apenas tipografia estilizada como logo).

**Rationale**: A spec exige que o professor entenda o propósito da aplicação imediatamente (SC-004).
Hero simples comunica identidade + acesso em segundos. Sem imagens externas = zero dependências de rede adicionais.

**Alternatives considered**:
- Imagem de fundo de campo: rejeitado — depende de asset externo não disponível; adiciona peso desnecessário.
- Layout multi-seção com features da escola: rejeitado — escopo limitado a home simples (spec FR-003).

---

## Decision 4: Formulário de login

**Decision**: Formulário com dois campos (usuário ou e-mail + senha) e um botão "Entrar".
O `<form>` terá `action="#"` e sem `onsubmit` real — apenas estrutura visual conforme FR-008.
Link "Voltar" aponta para `../index.html`.

**Rationale**: FR-008 explicita que não há lógica de submissão nesta fase. O formulário
DEVE existir visualmente para que a tela seja identificada como tela de login.

**Alternatives considered**:
- Formulário com validação JS básica: rejeitado — fora do escopo desta feature.
- Modal de login na home: rejeitado — spec define página dedicada em `/login`.

---

## Decision 5: Responsividade

**Decision**: Layout responsivo usando classes utilitárias Tailwind (`sm:`, `md:`, `lg:`).
Breakpoints: mobile-first. Botão e formulário com largura total em mobile, centralizado em desktop.

**Rationale**: SC-003 exige funcionamento entre 360px e 1920px. Tailwind mobile-first garante
cobertura com mínimo de código.

**Alternatives considered**:
- CSS media queries custom: rejeitado — duplica o que Tailwind já oferece.

---

## Unknowns Resolved

Nenhum `[NEEDS CLARIFICATION]` na spec. Todos os pontos foram resolvidos por decisões acima.
