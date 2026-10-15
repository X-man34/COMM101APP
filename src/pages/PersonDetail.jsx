import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, BackLink, Badge, Icon } from '../components/ui';
import { yearLabel, courseCode, isUpperclassman, emailFor, timeAgo } from '../utils';

export default function PersonDetail() {
    const { id } = useParams();
    const { state, currentUser, userById, isConnected, toggleConnection, inviteToGroup } = useStore();
    const person = userById(id);
    const [groupId, setGroupId] = useState('');
    const [notice, setNotice] = useState('');

    if (!person) return <p>Person not found. <Link to="/people">Back to People</Link></p>;

    const isMe = person.id === currentUser.id;
    const connected = isConnected(currentUser.id, person.id);
    const email = emailFor(person);

    // Private groups only show up here if you are in them too.
    const theirGroups = state.groups.filter(
        (g) => g.memberIds.includes(person.id) && (!g.isPrivate || g.memberIds.includes(currentUser.id))
    );
    const invitableGroups = state.groups.filter(
        (g) =>
            g.memberIds.includes(currentUser.id) &&
            g.major === person.major &&
            !g.memberIds.includes(person.id) &&
            !g.invitedIds.includes(person.id)
    );
    const materials = state.materials.filter((m) => m.authorId === person.id);
    const posts = state.posts.filter((p) => p.authorId === person.id);
    const replyCount = state.posts.reduce(
        (n, p) => n + p.replies.filter((r) => r.authorId === person.id).length,
        0
    );

    const invite = (e) => {
        e.preventDefault();
        if (!groupId) return;
        const g = state.groups.find((x) => x.id === groupId);
        inviteToGroup(groupId, person.id);
        setNotice(`Invitation to "${g?.name}" sent to ${person.name}.`);
        setGroupId('');
    };

    return (
        <>
            <BackLink to="/people">Back to People</BackLink>

            <div className="card">
                <div className="profile-head">
                    <Avatar user={person} size={72} />
                    <div className="grow">
                        <h1>{person.name} {isMe && <span className="muted small">(you)</span>}</h1>
                        <p className="muted">{person.major} · {yearLabel(person.year)}</p>
                        <div className="row gap wrap" style={{ marginTop: 6 }}>
                            {person.role === 'mentor' && <Badge tone="gold">University-paid Mentor</Badge>}
                            {!isMe && connected && <Badge tone="green">Connected</Badge>}
                        </div>
                    </div>
                    {!isMe && (
                        <div className="row gap wrap">
                            <button className={`btn ${connected ? 'btn-ghost' : 'btn-primary'}`} onClick={() => toggleConnection(person.id)}>
                                {connected ? 'Remove connection' : '+ Connect'}
                            </button>
                            <a className="btn btn-ghost" href={`mailto:${email}`}>
                                <Icon name="mail" size={16} /> Email
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <div className="card">
                <h3>Details</h3>
                <dl className="detail-list">
                    <dt>University email</dt>
                    <dd><a href={`mailto:${email}`} className="link">{email}</a></dd>

                    <dt>Major</dt>
                    <dd>{person.major}</dd>

                    <dt>Year</dt>
                    <dd>{yearLabel(person.year)}</dd>

                    <dt>Role</dt>
                    <dd>{person.role === 'mentor' ? 'University-paid peer mentor' : 'Student'}</dd>

                    <dt>Courses</dt>
                    <dd>
                        {person.courses.length === 0 ? (
                            <span className="muted">None listed</span>
                        ) : (
                            <div className="stack" style={{ gap: 4 }}>
                                {person.courses.map((c) => <span key={c}>{c}</span>)}
                            </div>
                        )}
                    </dd>

                    <dt>About</dt>
                    <dd>{person.bio || <span className="muted">No bio yet.</span>}</dd>

                    <dt>Forum activity</dt>
                    <dd>{posts.length} {posts.length === 1 ? 'post' : 'posts'} · {replyCount} {replyCount === 1 ? 'reply' : 'replies'}</dd>
                </dl>
            </div>

            {!isMe && (
                <div className="card">
                    <h3>Invite to one of your groups</h3>
                    {invitableGroups.length === 0 ? (
                        <p className="muted small">
                            No eligible groups. You can invite people to groups you belong to in their major ({person.major}), if they aren't already a member or invited.
                        </p>
                    ) : (
                        <form className="row gap" onSubmit={invite}>
                            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} style={{ flex: 1, minWidth: 0 }}>
                                <option value="">Select a group…</option>
                                {invitableGroups.map((g) => (
                                    <option key={g.id} value={g.id}>{g.name} ({g.isPrivate ? 'Private' : 'Public'})</option>
                                ))}
                            </select>
                            <button className="btn btn-primary btn-sm" type="submit" disabled={!groupId}>Invite</button>
                        </form>
                    )}
                    {notice && <p className="small success-text">{notice}</p>}
                </div>
            )}

            <div className="grid-2">
                <div className="card">
                    <h3>Study groups</h3>
                    {theirGroups.length === 0 && <p className="muted small">Not in any visible groups.</p>}
                    {theirGroups.map((g) => (
                        <Link key={g.id} to={`/groups/${g.id}`} className="list-row hover">
                            <div>
                                <b>{g.name}</b>
                                <div className="muted small">{courseCode(g.course)} · {g.memberIds.length} members · {g.isPrivate ? 'Private' : 'Public'}</div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="card">
                    <h3>Shared study materials</h3>
                    {materials.length === 0 && <p className="muted small">Nothing shared yet.</p>}
                    {materials.map((m) => (
                        <Link key={m.id} to={`/materials/${m.id}`} className="list-row hover">
                            <div>
                                <b>{m.title}</b>
                                <div className="muted small">{courseCode(m.course)} · {timeAgo(m.ts)}</div>
                            </div>
                            <Badge tone={m.type === 'quiz' ? 'blue' : m.type === 'flashcards' ? 'purple' : 'green'}>{m.type}</Badge>
                        </Link>
                    ))}
                </div>
            </div>

            {posts.length > 0 && (
                <div className="card">
                    <h3>Forum posts</h3>
                    {posts.map((p) => (
                        <Link key={p.id} to={`/forum/${p.id}`} className="list-row hover">
                            <div>
                                <b>{p.title}</b>
                                <div className="muted small">{timeAgo(p.ts)} · {p.replies.length} {p.replies.length === 1 ? 'reply' : 'replies'}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </>
    );
}