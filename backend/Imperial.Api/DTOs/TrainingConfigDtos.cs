namespace Imperial.Api.DTOs;

// ── Princípios/Fundamentos ────────────────────────────────────────────────────

public sealed record CreatePrincipioRequest(string Titulo, string? Filtro);

public sealed record UpdatePrincipioRequest(string Titulo, string? Filtro);

public sealed record ItemRequest(string Label);

// ── Momentos do Jogo ──────────────────────────────────────────────────────────

public sealed record CreateMomentoRequest(string Label, string? Desc, string? Tipo);

public sealed record UpdateMomentoRequest(string Label, string? Desc);

public sealed record VinculoDto(string GrupoId, List<string> ItemIds);

public sealed record SetVinculosRequest(List<VinculoDto> Vinculos);

// Respostas reutilizam os modelos PrincipioGrupo / Momento (serialização camelCase padrão).
