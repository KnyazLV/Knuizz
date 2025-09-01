namespace Knuizz.Api.Application.DTOs.Quiz;

public class QuizSummaryDto {
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public required string AuthorName { get; set; }
    public int QuestionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}