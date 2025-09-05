namespace Knuizz.Api.Application;

public static class DomainConstants {
    public static class Experience {
        public const double BaseExperienceForLevel = 50.0;
        public const double GrowthFactor = 1.2;
    }

    public static class Quiz {
        public const int OpenTriviaAPIQuestionLimit = 50; // It's Open Trivia Limit, don't change it
        public const int DefaultQuestionCount = 20;
        public const int MaxQuestionsPerQuiz = 30;
    }

    public static class Leaderboard {
        public const int DefaultTopPlayersLimit = 10;
        public const int MaxTopPlayersLimit = 100;
    }

    public static class Application {
        public const int JWTTokenLifetimeDays = 7;
    }

    public static class Rating {
        public const double BaseRating = 1000.0;
        public const double BaseAccuracyThreshold = 0.6;
        
        public const double MaxGain = 50.0;
        public const double MinGain = 5.0;
        public const double MaxLoss = 40.0;
        public const double MinLoss = 10.0;

        // Modificators
        public const double GainReductionFactor = 40.0; // How quickly does the increase in points decrease as the rating rises
        public const double LossIncreaseFactor = 30.0; // How quickly does the penalty increase as the rating rises
        public const double ThresholdIncreaseFactor = 2000.0; //How quickly does the accuracy threshold increase as the rating increases
    }
}