namespace Imperial.Api.DTOs;

// ── Tipos de Avaliação (feature 022) ──────────────────────────────────────────

/// <summary>Item no payload de criação/edição de tipo; `Id` nulo indica item novo.</summary>
public sealed record EvaluationItemDto(string? Id, string Nome);

public sealed record CreateEvaluationTypeRequest(string Nome, List<string> Itens);

public sealed record UpdateEvaluationTypeRequest(string Nome, List<EvaluationItemDto> Itens);

// ── Avaliações / registros (feature 022) ──────────────────────────────────────

public sealed record PontuacaoDto(string ItemId, int Nota);

public sealed record CreateEvaluationRequest(string AlunoId, string TipoId, string Data, List<PontuacaoDto> Pontuacoes);

// Respostas reutilizam os modelos EvaluationType / Evaluation (serialização camelCase padrão).
