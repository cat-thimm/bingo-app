import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { findWinLine } from '../lib/bingo';
import { useCards } from '../hooks/useCards';
import type { CardRow, Cell, Game } from '../lib/types';
import BingoCard from './BingoCard';
import CardEditor from './CardEditor';
import WinnerModal from './WinnerModal';
import { btnGhost } from '../lib/ui';
import CatLogo from "./CatLogo";

type Props = { code: string; userId: string; name: string; onLeave: () => void };

export default function GameView({ code, userId, name, onLeave }: Props) {
  const [game, setGame] = useState<Game | null>(null);
  const [status, setStatus] = useState<'loading' | 'missing' | 'error' | 'ready'>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    supabase
      .from('games')
      .select('*')
      .eq('code', code.toUpperCase())
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setStatus('error');
        else if (!data) setStatus('missing');
        else {
          setGame(data as Game);
          setStatus('ready');
        }
      });
    return () => {
      active = false;
    };
  }, [code]);

  if (status === 'ready' && game) {
    return <Table game={game} userId={userId} name={name} onLeave={onLeave} />;
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <p>
        {status === 'loading' && 'Runde wird geladen …'}
        {status === 'missing' && `Die Runde ${code} existiert nicht. Prüfe den Code.`}
        {status === 'error' && 'Die Runde konnte nicht geladen werden. Prüfe die Verbindung.'}
      </p>
      {status !== 'loading' && (
        <button type="button" onClick={onLeave} className={`${btnGhost} mt-4`}>
          Zurück
        </button>
      )}
    </main>
  );
}

function Table({ game, userId, name, onLeave }: { game: Game; userId: string; name: string; onLeave: () => void }) {
  const [winner, setWinner] = useState<CardRow | null>(null);
  const [editing, setEditing] = useState(false);
  const [zoomId, setZoomId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  );

  const { cards, loaded, setLocal } = useCards(game.id, (card) => {
    setWinner(card);
    if (card.user_id !== userId && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(`${card.player_name} hat Bingo!`, { body: game.title });
    }
  });

  const mine = cards.find((c) => c.user_id === userId);
  const others = cards.filter((c) => c.user_id !== userId);
  const winners = cards.filter((c) => c.won_at).sort((a, b) => (a.won_at! < b.won_at! ? -1 : 1));
  const zoomed = cards.find((c) => c.id === zoomId);

  const saveCard = async (cells: Cell[]) => {
    setError(null);
    if (mine) {
      const line = findWinLine(cells, game.size);
      const won_at = line ? (mine.won_at ?? new Date().toISOString()) : null;
      const { error: err } = await supabase
        .from('cards')
        .update({ cells, win_line: line, won_at, updated_at: new Date().toISOString() })
        .eq('id', mine.id);
      if (err) return setError('Speichern fehlgeschlagen. Versuche es erneut.');
      setLocal({ ...mine, cells, win_line: line, won_at });
    } else {
      const { data, error: err } = await supabase
        .from('cards')
        .insert({ game_id: game.id, player_name: name, cells })
        .select()
        .single();
      if (err || !data) return setError('Karte konnte nicht veröffentlicht werden. Versuche es erneut.');
      setLocal(data as CardRow);
    }
    setEditing(false);
  };

  const toggle = async (index: number) => {
    if (!mine) return;
    setError(null);
    const cells = mine.cells.map((c, i) => (i === index ? { ...c, checked: !c.checked } : c));
    const line = findWinLine(cells, game.size);
    const won_at = line ? (mine.won_at ?? new Date().toISOString()) : null;
    const previous = mine;
    setLocal({ ...mine, cells, win_line: line, won_at });
    const { error: err } = await supabase
      .from('cards')
      .update({ cells, win_line: line, won_at, updated_at: new Date().toISOString() })
      .eq('id', mine.id);
    if (err) {
      setLocal(previous);
      setError('Das Kreuz konnte nicht gespeichert werden. Versuche es erneut.');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${location.origin}/?g=${game.code}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(`Kopieren nicht möglich. Teile den Code ${game.code}.`);
    }
  };

  const enableNotifications = async () => {
    if (typeof Notification === 'undefined') return;
    setPermission(await Notification.requestPermission());
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
              <CatLogo className="h-10 w-10 shrink-0 text-ink" />
              <div>
                  <h1 className="text-3xl font-extrabold tracking-tight">{game.title}</h1>
                  <p className="text-ink/70">
                      Code {game.code} · {cards.length} {cards.length === 1 ? 'Karte' : 'Karten'} · du bist {name}
                  </p>
              </div>
          </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyLink} className={btnGhost}>
            {copied ? 'Link kopiert' : 'Einladungslink kopieren'}
          </button>
          {permission === 'default' && (
            <button type="button" onClick={enableNotifications} className={btnGhost}>
              Benachrichtigungen aktivieren
            </button>
          )}
          <button type="button" onClick={onLeave} className={btnGhost}>
            Verlassen
          </button>
        </div>
      </header>

      {error && (
        <p role="alert" className="mt-3 text-stamp">
          {error}
        </p>
      )}

      {winners.length > 0 && (
        <p className="mt-4 rounded-lg bg-hit px-4 py-2 font-semibold">
          Bingo: {winners.map((w) => w.player_name).join(', ')}
        </p>
      )}

      {!loaded ? (
        <p className="mt-8">Karten werden geladen …</p>
      ) : !mine || editing ? (
        <div className="mt-6">
          <CardEditor
            size={game.size}
            initial={mine?.cells}
            onSave={saveCard}
            onCancel={mine ? () => setEditing(false) : undefined}
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,32rem)_1fr]">
          <section>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-xl font-bold">Deine Karte</h2>
              <button type="button" onClick={() => setEditing(true)} className={btnGhost}>
                Felder ändern
              </button>
            </div>
            <BingoCard card={mine} size={game.size} onToggle={toggle} large />
            <p className="mt-2 text-sm text-ink/70">Tippe auf ein Feld, wenn es eingetreten ist. Alle sehen dein Kreuz.</p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold">Die anderen</h2>
            {others.length === 0 ? (
              <p className="text-ink/70">Noch niemand sonst da. Teile den Einladungslink.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {others.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setZoomId(c.id)}
                    className="rounded-xl text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stamp"
                    aria-label={`Karte von ${c.player_name} vergrößern`}
                  >
                    <p className="mb-1 font-semibold">
                      {c.player_name}
                      {c.won_at && ' hat Bingo'}
                    </p>
                    <BingoCard card={c} size={game.size} />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {zoomed && !winner && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Karte von ${zoomed.player_name}`}
          className="fixed inset-0 z-40 flex items-center justify-center overflow-y-auto bg-ink/60 p-4"
          onClick={() => setZoomId(null)}
        >
          <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 text-xl font-bold text-white">{zoomed.player_name}</p>
            <BingoCard card={zoomed} size={game.size} large />
            <button type="button" onClick={() => setZoomId(null)} className={`${btnGhost} mt-3`}>
              Schließen
            </button>
          </div>
        </div>
      )}

      {winner && (
        <WinnerModal
          card={winner}
          size={game.size}
          isMe={winner.user_id === userId}
          onClose={() => setWinner(null)}
        />
      )}
    </main>
  );
}
