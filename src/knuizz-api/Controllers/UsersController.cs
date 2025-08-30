using System.Security.Claims;
using knuizz_api.Application.DTOs.User;
using knuizz_api.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace knuizz_api.Controllers;

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
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var profile = await _userService.GetUserProfileAsync(userId);
        if (profile == null) return NotFound();
        return Ok(profile);
    }

    // PUT /api/users/profile
    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateMyProfile(UpdateProfileDto profileDto) {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
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