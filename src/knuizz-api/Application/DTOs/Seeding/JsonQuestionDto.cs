using System.Text.Json.Serialization;

namespace knuizz_api.Application.DTOs.Seeding;

public class JsonQuestionDto {
    [JsonPropertyName("question")]
    public string Question { get; set; }

    [JsonPropertyName("A")]
    public string A { get; set; }

    [JsonPropertyName("B")]
    public string B { get; set; }

    [JsonPropertyName("C")]
    public string C { get; set; }

    [JsonPropertyName("D")]
    public string D { get; set; }

    [JsonPropertyName("answer")]
    public string Answer { get; set; }
}