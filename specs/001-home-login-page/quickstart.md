# Quickstart: Home e Login Pages

**Feature**: 001-home-login-page
**Branch**: `001-home-login-page`

---

## Pré-requisitos

Nenhum. Os arquivos são HTML estático — basta um navegador moderno.

---

## Como visualizar as páginas

### Opção A — Abrir diretamente no navegador

```bash
# Abrir a home
start frontend/index.html

# Abrir a tela de login
start frontend/pages/login.html
```

### Opção B — Servir localmente (evita restrições de CORS do navegador)

```bash
# Com Python (se disponível)
cd frontend
python -m http.server 3000
# Acessar: http://localhost:3000

# Com Node.js / npx
cd frontend
npx serve .
# Acessar: http://localhost:3000
```

---

## Validação manual

### Home (`/` ou `index.html`)

- [ ] Nome "Imperial Soccer" visível em destaque
- [ ] Descrição breve da escolinha presente
- [ ] Botão "Entrar no Sistema" (ou equivalente) visível e clicável
- [ ] Layout responsivo em mobile (360px) e desktop (1280px+)
- [ ] Ao clicar no botão, navega para a tela de login

### Login (`/pages/login.html`)

- [ ] Campo de usuário/e-mail presente
- [ ] Campo de senha presente
- [ ] Botão "Entrar" presente
- [ ] Link de voltar para a home presente
- [ ] Layout responsivo em mobile e desktop

### Cross-browser

- [ ] Chrome — funciona sem erros no console
- [ ] Firefox — funciona sem erros no console
- [ ] Edge — funciona sem erros no console

---

## Estrutura de arquivos gerada

```text
frontend/
├── index.html          # Página inicial (home)
└── pages/
    └── login.html      # Tela de autenticação (visual only)
```
