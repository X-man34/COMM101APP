import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, EmptyState, PageHeader, ScopeToggle, useScope } from '../components/ui';
import ConnectButton from '../components/ConnectButton';
import ConnectionRequests from '../components/ConnectionRequests';
import { isUpperclassman } from '../utils';

export default function People() {
    const { state, currentUser, myConnections, outgoingRequests, userById } = useStore();
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

    const connections = myConnections().map(userById).filter(Boolean);
    const pendingSent = outgoingRequests().length;

    return (
        <>
            <PageHeader
                title="People"
                subtitle="Find classmates, upperclassmen, and paid mentors to connect with."
            />

            <ConnectionRequests />

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

            {(connections.length > 0 || pendingSent > 0) && (
                <div className="card subtle">
                    <b>Your connections ({connections.length}):</b>{' '}
                    <span className="avatars" style={{ marginLeft: 8 }}>
                        {connections.map((u) => (
                            <Link key={u.id} to={`/people/${u.id}`}><Avatar user={u} size={28} /></Link>
                        ))}
                    </span>
                    {pendingSent > 0 && (
                        <span className="muted small" style={{ marginLeft: 10 }}>
                            {pendingSent} {pendingSent === 1 ? 'request' : 'requests'} waiting for a response
                        </span>
                    )}
                </div>
            )}

            {people.length === 0 ? (
                <EmptyState title="No one matches" hint="Try another filter or search term." />
            ) : (
                <div className="grid-3">
                    {people.map((u) => (
                        <div key={u.id} className="card person-card">
                            <Link to={`/people/${u.id}`} className="row gap person-link">
                                <Avatar user={u} size={48} />
                                <div>
                                    <b>{u.name}</b>
                                </div>
                            </Link>
                            <p className="muted small">{u.bio || 'No bio yet.'}</p>
                            <div className="row gap wrap" style={{ marginTop: 'auto' }}>
                                <ConnectButton user={u} />
                                <Link to={`/people/${u.id}`} className="btn btn-ghost btn-sm">View profile</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}