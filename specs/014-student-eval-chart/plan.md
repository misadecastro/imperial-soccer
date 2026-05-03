# Implementation Plan: Gráfico de Evolução do Aluno no Dashboard

**Branch**: `014-student-eval-chart` | **Date**: 2026-05-03 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/014-student-eval-chart/spec.md`

## Summary

Adicionar ao dashboard do aluno (`dashboard.html`) uma seção com gráfico de linha mostrando as últimas 6 avaliações do aluno selecionado nas dimensões Tático, Técnico e Mental. O gráfico já existe em `student-eval.html` com a mesma paleta de cores e configuração Chart.js — esta feature o replica no contexto do dashboard, conectando ao array `state.avaliacoes[]` já disponível na sessão.

## Technical Context

**Language/Version**: JavaScript ES2020+ (ES Modules), HTML5  
**Primary Dependencies**: Chart.js v4 via CDN (já incluso em `dashboard.html` linha 9), Tailwind CSS v3 via CDN  
**Storage**: `sessionStorage` chave `imperialState` — leitura apenas de `state.avaliacoes[]`; sem escrita  
**Testing**: Manual (abrir `dashboard.html` no browser, selecionar aluno com avaliações)  
**Target Platform**: Browsers modernos 2023+ (Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application — frontend-only (fase de protótipo com sessionStorage)  
**Performance Goals**: Gráfico renderiza instantaneamente (< 100 ms) — dados já em memória  
**Constraints**: Sem build step; Tailwind e Chart.js via CDN; zero dependências novas  
**Scale/Scope**: Altera apenas `dashboard.html`; afeta aba Alunos do dashboard existente

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Complexidade justificada?** Sim — visualização de evolução é funcionalidade central do domínio pedagógico; nenhuma camada nova é introduzida.
- [x] **Professor opera sem suporte técnico?** Sim — o gráfico é renderizado automaticamente ao selecionar o aluno; zero interação adicional.
- [x] **Dados do aluno consistentes?** Sim — leitura apenas; `state.avaliacoes[]` não é modificado.
- [x] **API segue envelope padrão?** N/A — fase de protótipo frontend-only; integração de API REST ocorrerá quando o backend .NET for conectado.
- [x] **MongoDB via driver oficial?** N/A — mesmo motivo; sessionStorage é o armazenamento do protótipo.

Sem violações — Complexity Tracking não se aplica.

## Project Structure

### Documentation (this feature)

```text
specs/014-student-eval-chart/
├── plan.md              # Este arquivo
├── research.md          # Findings de codebase e decisões de design
├── data-model.md        # Entidade Avaliação e campos usados no gráfico
├── quickstart.md        # Como testar manualmente
└── checklists/
    └── requirements.md  # Checklist de qualidade da spec
```

### Source Code (arquivo único modificado)

```text
frontend/
└── pages/
    └── dashboard.html   # Único arquivo alterado nesta feature
```

**Structure Decision**: Feature frontend-only. Um único arquivo HTML é modificado, sem novos arquivos de código. O projeto não tem build step — Tailwind e Chart.js chegam via CDN. O padrão existente de `dashboard.html` concentrar HTML + JS inline é mantido.

### Pontos de modificação em `dashboard.html`

| Seção | Tipo | Localização |
|-------|------|-------------|
| `#secaoEvolucaoAluno` | HTML — nova `<section>` | Após `#listaHistoricoJogos` (linha ~197), dentro de `#blocosAluno` |
| `chartEvolucaoAluno` | JS — variável de instância | Junto às demais variáveis de chart (`chartMinutagem`, `chartVolumeAluno`) |
| `computeAlunoData()` | JS — adição de campo `avaliacoesRecentes` ao retorno | Linha ~900 |
| `renderEvolucaoAluno()` | JS — nova função render | Após `renderHistoricoJogos()` (~linha 1190) |
| `clearAlunoView()` | JS — destruir instância do chart | Linha ~1014, junto aos demais destroys |
| `refreshAluno()` | JS — chamar `renderEvolucaoAluno(data)` | Linha ~1213, após `renderHistoricoJogos(data)` |
