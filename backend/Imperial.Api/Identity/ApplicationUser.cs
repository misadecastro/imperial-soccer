using Microsoft.AspNetCore.Identity;

namespace Imperial.Api.Identity;

/// <summary>
/// Usuário do sistema (quem opera o sistema — distinto de Aluno, que é gerido pelo sistema).
/// Estende o IdentityUser&lt;string&gt; (abstrações "core" do Identity, sem EF Core).
/// </summary>
public sealed class ApplicationUser : IdentityUser<string>
{
    public ApplicationUser()
    {
        Id = Guid.NewGuid().ToString();
    }

    /// <summary>Nome de exibição do usuário.</summary>
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Papel único do usuário ("Administrador" | "Professor"). Embutido deliberadamente
    /// em vez de uma coleção `roles` separada — ver data-model.md.
    /// </summary>
    public string Role { get; set; } = Roles.Professor;

    /// <summary><c>false</c> bloqueia o login mesmo com credenciais corretas.</summary>
    public bool Ativo { get; set; } = true;
}
