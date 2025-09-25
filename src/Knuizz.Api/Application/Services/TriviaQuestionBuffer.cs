using System.Collections.Concurrent;
using Knuizz.Api.Domain.Entities;

namespace Knuizz.Api.Application.Services;

public class TriviaQuestionBuffer : BackgroundService, IDisposable, ITriviaQuestionBuffer {
    // Constants
    private const int MaxBufferedQuestions = 200;
    private const int FetchAmount = 50;
    private static readonly TimeSpan FetchInterval = TimeSpan.FromSeconds(5);

    private readonly ILogger<TriviaQuestionBuffer> _logger;
    private readonly SemaphoreSlim _questionAvailable = new(0, MaxBufferedQuestions);
    private readonly ConcurrentQueue<Question> _questionQueue = new();
    private readonly IServiceProvider _serviceProvider;
    private readonly HashSet<string> _uniqueQuestionTexts = [];

    public TriviaQuestionBuffer(IServiceProvider serviceProvider, ILogger<TriviaQuestionBuffer> logger) {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public override void Dispose() {
        _questionAvailable?.Dispose();
        base.Dispose();
    }

    public async Task<List<Question>> GetQuestionsAsync(int count, CancellationToken cancellationToken = default) {
        var questions = new List<Question>(count);
        for (var i = 0; i < count; i++) {
            try {
                using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, CancellationToken.None);
                if (!await _questionAvailable.WaitAsync(TimeSpan.FromSeconds(10), linkedCts.Token)) break;
            }
            catch (OperationCanceledException) {
                break;
            }

            if (_questionQueue.TryDequeue(out var question)) {
                lock (_uniqueQuestionTexts) {
                    _uniqueQuestionTexts.Remove(question.QuestionText);
                }

                questions.Add(question);
            } else {
                break;
            }
        }

        return questions;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken) {
        await FetchAndBufferQuestionsAsync(stoppingToken);

        while (!stoppingToken.IsCancellationRequested) {
            await Task.Delay(FetchInterval, stoppingToken);
            await FetchAndBufferQuestionsAsync(stoppingToken);
        }
    }

    private async Task FetchAndBufferQuestionsAsync(CancellationToken stoppingToken) {
        if (_questionQueue.Count >= MaxBufferedQuestions) return;

        try {
            _logger.LogInformation("Buffer has {Count}/{Max} questions. Fetching new batch.", _questionQueue.Count, MaxBufferedQuestions);

            await using var scope = _serviceProvider.CreateAsyncScope();
            var triviaService = scope.ServiceProvider.GetRequiredService<OpenTriviaService>();

            var newQuestions = await triviaService.GetQuestionsAsync(FetchAmount, stoppingToken);

            if (!newQuestions.Any()) return;

            var questionsAddedCount = 0;
            lock (_uniqueQuestionTexts) {
                var spaceAvailable = MaxBufferedQuestions - _questionQueue.Count;
                if (spaceAvailable <= 0) return;

                var added = newQuestions.Where(q => _uniqueQuestionTexts.Add(q.QuestionText))
                    .Take(spaceAvailable)
                    .ToList();

                foreach (var question in added) _questionQueue.Enqueue(question);
                questionsAddedCount = added.Count;
            }

            if (questionsAddedCount > 0) {
                _logger.LogInformation("{Count} new UNIQUE questions added.", questionsAddedCount);
                _questionAvailable.Release(questionsAddedCount);
            }
        }
        catch (OperationCanceledException) {
            _logger.LogInformation("TriviaQuestionBuffer is stopping.");
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Failed to fetch and buffer questions.");
        }
    }
}