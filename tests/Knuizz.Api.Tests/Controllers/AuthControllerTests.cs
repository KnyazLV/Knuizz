using Knuizz.Api.Application.DTOs.Auth;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Controllers;
using Knuizz.Api.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Knuizz.Api.Tests.Controllers;

[TestFixture]
public class AuthControllerTests {
    [SetUp]
    public void Setup() {
        _mockAuthService = new Mock<IAuthService>();
        _controller = new AuthController(_mockAuthService.Object);
    }

    private Mock<IAuthService> _mockAuthService;
    private AuthController _controller;

    [Test]
    public async Task Register_WhenServiceSucceeds_ShouldReturnOk() {
        // Arrange
        var registerDto = new RegisterDto { Username = "newuser", Email = "new@example.com", Password = "Password123" };
        var user = new User { Username = "newuser" };

        _mockAuthService.Setup(s => s.RegisterAsync(registerDto)).ReturnsAsync(user);

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var okResult = (OkObjectResult)result;
        Assert.That(okResult.Value?.ToString(), Does.Contain("registered successfully"));
    }

    [Test]
    public async Task Register_WhenServiceThrowsArgumentException_ShouldReturnBadRequest() {
        // Arrange
        var registerDto = new RegisterDto {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password"
        };
        var errorMessage = "Username is already taken.";
        _mockAuthService.Setup(s => s.RegisterAsync(registerDto)).ThrowsAsync(new ArgumentException(errorMessage));

        // Act
        var result = await _controller.Register(registerDto);

        // Assert
        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        var badRequestResult = (BadRequestObjectResult)result;
        Assert.That(badRequestResult.Value?.ToString(), Does.Contain(errorMessage));
    }

    [Test]
    public async Task Login_WhenServiceSucceeds_ShouldReturnOkWithToken() {
        // Arrange
        var loginDto = new LoginDto {
            Email = "test@example.com",
            Password = "password"
        };
        var expectedToken = "a.valid.jwt";
        _mockAuthService.Setup(s => s.LoginAsync(loginDto)).ReturnsAsync(expectedToken);

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var okResult = (OkObjectResult)result;

        var returnedObject = okResult.Value;
        var tokenProperty = returnedObject?.GetType().GetProperty("token");
        Assert.That(tokenProperty, Is.Not.Null, "Response object should have a 'token' property.");
        Assert.That(tokenProperty?.GetValue(returnedObject, null), Is.EqualTo(expectedToken));
    }

    [Test]
    public async Task Login_WhenServiceThrowsArgumentException_ShouldReturnUnauthorized() {
        // Arrange
        var loginDto = new LoginDto {
            Email = "test@example.com",
            Password = "password"
        };
        var errorMessage = "Invalid email or password.";
        _mockAuthService.Setup(s => s.LoginAsync(loginDto)).ThrowsAsync(new ArgumentException(errorMessage));

        // Act
        var result = await _controller.Login(loginDto);

        // Assert
        Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
        var unauthorizedResult = (UnauthorizedObjectResult)result;
        Assert.That(unauthorizedResult.Value?.ToString(), Does.Contain(errorMessage));
    }
}