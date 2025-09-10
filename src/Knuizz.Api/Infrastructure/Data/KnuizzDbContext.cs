using System.Text.Json;
using Knuizz.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Knuizz.Api.Infrastructure.Data;

public class KnuizzDbContext : DbContext {
    public KnuizzDbContext(DbContextOptions<KnuizzDbContext> options) : base(options) { }
    public DbSet<User> Users { get; set; }
    public DbSet<UserStatistics> UserStatistics { get; set; }
    public DbSet<UserQuiz> UserQuizzes { get; set; }
    public DbSet<Question> Questions { get; set; }
    public DbSet<MatchHistory> MatchHistories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity => {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
        });

        // UserStatistics (1-to-1 with User)
        modelBuilder.Entity<UserStatistics>(entity => {
            entity.HasKey(e => e.UserId);
            entity.HasOne(e => e.User)
                .WithOne(u => u.Statistics)
                .HasForeignKey<UserStatistics>(e => e.UserId);
        });

        // UserQuiz (Many-to-1 with User)
        modelBuilder.Entity<UserQuiz>(entity => {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(255);
            entity.HasOne(e => e.Author)
                .WithMany(u => u.Quizzes)
                .HasForeignKey(e => e.AuthorId);
        });

        // Question
        modelBuilder.Entity<Question>(entity => {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuestionText).IsRequired();
            entity.Property(e => e.SourceName).HasMaxLength(50);

            // Converting an array of strings to JSON and back
            // entity.Property(e => e.Options)
            //     .HasConversion(
            //         v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null),
            //         v => JsonSerializer.Deserialize<string[]>(v, (JsonSerializerOptions)null))
            //     .HasColumnType("jsonb");
            entity.Property(e => e.Options)
                .HasConversion(
                    v => JsonSerializer.Serialize(v ?? Array.Empty<string>(), new JsonSerializerOptions()),
                    v => JsonSerializer.Deserialize<string[]>(v, new JsonSerializerOptions()) ?? Array.Empty<string>())
                .HasColumnType("jsonb");

            entity.HasOne(e => e.UserQuiz)
                .WithMany(q => q.Questions)
                .HasForeignKey(e => e.UserQuizId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // MatchHistory
        modelBuilder.Entity<MatchHistory>(entity => {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SourceName).IsRequired().HasMaxLength(50);
            entity.HasOne(e => e.User)
                .WithMany(u => u.MatchHistories)
                .HasForeignKey(e => e.UserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.UserQuiz)
                .WithMany()
                .HasForeignKey(e => e.UserQuizId)
                .IsRequired(false);
        });
    }
}