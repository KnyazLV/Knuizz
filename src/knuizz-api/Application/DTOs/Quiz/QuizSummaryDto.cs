namespace knuizz_api.Application.DTOs.Quiz;

public class QuizSummaryDto {
    public Guid Id { get; set; }
    public string Title { get; set; }
    public string? Description { get; set; }
    public string AuthorName { get; set; }
    public int QuestionCount { get; set; }
    public DateTime CreatedAt { get; set; }
}