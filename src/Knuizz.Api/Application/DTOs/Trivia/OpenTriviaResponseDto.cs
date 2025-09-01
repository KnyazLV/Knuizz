using System.Text.Json.Serialization;

namespace Knuizz.Api.Application.DTOs.Trivia;

public class OpenTriviaResponseDto {
    [JsonPropertyName("response_code")]
    public int ResponseCode { get; set; }

    [JsonPropertyName("results")]
    public required List<OpenTriviaQuestionDto> Results { get; set; }
}