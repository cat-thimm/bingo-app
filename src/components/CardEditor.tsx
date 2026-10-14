import {useState} from 'react';
import type {Cell} from '../lib/types';
import {emptyCells, shuffle} from '../lib/bingo';
import {btnGhost, btnPrimary, input} from '../lib/ui';

type Props = {
    size: number;
    initial?: Cell[];
    onSave: (cells: Cell[]) => void | Promise<void>;
    onCancel?: () => void;
};

export default function CardEditor({size, initial, onSave, onCancel}: Props) {
    const total = size * size;
    const [cells, setCells] = useState<Cell[]>(initial ?? emptyCells(size));
    const [bulk, setBulk] = useState('');
    const [saving, setSaving] = useState(false);

    const filled = cells.filter((c) => c.text.trim()).length;
    const complete = filled === total;

    const setText = (i: number, text: string) =>
        setCells((prev) => prev.map((c, idx) => (idx === i ? {...c, text} : c)));

    const applyBulk = () => {
        const lines = bulk
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .slice(0, total);
        setCells((prev) => prev.map((c, i) => (lines[i] !== undefined ? {...c, text: lines[i]} : c)));
        setBulk('');
    };

    const save = async () => {
        setSaving(true);
        try {
            await onSave(cells.map((c) => ({...c, text: c.text.trim()})));
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-bold">{initial ? 'Felder ändern' : 'Deine Bingo-Karte'}</h2>
            <p className="mt-1 text-ink/70">
                Schreibe {total} kurze Sätze oder Begriffe. Die Reihenfolge kannst du am Ende mischen.
            </p>

            <details className="mt-4 rounded-lg bg-white p-3 ring-1 ring-line">
                <summary className="cursor-pointer font-medium">Liste einfügen</summary>
                <p className="mt-2 text-sm text-ink/70">Ein Eintrag pro Zeile. Er füllt die Felder der Reihe nach.</p>
                <textarea
                    value={bulk}
                    onChange={(e) => setBulk(e.target.value)}
                    rows={5}
                    className={`${input} mt-2`}
                />
                <button type="button" onClick={applyBulk} disabled={!bulk.trim()} className={`${btnGhost} mt-2`}>
                    Übernehmen
                </button>
            </details>

            <ol className="mt-4 grid gap-2 sm:grid-cols-2">
                {cells.map((cell, i) => (
                    <li key={i}>
                        <label className="sr-only" htmlFor={`cell-${i}`}>
                            Feld {i + 1}
                        </label>
                        <input
                            id={`cell-${i}`}
                            value={cell.text}
                            maxLength={60}
                            onChange={(e) => setText(i, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key !== 'Enter') return;
                                e.preventDefault();
                                const next = document.getElementById(`cell-${i + 1}`);
                                if (next) next.focus();
                                else e.currentTarget.blur();
                            }}
                            enterKeyHint={i === total - 1 ? 'done' : 'next'}
                            placeholder={`Feld ${i + 1}`}
                            className={input}
                        />
                    </li>
                ))}
            </ol>

            <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" onClick={save} disabled={!complete || saving} className={btnPrimary}>
                    {initial ? 'Änderungen speichern' : 'Karte veröffentlichen'}
                </button>
                <button type="button" onClick={() => setCells((prev) => shuffle(prev))} className={btnGhost}>
                    Felder mischen
                </button>
                {onCancel && (
                    <button type="button" onClick={onCancel} className={btnGhost}>
                        Abbrechen
                    </button>
                )}
                <span className="text-sm text-ink/70">
          {filled} von {total} ausgefüllt
        </span>
            </div>
        </section>
    );
}
