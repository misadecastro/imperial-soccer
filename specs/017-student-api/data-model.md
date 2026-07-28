# Data Model: Cadastro de Alunos com Persistência Real

**Branch**: `017-student-api` | **Date**: 2026-07-12

Nova coleção MongoDB `students`. As demais coleções existentes (`users`, `roles`) e os dados em `sessionStorage` (`avaliacoes`, `chamadas`, `jogos`) **não são alterados** por esta feature.

## Aluno (coleção `students`)

| Campo | Tipo | Restrições | Origem |
|-------|------|------------|--------|
| `_id` (mapeado como `Id`) | string (GUID) | único; gerado na criação | gerado pelo backend |
| `Nome` | string | obrigatório; mín. 2 caracteres | FR-001, FR-007 |
| `DataNascimento` | string (ISO 8601 `YYYY-MM-DD`) | obrigatório; não pode ser data futura | FR-001, FR-006 |
| `Categoria` | string | obrigatório; deve ser um dos valores válidos | FR-001, validação |

**Categorias válidas** (lista fixa do domínio):  
`Sub09`, `Sub10`, `Sub11`, `Sub12`, `Sub13`, `Sub14`, `Sub15F`, `Sub17F`

```csharp
// backend/Imperial.Api/Models/Aluno.cs
public sealed class Aluno
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public string DataNascimento { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
}
```

```ts
// src/frontend/src/app/models/aluno.model.ts (existente, inalterado)
export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string;
  categoria: string;
}
```

## DTOs da API

### `CreateStudentRequest` (entrada — POST)

```json
{
  "nome": "João Silva",
  "dataNascimento": "2015-03-20",
  "categoria": "Sub09"
}
```

### `StudentResponse` (saída — GET / POST)

```json
{
  "id": "b3c9a21f-...",
  "nome": "João Silva",
  "dataNascimento": "2015-03-20",
  "categoria": "Sub09"
}
```

### Novo model no frontend (`CreateStudentRequest`)

```ts
// adicionar a src/frontend/src/app/models/aluno.model.ts
export interface CreateStudentRequest {
  nome: string;
  dataNascimento: string;
  categoria: string;
}
```

## Validações (camada backend)

| Regra | FR | Código de erro HTTP |
|-------|----|---------------------|
| `nome` obrigatório, mín. 2 chars | FR-001, FR-007 | 400 |
| `dataNascimento` obrigatório, formato válido | FR-001 | 400 |
| `dataNascimento` não pode ser futuro | FR-006 | 400 |
| `categoria` obrigatório, valor na lista válida | FR-001 | 400 |

Todas as respostas de erro seguem o envelope padrão `{ success: false, data: null, message: "...", errors: [...] }`.

## Relacionamentos

```
Aluno (1) ──< Avaliacao (N)   via Avaliacao.alunoId  [avaliações em sessionStorage — não migradas nesta feature]
Aluno (1) ──< Chamada.registros (N)   via RegistroPresenca.alunoId  [chamadas em sessionStorage]
Aluno (N) ──< Jogo.participacoes (N)  via Participacao.alunoId  [jogos em sessionStorage]
```

Enquanto avaliações/chamadas/jogos permanecerem em `sessionStorage`, essas relações existem apenas no cliente. O `Id` do aluno gerado pelo backend será a chave usada daqui em diante em todas as referências cruzadas.
