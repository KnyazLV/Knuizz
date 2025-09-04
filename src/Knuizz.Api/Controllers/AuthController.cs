using Knuizz.Api.Application.DTOs.Auth;
using Knuizz.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Knuizz.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
    // private readonly AuthService _authService;
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto) {
        try {
            var user = await _authService.RegisterAsync(registerDto);
            return Ok(new { message = $"User {user.Username} registered successfully." });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto) {
        try {
            var token = await _authService.LoginAsync(loginDto);
            return Ok(new { token });
        }
        catch (ArgumentException ex) {
            return Unauthorized(new { message = ex.Message });
        }
    }
}