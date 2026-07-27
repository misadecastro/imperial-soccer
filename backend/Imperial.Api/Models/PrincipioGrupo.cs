namespace Imperial.Api.Models;

/// <summary>
/// Princípio/Fundamento — raiz da coleção <c>training_principles</c> (feature 020),
/// embutindo seus <see cref="ItemTrabalhado"/>.
/// </summary>
public sealed class PrincipioGrupo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Titulo { get; set; } = string.Empty;
    public string Filtro { get; set; } = "sempre"; // "defensivo" | "ofensivo" | "sempre"
    public List<ItemTrabalhado> Itens { get; set; } = [];
}
