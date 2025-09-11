using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Application.Services;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Logging;
using Moq;

namespace Knuizz.Api.Tests.Services;

[TestFixture]
public class QuizServiceTests {
    [SetUp]
    public void Setup() {
        _options = new DbContextOptionsBuilder<KnuizzDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
            .Options;

        _context = new KnuizzDbContext(_options);

        var mockHttpClientFactory = new Mock<IHttpClientFactory>();
        var mockTriviaLogger = new Mock<ILogger<OpenTriviaService>>();

        _mockTriviaService = new Mock<OpenTriviaService>(mockHttpClientFactory.Object, mockTriviaLogger.Object);

        _mockServiceProvider = new Mock<IServiceProvider>();
        _mockTriviaBuffer = new Mock<ITriviaQuestionBuffer>();

        var mockLogger = new Mock<ILogger<QuizService>>();

        _quizService = new QuizService(
            _context,
            _mockTriviaBuffer.Object,
            mockLogger.Object,
            _mockServiceProvider.Object
        );
    }

    [TearDown]
    public void Teardown() {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }

    private KnuizzDbContext _context;
    private QuizService _quizService;
    private DbContextOptions<KnuizzDbContext> _options;
    private Mock<OpenTriviaService> _mockTriviaService;
    private Mock<ITriviaQuestionBuffer> _mockTriviaBuffer;
    private Mock<IServiceProvider> _mockServiceProvider;

    //#region SubmitMatchResult

    [Test]
    public async Task SubmitMatchResultAsync_OfficialSource_UpdatesUserStatistics() {
        // Arrange
        var userId = Guid.NewGuid();
        var userStats = new UserStatistics {
            UserId = userId,
            Level = 1,
            Rating = 1000,
            CurrentExperience = 0,
            TotalGamesPlayed = 0,
            TotalCorrectAnswers = 0,
            TotalAnswers = 0
        };

        await _context.UserStatistics.AddAsync(userStats);
        await _context.SaveChangesAsync();

        var resultDto = new SubmitMatchResultDto {
            Score = 8,
            TotalQuestions = 10,
            DurationSeconds = 120,
            SourceName = "trivia_api"
        };

        // Act
        await _quizService.SubmitMatchResultAsync(userId, resultDto);

        // Assert
        var updatedStats = await _context.UserStatistics.FindAsync(userId);

        Assert.That(updatedStats, Is.Not.Null);
        Assert.That(updatedStats!.TotalGamesPlayed, Is.EqualTo(1));
        Assert.That(updatedStats.TotalCorrectAnswers, Is.EqualTo(8));
        Assert.That(updatedStats.TotalAnswers, Is.EqualTo(10));
        Assert.That(updatedStats.CurrentExperience, Is.EqualTo(8));

        var matchHistory = await _context.MatchHistories.FirstOrDefaultAsync(m => m.UserId == userId);
        Assert.That(matchHistory, Is.Not.Null);
        Assert.That(matchHistory!.Score, Is.EqualTo(8));
    }

    [Test]
    public async Task SubmitMatchResultAsync_UserQuizSource_DoesNotUpdateStatistics() {
        // Arrange
        var userId = Guid.NewGuid();
        var resultDto = new SubmitMatchResultDto {
            Score = 5,
            TotalQuestions = 10,
            DurationSeconds = 120,
            SourceName = "user_quiz",
            UserQuizId = Guid.NewGuid()
        };

        // Act
        await _quizService.SubmitMatchResultAsync(userId, resultDto);

        // Assert
        var userStats = await _context.UserStatistics.FindAsync(userId);
        Assert.That(userStats, Is.Null);

        var matchHistory = await _context.MatchHistories.FirstOrDefaultAsync(m => m.UserId == userId);
        Assert.That(matchHistory, Is.Not.Null);
    }

    [Test]
    public async Task SubmitMatchResultAsync_OfficialSource_CorrectlyCalculatesLevelUp() {
        // --- Arrange ---
        var userId = Guid.NewGuid();
        var initialStats = new UserStatistics {
            UserId = userId,
            Level = 1,
            Rating = 1000,
            CurrentExperience = 45,
            TotalGamesPlayed = 10,
            TotalCorrectAnswers = 100,
            TotalAnswers = 200
        };

        await _context.UserStatistics.AddAsync(initialStats);
        await _context.SaveChangesAsync();

        var resultDto = new SubmitMatchResultDto {
            Score = 10,
            TotalQuestions = 15,
            DurationSeconds = 120,
            SourceName = "trivia_api"
        };

        // --- Act ---
        await _quizService.SubmitMatchResultAsync(userId, resultDto);

        // --- Assert ---
        var updatedStats = await _context.UserStatistics.FindAsync(userId);

        Assert.That(updatedStats, Is.Not.Null);
        Assert.That(updatedStats!.Level, Is.EqualTo(2));
        // (45 + 10 = 55; 55 - 50 = 5)
        Assert.That(updatedStats.CurrentExperience, Is.EqualTo(5));
    }

    //#endregion

    //#region UserQuiz

    [Test]
    public async Task GetQuestionsFromSourceAsync_WhenSourceIsTriviaApi_ShouldReturnQuestionsFromBuffer() {
        // Arrange
        var expectedQuestions = new List<Question> {
            new() { QuestionText = "Question 1" },
            new() { QuestionText = "Question 2" }
        };
        var requestedCount = 2;
        
        _mockTriviaBuffer.Setup(b => b.GetQuestionsAsync(requestedCount, It.IsAny<CancellationToken>()))
            .ReturnsAsync(expectedQuestions);

        // Act
        var result = await _quizService.GetQuestionsFromSourceAsync("trivia_api", requestedCount);

        // Assert
        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(expectedQuestions.Count));
        Assert.That(result, Is.EqualTo(expectedQuestions));
        _mockTriviaBuffer.Verify(b => b.GetQuestionsAsync(requestedCount, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public void GetQuestionsFromSourceAsync_WhenSourceIsUnsupported_ShouldThrowArgumentException() {
        // Arrange
        var unsupportedSource = "my_own_source";

        // Act & Assert
        Assert.ThrowsAsync<ArgumentException>(async () => await _quizService.GetQuestionsFromSourceAsync(unsupportedSource, 10)
        );
    }

    [Test]
    public async Task UpdateUserQuizAsync_WhenUserIsAuthor_ShouldUpdateQuizProperties() {
        // Arrange
        var authorId = Guid.NewGuid();
        var quizId = Guid.NewGuid();
        var initialQuiz = new UserQuiz {
            Id = quizId,
            AuthorId = authorId,
            Title = "Old Title",
            Description = "Old Description",
            Questions = new List<Question> { new() { QuestionText = "Old question", Options = [], CorrectAnswerIndex = 0 } }
        };
        await _context.UserQuizzes.AddAsync(initialQuiz);
        await _context.SaveChangesAsync();

        var updateDto = new CreateQuizDto {
            Title = "New Title",
            Description = "New Description",
            Questions = [
                new QuestionDto { QuestionText = "New question 1", Options = ["A", "B", "C", "D"], CorrectAnswerIndex = 0 },
                new QuestionDto { QuestionText = "New question 2", Options = ["A", "B", "C", "D"], CorrectAnswerIndex = 1 }
            ]
        };

        // Act
        var result = await _quizService.UpdateUserQuizAsync(quizId, updateDto, authorId);

        // Assert
        Assert.That(result, Is.True);
        var updatedQuiz = await _context.UserQuizzes.Include(q => q.Questions).FirstOrDefaultAsync(q => q.Id == quizId);
        Assert.That(updatedQuiz, Is.Not.Null);
        Assert.That(updatedQuiz!.Title, Is.EqualTo("New Title"));
        Assert.That(updatedQuiz.Questions.Count, Is.EqualTo(2));
        Assert.That(updatedQuiz.Questions.First().QuestionText, Is.EqualTo("New question 1"));
    }

    [Test]
    public async Task UpdateUserQuizAsync_WhenQuizNotFound_ShouldReturnFalse() {
        // Arrange
        var nonExistentQuizId = Guid.NewGuid();
        var updateDto = new CreateQuizDto { Title = "Test", Questions = new List<QuestionDto>() };

        // Act
        var result = await _quizService.UpdateUserQuizAsync(nonExistentQuizId, updateDto, Guid.NewGuid());

        // Assert
        Assert.That(result, Is.False);
    }

    [Test]
    public async Task UpdateUserQuizAsync_WhenUserIsNotAuthor_ShouldThrowUnauthorizedAccessException() {
        // Arrange
        var authorId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var quiz = new UserQuiz { Id = Guid.NewGuid(), AuthorId = authorId, Title = "Test" };
        await _context.UserQuizzes.AddAsync(quiz);
        await _context.SaveChangesAsync();
        var updateDto = new CreateQuizDto { Title = "New Title", Questions = new List<QuestionDto>() };

        // Act & Assert
        Assert.ThrowsAsync<UnauthorizedAccessException>(async () => await _quizService.UpdateUserQuizAsync(quiz.Id, updateDto, otherUserId)
        );
    }

    [Test]
    public void CreateUserQuizAsync_WhenQuestionCountExceedsLimit_ShouldThrowArgumentException() {
        // Arrange
        var authorId = Guid.NewGuid();
        var questions = new List<QuestionDto>();
        for (var i = 0; i < 31; i++)
            questions.Add(new QuestionDto {
                QuestionText = $"Question {i + 1}",
                Options = ["A", "B", "C", "D"],
                CorrectAnswerIndex = 0
            });

        var quizDto = new CreateQuizDto {
            Title = "Too big quiz",
            Questions = questions
        };

        // Act & Assert
        Assert.ThrowsAsync<ArgumentException>(
            async () => await _quizService.CreateUserQuizAsync(quizDto, authorId),
            "A quiz cannot have more than 30 questions."
        );
    }

    [Test]
    public async Task GetAndSearchQuizzes_ShouldReturnCorrectFilteredLists() {
        // --- Arrange ---
        var author1 = new User {
            Id = Guid.NewGuid(),
            Username = "Author One",
            Email = "author1@example.com",
            PasswordHash = "some_hash"
        };
        var author2 = new User {
            Id = Guid.NewGuid(),
            Username = "Author Two",
            Email = "author2@example.com",
            PasswordHash = "some_other_hash"
        };
        await _context.Users.AddRangeAsync(author1, author2);
        await _context.UserQuizzes.AddRangeAsync(
            new UserQuiz {
                Author = author1,
                AuthorId = author1.Id,
                Title = "C# Quiz",
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new UserQuiz {
                Author = author1,
                AuthorId = author1.Id,
                Title = "SQL Quiz",
                CreatedAt = DateTime.UtcNow
            },
            new UserQuiz {
                Author = author2,
                AuthorId = author2.Id,
                Title = "React Quiz"
            }
        );
        await _context.SaveChangesAsync();

        // --- Act & Assert for GetQuizzesByAuthorAsync ---
        var author1Quizzes = await _quizService.GetQuizzesByAuthorAsync(author1.Id);
        Assert.That(author1Quizzes.Count, Is.EqualTo(2));
        Assert.That(author1Quizzes.First().Title, Is.EqualTo("SQL Quiz"));

        var nonExistentAuthorQuizzes = await _quizService.GetQuizzesByAuthorAsync(Guid.NewGuid());
        Assert.That(nonExistentAuthorQuizzes, Is.Empty);

        // --- Act & Assert for SearchQuizzesByTitleAsync ---
        var searchResult = await _quizService.SearchQuizzesByTitleAsync("C#");
        Assert.That(searchResult.Count, Is.EqualTo(1));
        Assert.That(searchResult.First().Title, Is.EqualTo("C# Quiz"));
        Assert.That(searchResult.First().AuthorName, Is.EqualTo("Author One"));

        // Verify searching for something that doesn't exist
        var emptySearchResult = await _quizService.SearchQuizzesByTitleAsync("JavaScript");
        Assert.That(emptySearchResult, Is.Empty);
    }


    [Test]
    public async Task DeleteUserQuizAsync_WhenQuizExistsAndUserIsAuthor_ShouldSucceed() {
        // --- Arrange ---
        var quizId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var quiz = new UserQuiz { Id = quizId, AuthorId = authorId, Title = "Test Quiz" };

        await _context.UserQuizzes.AddAsync(quiz);
        await _context.SaveChangesAsync();

        // --- Act ---
        var result = await _quizService.DeleteUserQuizAsync(quizId, authorId);

        // --- Assert ---
        Assert.That(result, Is.True);

        var deletedQuizInDb = await _context.UserQuizzes.FindAsync(quizId);
        Assert.That(deletedQuizInDb, Is.Null);
    }

    //#endregion
}