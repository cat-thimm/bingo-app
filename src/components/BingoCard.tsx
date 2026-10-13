import type { CardRow } from '../lib/types';

type Props = {
  card: CardRow;
  size: number;
  /** Wenn gesetzt, sind die Felder antippbar (nur für die eigene Karte). */
  onToggle?: (index: number) => void;
  large?: boolean;
};

function Stamp({ animate }: { animate: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full text-stamp"
      aria-hidden="true"
    >
      <path
        d="M20 20 L80 80 M80 20 L20 80"
        pathLength={1}
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        className={animate ? 'stamp-draw' : undefined}
        opacity="0.85"
      />
    </svg>
  );
}

export default function BingoCard({ card, size, onToggle, large = false }: Props) {
  const winSet = new Set(card.win_line ?? []);

  const cellClass = (win: boolean) =>
    [
      'relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-md p-1 text-center leading-tight [hyphens:auto] [overflow-wrap:anywhere]',
      large ? 'text-xs sm:text-base' : 'text-[10px] sm:text-xs',
      win ? 'bg-hit ring-2 ring-ink' : 'bg-paper/60 ring-1 ring-line',
    ].join(' ');

  return (
    <div
      className="grid gap-1 rounded-xl bg-white p-2 shadow-sm ring-1 ring-line"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {card.cells.map((cell, i) => {
        const win = winSet.has(i);
        const label = (
          <>
            <span className={cell.checked ? 'opacity-50' : undefined}>{cell.text}</span>
            {cell.checked && <Stamp animate={Boolean(onToggle)} />}
          </>
        );

        if (onToggle) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => onToggle(i)}
              aria-pressed={cell.checked}
              title={cell.text}
              className={`${cellClass(win)} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stamp`}
            >
              {label}
            </button>
          );
        }
        return (
          <div key={i} title={cell.text} className={cellClass(win)}>
            {label}
          </div>
        );
      })}
    </div>
  );
}
