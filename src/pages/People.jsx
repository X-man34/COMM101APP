import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, Badge, EmptyState, PageHeader, ScopeToggle, useScope } from '../components/ui';
import { yearLabel, courseCode, isUpperclassman } from '../utils';

export default function People() {
    const { state, currentUser, isConnected, toggleConnection, myConnections, userById } = useStore();
    const [scope, setScope] = useScope();
    const [q, setQ] = useState('');
    const [filter, setFilter] = useState('all'); // all | mentors | upper | under

    const people = state.users.filter((u) => {
        if (u.id === currentUser.id) return false;
        if (scope === 'major' && u.major !== currentUser.major) return false;
        if (filter === 'mentors' && u.role !== 'mentor') return false;
        if (filter === 'upper' && !isUpperclassman(u)) return false;
        if (filter === 'under' && isUpperclassman(u)) return false;
        if (q && !`${u.name} ${u.bio} ${u.courses.join(' ')}`.toLowerCase().includes(q.toLowerCase())) return false;
        return true;
    });

    const sharedGroups = (u) => state.groups.filter((g) => g.memberIds.includes(u.id) && g.memberIds.includes(currentUser.id));
    const connections = myConnections().map(userById).filter(Boolean);

    return (
        <>
            <PageHeader
                title={`People in ${scope === 'major' ? currentUser.major : 'the University'}`}
                subtitle="Find classmates, upperclassmen, and paid mentors to connect with."
            />

            <div className="toolbar">
                <ScopeToggle scope={scope} setScope={setScope} major={currentUser.major} />
                <div className="segmented">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>Everyone</button>
                    <button className={filter === 'mentors' ? 'active' : ''} onClick={() => setFilter('mentors')}>Mentors</button>
                    <button className={filter === 'upper' ? 'active' : ''} onClick={() => setFilter('upper')}>Upperclassmen</button>
                    <button className={filter === 'under' ? 'active' : ''} onClick={() => setFilter('under')}>Underclassmen</button>
                </div>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, bio, course…" style={{ flex: 1, minWidth: 180 }} />
            </div>

            {connections.length > 0 && (
                <div className="card subtle">
                    <b>Your connections ({connections.length}):</b>{' '}
                    <span className="avatars" style={{ marginLeft: 8 }}>
                        {connections.map((u) => <Avatar key={u.id} user={u} size={28} />)}
                    </span>
                </div>
            )}

            {people.length === 0 ? (
                <EmptyState title="No one matches" hint="Try another filter or search term." />
            ) : (
                <div className="grid-3">
                    {people.map((u) => {
                        const connected = isConnected(currentUser.id, u.id);
                        const shared = sharedGroups(u);
                        return (
                            <div key={u.id} className="card person-card">
                                <div className="row gap">
                                    <Avatar user={u} size={48} />
                                    <div>
                                        <b>{u.name}</b>
                                    </div>
                                </div>
                                <p className="muted small">{u.bio || 'No bio yet.'}</p>
                                <div className="row gap" style={{ marginTop: 'auto' }}>
                                    <button className={`btn btn-sm ${connected ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleConnection(u.id)}>
                                        {connected ? '✓ Connected' : '+ Connect'}
                                    </button>
                                    <Link to="/groups" className="btn btn-ghost btn-sm">Invite to a group</Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
}