import type { CardRow } from '../lib/types';

type Props = {
  card: CardRow;
  size: number;
  /** Wenn gesetzt, sind die Felder antippbar (nur für die eigene Karte). */
  onToggle?: (index: number) => void;
  large?: boolean;
};

function Stamp({ animate, index }: { animate: boolean; index: number }) {
    // jede Pfote leicht anders gedreht, wie von Hand gestempelt
    const tilt = ((index * 37) % 31) - 15;
    return (
        <svg
            viewBox="0 0 100 100"
            className="pointer-events-none absolute inset-0 h-full w-full p-[12%] text-stamp"
            style={{ transform: `rotate(${tilt}deg)` }}
            aria-hidden="true"
        >
            <g fill="currentColor" opacity="0.85" className={animate ? 'paw-pop' : undefined}>
                <ellipse cx="50" cy="68" rx="24" ry="19" />
                <ellipse cx="20" cy="46" rx="9" ry="13" transform="rotate(-22 20 46)" />
                <ellipse cx="38" cy="25" rx="9" ry="13" transform="rotate(-8 38 25)" />
                <ellipse cx="62" cy="25" rx="9" ry="13" transform="rotate(8 62 25)" />
                <ellipse cx="80" cy="46" rx="9" ry="13" transform="rotate(22 80 46)" />
            </g>
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
            {cell.checked && <Stamp animate={Boolean(onToggle)} index={i} />}
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
              className={`${cellClass(win)} cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-stamp active:scale-95 transition-transform motion-reduce:transition-none`}
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
