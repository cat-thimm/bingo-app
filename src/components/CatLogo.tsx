type Props = { className?: string; crown?: boolean };

export default function CatLogo({ className, crown = false }: Props) {
    return (
        <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
            <path d="M9 34 L11 7 L28 19 Z" fill="currentColor" />
            <path d="M55 34 L53 7 L36 19 Z" fill="currentColor" />
            <ellipse cx="32" cy="38" rx="24" ry="20" fill="currentColor" />
            <ellipse cx="23" cy="37" rx="4.5" ry="4.5" fill="#ffd23f" />
            <ellipse cx="41" cy="37" rx="4.5" ry="4.5" fill="#ffd23f" />
            <ellipse cx="23" cy="37" rx="1.3" ry="3.6" fill="#1e2347" />
            <ellipse cx="41" cy="37" rx="1.3" ry="3.6" fill="#1e2347" />
            <path d="M29 44 L35 44 L32 48 Z" fill="#e4266f" />
            <path
                d="M32 48 Q29 52 26 50 M32 48 Q35 52 38 50"
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M2 40 L13 43 M2 47 L13 46 M62 40 L51 43 M62 47 L51 46"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {crown && <path d="M26 18 L27 8 L30 13 L32 6 L34 13 L37 8 L38 18 Z" fill="#ffd23f" />}
        </svg>
    );
}