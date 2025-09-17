namespace Knuizz.Api.Application.DTOs.Quiz;

public class QuizDetailDto {
    public Guid Id { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public Guid AuthorId { get; set; }
    public required string AuthorName { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsPublished { get; set; }
    public required List<QuestionDto> Questions { get; set; }
}