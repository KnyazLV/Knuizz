using System.ComponentModel.DataAnnotations;

namespace Knuizz.Api.Application.DTOs.Quiz;

public class QuestionDto {
    public Guid? Id { get; set; }

    [Required]
    public required string QuestionText { get; set; }

    [Required]
    [MinLength(4, ErrorMessage = "A question must have exactly 4 options.")]
    [MaxLength(4, ErrorMessage = "A question must have exactly 4 options.")]
    public required string[] Options { get; set; }

    [Required]
    [Range(0, 3)]
    public required int CorrectAnswerIndex { get; set; }
}