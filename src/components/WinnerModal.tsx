import {useEffect, useRef} from 'react';
import type {CardRow} from '../lib/types';
import BingoCard from './BingoCard';
import {btnPrimary} from '../lib/ui';
import CatLogo from './CatLogo';
import Confetti from './Confetti';

type Props = { card: CardRow; size: number; isMe: boolean; onClose: () => void };

export default function WinnerModal({card, size, isMe, onClose}: Props) {
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const winning = (card.win_line ?? []).map((i) => card.cells[i]?.text).filter(Boolean);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="winner-title"
            className="fixed inset-0 z-50 overflow-y-auto bg-ink/70"
        >
            <Confetti />
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="w-full max-w-md rounded-2xl bg-paper p-5 shadow-xl">
                    <CatLogo crown className="mb-2 h-14 w-14 text-ink" />
                    <h2 id="winner-title" className="text-3xl font-extrabold">
                        {isMe ? 'Du hast Bingo!' : `${card.player_name} hat Bingo!`}
                    </h2>
                    <p className="mt-2 font-medium">
                        {isMe
                            ? 'Was passiert ist, sodass du gewonnen hast:'
                            : `Was passiert ist, sodass ${card.player_name} gewonnen hat:`}
                    </p>
                    <ul className="mt-2 space-y-1">
                        {winning.map((text, i) => (
                            <li key={i} className="rounded-md bg-hit px-3 py-1.5 font-medium">
                                {text}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4">
                        <BingoCard card={card} size={size} />
                    </div>
                    <button ref={closeRef} type="button" onClick={onClose} className={`${btnPrimary} mt-4 w-full`}>
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
}
