using System.Collections.Concurrent;
using Knuizz.Api.Domain.Entities;

namespace Knuizz.Api.Application.Services;

public class TriviaQuestionBuffer : IHostedService, IDisposable, ITriviaQuestionBuffer {
    // Constants
    private const int MaxBufferedQuestions = 200;
    private const int FetchAmount = 50;
    private const int FetchIntervalSeconds = 5;

    private readonly SemaphoreSlim _fetchSemaphore = new(1, 1);
    private readonly ILogger<TriviaQuestionBuffer> _logger;
    private readonly SemaphoreSlim _questionAvailable = new(0, MaxBufferedQuestions);
    private readonly ConcurrentQueue<Question> _questionQueue = new();

    private readonly IServiceProvider _serviceProvider;
    private readonly HashSet<string> _uniqueQuestionTexts = [];
    private Timer? _timer;

    public TriviaQuestionBuffer(IServiceProvider serviceProvider, ILogger<TriviaQuestionBuffer> logger) {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public void Dispose() {
        _timer?.Dispose();
        _questionAvailable?.Dispose();
        _fetchSemaphore?.Dispose();
    }

    public Task StartAsync(CancellationToken cancellationToken) {
        _timer = new Timer(DoWork, null, TimeSpan.Zero, TimeSpan.FromSeconds(FetchIntervalSeconds));
        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) {
        _timer?.Change(Timeout.Infinite, 0);
        return Task.CompletedTask;
    }

    public async Task<List<Question>> GetQuestionsAsync(int count, CancellationToken cancellationToken = default) {
        var questions = new List<Question>(count);
        for (var i = 0; i < count; i++) {
            try {
                if (!await _questionAvailable.WaitAsync(TimeSpan.FromSeconds(10), cancellationToken)) break;
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

    private async void DoWork(object? state) {
        if (!await _fetchSemaphore.WaitAsync(0)) return;

        try {
            if (_questionQueue.Count >= MaxBufferedQuestions) return;

            await FetchAndBufferQuestionsAsync();
        }
        finally {
            _fetchSemaphore.Release();
        }
    }

    private async Task FetchAndBufferQuestionsAsync() {
        try {
            _logger.LogInformation("Buffer has {Count}/{Max} questions. Fetching new batch.", _questionQueue.Count, MaxBufferedQuestions);

            await using var scope = _serviceProvider.CreateAsyncScope();
            var triviaService = scope.ServiceProvider.GetRequiredService<OpenTriviaService>();
            var newQuestions = await triviaService.GetQuestionsAsync(FetchAmount);

            if (!newQuestions.Any()) return;

            var questionsAddedCount = 0;

            lock (_uniqueQuestionTexts) {
                var spaceAvailable = MaxBufferedQuestions - _questionQueue.Count;
                if (spaceAvailable <= 0) return;

                var added = 0;
                foreach (var question in newQuestions) {
                    if (added >= spaceAvailable) break;

                    if (_uniqueQuestionTexts.Add(question.QuestionText)) {
                        _questionQueue.Enqueue(question);
                        added++;
                    }
                }

                questionsAddedCount = added;
            }

            if (questionsAddedCount > 0) {
                _logger.LogInformation("{Count} new UNIQUE questions added.", questionsAddedCount);
                _questionAvailable.Release(questionsAddedCount);
            }
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Failed to fetch and buffer questions.");
        }
    }
}