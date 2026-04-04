# Quickstart: Student Registration and Evaluation (Mock)

**Feature**: 002-student-register-eval  
**Date**: 2026-04-04

---

## O que é este arquivo

Uma página HTML standalone (`frontend/pages/students.html`) que simula o fluxo completo de cadastro de alunos, filtragem e lançamento de avaliação sem nenhum backend. Os dados ficam em memória durante a sessão do navegador.

---

## Como usar

### Abrir a página

1. Abra o arquivo `frontend/pages/students.html` diretamente no navegador (double-click ou arraste para o browser).
2. Nenhum servidor, build, ou instalação é necessário.

### Fluxo de validação

**Cadastrar um aluno:**
1. Preencha o nome no campo "Nome do Aluno".
2. Selecione a data de nascimento.
3. Escolha a categoria no dropdown (Sub 09–Sub 14).
4. Clique em "Cadastrar".
5. O aluno aparece imediatamente na listagem abaixo.

**Filtrar alunos:**
1. Digite parte do nome no campo de busca — a lista filtra em tempo real.
2. Selecione uma categoria no filtro dropdown — a lista filtra imediatamente.
3. Os dois filtros podem ser combinados.

**Lançar avaliação:**
1. Clique no botão "Avaliar" na linha do aluno desejado na listagem.
2. No modal que abre, selecione a nota para cada aspecto (Técnico, Tático, Mental).
3. Clique em "Confirmar Avaliação".
4. O modal fecha e o aluno na listagem mostra um indicador visual de "avaliado".

---

## Estrutura do arquivo

```
frontend/
└── pages/
    └── students.html    ← única entrega desta feature (mock)
```

---

## Próximos passos (após validação)

Quando o fluxo for validado com o professor, a implementação real seguirá:

1. **Backend**: Controllers + Services + Repositories em `backend/Imperial.Api/`.
2. **Frontend**: Substituir o array em memória por chamadas à API via `frontend/services/studentService.js`.
3. **API contracts**: Já documentados em `specs/002-student-register-eval/contracts/students-api.md`.
