using System.Security.Claims;
using Knuizz.Api.Application;
using Knuizz.Api.Application.DTOs.User;
using Knuizz.Api.Application.Exceptions;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Knuizz.Api.Controllers;

/// <summary>
///     Manages user profiles, statistics, and leaderboards.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase {
    private readonly IUserService _userService;

    public UsersController(IUserService userService) {
        _userService = userService;
    }

    /// <summary>
    ///     Retrieves the profile of the currently authenticated user. (Authorization required)
    /// </summary>
    /// <returns>User profile information.</returns>
    /// <response code="200">Returns information about the user profile.</response>
    /// <response code="401">The user is not authorized.</response>
    /// <response code="404">User profile not found.</response>
    [HttpGet("profile")]
    [Authorize]
    [ProducesResponseType(typeof(UserProfileDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status404NotFound)]
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


    /// <summary>
    ///     Updates the profile of the currently authenticated user. (Authorization required)
    /// </summary>
    /// <remarks>
    ///     This endpoint allows the user to change their `Username`.
    /// </remarks>
    /// <param name="profileDto">Data for updating your profile.</param>
    /// <returns>Empty response upon successful update.</returns>
    /// <response code="204">Profile successfully updated.</response>
    /// <response code="400">Incorrect data in the request (for example, the username is already taken).</response>
    /// <response code="401">The user is not authorized.</response>
    /// <response code="404">User profile for update not found.</response>
    [HttpPut("profile")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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


    /// <summary>
    ///     Retrieves a user's game statistics based on their ID.
    /// </summary>
    /// <param name="id">Unique user identifier.</param>
    /// <returns>Object with user statistics.</returns>
    /// <response code="200">Returns user statistics.</response>
    /// <response code="404">Statistics for this user not found.</response>
    [HttpGet("{id:guid}/statistics")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(UserStatistics), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserStatistics(Guid id) {
        var stats = await _userService.GetUserStatisticsAsync(id);
        if (stats == null) return NotFound();
        return Ok(stats);
    }

    /// <summary>
    ///     Gets the leaderboard.
    /// </summary>
    /// <remarks>
    ///     Returns a list of the best players, sorted by their rating in descending order.
    /// </remarks>
    /// <param name="count">Number of players in the leaderboard (default 10, maximum 100).</param>
    /// <returns>List of players from the leaderboard.</returns>
    /// <response code="200">Returns the leaderboard.</response>
    [HttpGet("leaderboard")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<LeaderboardEntryDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetLeaderboard([FromQuery] int count = DomainConstants.Leaderboard.DefaultTopPlayersLimit) {
        var leaderboard = await _userService.GetLeaderboardAsync(count);
        return Ok(leaderboard);
    }
}