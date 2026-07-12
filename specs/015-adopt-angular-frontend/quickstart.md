# Quickstart: Migração do Frontend para Angular

**Branch**: `015-adopt-angular-frontend` | **Date**: 2026-06-27

## Pré-requisitos

- Node.js LTS instalado (necessário para Angular CLI).
- Angular CLI (`npm install -g @angular/cli`, ou via `npx`).

## Scaffold inicial (uma vez)

```bash
# Na raiz do repositório:
cd "src/frontend"
ng new . --routing --style=css --skip-git --standalone
# Ajustar tailwind.config.js, postcss.config.js conforme research.md decisão #3
```

## Rodar em desenvolvimento

```bash
cd "src/frontend"
ng serve
# Abrir http://localhost:4200
```

## Como validar paridade por página migrada

Para cada página migrada, repetir o roteiro de teste manual da(s) spec(s) original(is)
que a implementaram, comparando o comportamento na versão Angular com o documentado:

| Página Angular | Specs originais a revalidar |
|-----------------|------------------------------|
| `home` (`/`) | 001-home-login-page |
| `login` (`/login`) | 001-home-login-page |
| `dashboard` (`/dashboard`) | 006, 007, 009, 010, 011, 012, 014 |
| `games` (`/games`) | 008, 013 |
| `training` (`/training`) | 009, 010 |
| `students` (`/students`) | 003, 005 |
| `student-eval` (`/student-eval`) | 002, 004 |

## Cenários de validação cruzados (coexistência durante a transição)

| Cenário | Como reproduzir | Resultado esperado |
|---------|------------------|---------------------|
| Dados gravados na versão HTML, lidos na versão Angular | Registrar uma avaliação em `student-eval.html` (HTML), depois abrir `dashboard` migrado (Angular) na mesma sessão de navegador | Avaliação aparece corretamente no dashboard Angular |
| Dados gravados na versão Angular, lidos na versão HTML | Registrar uma avaliação na versão Angular migrada, depois abrir uma página HTML ainda não migrada | Dados aparecem normalmente — mesmo esquema de `sessionStorage` |
| Build falha em erro de tipo | Introduzir deliberadamente um campo inexistente (ex.: `avaliacao.tatic`) em um componente | `ng build` ou `ng serve` falha apontando arquivo e linha |
| Componente compartilhado | Alterar o componente `category-selector` | Mudança reflete em todas as páginas migradas que o usam, sem edição manual em cada uma |

## Critério de "página migrada com sucesso"

Uma página é considerada migrada quando:

1. Todos os cenários de aceitação das specs originais listadas na tabela acima passam.
2. Nenhum erro aparece no console do navegador.
3. `ng build` conclui sem erros de tipo.
4. O arquivo HTML estático correspondente é removido de `src/frontend/pages/`.
