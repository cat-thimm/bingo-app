import { useMemo } from 'react';
import type { CSSProperties } from 'react';

const COLORS = ['#e4266f', '#ffd23f', '#1e2347', '#ffffff', '#7aa2ff'];

export default function Confetti() {
    const pieces = useMemo(
        () =>
            Array.from({ length: 48 }, (_, i) => ({
                left: Math.random() * 100,
                delay: Math.random() * 0.6,
                duration: 2.2 + Math.random() * 1.8,
                size: 6 + Math.random() * 8,
                rotate: Math.random() * 360,
                round: i % 3 === 0,
                color: COLORS[i % COLORS.length],
            })),
        [],
    );

    return (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60] overflow-hidden motion-reduce:hidden">
            {pieces.map((p, i) => (
                <span
                    key={i}
                    className="confetti"
                    style={
                        {
                            left: `${p.left}%`,
                            width: p.size,
                            height: p.round ? p.size : p.size * 0.5,
                            background: p.color,
                            borderRadius: p.round ? '50%' : '2px',
                            animationDelay: `${p.delay}s`,
                            animationDuration: `${p.duration}s`,
                            '--r': `${p.rotate}deg`,
                        } as CSSProperties
                    }
                />
            ))}
        </div>
    );
}