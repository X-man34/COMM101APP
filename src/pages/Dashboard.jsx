import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, Badge, PageHeader, UserChip } from '../components/ui';
import { timeAgo, courseCode, yearLabel } from '../utils';

export default function Dashboard() {
    const { state, currentUser, userById, respondToInvite, myConnections } = useStore();
    const me = currentUser;

    const myGroups = state.groups.filter((g) => g.memberIds.includes(me.id));
    const invites = state.groups.filter((g) => g.invitedIds.includes(me.id));
    const majorPosts = state.posts.filter((p) => p.major === me.major).slice(0, 4);
    const majorMaterials = state.materials.filter((m) => m.major === me.major).slice(0, 4);
    const mentors = state.users.filter((u) => u.major === me.major && u.role === 'mentor' && u.id !== me.id);
    const unanswered = state.posts.filter((p) => p.major === me.major && p.replies.length === 0);
    const connections = myConnections();

    return (
        <>
            <PageHeader
                title={`Welcome back, ${me.name.split(' ')[0]}`}
            />

            <div className="stat-row">
                <Link to="/groups" className="stat"><b>{myGroups.length}</b><span>Study groups</span></Link>
                <Link to="/forum" className="stat"><b>{state.posts.filter((p) => p.major === me.major).length}</b><span>Forum posts in your major</span></Link>
                <Link to="/materials" className="stat"><b>{state.materials.filter((m) => m.major === me.major).length}</b><span>Shared materials</span></Link>
                <Link to="/people" className="stat"><b>{connections.length}</b><span>Connections</span></Link>
            </div>

            {invites.length > 0 && (
                <div className="card highlight">
                    <h3>Group invitations</h3>
                    {invites.map((g) => (
                        <div key={g.id} className="list-row">
                            <div>
                                <b>{g.name}</b> <span className="muted">· {courseCode(g.course)}</span>
                                <div className="muted small">Invited by {userById(g.ownerId)?.name}</div>
                            </div>
                            <div className="row gap">
                                <button className="btn btn-primary btn-sm" onClick={() => respondToInvite(g.id, true)}>Accept</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => respondToInvite(g.id, false)}>Decline</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {me.role === 'mentor' && unanswered.length > 0 && (
                <div className="card highlight">
                    <h3>Mentor queue — unanswered questions in {me.major}</h3>
                    {unanswered.map((p) => (
                        <div key={p.id} className="list-row">
                            <div>
                                <Link to={`/forum/${p.id}`} className="bold">{p.title}</Link>
                                <div className="muted small">{userById(p.authorId)?.name} · {timeAgo(p.ts)}</div>
                            </div>
                            <Link to={`/forum/${p.id}`} className="btn btn-sm btn-primary">Answer</Link>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid-2">
                <div className="card">
                    <div className="card-head">
                        <h3>My study groups</h3>
                        <Link to="/groups" className="link">View all</Link>
                    </div>
                    {myGroups.length === 0 && <p className="muted">You haven't joined a group yet. <Link to="/groups">Find or create one →</Link></p>}
                    {myGroups.map((g) => (
                        <Link to={`/groups/${g.id}`} key={g.id} className="list-row hover">
                            <div>
                                <b>{g.name}</b>
                                <div className="muted small">{courseCode(g.course)} · {g.memberIds.length} members · {g.messages.length} messages</div>
                            </div>
                            <span className="muted">→</span>
                        </Link>
                    ))}
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Recent forum activity</h3>
                        <Link to="/forum" className="link">Go to forum</Link>
                    </div>
                    {majorPosts.map((p) => (
                        <Link to={`/forum/${p.id}`} key={p.id} className="list-row hover">
                            <div>
                                <b>{p.title}</b>
                                <div className="muted small">
                                    {userById(p.authorId)?.name} · {timeAgo(p.ts)} · {p.replies.length} replies
                                    {p.replies.some((r) => userById(r.authorId)?.role === 'mentor') && <> · <Badge tone="gold">Mentor answered</Badge></>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Study materials for {me.major}</h3>
                        <Link to="/materials" className="link">Browse</Link>
                    </div>
                    {majorMaterials.map((m) => (
                        <Link to={`/materials/${m.id}`} key={m.id} className="list-row hover">
                            <div>
                                <b>{m.title}</b>
                                <div className="muted small">{courseCode(m.course)} · by {userById(m.authorId)?.name}</div>
                            </div>
                            <Badge tone={m.type === 'quiz' ? 'blue' : m.type === 'flashcards' ? 'purple' : 'green'}>{m.type}</Badge>
                        </Link>
                    ))}
                </div>

                <div className="card">
                    <div className="card-head">
                        <h3>Mentors in your major</h3>
                        <Link to="/people" className="link">All people</Link>
                    </div>
                    {mentors.length === 0 && <p className="muted">No mentors listed yet.</p>}
                    {mentors.map((u) => (
                        <div key={u.id} className="list-row">
                            <UserChip user={u} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}