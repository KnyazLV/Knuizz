using Knuizz.Api.Application.DTOs.User;
using Knuizz.Api.Application.Exceptions;
using Knuizz.Api.Domain.Entities;
using Knuizz.Api.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Knuizz.Api.Application.Services;

public class UserService : IUserService {
    private readonly KnuizzDbContext _context;

    public UserService(KnuizzDbContext context) {
        _context = context;
    }

    public async Task<UserProfileDto> GetUserProfileAsync(Guid userId) {
        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserProfileDto { Id = u.Id, Username = u.Username, Email = u.Email })
            .FirstOrDefaultAsync();

        if (user == null)
            throw new EntityNotFoundException($"User with ID {userId} not found.");

        return user;
    }

    public async Task<bool> UpdateUserProfileAsync(Guid userId, UpdateProfileDto profileDto) {
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return false;

        if (await _context.Users.AnyAsync(u => u.Username == profileDto.Username && u.Id != userId))
            throw new ArgumentException("Username is already taken.");

        user.Username = profileDto.Username;
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserStatistics?> GetUserStatisticsAsync(Guid userId) {
        return await _context.UserStatistics.FindAsync(userId);
    }

    public async Task<List<LeaderboardEntryDto>> GetLeaderboardAsync(int count) {
        if (count > DomainConstants.Leaderboard.MaxTopPlayersLimit) count = DomainConstants.Leaderboard.MaxTopPlayersLimit;

        var leaderboardEntries = await _context.UserStatistics
            .OrderByDescending(s => s.Rating)
            .ThenBy(s => s.User.Username)
            .Take(count)
            .Select(s => new LeaderboardEntryDto {
                UserId = s.UserId,
                Username = s.User.Username,
                Rating = s.Rating,
                Level = s.Level
            })
            .AsNoTracking()
            .ToListAsync();

        return leaderboardEntries;
    }


    public async Task<int> GetUserRankAsync(Guid userId) {
        var currentUserStats = await _context.UserStatistics
            .Where(s => s.UserId == userId)
            .Select(s => new { s.Rating, s.User.Username })
            .FirstOrDefaultAsync();

        if (currentUserStats == null) return 0;

        var playersWithHigherRating = await _context.UserStatistics
            .CountAsync(s => s.Rating > currentUserStats.Rating);

        var playersWithSameRatingAndBetterName = await _context.UserStatistics
            .CountAsync(s => s.Rating == currentUserStats.Rating &&
                             s.User.Username.CompareTo(currentUserStats.Username) < 0);
        var rank = playersWithHigherRating + playersWithSameRatingAndBetterName + 1;

        return rank;
    }

    public async Task<IEnumerable<MatchHistoryDto>> GetUserMatchHistoryAsync(Guid userId, int count = 5) {
        var history = await _context.MatchHistories
            .Where(m => m.UserId == userId && m.UserQuizId == null)
            .OrderByDescending(m => m.CompletedAt)
            .Take(count)
            .Select(m => new MatchHistoryDto {
                Id = m.Id,
                Score = m.Score,
                TotalQuestions = m.TotalQuestions,
                RatingChange = m.RatingChange,
                DurationSeconds = m.DurationSeconds,
                CompletedAt = m.CompletedAt,
                SourceName = m.SourceName
            })
            .AsNoTracking()
            .ToListAsync();

        return history;
    }
}