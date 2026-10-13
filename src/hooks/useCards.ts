import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { CardRow } from '../lib/types';

/**
 * Lädt alle Karten einer Runde und hält sie per Realtime aktuell.
 * `onWin` wird genau einmal pro neuem Gewinn aufgerufen (auch für die eigene Karte).
 */
export function useCards(gameId: string, onWin: (card: CardRow) => void) {
  const [cards, setCards] = useState<CardRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const announced = useRef(new Set<string>());
  const onWinRef = useRef(onWin);
  onWinRef.current = onWin;

  const setLocal = useCallback((row: CardRow) => {
    setCards((prev) => {
      const i = prev.findIndex((c) => c.id === row.id);
      if (i === -1) return [...prev, row];
      const next = [...prev];
      next[i] = row;
      return next;
    });
  }, []);

  useEffect(() => {
    let active = true;

    const apply = (row: CardRow) => {
      setLocal(row);
      if (!row.won_at) {
        announced.current.delete(row.id);
        return;
      }
      if (!announced.current.has(row.id)) {
        announced.current.add(row.id);
        onWinRef.current(row);
      }
    };

    const load = async () => {
      const { data } = await supabase
        .from('cards')
        .select('*')
        .eq('game_id', gameId)
        .order('created_at');
      if (!active || !data) return;
      const rows = data as CardRow[];
      // Gewinne, die schon vor dem Beitritt existierten, lösen keine Meldung mehr aus.
      rows.forEach((r) => {
        if (r.won_at) announced.current.add(r.id);
      });
      setCards((prev) => {
        const ids = new Set(rows.map((r) => r.id));
        return [...rows, ...prev.filter((c) => !ids.has(c.id))];
      });
      setLoaded(true);
    };

    const channel = supabase
      .channel(`cards-${gameId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cards', filter: `game_id=eq.${gameId}` },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as { id?: string }).id;
            if (id) setCards((prev) => prev.filter((c) => c.id !== id));
          } else {
            apply(payload.new as CardRow);
          }
        },
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') void load();
      });

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [gameId, setLocal]);

  return { cards, loaded, setLocal };
}
