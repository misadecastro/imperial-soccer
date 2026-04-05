# Data Model: Redesign da Aplicação

**Branch**: `006-app-redesign` | **Date**: 2026-04-05

## Nota

Esta feature é exclusivamente visual (HTML/CSS). **Nenhuma entidade nova é introduzida** e nenhuma entidade existente é modificada.

As entidades do domínio (`Aluno`, `Avaliação`, `Frequência`) permanecem inalteradas, conforme definido na Constituição e nas features anteriores.

O único "modelo" relevante para esta feature é a paleta de cores e tokens de design, documentados em [research.md](research.md).

## Design Tokens (referência de implementação)

| Token CSS / Tailwind | Valor | Uso |
|---|---|---|
| `imperial.green` | `#2a7a3d` | Header, aba ativa, botão salvar |
| `imperial.green-mid` | `#16a34a` | Botão Presente (ativo), badges |
| `imperial.green-light` | `#dcfce7` | Fundo botão Presente ativo |
| `imperial.red` | `#dc2626` | Botão Falta (ativo) |
| `imperial.red-light` | `#fee2e2` | Fundo botão Falta ativo |
| `imperial.bg` | `#f0f4f1` | Fundo geral da página |
| `imperial.card` | `#ffffff` | Fundo dos cartões |
| `imperial.text` | `#111827` | Texto principal |
| `imperial.text-muted` | `#6b7280` | Texto secundário |
| `imperial.border` | `#e5e7eb` | Bordas de cartão/separadores |

## Avatar Color Rotation

Paleta de 8 cores atribuídas por `index % 8` via JavaScript (sem nova entidade de dados):

```js
const AVATAR_COLORS = [
  '#16a34a', // verde
  '#f97316', // laranja
  '#ec4899', // rosa
  '#8b5cf6', // violeta
  '#06b6d4', // ciano
  '#eab308', // amarelo
  '#ef4444', // vermelho
  '#6366f1', // índigo
]
```
