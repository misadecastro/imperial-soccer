namespace Imperial.Api.Models;

/// <summary>Documento da coleção `students` no MongoDB — entidade de domínio Aluno.</summary>
public sealed class Aluno
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Nome { get; set; } = string.Empty;
    public string DataNascimento { get; set; } = string.Empty;
    public string Categoria { get; set; } = string.Empty;
}
