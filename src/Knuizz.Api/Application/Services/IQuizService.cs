using Knuizz.Api.Application.DTOs.Quiz;
using Knuizz.Api.Domain.Entities;

namespace Knuizz.Api.Application.Services;

public interface IQuizService {
    Task<List<Question>> GetQuestionsFromSourceAsync(string source, int count);
    Task<MatchResultResponseDto> SubmitMatchResultAsync(Guid userId, SubmitMatchResultDto resultDto);
    Task<QuizDetailDto?> GetUserQuizByIdAsync(Guid quizId);
    Task<Guid> CreateUserQuizAsync(CreateQuizDto quizDto, Guid authorId);
    Task<bool> UpdateUserQuizAsync(Guid quizId, CreateQuizDto quizDto, Guid userId);
    Task<bool> DeleteUserQuizAsync(Guid quizId, Guid userId);
    Task<List<QuizSummaryDto>> GetQuizzesByAuthorAsync(Guid authorId);
    Task<List<QuizSummaryDto>> SearchQuizzesByTitleAsync(string titleQuery);
    Task<bool> UpdatePublicationStatusAsync(Guid quizId, Guid userId, bool isPublished);
}