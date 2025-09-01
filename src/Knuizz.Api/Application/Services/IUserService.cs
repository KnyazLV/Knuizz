using Knuizz.Api.Application.DTOs.User;
using Knuizz.Api.Domain.Entities;

namespace Knuizz.Api.Application.Services;

public interface IUserService {
    Task<UserProfileDto> GetUserProfileAsync(Guid userId);
    Task<bool> UpdateUserProfileAsync(Guid userId, UpdateProfileDto profileDto);
    Task<UserStatistics?> GetUserStatisticsAsync(Guid userId);
    Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int count);
}