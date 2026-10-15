import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { COURSES } from '../data/seed';
import { Avatar, EmptyState, PageHeader, ScopeToggle, useScope, Badge } from '../components/ui';
import { courseCode, timeAgo } from '../utils';

export default function Groups() {
    const { state, currentUser, createGroup, joinGroup, respondToInvite, userById } = useStore();
    const navigate = useNavigate();
    const [scope, setScope] = useScope();
    const [showForm, setShowForm] = useState(false);
    const courses = COURSES[currentUser.major] || [];
    const [form, setForm] = useState({ name: '', course: courses[0] || '', description: '' });

    const mine = state.groups.filter((g) => g.memberIds.includes(currentUser.id));
    const invites = state.groups.filter((g) => g.invitedIds.includes(currentUser.id));
    const discover = state.groups.filter(
        (g) => !g.memberIds.includes(currentUser.id) && !g.invitedIds.includes(currentUser.id) && (scope === 'all' || g.major === currentUser.major)
    );

    const submit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        const id = createGroup({ ...form, major: currentUser.major });
        navigate(`/groups/${id}`);
    };

    const GroupCard = ({ g, action }) => (
        <div className="card group-card">
            <div className="row between">
                <Link to={`/groups/${g.id}`} className="bold big-link">{g.name}</Link>
                <Badge tone="blue">{courseCode(g.course)}</Badge>
            </div>
            <p className="muted">{g.description}</p>
            <div className="row between">
                <div className="avatars">
                    {g.memberIds.slice(0, 5).map((id) => <Avatar key={id} user={userById(id)} size={26} />)}
                    <span className="muted small">{g.memberIds.length} members · {g.major}</span>
                </div>
                {action}
            </div>
        </div>
    );

    return (
        <>
            <PageHeader
                title="Study Groups"
                subtitle="Create a group for a class, invite classmates, and chat."
                actions={<button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ New group'}</button>}
            />

            {showForm && (
                <form className="card form" onSubmit={submit}>
                    <h3>Create a study group</h3>
                    <label>
                        Group name
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Algorithms Midterm Crew" required />
                    </label>
                    <label>
                        Course ({currentUser.major})
                        <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                            {courses.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </label>
                    <label>
                        Description
                        <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="When do you meet? What are you focusing on?" />
                    </label>
                    <button className="btn btn-primary" type="submit">Create group</button>
                </form>
            )}

            {invites.length > 0 && (
                <section>
                    <h2>Invitations</h2>
                    {invites.map((g) => (
                        <GroupCard
                            key={g.id}
                            g={g}
                            action={
                                <div className="row gap">
                                    <button className="btn btn-primary btn-sm" onClick={() => respondToInvite(g.id, true)}>Accept</button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => respondToInvite(g.id, false)}>Decline</button>
                                </div>
                            }
                        />
                    ))}
                </section>
            )}

            <section>
                <h2>My groups</h2>
                {mine.length === 0 ? (
                    <EmptyState title="No groups yet" hint="Create one above or join a group below." />
                ) : (
                    <div className="grid-2">
                        {mine.map((g) => (
                            <GroupCard
                                key={g.id}
                                g={g}
                                action={<span className="muted small">{g.messages.length ? `Last msg ${timeAgo(g.messages[g.messages.length - 1].ts)}` : 'No messages yet'}</span>}
                            />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="row between">
                    <h2>Discover groups</h2>
                    <ScopeToggle scope={scope} setScope={setScope} major={currentUser.major} />
                </div>
                {discover.length === 0 ? (
                    <EmptyState title="Nothing to discover" hint="You're in all the groups for this scope." />
                ) : (
                    <div className="grid-2">
                        {discover.map((g) => (
                            <GroupCard
                                key={g.id}
                                g={g}
                                action={<button className="btn btn-sm btn-primary" onClick={() => joinGroup(g.id)}>Join</button>}
                            />
                        ))}
                    </div>
                )}
            </section>
        </>
    );
}