import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Einfache Nutzerverwaltung: Jeder Browser bekommt beim ersten Besuch ein
 * anonymes Supabase-Konto. Die Sitzung bleibt im Browser gespeichert, so
 * gehört die eigene Karte auch nach einem Neuladen noch dir.
 */
let sessionPromise: Promise<string> | null = null;

function ensureSession(): Promise<string> {
    if (!sessionPromise) {
        sessionPromise = (async () => {
            const { data } = await supabase.auth.getSession();
            if (data.session) return data.session.user.id;
            const res = await supabase.auth.signInAnonymously();
            if (res.error || !res.data.user) {
                throw new Error(res.error?.message ?? 'Anmeldung fehlgeschlagen.');
            }
            return res.data.user.id;
        })();
        sessionPromise.catch(() => {
            sessionPromise = null;
        });
    }
    return sessionPromise;
}

export function useSession() {
    const [userId, setUserId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        ensureSession()
            .then((id) => {
                if (active) setUserId(id);
            })
            .catch((e: unknown) => {
                if (active) setError(e instanceof Error ? e.message : 'Keine Verbindung zum Server.');
            });
        return () => {
            active = false;
        };
    }, []);

    return { userId, error };
}