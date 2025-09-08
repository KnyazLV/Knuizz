using Knuizz.Api.Domain.Entities;

namespace Knuizz.Api.Application.Services;

public interface ITriviaQuestionBuffer {
    Task<List<Question>> GetQuestionsAsync(int count, CancellationToken cancellationToken = default);
}