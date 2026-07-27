namespace Imperial.Api.Models;

/// <summary>
/// Vínculo Momento ↔ Princípio — embutido em <see cref="Momento"/> (feature 020).
/// Referencia um <see cref="PrincipioGrupo"/> por <see cref="GrupoId"/> e a seleção de
/// <see cref="ItemTrabalhado"/> por <see cref="ItemIds"/>.
/// </summary>
public sealed class VinculoMomentoPrincipio
{
    public string GrupoId { get; set; } = string.Empty;
    public List<string> ItemIds { get; set; } = [];
}
