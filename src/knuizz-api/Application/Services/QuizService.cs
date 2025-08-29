using knuizz_api.Domain.Entities;
using knuizz_api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace knuizz_api.Application.Services;

// This service acts as a facade, orchestrating calls to different data sources.
public class QuizService : IQuizService {
    private readonly KnuizzDbContext _context;
    private readonly OpenTriviaService _triviaService;
    private readonly ILogger<QuizService> _logger;

    public QuizService(
        KnuizzDbContext context,
        OpenTriviaService triviaService,
        ILogger<QuizService> logger) {
        _context = context;
        _triviaService = triviaService;
        _logger = logger;
    }

    public async Task<List<Question>> GetQuestionsFromSourceAsync(string source, int count) {
        _logger.LogInformation("Attempting to get {Count} questions from source: {Source}", count, source);
        
        return source.ToLowerInvariant() switch {
            "trivia_api" => await _triviaService.GetQuestionsAsync(count),
            "wwtbm_ru" or "wwtbm_en" => await _context.Questions
                .Where(q => q.SourceName == source)
                .OrderBy(q => EF.Functions.Random())
                .Take(count)
                .ToListAsync(),
            _ => throw new ArgumentException($"The source '{source}' is not supported.")
        };
    }
    // Implementation of user quiz CRUD methods will go here later.
}