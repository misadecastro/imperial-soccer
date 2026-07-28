namespace Imperial.Api.Models;

/// <summary>Documento da coleção `students` no MongoDB — entidade de domínio Aluno.</summary>
public sealed class Aluno
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public string DataNascimento { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;

    // ── Campos da ficha (feature 022) — editados inline na ficha do aluno ──────────
    /// <summary>Foto como data URI base64 (`data:image/...;base64,...`); nula quando ausente.</summary>
    public string? Foto { get; set; }
    /// <summary>"Direito" | "Esquerdo" | "Ambidestro".</summary>
    public string? PeDominante { get; set; }
    /// <summary>Massa corporal em quilogramas.</summary>
    public decimal? MassaCorporal { get; set; }
    /// <summary>Estatura em metros.</summary>
    public decimal? Estatura { get; set; }
    /// <summary>Texto qualitativo livre (Avaliação Geral) — um por aluno.</summary>
    public string? AvaliacaoGeral { get; set; }
}
