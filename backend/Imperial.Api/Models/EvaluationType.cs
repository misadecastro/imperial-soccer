using MongoDB.Bson.Serialization.Attributes;

namespace Imperial.Api.Models;

/// <summary>
/// Tipo de avaliação dinâmico — raiz da coleção <c>evaluation_types</c> (feature 022),
/// embutindo seus <see cref="EvaluationItem"/>. Exclusão é soft delete (<see cref="Arquivado"/>).
/// </summary>
[BsonIgnoreExtraElements]
public sealed class EvaluationType
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public List<EvaluationItem> Itens { get; set; } = [];
    public bool Arquivado { get; set; }
}
