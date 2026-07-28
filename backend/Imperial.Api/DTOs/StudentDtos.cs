namespace Imperial.Api.DTOs;

public sealed record CreateStudentRequest(string Nome, string DataNascimento, string Categoria);

public sealed record StudentResponse(
    string Id,
    string Nome,
    string DataNascimento,
    string Categoria,
    string? Foto,
    string? PeDominante,
    decimal? MassaCorporal,
    decimal? Estatura,
    string? AvaliacaoGeral);

/// <summary>Atualização dos campos da ficha (feature 022) — todos opcionais (edição incremental).</summary>
public sealed record UpdateStudentProfileRequest(
    string? Foto,
    string? PeDominante,
    decimal? MassaCorporal,
    decimal? Estatura,
    string? AvaliacaoGeral);
