namespace Imperial.Api.Identity;

/// <summary>Os dois únicos papéis válidos nesta versão (spec FR-003).</summary>
public static class Roles
{
    public const string Administrador = "Administrador";
    public const string Professor = "Professor";

    public static readonly IReadOnlyList<string> Todos = [Administrador, Professor];

    public static bool EhValido(string? role) => role is Administrador or Professor;
}
