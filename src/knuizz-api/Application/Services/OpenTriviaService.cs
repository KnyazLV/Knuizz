using System.Text;
using System.Web;
using knuizz_api.Application.DTOs.Trivia;
using knuizz_api.Domain.Entities;

namespace knuizz_api.Application.Services;

public class OpenTriviaService {
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<OpenTriviaService> _logger;

    public OpenTriviaService(IHttpClientFactory httpClientFactory, ILogger<OpenTriviaService> logger) {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    public async Task<List<Question>> GetQuestionsAsync(int amount) {
        if (amount > 50) amount = 50; // API limit

        var httpClient = _httpClientFactory.CreateClient("OpenTriviaClient");

        // We use 'base64' encoding to handle special characters correctly.
        var requestUrl = $"api.php?amount={amount}&encode=base64";

        try {
            var response = await httpClient.GetFromJsonAsync<OpenTriviaResponseDto>(requestUrl);

            if (response == null || response.ResponseCode != 0) {
                _logger.LogError("Open Trivia API returned an error. Code: {ResponseCode}", response?.ResponseCode);
                throw new HttpRequestException($"Failed to get questions from Open Trivia API. Response code: {response?.ResponseCode}");
            }

            return response.Results.Select(MapToEntity).ToList();
        }
        catch (Exception ex) {
            _logger.LogError(ex, "An error occurred while fetching questions from Open Trivia API.");
            throw; // Re-throw the exception to be handled by a global error handler.
        }
    }

    private Question MapToEntity(OpenTriviaQuestionDto dto) {
        // The API returns Base64 encoded strings, we need to decode them.
        var questionText = DecodeBase64(dto.Question);
        var correctAnswer = DecodeBase64(dto.CorrectAnswer);
        var incorrectAnswers = dto.IncorrectAnswers.Select(DecodeBase64).ToList();

        // Combine correct and incorrect answers and shuffle them.
        var allAnswers = incorrectAnswers.Append(correctAnswer).OrderBy(a => Guid.NewGuid()).ToList();
        var correctIndex = allAnswers.IndexOf(correctAnswer);

        return new Question {
            Id = Guid.NewGuid(), // These questions are not stored, so ID is temporary.
            QuestionText = questionText,
            Options = allAnswers.ToArray(),
            CorrectAnswerIndex = correctIndex,
            SourceName = "trivia_api" // Identifier for this source.
        };
    }

    private string DecodeBase64(string base64Encoded) {
        var base64EncodedBytes = Convert.FromBase64String(base64Encoded);
        var decodedString = Encoding.UTF8.GetString(base64EncodedBytes);
        // The API also HTML-encodes some characters, so we decode them too.
        return HttpUtility.HtmlDecode(decodedString);
    }
}