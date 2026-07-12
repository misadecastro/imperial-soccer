namespace Imperial.Api.Models;

public sealed class Avaliacao
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string AlunoId { get; set; } = string.Empty;
    public string Data { get; set; } = string.Empty;
    public int Tatico { get; set; }
    public int Tecnico { get; set; }
    public int Mental { get; set; }
}
