using Imperial.Api.DTOs;
using Imperial.Api.Identity;
using Imperial.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Imperial.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtTokenService _jwtTokenService;

    public AuthController(
        SignInManager<ApplicationUser> signInManager,
        UserManager<ApplicationUser> userManager,
        JwtTokenService jwtTokenService)
    {
        _signInManager = signInManager;
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    /// <summary>FR-001, FR-009, FR-012 — US1 Acceptance Scenarios 1 e 2.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<ApiResponse<LoginResponse>>> Login([FromBody] LoginRequest request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !user.Ativo)
        {
            // Mensagem genérica — não revela se o problema foi o e-mail ou a senha (FR-009).
            return Unauthorized(ApiResponse<LoginResponse>.Fail("E-mail ou senha inválidos."));
        }

        var resultado = await _signInManager.CheckPasswordSignInAsync(user, request.Senha, lockoutOnFailure: true);

        if (resultado.IsLockedOut)
        {
            return StatusCode(423, ApiResponse<LoginResponse>.Fail(
                "Conta temporariamente bloqueada. Tente novamente mais tarde."));
        }

        if (!resultado.Succeeded)
        {
            return Unauthorized(ApiResponse<LoginResponse>.Fail("E-mail ou senha inválidos."));
        }

        var token = _jwtTokenService.GerarToken(user);
        var resposta = new LoginResponse(
            token.Token,
            token.ExpiraEm,
            new UserResponse(user.Id, user.Nome, user.Email!, user.Role, user.Ativo));

        return Ok(ApiResponse<LoginResponse>.Ok(resposta));
    }

    /// <summary>
    /// US1 Acceptance Scenario 4. Autenticação é stateless (JWT) — o logout é primariamente
    /// uma ação do cliente (descartar o token); este endpoint existe por simetria de contrato.
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public ActionResult<ApiResponse<object?>> Logout()
    {
        return Ok(ApiResponse<object?>.Ok(null, "Sessão finalizada."));
    }
}
