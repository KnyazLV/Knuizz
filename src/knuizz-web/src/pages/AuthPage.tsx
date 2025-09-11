// src/pages/AuthPage.tsx
import { useState } from 'react';
import AuthForm from '../components/ui/AuthForm';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);

    const toggleForm = () => {
        setIsLogin((prev) => !prev);
    };

    return (
        <div className="max-w-sm mx-auto mt-10">
            <AuthForm isLoginMode={isLogin} onToggleMode={toggleForm} />
        </div>
    );
}
