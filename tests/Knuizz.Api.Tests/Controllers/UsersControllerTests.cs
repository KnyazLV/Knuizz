using System.Security.Claims;
using Knuizz.Api.Application.DTOs.User;
using Knuizz.Api.Application.Exceptions;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Controllers;
using Knuizz.Api.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Knuizz.Api.Tests.Controllers;

[TestFixture]
public class UsersControllerTests {
    [SetUp]
    public void Setup() {
        _mockUserService = new Mock<IUserService>();
        _controller = new UsersController(_mockUserService.Object);
    }

    private Mock<IUserService> _mockUserService;
    private UsersController _controller;

    private void SetupUser(string userId) {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, userId) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    [Test]
    public async Task GetMyProfile_WhenProfileExists_ShouldReturnOk() {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUser(userId.ToString());
        var userProfile = new UserProfileDto { Id = userId, Username = "test", Email = "test@example.com" };
        _mockUserService.Setup(s => s.GetUserProfileAsync(userId)).ReturnsAsync(userProfile);

        // Act
        var result = await _controller.GetMyProfile();

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var okResult = (OkObjectResult)result;
        Assert.That(okResult.Value, Is.EqualTo(userProfile));
    }

    [Test]
    public async Task GetMyProfile_WhenProfileNotFound_ShouldReturnNotFound() {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUser(userId.ToString());

        _mockUserService.Setup(s => s.GetUserProfileAsync(userId))
            .ThrowsAsync(new EntityNotFoundException("Not found"));

        // Act
        var result = await _controller.GetMyProfile();

        // Assert
        Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
    }


    [Test]
    public async Task UpdateMyProfile_WhenUpdateSucceeds_ShouldReturnNoContent() {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUser(userId.ToString());
        var updateDto = new UpdateProfileDto { Username = "newname" };
        _mockUserService.Setup(s => s.UpdateUserProfileAsync(userId, updateDto)).ReturnsAsync(true);

        // Act
        var result = await _controller.UpdateMyProfile(updateDto);

        // Assert
        Assert.That(result, Is.InstanceOf<NoContentResult>());
    }

    [Test]
    public async Task UpdateMyProfile_WhenServiceThrowsArgumentException_ShouldReturnBadRequest() {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUser(userId.ToString());
        var updateDto = new UpdateProfileDto { Username = "taken-name" };
        var errorMessage = "Username is already taken.";
        _mockUserService.Setup(s => s.UpdateUserProfileAsync(userId, updateDto)).ThrowsAsync(new ArgumentException(errorMessage));

        // Act
        var result = await _controller.UpdateMyProfile(updateDto);

        // Assert
        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        var badRequestResult = (BadRequestObjectResult)result;
        var responseMessage = badRequestResult.Value?.GetType().GetProperty("message")?.GetValue(badRequestResult.Value, null);
        Assert.That(responseMessage, Is.EqualTo(errorMessage));
    }

    [Test]
    public async Task GetUserStatistics_WhenStatsExist_ShouldReturnOk() {
        // Arrange
        var userId = Guid.NewGuid();
        var stats = new UserStatistics { UserId = userId, Rating = 1234, Level = 5 };
        _mockUserService.Setup(s => s.GetUserStatisticsAsync(userId)).ReturnsAsync(stats);

        // Act
        var result = await _controller.GetUserStatistics(userId);

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var okResult = (OkObjectResult)result;
        Assert.That(okResult.Value, Is.EqualTo(stats));
    }

    [Test]
    public async Task GetUserStatistics_WhenStatsNotFound_ShouldReturnNotFound() {
        // Arrange
        UserStatistics? nullStats = null;
        _mockUserService.Setup(s => s.GetUserStatisticsAsync(It.IsAny<Guid>())).ReturnsAsync(nullStats);

        // Act
        var result = await _controller.GetUserStatistics(Guid.NewGuid());

        // Assert
        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    [Test]
    public async Task GetLeaderboard_ShouldReturnOkWithDataFromService() {
        // Arrange
        var leaderboardData = new List<LeaderboardEntryDto> {
            new() { Username = "Player1", Rating = 2000 },
            new() { Username = "Player2", Rating = 1900 }
        };
        _mockUserService.Setup(s => s.GetLeaderboardAsync(It.IsAny<int>())).ReturnsAsync(leaderboardData);

        // Act
        var result = await _controller.GetLeaderboard();

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var okResult = (OkObjectResult)result;
        Assert.That(okResult.Value, Is.EqualTo(leaderboardData));
    }
}