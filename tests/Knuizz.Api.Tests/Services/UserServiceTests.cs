using Knuizz.Api.Application.DTOs.User;
using Knuizz.Api.Application.Exceptions;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Knuizz.Api.Tests.Services;

[TestFixture]
public class UserServiceTests {
    [SetUp]
    public void Setup() {
        var options = new DbContextOptionsBuilder<KnuizzDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _context = new KnuizzDbContext(options);
        _userService = new UserService(_context);
    }

    [TearDown]
    public void Teardown() {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    private KnuizzDbContext _context;
    private UserService _userService;

    //#region GetUserProfileAsync

    [Test]
    public async Task GetUserProfileAsync_WhenUserExists_ShouldReturnProfile() {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Username = "testuser", Email = "test@example.com", PasswordHash = "hash" };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        // Act
        var profile = await _userService.GetUserProfileAsync(user.Id);

        // Assert
        Assert.That(profile, Is.Not.Null);
        Assert.That(profile.Id, Is.EqualTo(user.Id));
        Assert.That(profile.Username, Is.EqualTo(user.Username));
    }

    [Test]
    public void GetUserProfileAsync_WhenUserNotFound_ShouldThrowEntityNotFoundException() {
        Assert.ThrowsAsync<EntityNotFoundException>(async () => await _userService.GetUserProfileAsync(Guid.NewGuid()));
    }

    //#endregion

    //#region UpdateUserProfileAsync

    [Test]
    public async Task UpdateUserProfileAsync_WhenUserExistsAndUsernameIsUnique_ShouldSucceed() {
        // Arrange
        var user = new User { Id = Guid.NewGuid(), Username = "oldname", Email = "test@example.com", PasswordHash = "hash" };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
        var updateDto = new UpdateProfileDto { Username = "newname" };

        // Act
        var result = await _userService.UpdateUserProfileAsync(user.Id, updateDto);

        // Assert
        Assert.That(result, Is.True);
        var updatedUser = await _context.Users.FindAsync(user.Id);
        Assert.That(updatedUser?.Username, Is.EqualTo("newname"));
    }

    [Test]
    public async Task UpdateUserProfileAsync_WhenUserNotFound_ShouldReturnFalse() {
        // Act
        var result = await _userService.UpdateUserProfileAsync(Guid.NewGuid(), new UpdateProfileDto { Username = "newname" });

        // Assert
        Assert.That(result, Is.False);
    }

    [Test]
    public async Task UpdateUserProfileAsync_WhenUsernameIsTaken_ShouldThrowArgumentException() {
        // Arrange
        var user1 = new User { Id = Guid.NewGuid(), Username = "user1", Email = "user1@example.com", PasswordHash = "hash1" };
        var user2 = new User { Id = Guid.NewGuid(), Username = "user2", Email = "user2@example.com", PasswordHash = "hash2" };
        await _context.Users.AddRangeAsync(user1, user2);
        await _context.SaveChangesAsync();
        var updateDto = new UpdateProfileDto { Username = "user2" };

        // Act & Assert
        Assert.ThrowsAsync<ArgumentException>(async () => await _userService.UpdateUserProfileAsync(user1.Id, updateDto));
    }

    //#endregion

    //#region GetUserStatisticsAsync

    [Test]
    public async Task GetUserStatisticsAsync_WhenStatsExist_ShouldReturnStatistics() {
        // Arrange
        var stats = new UserStatistics { UserId = Guid.NewGuid(), Rating = 1500, Level = 10 };
        await _context.UserStatistics.AddAsync(stats);
        await _context.SaveChangesAsync();

        // Act
        var result = await _userService.GetUserStatisticsAsync(stats.UserId);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Rating, Is.EqualTo(1500));
        Assert.That(result.Level, Is.EqualTo(10));
    }

    [Test]
    public async Task GetUserStatisticsAsync_WhenStatsNotFound_ShouldReturnNull() {
        // Act
        var result = await _userService.GetUserStatisticsAsync(Guid.NewGuid());

        // Assert
        Assert.That(result, Is.Null);
    }

    //#endregion

    //#region GetLeaderboardAsync

    [Test]
    public async Task GetLeaderboardAsync_ShouldReturnTopUsersSortedByRating() {
        // Arrange
        var user1 = new User { Username = "Player1", Email = "p1@e.c", PasswordHash = "h" };
        var user2 = new User { Username = "Player2", Email = "p2@e.c", PasswordHash = "h" };
        var user3 = new User { Username = "Player3", Email = "p3@e.c", PasswordHash = "h" };
        await _context.UserStatistics.AddRangeAsync(
            new UserStatistics { User = user1, Rating = 1200 },
            new UserStatistics { User = user2, Rating = 1500 },
            new UserStatistics { User = user3, Rating = 1100 }
        );
        await _context.SaveChangesAsync();

        // Act
        var leaderboard = await _userService.GetLeaderboardAsync(3);

        // Assert
        Assert.That(leaderboard.Count, Is.EqualTo(3));
        Assert.That(leaderboard[0].Username, Is.EqualTo("Player2"));
        Assert.That(leaderboard[1].Username, Is.EqualTo("Player1"));
        Assert.That(leaderboard[2].Username, Is.EqualTo("Player3"));
    }

    [Test]
    public async Task GetLeaderboardAsync_WhenRequestedCountExceedsLimit_ShouldReturnMax100() {
        // Arrange
        for (var i = 0; i < 120; i++) {
            var user = new User { Username = $"User{i}", Email = $"u{i}@e.c", PasswordHash = "h" };
            await _context.UserStatistics.AddAsync(new UserStatistics { User = user, Rating = 1000 + i });
        }

        await _context.SaveChangesAsync();

        // Act
        var leaderboard = await _userService.GetLeaderboardAsync(110);

        // Assert
        Assert.That(leaderboard.Count, Is.EqualTo(100));
    }

    //#endregion
}