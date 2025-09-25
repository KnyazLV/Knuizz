using System.Text;
using System.Web;
using Knuizz.Api.Application.DTOs.Trivia;
using Knuizz.Api.Domain.Entities;

namespace Knuizz.Api.Application.Services;

public class OpenTriviaService {
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<OpenTriviaService> _logger;

    public OpenTriviaService(IHttpClientFactory httpClientFactory, ILogger<OpenTriviaService> logger) {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<List<Question>> GetQuestionsAsync(int amount, CancellationToken cancellationToken = default) {
        if (amount > DomainConstants.Quiz.OpenTriviaAPIQuestionLimit) amount = DomainConstants.Quiz.OpenTriviaAPIQuestionLimit; // API limit

        var httpClient = _httpClientFactory.CreateClient("OpenTriviaClient");
        var requestUrl = $"api.php?amount={amount}&encode=base64";

        try {
            var response = await httpClient.GetFromJsonAsync<OpenTriviaResponseDto>(requestUrl, cancellationToken);

            if (response == null || response.ResponseCode != 0) {
                if (response?.ResponseCode == 4) {
                    _logger.LogWarning(
                        "Open Trivia API returned code 4: Token has returned all possible questions for the specified query.");
                    return new List<Question>();
                }

                _logger.LogError("Open Trivia API returned an error. Code: {ResponseCode}", response?.ResponseCode);
                throw new HttpRequestException($"Failed to get questions from Open Trivia API. Response code: {response?.ResponseCode}");
            }

            return response.Results.Select(MapToEntity).ToList();
        }
        catch (Exception ex) {
            _logger.LogError(ex, "An error occurred while fetching questions from Open Trivia API.");
            throw;
        }
    }

    private Question MapToEntity(OpenTriviaQuestionDto dto) {
        var questionText = DecodeBase64(dto.Question);
        var correctAnswer = DecodeBase64(dto.CorrectAnswer);
        var incorrectAnswers = dto.IncorrectAnswers.Select(DecodeBase64).ToList();

        var allAnswers = incorrectAnswers.Append(correctAnswer).OrderBy(a => Guid.NewGuid()).ToList();
        var correctIndex = allAnswers.IndexOf(correctAnswer);

        return new Question {
            Id = Guid.NewGuid(),
            QuestionText = questionText,
            Options = allAnswers.ToArray(),
            CorrectAnswerIndex = correctIndex,
            SourceName = "trivia_api"
        };
    }

    private string DecodeBase64(string base64Encoded) {
        var base64EncodedBytes = Convert.FromBase64String(base64Encoded);
        var decodedString = Encoding.UTF8.GetString(base64EncodedBytes);
        return HttpUtility.HtmlDecode(decodedString);
    }
}