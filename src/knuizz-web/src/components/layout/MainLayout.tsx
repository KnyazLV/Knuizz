// src/components/layout/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
    return (
        <>
            <div
                className="fixed inset-0 -z-10 w-full h-full"
                style={{
                    background: 'var(--slate-1)',
                    backgroundImage: `
                        linear-gradient(to right, rgba(71,85,105,0.3) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(71,85,105,0.3) 1px, transparent 1px),
                        radial-gradient(circle at 50% 50%, rgba(139,92,246,0.15) 0%, transparent 70%)
                    `,
                    backgroundSize: "32px 32px, 32px 32px, 100% 100%",
                }}
            />

            <Header />
            <main style={{paddingBottom: 50}}>
                <Outlet />
            </main>
            <Footer />
        </>
    );
}
