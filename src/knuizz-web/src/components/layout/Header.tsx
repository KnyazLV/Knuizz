// src/components/layout/Header.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flex, Text, Button, SegmentedControl } from '@radix-ui/themes';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';

import logo from '/logo.svg';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <header
            className={`sticky z-50 transition-all duration-300 ${
                isScrolled ? 'backdrop-blur-lg' : ''
            }`}
            style={{ top: 0 }}
        >
            <Flex
                justify="between"
                align="center"
                p="4"
                className={`transition-colors duration-300 ${
                    isScrolled
                        ? 'bg-[var(--slate-a2)] border-b border-[var(--slate-a5)]'
                        : 'bg-transparent border-b border-transparent'
                }`}
            >
                <Link to="/">
                    <img src={logo} alt="Knuizz Logo" className="h-8 w-auto" />
                </Link>

                <Flex gap="4" align="center">
                    <SegmentedControl.Root
                        style={{ background: 'var(--slate-3)' }}
                        defaultValue="ru"
                    >
                        <SegmentedControl.Item value="ru">RU</SegmentedControl.Item>
                        <SegmentedControl.Item value="en">EN</SegmentedControl.Item>
                    </SegmentedControl.Root>

                    {isAuthenticated ? (
                        <>
                            <Link to="/profile">
                                <Text className="hover:underline">Профиль</Text>
                            </Link>
                            <Button variant="soft" color="red" onClick={handleLogout}>
                                Выйти
                            </Button>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button>Войти</Button>
                        </Link>
                    )}
                </Flex>
            </Flex>
        </header>
    );
}
