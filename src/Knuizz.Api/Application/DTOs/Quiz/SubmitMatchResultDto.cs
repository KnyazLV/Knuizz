using System.ComponentModel.DataAnnotations;

namespace Knuizz.Api.Application.DTOs.Quiz;

public class SubmitMatchResultDto {
    [Required]
    public int Score { get; set; }

    [Required]
    [Range(1, 50)]
    public int TotalQuestions { get; set; }

    [Required]
    [Range(1, 3600)] // Duration from 1 second to 1 hour
    public int DurationSeconds { get; set; }

    [Required]
    public required string SourceName { get; set; }

    // This will be null if the quiz is from a public source like "trivia_api"
    public Guid? UserQuizId { get; set; }
}