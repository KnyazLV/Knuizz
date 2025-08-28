using System.Globalization;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using knuizz_api.Application.DTOs.Seeding;
using knuizz_api.Domain.Entities;
using CsvHelper;
using CsvHelper.Configuration;

namespace knuizz_api.Infrastructure.Data.Seeding;

// Class to map CSV columns to a DTO. This remains the most reliable method.
public sealed class CsvQuestionMap : ClassMap<JsonQuestionDto> {
    public CsvQuestionMap() {
        Map(m => m.Question).Name("Вопрос");
        Map(m => m.A).Name("Вариант A");
        Map(m => m.B).Name("Вариант B");
        Map(m => m.C).Name("Вариант C");
        Map(m => m.D).Name("Вариант D");
        Map(m => m.Answer).Name("Ответ");
    }
}

public class DataSeeder {
    private readonly KnuizzDbContext _context;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(KnuizzDbContext context, ILogger<DataSeeder> logger) {
        _context = context;
        _logger = logger;
    }

    public async Task SeedAsync() {
        await _context.Database.MigrateAsync();

        await SeedQuestionsFromJsonAsync("Data/wwtbm_en.json", "wwtbm_en");
        await SeedQuestionsFromCsvAsync("Data/wwtbm_ru.csv", "wwtbm_ru");
    }

    private async Task SeedQuestionsFromJsonAsync(string filePath, string sourceName) {
        if (await _context.Questions.AnyAsync(q => q.SourceName == sourceName)) {
            _logger.LogInformation("Questions from source '{SourceName}' already seeded.", sourceName);
            return;
        }

        if (!File.Exists(filePath)) {
            _logger.LogWarning("Seed file not found: {FilePath}", filePath);
            return;
        }

        _logger.LogInformation("Seeding questions from source '{SourceName}'...", sourceName);
        var json = await File.ReadAllTextAsync(filePath);
        var rawQuestions = JsonSerializer.Deserialize<List<JsonQuestionDto>>(json);
        if (rawQuestions is null || rawQuestions.Count == 0) {
            _logger.LogWarning("No questions found in file: {FilePath}", filePath);
            return;
        }

        var questionsToSeed = new List<Question>();
        foreach (var raw in rawQuestions) {
            var question = MapToEntity(raw.Question, new[] { raw.A, raw.B, raw.C, raw.D }, raw.Answer, sourceName);
            questionsToSeed.Add(question);
        }

        await _context.Questions.AddRangeAsync(questionsToSeed);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Successfully seeded {Count} questions from '{SourceName}'.", questionsToSeed.Count, sourceName);
    }

    private async Task SeedQuestionsFromCsvAsync(string filePath, string sourceName) {
        if (await _context.Questions.AnyAsync(q => q.SourceName == sourceName)) {
            _logger.LogInformation("Questions from source '{SourceName}' are already seeded.", sourceName);
            return;
        }

        if (!File.Exists(filePath)) {
            _logger.LogWarning("Seed file not found: {FilePath}", filePath);
            return;
        }

        _logger.LogInformation("Seeding questions from source '{SourceName}'...", sourceName);

        var config = new CsvConfiguration(CultureInfo.InvariantCulture) {
            HasHeaderRecord = true,
            ShouldSkipRecord = args => args.Row.Parser.Record.All(string.IsNullOrEmpty)
        };
        
        using (var reader = new StreamReader(filePath))
        using (var csv = new CsvReader(reader, config)) {
            csv.Context.RegisterClassMap<CsvQuestionMap>();

            var records = csv.GetRecords<JsonQuestionDto>().ToList();
            var questionsToSeed = new List<Question>();

            foreach (var record in records)
                try {
                    var question = MapToEntity(record.Question, [record.A, record.B, record.C, record.D], record.Answer,
                        sourceName);
                    questionsToSeed.Add(question);
                }
                catch (Exception ex) {
                    _logger.LogError(ex, "Failed to parse a row in CSV file {FilePath}", filePath);
                }

            if (questionsToSeed.Count > 0) {
                await _context.Questions.AddRangeAsync(questionsToSeed);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Successfully seeded {Count} questions from '{SourceName}'.", questionsToSeed.Count, sourceName);
            } else {
                _logger.LogWarning("No valid questions found in CSV file: {FilePath}", filePath);
            }
        }
    }

    private static Question MapToEntity(string questionText, string[] options, string answerLetter, string sourceName) {
        if (string.IsNullOrWhiteSpace(questionText) || string.IsNullOrWhiteSpace(answerLetter))
            throw new ArgumentException("Question text and answer letter cannot be empty.");

        int GetCorrectAnswerIndex(string answer) {
            return answer.Trim().ToUpper() switch {
                "A" => 0, "B" => 1, "C" => 2, "D" => 3,
                _ => throw new ArgumentOutOfRangeException(nameof(answer), $"Invalid answer character: {answer}")
            };
        }

        return new Question {
            QuestionText = questionText.Trim(), Options = options.Select(o => o?.Trim() ?? "").ToArray(),
            CorrectAnswerIndex = GetCorrectAnswerIndex(answerLetter), SourceName = sourceName
        };
    }
}