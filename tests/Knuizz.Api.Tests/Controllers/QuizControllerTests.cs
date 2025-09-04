using System.Security.Claims;
using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Controllers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Knuizz.Api.Tests.Controllers;

[TestFixture]
public class QuizControllerTests {
    [SetUp]
    public void Setup() {
        _mockQuizService = new Mock<IQuizService>();
        _controller = new QuizController(_mockQuizService.Object);
    }

    private Mock<IQuizService> _mockQuizService;
    private QuizController _controller;

    //#endregion

    //#region GetUserQuiz

    [Test]
    public async Task GetUserQuiz_WhenQuizExists_ShouldReturnOk() {
        // Arrange
        var quizId = Guid.NewGuid();
        var quizDetail = new QuizDetailDto {
            Id = quizId,
            Title = "Test Quiz",
            AuthorName = "Author",
            Questions = []
        };
        _mockQuizService.Setup(s => s.GetUserQuizByIdAsync(quizId)).ReturnsAsync(quizDetail);

        // Act
        var result = await _controller.GetUserQuiz(quizId);

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var okResult = result as OkObjectResult;
        Assert.That(okResult?.Value, Is.EqualTo(quizDetail));
    }

    [Test]
    public async Task GetUserQuiz_WhenQuizNotFound_ShouldReturnNotFound() {
        // Arrange
        _mockQuizService.Setup(s => s.GetUserQuizByIdAsync(It.IsAny<Guid>())).ReturnsAsync(default(QuizDetailDto));

        // Act
        var result = await _controller.GetUserQuiz(Guid.NewGuid());

        // Assert
        Assert.That(result, Is.InstanceOf<NotFoundResult>());
    }

    //#endregion

    //#region CreateUserQuiz

    [Test]
    public async Task CreateUserQuiz_WithValidData_ShouldReturnCreatedAtAction() {
        // Arrange
        var userId = Guid.NewGuid();
        SetupUser(userId.ToString());

        var createDto = new CreateQuizDto { Title = "New Quiz", Questions = new List<QuestionDto>() };
        var newQuizId = Guid.NewGuid();
        _mockQuizService.Setup(s => s.CreateUserQuizAsync(createDto, userId)).ReturnsAsync(newQuizId);

        // Act
        var result = await _controller.CreateUserQuiz(createDto);

        // Assert
        Assert.That(result, Is.InstanceOf<CreatedAtActionResult>());
        var createdResult = (CreatedAtActionResult)result;
        Assert.That(createdResult.ActionName, Is.EqualTo(nameof(QuizController.GetUserQuiz)));
        Assert.That(createdResult.RouteValues, Is.Not.Null);
        Assert.That(createdResult.RouteValues?["id"], Is.EqualTo(newQuizId));
    }

    [Test]
    public async Task CreateUserQuiz_WhenQuestionCountExceedsLimit_ShouldReturnBadRequest() {
        // Arrange
        var questions = Enumerable.Range(1, 31).Select(i => new QuestionDto {
            QuestionText = $"Q{i}", Options = ["A", "B", "C", "D"], CorrectAnswerIndex = 0
        }).ToList();

        var createDto = new CreateQuizDto { Title = "Big Quiz", Questions = questions };
        SetupUser(Guid.NewGuid().ToString());

        // Act
        var result = await _controller.CreateUserQuiz(createDto);

        // Assert
        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }

    //#endregion

    //#region UpdateUserQuiz

    [Test]
    public async Task UpdateUserQuiz_WhenUpdateSucceeds_ShouldReturnNoContent() {
        // Arrange
        var userId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        SetupUser(userId.ToString());
        _mockQuizService.Setup(s => s.UpdateUserQuizAsync(quizId, It.IsAny<CreateQuizDto>(), userId)).ReturnsAsync(true);

        // Act
        var result = await _controller.UpdateUserQuiz(quizId, new CreateQuizDto {
            Title = "Updated",
            Questions = new List<QuestionDto>()
        });

        // Assert
        Assert.That(result, Is.InstanceOf<NoContentResult>());
    }

    [Test]
    public async Task UpdateUserQuiz_WhenUserIsUnauthorized_ShouldReturnForbid() {
        // Arrange
        var userId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        SetupUser(userId.ToString());

        var updateDto = new CreateQuizDto { Title = "Updated", Questions = new List<QuestionDto>() };
        _mockQuizService.Setup(s => s.UpdateUserQuizAsync(quizId, updateDto, userId))
            .ThrowsAsync(new UnauthorizedAccessException("Forbidden"));

        // Act & Assert
        var result = await _controller.UpdateUserQuiz(quizId, updateDto);
        Assert.That(result, Is.InstanceOf<ForbidResult>());
    }

    //#endregion

    //#region SearchQuizzes

    [Test]
    public async Task SearchQuizzes_WithValidQuery_ShouldReturnOk() {
        // Arrange
        var query = "C#";
        var quizList = new List<QuizSummaryDto> { new() { Title = "C# Advanced", AuthorName = "Author" } };
        _mockQuizService.Setup(s => s.SearchQuizzesByTitleAsync(query)).ReturnsAsync(quizList);

        // Act
        var result = await _controller.SearchQuizzes(query);

        // Assert
        Assert.That(result, Is.InstanceOf<OkObjectResult>());
        var okResult = result as OkObjectResult;
        Assert.That(okResult?.Value, Is.EqualTo(quizList));
    }

    [Test]
    public async Task SearchQuizzes_WithEmptyQuery_ShouldReturnBadRequest() {
        // Act
        var result = await _controller.SearchQuizzes(" ");
        // Assert
        Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
    }

    //#endregion

    //#region Helper Methods

    /// Method to simulate an authenticated user
    private void SetupUser(string userId) {
        var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, userId) };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        _controller.ControllerContext = new ControllerContext {
            HttpContext = new DefaultHttpContext { User = claimsPrincipal }
        };
    }

    //#endregion
}