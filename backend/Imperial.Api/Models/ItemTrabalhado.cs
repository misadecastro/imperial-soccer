namespace Imperial.Api.Models;

/// <summary>Item Trabalhado — embutido em <see cref="PrincipioGrupo"/> (feature 020).</summary>
public sealed class ItemTrabalhado
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Label { get; set; } = string.Empty;
}
