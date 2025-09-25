using System.IdentityModel.Tokens.Jwt;
using Knuizz.Api.Application.DTOs.Auth;
using Knuizz.Api.Application.Exceptions;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Moq;

namespace Knuizz.Api.Tests.Services;

[TestFixture]
public class AuthServiceTests {
    [SetUp]
    public void Setup() {
        var options = new DbContextOptionsBuilder<KnuizzDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _context = new KnuizzDbContext(options);

        _mockConfiguration = new Mock<IConfiguration>();

        var jwtTestKey = "6VM5rBC1956umw8EP25f7tcyJAPaUlxX6d6HJ61ugQH9sJ0EhlDTRk9AVjDnsGvE";
        _mockConfiguration.Setup(c => c["Jwt:Key"]).Returns(jwtTestKey);
        _mockConfiguration.Setup(c => c["Jwt:Issuer"]).Returns("TestIssuer");
        _mockConfiguration.Setup(c => c["Jwt:Audience"]).Returns("TestAudience");

        _authService = new AuthService(_context, _mockConfiguration.Object);
    }

    [TearDown]
    public void Teardown() {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    private KnuizzDbContext _context;
    private AuthService _authService;
    private Mock<IConfiguration> _mockConfiguration;

    [Test]
    public async Task RegisterAsync_WithUniqueEmail_ShouldCreateUserAndStats() {
        // Arrange
        var registerDto = new RegisterDto {
            Username = "testuser",
            Email = "test@example.com",
            Password = "Password123"
        };

        // Act
        var createdUser = await _authService.RegisterAsync(registerDto);

        // Assert
        Assert.That(createdUser, Is.Not.Null);

        var userInDb = await _context.Users.FirstOrDefaultAsync(u => u.Email == registerDto.Email);
        Assert.That(userInDb, Is.Not.Null);
        Assert.That(userInDb!.Username, Is.EqualTo(registerDto.Username));
        Assert.That(BCrypt.Net.BCrypt.Verify(registerDto.Password, userInDb.PasswordHash), Is.True);

        var statsInDb = await _context.UserStatistics.FirstOrDefaultAsync(s => s.UserId == userInDb.Id);
        Assert.That(statsInDb, Is.Not.Null);
    }

    [Test]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowArgumentException() {
        // Arrange
        var existingUser = new User {
            Username = "existinguser",
            Email = "existing@example.com",
            PasswordHash = "some_hashed_password"
        };
        await _context.Users.AddAsync(existingUser);
        await _context.SaveChangesAsync();

        var registerDto = new RegisterDto {
            Username = "newuser",
            Email = "existing@example.com",
            Password = "Password123"
        };

        // Act & Assert
        var ex = Assert.ThrowsAsync<DuplicateUserException>(async () => await _authService.RegisterAsync(registerDto));
        Assert.That(ex.Message, Is.EqualTo("User with this email already exists."));
    }

    [Test]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnValidJwtToken() {
        // Arrange
        var password = "Password123";
        var user = new User {
            Id = Guid.NewGuid(),
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password)
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginDto { Email = user.Email, Password = password };

        // Act
        var tokenString = await _authService.LoginAsync(loginDto);

        // Assert
        Assert.That(tokenString, Is.Not.Null.And.Not.Empty);

        var handler = new JwtSecurityTokenHandler();
        var decodedToken = handler.ReadJwtToken(tokenString);

        var userIdClaim = decodedToken.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Sub).Value;
        var emailClaim = decodedToken.Claims.First(claim => claim.Type == JwtRegisteredClaimNames.Email).Value;

        Assert.That(userIdClaim, Is.EqualTo(user.Id.ToString()));
        Assert.That(emailClaim, Is.EqualTo(user.Email));
    }

    [TestCase("wrong@example.com", "Password123")] // Non-existent email
    [TestCase("test@example.com", "WrongPassword")] // Correct email, wrong password
    public async Task LoginAsync_WithInvalidCredentials_ShouldThrowArgumentException(string email, string password) {
        // Arrange
        var correctPassword = "Password123";
        var user = new User {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(correctPassword)
        };
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        var loginDto = new LoginDto { Email = email, Password = password };

        // Act & Assert
        var ex = Assert.ThrowsAsync<ArgumentException>(async () => await _authService.LoginAsync(loginDto));
        Assert.That(ex.Message, Is.EqualTo("Invalid email or password."));
    }

    [Test]
    public async Task RegisterAsync_WithExistingUsername_ShouldThrowArgumentException() {
        // --- Arrange ---
        var existingUser = new User {
            Username = "existinguser",
            Email = "existing@example.com",
            PasswordHash = "some_hashed_password"
        };
        await _context.Users.AddAsync(existingUser);
        await _context.SaveChangesAsync();

        var registerDto = new RegisterDto {
            Username = "existinguser",
            Email = "new@example.com",
            Password = "Password123"
        };

        // --- Act & Assert ---
        var ex = Assert.ThrowsAsync<DuplicateUserException>(async () => await _authService.RegisterAsync(registerDto));
        Assert.That(ex.Message, Is.EqualTo("This username is already taken."));
    }
}