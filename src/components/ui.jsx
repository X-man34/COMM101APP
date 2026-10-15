import { useState } from 'react';
import { Link } from 'react-router-dom';
import { initials, yearLabel } from '../utils';

/* ---------- Icons (inline SVG, no emoji) ---------- */
const ICONS = {
    home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>,
    groups: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17.5" cy="9" r="2.5" /><path d="M17 14.2c2.6.3 4.5 2.3 4.5 5.3" /></>,
    forum: <path d="M4 4h16v12H9l-5 4z" />,
    materials: <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z" /><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20" /></>,
    people: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" /></>,
    chevronLeft: <path d="M15 5l-7 7 7 7" />,
    chevronRight: <path d="M9 5l7 7-7 7" />,
    paperclip: <path d="M20 11.5l-8.5 8.5a5 5 0 0 1-7-7L13 4.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L14.5 7.5" />,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9.5" r="1.5" /><path d="M21 16l-5-5L5 20" /></>,
    file: <><path d="M6 2h8l5 5v15H6z" /><path d="M14 2v5h5" /><path d="M9 13h7M9 17h7" /></>,
    quiz: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7" /><path d="M12 17h.01" /></>,
    cards: <><rect x="3" y="7" width="14" height="12" rx="2" /><path d="M7 7V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-3" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
    upload: <><path d="M12 16V4M7 9l5-5 5 5" /><path d="M4 16v4h16v-4" /></>,
};

export function Icon({ name, size = 18 }) {
    return (
        <svg
            className="icon"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {ICONS[name]}
        </svg>
    );
}

/* ---------- Brand mark ----------
   Uses public/bronco-logo.png if it exists; otherwise shows a simple "B" mark. */
const LOGO_URL = `${import.meta.env.BASE_URL}bronco-logo.png`;

export function BrandMark({ size = 38 }) {
    const [status, setStatus] = useState('loading'); // loading | ok | missing
    return (
        <span className="brand-mark-wrap" style={{ width: size, height: size }}>
            {status !== 'missing' && (
                <img
                    src={LOGO_URL}
                    alt="Boise State Broncos"
                    className="brand-logo"
                    style={{ display: status === 'ok' ? 'block' : 'none' }}
                    onLoad={() => setStatus('ok')}
                    onError={() => setStatus('missing')}
                />
            )}
            {status !== 'ok' && (
                <span className="brand-mark" style={{ fontSize: size * 0.5 }}>B</span>
            )}
        </span>
    );
}

/* ---------- Placeholder for features the demo doesn't support ---------- */
export function NotSupportedButton({ icon, label, showLabel = false }) {
    return (
        <button
            type="button"
            className={`btn btn-ghost btn-unsupported tip ${showLabel ? '' : 'btn-icon'}`}
            data-tip="Not supported"
            aria-label={`${label} (not supported)`}
            aria-disabled="true"
            onClick={(e) => e.preventDefault()}
        >
            <Icon name={icon} />
            {showLabel && label}
        </button>
    );
}

export function BackLink({ to, children }) {
    return (
        <Link to={to} className="back-link">
            <Icon name="chevronLeft" size={16} />
            {children}
        </Link>
    );
}

export function Avatar({ user, size = 36 }) {
    const hue = [...(user?.name || '')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
    return (
        <div
            className="avatar"
            style={{
                width: size,
                height: size,
                fontSize: size * 0.38,
                background: `hsl(${hue} 60% 45%)`,
            }}
            title={user?.name}
        >
            {user ? initials(user.name) : '?'}
        </div>
    );
}

export function Badge({ children, tone = 'gray' }) {
    return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function UserChip({ user, showYear = true }) {
    if (!user) return null;
    return (
        <span className="user-chip">
            <Avatar user={user} size={24} />
            <Link to={`/people/${user.id}`} className="chip-name">{user.name}</Link>
            {user.role === 'mentor' && <Badge tone="gold">Mentor</Badge>}
            {showYear && <span className="muted small">· {yearLabel(user.year)}</span>}
        </span>
    );
}

export function ScopeToggle({ scope, setScope, major }) {
    return (
        <div className="segmented">
            <button className={scope === 'major' ? 'active' : ''} onClick={() => setScope('major')}>
                {major}
            </button>
            <button className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>
                University-wide
            </button>
        </div>
    );
}

export function useScope() {
    return useState('major');
}

export function EmptyState({ title, hint, children }) {
    return (
        <div className="empty">
            <h4>{title}</h4>
            {hint && <p className="muted">{hint}</p>}
            {children}
        </div>
    );
}

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="page-header">
            <div>
                <h1>{title}</h1>
                {subtitle && <p className="muted">{subtitle}</p>}
            </div>
            {actions && <div className="actions">{actions}</div>}
        </div>
    );
}