using Knuizz.Api.Application.DTOs.Auth;
using Knuizz.Api.Application.Exceptions;
using Knuizz.Api.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Knuizz.Api.Controllers;

/// <summary>
///     Controller for user authentication and registration.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase {
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService) {
        _authService = authService;
    }

    /// <summary>
    ///     Registration of a new user in the system.
    /// </summary>
    /// <remarks>
    ///     This endpoint creates a new user and its statistics.
    ///     Email and Username must be unique.
    /// </remarks>
    /// <param name="registerDto">Registration details: username, email, and password.</param>
    /// <returns>Notification of successful registration.</returns>
    /// <response code="200">User name registered successfully.</response>
    /// <response code="409">Error in request (e.g., email or username already taken).</response>
    /// <response code="400">Server error</response>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(string))]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register(RegisterDto registerDto) {
        try {
            var user = await _authService.RegisterAsync(registerDto);
            return Ok(new { message = $"User {user.Username} registered successfully." });
        }
        catch (DuplicateUserException ex) {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    ///     User authentication and receiving a JWT token.
    /// </summary>
    /// <param name="loginDto">Login details: email and password.</param>
    /// <returns>An object containing a JWT token for future requests.</returns>
    /// <response code="200">Authentication successful, token returned.</response>
    /// <response code="401">Incorrect login details (email or password).</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(LoginDto loginDto) {
        try {
            var token = await _authService.LoginAsync(loginDto);
            return Ok(new LoginResponseDto { Token = token });
        }
        catch (ArgumentException ex) {
            return Unauthorized(new { message = ex.Message });
        }
    }
}