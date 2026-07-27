using MongoDB.Bson.Serialization.Attributes;

namespace Imperial.Api.Models;

/// <summary>Item avaliável embutido em <see cref="EvaluationType"/> (feature 022).</summary>
[BsonIgnoreExtraElements]
public sealed class EvaluationItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
}
