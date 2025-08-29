using System.Text.Json.Serialization;

namespace knuizz_api.Application.DTOs.Trivia;

public class OpenTriviaResponseDto {
    [JsonPropertyName("response_code")]
    public int ResponseCode { get; set; }

    [JsonPropertyName("results")]
    public List<OpenTriviaQuestionDto> Results { get; set; }
}