using System.Text.Json.Serialization;

namespace Knuizz.Api.Application.DTOs.Seeding;

public class JsonQuestionDto {
    [JsonPropertyName("question")]
    public required string Question { get; set; }

    [JsonPropertyName("A")]
    public required string A { get; set; }

    [JsonPropertyName("B")]
    public required string B { get; set; }

    [JsonPropertyName("C")]
    public required string C { get; set; }

    [JsonPropertyName("D")]
    public required string D { get; set; }

    [JsonPropertyName("answer")]
    public required string Answer { get; set; }
}