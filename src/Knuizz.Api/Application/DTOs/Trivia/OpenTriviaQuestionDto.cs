using System.Text.Json.Serialization;

namespace Knuizz.Api.Application.DTOs.Trivia;

public class OpenTriviaQuestionDto {
    [JsonPropertyName("type")]
    public required string Type { get; set; }

    [JsonPropertyName("difficulty")]
    public required string Difficulty { get; set; }

    [JsonPropertyName("category")]
    public required string Category { get; set; }

    [JsonPropertyName("question")]
    public required string Question { get; set; }

    [JsonPropertyName("correct_answer")]
    public required string CorrectAnswer { get; set; }

    [JsonPropertyName("incorrect_answers")]
    public required List<string> IncorrectAnswers { get; set; }
}