import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, Badge } from './ui';
import { yearLabel } from '../utils';

const links = [
    { to: '/', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/groups', label: 'Study Groups', icon: '👥' },
    { to: '/forum', label: 'Forum', icon: '💬' },
    { to: '/materials', label: 'Study Materials', icon: '📚' },
    { to: '/people', label: 'People in my Major', icon: '🤝' },
];

export default function Layout() {
    const { currentUser, logout, resetDemo } = useStore();
    const navigate = useNavigate();

    const handleReset = () => {
        if (confirm('Reset all demo data? This clears everything you created in this browser.')) {
            resetDemo();
            navigate('/login');
        }
    };

    return (
        <div className="shell">
            <aside className="sidebar">
                <div className="brand">
                    <span className="brand-mark">CC</span>
                    <div>
                        <div className="brand-name">CampusConnect</div>
                        <div className="muted small">Student Resource Hub</div>
                    </div>
                </div>

                <nav>
                    {links.map((l) => (
                        <NavLink key={l.to} to={l.to} end={l.end} className="nav-link">
                            <span className="nav-icon">{l.icon}</span>
                            {l.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="me">
                        <Avatar user={currentUser} size={40} />
                        <div>
                            <div className="bold">{currentUser.name}</div>
                            <div className="muted small">
                                {currentUser.major} · {yearLabel(currentUser.year)}
                            </div>
                            {currentUser.role === 'mentor' && <Badge tone="gold">Paid Mentor</Badge>}
                        </div>
                    </div>
                    <div className="row gap">
                        <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/login'); }}>
                            Switch user
                        </button>
                        <button className="btn btn-ghost btn-sm danger" onClick={handleReset}>
                            Reset demo
                        </button>
                    </div>
                </div>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}