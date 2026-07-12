using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Imperial.Api.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Imperial.Api.Services;

public sealed record TokenGerado(string Token, DateTimeOffset ExpiraEm);

/// <summary>Emite o token JWT que representa a "Sessão" descrita na spec (stateless).</summary>
public sealed class JwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public TokenGerado GerarToken(ApplicationUser user)
    {
        var jwtSection = _configuration.GetSection("Jwt");
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Configuração 'Jwt:Key' não definida (esperada via user-secrets).");
        var expirationHours = jwtSection.GetValue<double?>("ExpirationHours") ?? 8;
        var expiraEm = DateTimeOffset.UtcNow.AddHours(expirationHours);

        // Claims curtas (sub/name/email/role), não as URIs longas de ClaimTypes.* —
        // mantém o token legível e consistente com data-model.md. RoleClaimType/NameClaimType
        // são configurados em Program.cs para que [Authorize(Roles=...)] reconheça "role".
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim("name", user.Nome),
            new Claim("email", user.Email ?? string.Empty),
            new Claim("role", user.Role),
        };

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSection["Issuer"],
            audience: jwtSection["Audience"],
            claims: claims,
            expires: expiraEm.UtcDateTime,
            signingCredentials: credentials);

        return new TokenGerado(new JwtSecurityTokenHandler().WriteToken(token), expiraEm);
    }
}
