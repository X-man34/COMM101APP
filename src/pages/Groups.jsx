import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { COURSES } from '../data/seed';
import { Avatar, Badge, EmptyState, PageHeader, ScopeToggle, useScope } from '../components/ui';
import { courseCode, timeAgo, yearLabel } from '../utils';

function GroupRow({ g, meta, action }) {
    return (
        <li>
            <div className="list-main">
                <div className="row gap wrap">
                    <Link to={`/groups/${g.id}`} className="list-title">{g.name}</Link>
                    <Badge tone="blue">{courseCode(g.course)}</Badge>
                    <Badge>{g.isPrivate ? 'Private' : 'Public'}</Badge>
                </div>
                <div className="muted small">{meta}</div>
            </div>
            {action && <div className="list-side">{action}</div>}
        </li>
    );
}

export default function Groups() {
    const { state, currentUser, createGroup, joinGroup, respondToInvite, userById } = useStore();
    const navigate = useNavigate();
    const [scope, setScope] = useScope();
    const [showForm, setShowForm] = useState(false);
    const courses = COURSES[currentUser.major] || [];
    const [form, setForm] = useState({
        name: '',
        course: courses[0] || '',
        description: '',
        isPrivate: false,
        inviteIds: [],
    });

    const mine = state.groups.filter((g) => g.memberIds.includes(currentUser.id));
    const invites = state.groups.filter((g) => g.invitedIds.includes(currentUser.id) && !g.memberIds.includes(currentUser.id));
    // Only public groups are discoverable. Private groups are invite-only.
    const publicGroups = state.groups.filter(
        (g) =>
            !g.isPrivate &&
            !g.memberIds.includes(currentUser.id) &&
            !g.invitedIds.includes(currentUser.id) &&
            (scope === 'all' || g.major === currentUser.major)
    );

    const candidates = state.users.filter((u) => u.major === currentUser.major && u.id !== currentUser.id);
    const canSubmit = form.name.trim().length > 0 && form.inviteIds.length > 0;

    const toggleInvite = (id) =>
        setForm((f) => ({
            ...f,
            inviteIds: f.inviteIds.includes(id) ? f.inviteIds.filter((x) => x !== id) : [...f.inviteIds, id],
        }));

    const submit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        const id = createGroup({ ...form, name: form.name.trim(), major: currentUser.major });
        navigate(`/groups/${id}`);
    };

    const lastMessage = (g) =>
        g.messages.length ? `Last message ${timeAgo(g.messages[g.messages.length - 1].ts)}` : 'No messages yet';

    return (
        <>
            <PageHeader
                title="Study Groups"
                subtitle="Create a group for a class, invite classmates, and chat."
                actions={
                    <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
                        {showForm ? 'Cancel' : '+ New group'}
                    </button>
                }
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

                    <div className="field">
                        <span className="field-label">Visibility</span>
                        <div className="segmented">
                            <button type="button" className={!form.isPrivate ? 'active' : ''} onClick={() => setForm({ ...form, isPrivate: false })}>Public</button>
                            <button type="button" className={form.isPrivate ? 'active' : ''} onClick={() => setForm({ ...form, isPrivate: true })}>Private</button>
                        </div>
                        <span className="muted small">
                            {form.isPrivate
                                ? 'Invite only. The group is hidden from the public list and people can only join with an invitation.'
                                : 'Listed under public groups. Anyone who finds it can join without an invitation.'}
                        </span>
                    </div>

                    <div className="field">
                        <span className="field-label">
                            Invite people (at least one) · {form.inviteIds.length} selected
                        </span>
                        <div className="checklist">
                            {candidates.map((u) => (
                                <label key={u.id}>
                                    <input type="checkbox" checked={form.inviteIds.includes(u.id)} onChange={() => toggleInvite(u.id)} />
                                    <Avatar user={u} size={24} />
                                    <span>{u.name}</span>
                                    <span className="muted small">{yearLabel(u.year)}</span>
                                    {u.role === 'mentor' && <Badge tone="gold">Mentor</Badge>}
                                </label>
                            ))}
                            {candidates.length === 0 && <p className="muted small" style={{ padding: 10 }}>No one else in {currentUser.major} yet.</p>}
                        </div>
                        {form.inviteIds.length === 0 && (
                            <span className="small error-text">Select at least one person to invite.</span>
                        )}
                    </div>

                    <button className="btn btn-primary" type="submit" disabled={!canSubmit}>Create group and send invites</button>
                </form>
            )}

            {invites.length > 0 && (
                <section>
                    <h2>Invitations</h2>
                    <ul className="list">
                        {invites.map((g) => (
                            <GroupRow
                                key={g.id}
                                g={g}
                                meta={`Invited by ${userById(g.ownerId)?.name} · ${g.memberIds.length} members`}
                                action={
                                    <div className="row gap">
                                        <button className="btn btn-primary btn-sm" onClick={() => respondToInvite(g.id, true)}>Accept</button>
                                        <button className="btn btn-ghost btn-sm" onClick={() => respondToInvite(g.id, false)}>Decline</button>
                                    </div>
                                }
                            />
                        ))}
                    </ul>
                </section>
            )}

            <section>
                <h2>My groups</h2>
                {mine.length === 0 ? (
                    <EmptyState title="No groups yet" hint="Create one above or join a public group below." />
                ) : (
                    <ul className="list">
                        {mine.map((g) => (
                            <GroupRow
                                key={g.id}
                                g={g}
                                meta={`${g.memberIds.length} members · ${lastMessage(g)}`}
                                action={<Link to={`/groups/${g.id}`} className="btn btn-ghost btn-sm">Open</Link>}
                            />
                        ))}
                    </ul>
                )}
            </section>

            <section>
                <div className="row between wrap gap">
                    <h2>Public groups</h2>
                    <ScopeToggle scope={scope} setScope={setScope} major={currentUser.major} />
                </div>
                {publicGroups.length === 0 ? (
                    <EmptyState title="No public groups to join" hint="Private groups only appear here once you are invited." />
                ) : (
                    <ul className="list">
                        {publicGroups.map((g) => (
                            <GroupRow
                                key={g.id}
                                g={g}
                                meta={`${g.memberIds.length} members · ${g.major}`}
                                action={<button className="btn btn-sm btn-primary" onClick={() => joinGroup(g.id)}>Join</button>}
                            />
                        ))}
                    </ul>
                )}
            </section>
        </>
    );
}