import { useState } from 'react';
import { initials, yearLabel } from '../utils';

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
            <span>{user.name}</span>
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