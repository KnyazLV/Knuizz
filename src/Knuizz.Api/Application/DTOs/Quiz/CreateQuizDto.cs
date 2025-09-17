using System.ComponentModel.DataAnnotations;

namespace Knuizz.Api.Application.DTOs.Quiz;

public class CreateQuizDto {
    [Required]
    [StringLength(255, MinimumLength = 3)]
    public required string Title { get; set; }

    public string? Description { get; set; }
    public bool IsPublished { get; set; } 

    [Required]
    [MinLength(1)] // Quiz must have at least one question
    public required List<QuestionDto> Questions { get; set; }
}