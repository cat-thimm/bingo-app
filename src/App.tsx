import {useEffect, useState} from 'react';
import {isConfigured} from './lib/supabase';
import {useSession} from './hooks/useSession';
import {usePlayerName} from './hooks/usePlayerName';
import Lobby from './components/Lobby';
import GameView from './components/GameView';
import Footer from "./components/Footer";

const readCode = () => new URLSearchParams(location.search).get('g')?.toUpperCase() ?? null;

function AppContent() {
    const {userId, error} = useSession();
    const [name, setName] = usePlayerName();
    const [code, setCode] = useState<string | null>(readCode);

    useEffect(() => {
        const onPop = () => setCode(readCode());
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);

    if (!isConfigured) {
        return (
            <main className="mx-auto max-w-md px-4 py-10">
                <h1 className="text-2xl font-bold">Konfiguration fehlt</h1>
                <p className="mt-2">
                    Setze VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY (lokal in .env, auf Netlify unter Environment
                    variables).
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-md px-4 py-10">
                <p role="alert">{error}</p>
            </main>
        );
    }

    if (!userId) {
        return (
            <main className="mx-auto max-w-md px-4 py-10">
                <p>Wird geladen …</p>
            </main>
        );
    }

    const enter = (nextCode: string, nextName: string) => {
        setName(nextName);
        history.pushState(null, '', `?g=${nextCode}`);
        setCode(nextCode);
    };

    const leave = () => {
        history.pushState(null, '', '/');
        setCode(null);
    };

    if (code && name) {
        return <GameView code={code} userId={userId} name={name} onLeave={leave}/>;
    }

    return <Lobby initialName={name} invitedCode={code} onEnter={enter}/>;
}

export default function App() {
    return (
        <div className="flex min-h-screen flex-col">
            <div className="flex-1">
                <AppContent/>
            </div>
            <Footer/>
        </div>
    );
}