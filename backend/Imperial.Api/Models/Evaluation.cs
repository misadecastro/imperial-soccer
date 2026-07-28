using MongoDB.Bson.Serialization.Attributes;

namespace Imperial.Api.Models;

/// <summary>
/// Registro de avaliação de um aluno em um tipo, numa data (feature 022).
/// Coleção <c>evaluations</c> (esquema novo — a coleção da feature 018 foi descartada na 021).
/// <see cref="BsonIgnoreExtraElements"/> torna a leitura resiliente a documentos de esquemas antigos.
/// </summary>
[BsonIgnoreExtraElements]
public sealed class Evaluation
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string AlunoId { get; set; } = string.Empty;
    public string TipoId { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
    public List<Pontuacao> Pontuacoes { get; set; } = [];
}

/// <summary>Pontuação de um item (1–5) embutida em <see cref="Evaluation"/>.</summary>
[BsonIgnoreExtraElements]
public sealed class Pontuacao
{
    public string ItemId { get; set; } = string.Empty;
    public int Nota { get; set; }
}
