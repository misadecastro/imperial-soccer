namespace Imperial.Api.Models;

/// <summary>
/// Momento do Jogo — raiz da coleção <c>game_moments</c> (feature 020),
/// embutindo seus <see cref="VinculoMomentoPrincipio"/>.
/// </summary>
public sealed class Momento
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Label { get; set; } = string.Empty;
    public string Desc { get; set; } = string.Empty;
    public string Tipo { get; set; } = "ofensivo"; // "ofensivo" | "defensivo"
    public List<VinculoMomentoPrincipio> Vinculos { get; set; } = [];
}
