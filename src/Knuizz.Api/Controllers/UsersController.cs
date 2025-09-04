using System.Security.Claims;
using Knuizz.Api.Application.DTOs.User;
using Knuizz.Api.Application.Exceptions;
using Knuizz.Api.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Knuizz.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase {
    private readonly IUserService _userService;

    public UsersController(IUserService userService) {
        _userService = userService;
    }

    // GET /api/users/profile
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetMyProfile() {
        try {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString)) return Unauthorized("User identifier is missing in token.");
            var userId = Guid.Parse(userIdString);

            var profile = await _userService.GetUserProfileAsync(userId);
            return Ok(profile);
        }
        catch (EntityNotFoundException ex) {
            return NotFound(new { message = ex.Message });
        }
    }

    // PUT /api/users/profile
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile(UpdateProfileDto profileDto) {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdString)) return Unauthorized("User identifier is missing in token.");
        var userId = Guid.Parse(userIdString);
        try {
            var success = await _userService.UpdateUserProfileAsync(userId, profileDto);
            if (!success) return NotFound();
            return NoContent();
        }
        catch (ArgumentException ex) {
            return BadRequest(new { message = ex.Message });
        }
    }

    // GET /api/users/{id}/statistics
    [HttpGet("{id:guid}/statistics")]
    [AllowAnonymous]
    public async Task<IActionResult> GetUserStatistics(Guid id) {
        var stats = await _userService.GetUserStatisticsAsync(id);
        if (stats == null) return NotFound();
        return Ok(stats);
    }

    // GET /api/users/leaderboard?count=10
    [HttpGet("leaderboard")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLeaderboard([FromQuery] int count = 10) {
        var leaderboard = await _userService.GetLeaderboardAsync(count);
        return Ok(leaderboard);
    }
}