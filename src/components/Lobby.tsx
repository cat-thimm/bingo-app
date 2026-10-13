import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { makeCode } from '../lib/bingo';
import { btnGhost, btnPrimary, input } from '../lib/ui';

type Props = {
  initialName: string;
  invitedCode: string | null;
  onEnter: (code: string, name: string) => void;
};

export default function Lobby({ initialName, invitedCode, onEnter }: Props) {
  const [name, setName] = useState(initialName);
  const [title, setTitle] = useState('Bingo');
  const [size, setSize] = useState(5);
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = name.trim();

  const create = async () => {
    setBusy(true);
    setError(null);
    for (let attempt = 0; attempt < 5; attempt++) {
      const code = makeCode();
      const { error: err } = await supabase
        .from('games')
        .insert({ code, title: title.trim() || 'Bingo', size });
      if (!err) {
        onEnter(code, trimmed);
        return;
      }
      if (err.code !== '23505') {
        setError('Die Runde konnte nicht erstellt werden. Prüfe die Verbindung und versuche es erneut.');
        setBusy(false);
        return;
      }
    }
    setError('Es konnte kein freier Code erzeugt werden. Bitte versuche es erneut.');
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-5xl font-extrabold tracking-tight">Bingo</h1>
      <p className="mt-2 text-ink/70">Erstelle eine Karte und spielt gemeinsam, auch wenn ihr nicht am selben Ort seid.</p>

      <div className="mt-8">
        <label htmlFor="name" className="font-medium">
          Dein Name
        </label>
        <input
          id="name"
          value={name}
          maxLength={24}
          onChange={(e) => setName(e.target.value)}
          className={`${input} mt-1`}
        />
      </div>

      {invitedCode ? (
        <div className="mt-6 rounded-xl bg-white p-4 ring-1 ring-line">
          <p>
            Du wurdest zur Runde <strong>{invitedCode}</strong> eingeladen.
          </p>
          <button
            type="button"
            disabled={!trimmed}
            onClick={() => onEnter(invitedCode, trimmed)}
            className={`${btnPrimary} mt-3`}
          >
            Runde beitreten
          </button>
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-xl bg-white p-4 ring-1 ring-line">
            <h2 className="text-lg font-bold">Neue Runde</h2>
            <label htmlFor="title" className="mt-3 block text-sm font-medium">
              Titel
            </label>
            <input
              id="title"
              value={title}
              maxLength={40}
              onChange={(e) => setTitle(e.target.value)}
              className={`${input} mt-1`}
            />
            <label htmlFor="size" className="mt-3 block text-sm font-medium">
              Feldgröße
            </label>
            <select
              id="size"
              value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className={`${input} mt-1`}
            >
              <option value={4}>4 × 4</option>
              <option value={5}>5 × 5</option>
              <option value={6}>6 × 6</option>
            </select>
            <button type="button" disabled={!trimmed || busy} onClick={create} className={`${btnPrimary} mt-4`}>
              Runde erstellen
            </button>
          </section>

          <section className="mt-4 rounded-xl bg-white p-4 ring-1 ring-line">
            <h2 className="text-lg font-bold">Runde beitreten</h2>
            <label htmlFor="code" className="mt-3 block text-sm font-medium">
              Code
            </label>
            <input
              id="code"
              value={joinCode}
              maxLength={5}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className={`${input} mt-1 uppercase`}
            />
            <button
              type="button"
              disabled={!trimmed || joinCode.length < 5}
              onClick={() => onEnter(joinCode, trimmed)}
              className={`${btnGhost} mt-4`}
            >
              Beitreten
            </button>
          </section>
        </>
      )}

      {error && (
        <p role="alert" className="mt-4 text-stamp">
          {error}
        </p>
      )}
    </main>
  );
}
