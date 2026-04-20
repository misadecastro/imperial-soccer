# imperial Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-20

## Active Technologies
- HTML5 + JavaScript ES Modules (browsers modernos 2023+) + Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) — zero instalação (002-student-register-eval)
- In-memory (JavaScript array em `window`-scope) — dados perdidos ao recarregar (002-student-register-eval)
- In-memory (array `state.alunos` / `state.avaliacoes` em `window`-scope) — sem persistência (003-students-eval-display)
- HTML5 + JavaScript ES Modules (browsers modernos 2023+) + Tailwind CSS v3 via CDN, Chart.js v4 via CDN (nova dependência para o gráfico) (004-cumulative-student-eval)
- In-memory (`window`-scope array), com `sessionStorage` para compartilhamento de estado entre páginas (004-cumulative-student-eval)
- HTML5 + JavaScript ES Modules (browsers modernos 2023+) + Tailwind CSS v3 via CDN, Chart.js v4 via CDN (já existente) (005-ui-improvements-mock-data)
- `sessionStorage` com chave `"imperialState"` (padrão da feature 004) (005-ui-improvements-mock-data)
- HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`), Chart.js v4 via CDN (somente `student-eval.html`) (006-app-redesign)
- `sessionStorage` com chave `"imperialState"` (existente, sem alteração) (006-app-redesign)
- `sessionStorage` com chave `"imperialState"` — estrutura estendida com campo `chamadas: []` (007-attendance-tracking)
- HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS (007-attendance-tracking)
- `sessionStorage` com chave `"imperialState"` — estrutura estendida com campo `jogos: []` (008-match-minutes)

- HTML5 + JavaScript ES Modules (navegadores modernos 2023+) + Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`) — zero instalação (001-home-login-page)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

HTML5 + JavaScript ES Modules (navegadores modernos 2023+): Follow standard conventions

## Recent Changes
- 008-match-minutes: Added HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS
- 007-attendance-tracking: Added HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`cdn.tailwindcss.com`); `imperial.css` (feature 006); sem frameworks JS
- 007-attendance-tracking: Added HTML5 + JavaScript ES Modules (navegadores 2023+) + Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
