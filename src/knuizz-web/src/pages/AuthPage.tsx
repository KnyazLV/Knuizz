// src/pages/AuthPage.tsx
import { useState } from 'react';
import AuthForm from '../components/ui/AuthForm';
import {Button, Flex} from '@radix-ui/themes';
import {useNavigate} from "react-router-dom";
import {ArrowLeftIcon} from "@radix-ui/react-icons";

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();

    const goHome = () => {
        navigate('/');
    }
    const toggleForm = () => {
        setIsLogin((prev) => !prev);
    };

    return (
        <>
            <Button
                onClick={goHome}
                variant="ghost"
                color="gray"
                highContrast
                style={{
                    position: 'fixed', // Фиксируем на экране
                    top: '24px',       // Отступ сверху
                    left: '24px',      // Отступ слева
                    zIndex: 10,        // Поверх других элементов
                    cursor: 'pointer',
                }}
                aria-label="Вернуться на главную"
            >
                <ArrowLeftIcon width="18" height="18"/>
                На главную
            </Button>
            <Flex align="center" justify="center" className="min-h-screen">
                <AuthForm isLoginMode={isLogin} onToggleMode={toggleForm} />
            </Flex>
        </>
    );
}
