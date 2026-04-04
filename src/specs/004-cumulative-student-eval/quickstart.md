# Quickstart: Avaliação Acumulativa do Aluno com Histórico e Gráfico

**Feature**: 004-cumulative-student-eval  
**Date**: 2026-04-04

---

## Visão Geral do Fluxo

```
students.html
  └─ [clica "Avaliar" no aluno X]
       └─ salva state em sessionStorage
       └─ navega para student-eval.html?alunoId=<uuid>
            ├─ lê state do sessionStorage
            ├─ exibe nome do aluno + botão Voltar
            ├─ exibe gráfico de evolução (Chart.js)
            ├─ exibe lista de avaliações (mais antigas primeiro)
            │    ├─ [Editar] → linha vira formulário inline
            │    └─ [Excluir] → confirmação → remove da lista e atualiza gráfico
            └─ formulário "Nova Avaliação" (data + Tático + Técnico + Mental)
                 └─ [Salvar] → adiciona à lista, atualiza gráfico
  └─ [clica "Voltar"]
       └─ salva state atualizado em sessionStorage
       └─ navega de volta para students.html
            └─ lê state do sessionStorage → renderiza lista com chips atualizados
```

---

## Arquivos a Criar / Modificar

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `frontend/pages/student-eval.html` | **Criar** | Nova página de avaliação individual |
| `frontend/pages/students.html` | **Modificar** | Botão "Avaliar" → navegação; ler/gravar sessionStorage |

---

## Dependências Externas (CDN)

```html
<!-- Tailwind (já existente) -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Chart.js (nova) -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

---

## Convenções a Seguir

- IDs de elementos HTML: camelCase em português (ex.: `listaAvaliacoes`, `formNovaAvaliacao`).
- JS: ES Modules inline (`<script type="module">`), sem arquivos externos.
- Validação: client-side com mensagens de erro via `<p role="alert">` abaixo do campo.
- Confirmação de exclusão: `window.confirm()` — simples, sem modal extra.
- Toast: reutilizar o padrão de `showToast()` já existente.
- Cores do gráfico: amarelo `#facc15` (Tático), verde `#4ade80` (Técnico), azul `#60a5fa` (Mental).

---

## Como Testar Manualmente

1. Abrir `frontend/index.html` no browser.
2. Fazer login (qualquer credencial aceita no MVP).
3. Cadastrar 1 aluno.
4. Clicar em "Avaliar" → confirmar que navega para `student-eval.html`.
5. Registrar 3 avaliações em datas diferentes → confirmar que lista e gráfico atualizam.
6. Editar uma avaliação → confirmar que lista e gráfico refletem o novo valor.
7. Excluir uma avaliação → confirmar que lista e gráfico removem o ponto.
8. Clicar em "Voltar" → confirmar que `students.html` exibe os chips com a avaliação mais recente.
