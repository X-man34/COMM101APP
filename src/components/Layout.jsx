import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, Badge, BrandMark, Icon } from './ui';
import { yearLabel } from '../utils';

const links = [
    { to: '/', label: 'Dashboard', icon: 'home', end: true },
    { to: '/groups', label: 'Study Groups', icon: 'groups' },
    { to: '/forum', label: 'Forum', icon: 'forum' },
    { to: '/materials', label: 'Study Materials', icon: 'materials' },
    { to: '/people', label: 'People', icon: 'people' },
];

const COLLAPSE_KEY = 'broncobridge-sidebar-collapsed';
const isNarrow = () => window.innerWidth <= 720;

function initialCollapsed() {
    if (isNarrow()) return true; // phones always start with the icon rail
    try {
        const saved = localStorage.getItem(COLLAPSE_KEY);
        if (saved !== null) return saved === '1';
    } catch (e) {
        /* ignore */
    }
    return false;
}

export default function Layout() {
    const { currentUser, logout, resetDemo } = useStore();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(initialCollapsed);

    useEffect(() => {
        if (isNarrow()) return; // don't let a phone overwrite the desktop preference
        try {
            localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
        } catch (e) {
            /* ignore */
        }
    }, [collapsed]);

    const handleReset = () => {
        if (confirm('Reset all demo data? This clears everything you created in this browser.')) {
            resetDemo();
            navigate('/login');
        }
    };

    const closeOnPhone = () => {
        if (isNarrow()) setCollapsed(true);
    };

    return (
        <div className={`shell ${collapsed ? 'is-collapsed' : ''}`}>
            {!collapsed && <div className="sidebar-backdrop" onClick={() => setCollapsed(true)} />}

            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="brand">
                        <BrandMark size={36} />
                        {!collapsed && (
                            <div className="brand-text">
                                <div className="brand-name">Bronco Bridge</div>
                                <div className="muted small">Boise State University</div>
                            </div>
                        )}
                    </div>
                    <button
                        className="collapse-btn"
                        onClick={() => setCollapsed((c) => !c)}
                        aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
                        title={collapsed ? 'Expand' : 'Collapse'}
                    >
                        <Icon name={collapsed ? 'chevronRight' : 'chevronLeft'} size={16} />
                    </button>
                </div>

                <nav>
                    {links.map((l) => (
                        <NavLink
                            key={l.to}
                            to={l.to}
                            end={l.end}
                            className="nav-link"
                            title={collapsed ? l.label : undefined}
                            aria-label={l.label}
                            onClick={closeOnPhone}
                        >
                            <Icon name={l.icon} size={20} />
                            {!collapsed && <span className="nav-label">{l.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    {collapsed ? (
                        <button
                            className="me"
                            onClick={() => setCollapsed(false)}
                            aria-label={`${currentUser.name}. Expand for account options`}
                        >
                            <Avatar user={currentUser} size={36} />
                        </button>
                    ) : (
                        <>
                            <Link to={`/people/${currentUser.id}`} className="me" onClick={closeOnPhone}>
                                <Avatar user={currentUser} size={40} />
                                <div className="me-text">
                                    <div className="bold">{currentUser.name}</div>
                                    <div className="muted small">
                                        {currentUser.major} · {yearLabel(currentUser.year)}
                                    </div>
                                    {currentUser.role === 'mentor' && <Badge tone="gold">Paid Mentor</Badge>}
                                </div>
                            </Link>
                            <div className="sidebar-actions">
                                <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                                    Switch user
                                </button>
                                <button className="btn btn-ghost btn-sm danger" onClick={handleReset}>
                                    Reset demo
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}