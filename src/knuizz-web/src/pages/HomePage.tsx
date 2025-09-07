import QuizList from '../components/ui/QuizList.tsx';

export default function HomePage() {
    return (
        <div>
            <QuizList
                sourceName="trivia_api"
                title="Викторина из Trivia API"
                count={5}
            />

            <QuizList
                sourceName="wwtbm_ru"
                title="Викторина 'Кто хочет стать миллионером?' (RU)"
                count={5}
            />

            <QuizList
                sourceName="wwtbm_en"
                title="Quiz 'Who Wants to Be a Millionaire?' (EN)"
                count={5}
            />
        </div>
    );
}
