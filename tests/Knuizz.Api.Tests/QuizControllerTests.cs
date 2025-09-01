using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Controllers;
using Microsoft.AspNetCore.Mvc;
using Moq;

namespace Knuizz.Api.Tests;

[TestFixture]
public class QuizControllerTests {
    [SetUp]
    public void Setup() {
        _quizServiceMock = new Mock<IQuizService>();
        _quizController = new QuizController(_quizServiceMock.Object);
    }

    private Mock<IQuizService> _quizServiceMock;
    private QuizController _quizController;

    [Test]
    public async Task GetUserQuiz_WhenQuizExists_ReturnsOkResultWithQuiz() {
        var quizId = Guid.NewGuid();

        var expectedQuiz = new QuizDetailDto {
            Id = quizId,
            Title = "Test Quiz",
            AuthorName = "Test Author",
            Questions = new List<QuestionDto>()
        };

        _quizServiceMock.Setup(s => s.GetUserQuizByIdAsync(quizId)).ReturnsAsync(expectedQuiz);

        var result = await _quizController.GetUserQuiz(quizId);
        Assert.That(result, Is.TypeOf<OkObjectResult>());
        var okResult = (OkObjectResult)result;

        Assert.That(okResult.Value, Is.Not.Null);
        var returnedQuiz = (QuizDetailDto)okResult.Value!;

        Assert.That(returnedQuiz.Id, Is.EqualTo(expectedQuiz.Id));
    }
}