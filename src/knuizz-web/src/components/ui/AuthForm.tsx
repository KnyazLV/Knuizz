// src/components/ui/AuthForm.tsx
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginMutation, useRegisterMutation } from '../../features/api/apiSlice';

interface AuthFormProps {
    isLoginMode: boolean;
    onToggleMode: () => void;
}

export default function AuthForm({ isLoginMode, onToggleMode }: AuthFormProps) {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [login, { isLoading: isLoggingIn }] = useLoginMutation();
    const [register, { isLoading: isRegistering }] = useRegisterMutation();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        try {
            if (isLoginMode) {
                await login({ email, password }).unwrap();
                navigate('/');
            } else {
                await register({ username, email, password }).unwrap();
                alert('Регистрация прошла успешно! Теперь вы можете войти.');
                onToggleMode();
            }
        } catch (err) {
            const apiError = err as { data?: { message?: string }; status?: number };
            const message = apiError.data?.message || 'Произошла ошибка. Попробуйте снова.';
            setErrorMsg(message);
        }
    };

    const isLoading = isLoggingIn || isRegistering;

    return (
        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h2 className="text-center text-2xl font-bold">
                {isLoginMode ? 'Вход в аккаунт' : 'Создание аккаунта'}
            </h2>

            {!isLoginMode && (
                <input
                    type="text"
                    placeholder="Имя пользователя"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
            )}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />

            {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isLoading
                    ? 'Загрузка...'
                    : isLoginMode
                        ? 'Войти'
                        : 'Зарегистрироваться'}
            </button>

            <p className="text-sm text-center">
                {isLoginMode ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
                <button
                    type="button"
                    onClick={onToggleMode}
                    className="font-medium text-blue-600 hover:underline ml-1"
                >
                    {isLoginMode ? 'Зарегистрироваться' : 'Войти'}
                </button>
            </p>
        </form>
    );
}
