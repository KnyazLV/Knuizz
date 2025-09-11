// import { useGetQuizFromSourceQuery } from '../../features/api/apiSlice';
//
// interface QuizListProps {
//     sourceName: 'trivia_api' | 'wwtbm_ru' | 'wwtbm_en';
//     title: string;
//     count?: number;
// }
//
// export default function QuizList({ sourceName, title, count = 5 }: QuizListProps) {
//     const { data: questions, isLoading, isError } = useGetQuizFromSourceQuery({
//         sourceName,
//         count,
//     });
//
//     return (
//         <div className="mb-8">
//             <h2 className="text-2xl font-semibold mb-4">{title}</h2>
//
//             {isLoading && <div>Загрузка вопросов...</div>}
//             {isError && <div>Ошибка при загрузке этого списка.</div>}
//
//             {questions && (
//                 <ol className="list-decimal list-inside space-y-2">
//                     {questions.map((question, index) => (
//                         <li key={index} className="p-2 bg-white shadow rounded text-sm">
//                             {question.questionText}
//                         </li>
//                     ))}
//                 </ol>
//             )}
//         </div>
//     );
// }
