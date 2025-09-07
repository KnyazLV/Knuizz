import { Outlet } from 'react-router-dom';

export default function App() {
    return (
        <div className="container mx-auto p-4">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Knuizz App</h1>
            </header>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
