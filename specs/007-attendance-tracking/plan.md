# Implementation Plan: Chamada de Treino

**Branch**: `007-attendance-tracking` | **Date**: 2026-04-05 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/007-attendance-tracking/spec.md`

## Summary

Criar a página `training.html` de registro de presença por categoria e data de treino, integrada ao estado compartilhado (`sessionStorage`). Adicionar menu de navegação fixo "Alunos / Treino" em todas as páginas existentes. O design segue o sistema visual da feature 006 (cabeçalho verde, cartões brancos, abas horizontais), idêntico à imagem de referência `Novo-Design/Pagina-Exemplo.png`.

## Technical Context

**Language/Version**: HTML5 + JavaScript ES Modules (navegadores 2023+)  
**Primary Dependencies**: Tailwind CSS v3 via CDN (`https://cdn.tailwindcss.com`)  
**Storage**: `sessionStorage` com chave `"imperialState"` — estrutura estendida com campo `chamadas: []`  
**Testing**: Inspeção visual manual + fluxo funcional no navegador  
**Target Platform**: Mobile-first (320–480 px principal); browsers modernos  
**Project Type**: Web application — frontend estático (`src/frontend/`)  
**Performance Goals**: Carregamento percebido < 1 s; marcação de presença instantânea (sem latência)  
**Constraints**: Sem build step; Tailwind via CDN; sem backend; dados perdidos ao fechar o navegador  
**Scale/Scope**: 1 nova página HTML (`training.html`); menu adicionado a 4 páginas existentes; sem novas dependências externas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] A feature adiciona complexidade justificada pelo domínio? — **Sim**: registro de frequência é uma das entidades centrais da Constituição (`Frequência`). Atende ao Princípio III (Aluno como Núcleo do Domínio).
- [x] O professor consegue operar o fluxo sem suporte técnico? — **Sim**: fluxo direto — selecionar data/categoria, marcar alunos, salvar. Alinhado ao Princípio II.
- [x] Os dados do aluno permanecem consistentes após a operação? — **Sim**: a chamada referencia o `id` do aluno; nenhuma mutação nos dados de aluno.
- [x] A API segue o envelope padrão e está documentada? — **N/A**: feature 100% frontend estático; sem API nesta fase.
- [x] O acesso ao MongoDB usa o driver oficial sem abstrações desnecessárias? — **N/A**: sem backend.

**Resultado: APROVADO — sem violações.**

## Project Structure

### Documentation (this feature)

```text
specs/007-attendance-tracking/
├── plan.md              ← este arquivo
├── research.md          ← estrutura de dados, padrões de UI
├── data-model.md        ← entidades Chamada e RegistroPresença
├── quickstart.md        ← como testar localmente
└── tasks.md             ← gerado por /speckit-tasks
```

### Source Code (repository root)

```text
src/frontend/
├── index.html                    ← adicionar menu de navegação
├── css/
│   └── imperial.css              ← sem alteração (tokens já existem)
├── pages/
│   ├── login.html                ← sem alteração (pré-autenticação)
│   ├── students.html             ← adicionar menu de navegação
│   ├── student-eval.html        ← adicionar menu de navegação
│   └── training.html             ← NOVA: página de chamada de treino
```

**Structure Decision**: Opção 2 (web application) — frontend estático em `src/frontend/`. Nova página `training.html` no diretório `pages/`. Nenhum novo arquivo CSS necessário — tokens já existem em `imperial.css`.

## Complexity Tracking

> Nenhuma violação da Constituição identificada. Tabela omitida.
