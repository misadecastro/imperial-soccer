using Imperial.Api.DTOs;
using Imperial.Api.Identity;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace Imperial.Api.Controllers;

/// <summary>Gestão de usuários — exclusiva ao papel Administrador (FR-004, FR-013, FR-014).</summary>
[ApiController]
[Route("api/v1/users")]
[Authorize(Roles = Roles.Administrador)]
public sealed class UsersController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMongoCollection<ApplicationUser> _users;

    public UsersController(UserManager<ApplicationUser> userManager, IMongoDatabase database)
    {
        _userManager = userManager;
        _users = database.GetCollection<ApplicationUser>("users");
    }

    /// <summary>FR-013.</summary>
    [HttpGet]
    public async Task<ActionResult<ApiResponse<IReadOnlyList<UserResponse>>>> GetUsers()
    {
        var usuarios = await _users.Find(FilterDefinition<ApplicationUser>.Empty).ToListAsync();
        var resposta = usuarios
            .Select(u => new UserResponse(u.Id, u.Nome, u.Email!, u.Role, u.Ativo))
            .ToList();

        return Ok(ApiResponse<IReadOnlyList<UserResponse>>.Ok(resposta));
    }

    /// <summary>FR-005, FR-006, FR-007 — US2 Acceptance Scenarios 2 e 3.</summary>
    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserResponse>>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (!Roles.EhValido(request.Papel))
        {
            return BadRequest(ApiResponse<UserResponse>.Fail("Papel inválido. Use 'Administrador' ou 'Professor'."));
        }

        var novoUsuario = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            Nome = request.Nome,
            Role = request.Papel,
            Ativo = true,
            EmailConfirmed = true,
        };

        var resultado = await _userManager.CreateAsync(novoUsuario, request.Senha);

        if (!resultado.Succeeded)
        {
            if (resultado.Errors.Any(e => e.Code is "DuplicateEmail" or "DuplicateUserName"))
            {
                return Conflict(ApiResponse<UserResponse>.Fail("Este e-mail já está em uso."));
            }

            return BadRequest(ApiResponse<UserResponse>.Fail(
                "Não foi possível cadastrar o usuário.",
                resultado.Errors.Select(e => e.Description).ToList()));
        }

        var resposta = new UserResponse(novoUsuario.Id, novoUsuario.Nome, novoUsuario.Email!, novoUsuario.Role, novoUsuario.Ativo);
        return CreatedAtAction(nameof(GetUsers), ApiResponse<UserResponse>.Ok(resposta, "Usuário cadastrado com sucesso."));
    }

    /// <summary>FR-014; Edge Case — impede desativar/trocar o papel do último Admin ativo.</summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<UserResponse>>> UpdateUser(string id, [FromBody] UpdateUserRequest request)
    {
        var usuario = await _userManager.FindByIdAsync(id);
        if (usuario is null)
        {
            return NotFound(ApiResponse<UserResponse>.Fail("Usuário não encontrado."));
        }

        var vaiDeixarDeSerAdminAtivo =
            usuario.Role == Roles.Administrador &&
            ((request.Papel is not null && request.Papel != Roles.Administrador) ||
             (request.Ativo is false));

        if (vaiDeixarDeSerAdminAtivo)
        {
            var outrosAdminsAtivos = await _users
                .Find(u => u.Id != usuario.Id && u.Role == Roles.Administrador && u.Ativo)
                .AnyAsync();

            if (!outrosAdminsAtivos)
            {
                return Conflict(ApiResponse<UserResponse>.Fail("Não é possível remover o último administrador ativo."));
            }
        }

        if (request.Nome is not null) usuario.Nome = request.Nome;
        if (request.Papel is not null)
        {
            if (!Roles.EhValido(request.Papel))
            {
                return BadRequest(ApiResponse<UserResponse>.Fail("Papel inválido. Use 'Administrador' ou 'Professor'."));
            }
            usuario.Role = request.Papel;
        }
        if (request.Ativo is not null) usuario.Ativo = request.Ativo.Value;

        var atualizacao = await _userManager.UpdateAsync(usuario);
        if (!atualizacao.Succeeded)
        {
            return BadRequest(ApiResponse<UserResponse>.Fail(
                "Não foi possível atualizar o usuário.",
                atualizacao.Errors.Select(e => e.Description).ToList()));
        }

        if (!string.IsNullOrWhiteSpace(request.NovaSenha))
        {
            await _userManager.RemovePasswordAsync(usuario);
            await _userManager.AddPasswordAsync(usuario, request.NovaSenha);
        }

        var resposta = new UserResponse(usuario.Id, usuario.Nome, usuario.Email!, usuario.Role, usuario.Ativo);
        return Ok(ApiResponse<UserResponse>.Ok(resposta, "Usuário atualizado com sucesso."));
    }
}
