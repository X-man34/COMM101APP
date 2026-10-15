import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, BackLink, Badge, NotSupportedButton, UserChip } from '../components/ui';
import { timeAgo, courseCode } from '../utils';

export default function GroupDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { state, currentUser, userById, inviteToGroup, respondToInvite, sendMessage, joinGroup, leaveGroup } = useStore();
    const group = state.groups.find((g) => g.id === id);
    const [text, setText] = useState('');
    const [inviteId, setInviteId] = useState('');
    const logRef = useRef(null);

    useEffect(() => {
        // Scroll only the chat box, not the whole page.
        if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, [group?.messages.length]);

    if (!group) return <p>Group not found. <Link to="/groups">Back to groups</Link></p>;

    const isMember = group.memberIds.includes(currentUser.id);
    const isOwner = group.ownerId === currentUser.id;
    const isInvited = !isMember && group.invitedIds.includes(currentUser.id);
    const canSeeMembers = isMember || isInvited || !group.isPrivate;
    const invitable = state.users.filter(
        (u) => u.major === group.major && !group.memberIds.includes(u.id) && !group.invitedIds.includes(u.id)
    );

    const send = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        sendMessage(group.id, text.trim());
        setText('');
    };

    const invite = (e) => {
        e.preventDefault();
        if (!inviteId) return;
        inviteToGroup(group.id, inviteId);
        setInviteId('');
    };

    let lockedMessage = 'Join this group to view and send messages.';
    if (isInvited) lockedMessage = 'You have been invited to this group. Accept the invitation to see the chat.';
    else if (group.isPrivate) lockedMessage = 'This is a private, invite-only group. Ask a member to invite you.';

    return (
        <>
            <BackLink to="/groups">All groups</BackLink>
            <div className="page-header">
                <div>
                    <h1>
                        {group.name} <Badge tone="blue">{courseCode(group.course)}</Badge>{' '}
                        <Badge>{group.isPrivate ? 'Private' : 'Public'}</Badge>
                    </h1>
                    <p className="muted">{group.description}</p>
                    <p className="muted small">{group.major} · created by {userById(group.ownerId)?.name} · {timeAgo(group.createdAt)}</p>
                </div>
                <div className="actions">
                    {isMember && !isOwner && (
                        <button className="btn btn-ghost danger" onClick={() => { leaveGroup(group.id); navigate('/groups'); }}>Leave group</button>
                    )}
                    {isInvited && (
                        <>
                            <button className="btn btn-primary" onClick={() => respondToInvite(group.id, true)}>Accept invitation</button>
                            <button className="btn btn-ghost" onClick={() => { respondToInvite(group.id, false); navigate('/groups'); }}>Decline</button>
                        </>
                    )}
                    {!isMember && !isInvited && !group.isPrivate && (
                        <button className="btn btn-primary" onClick={() => joinGroup(group.id)}>Join group</button>
                    )}
                </div>
            </div>

            <div className="group-layout">
                <div className={`card chat ${isMember ? '' : 'chat-locked'}`}>
                    <h3>Group chat</h3>
                    {!isMember ? (
                        <p className="muted">{lockedMessage}</p>
                    ) : (
                        <>
                            <div className="chat-log" ref={logRef}>
                                {group.messages.length === 0 && <p className="muted center">No messages yet. Say hi!</p>}
                                {group.messages.map((m) => {
                                    const u = userById(m.userId);
                                    const mine = m.userId === currentUser.id;
                                    return (
                                        <div key={m.id} className={`msg ${mine ? 'mine' : ''}`}>
                                            {!mine && <Avatar user={u} size={28} />}
                                            <div>
                                                <div className="msg-meta">
                                                    {!mine && <b>{u?.name}</b>} {u?.role === 'mentor' && !mine && <Badge tone="gold">Mentor</Badge>}
                                                    <span className="muted small"> {timeAgo(m.ts)}</span>
                                                </div>
                                                <div className="bubble">{m.text}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <form className="chat-input" onSubmit={send}>
                                <NotSupportedButton icon="paperclip" label="Attach a file" />
                                <NotSupportedButton icon="image" label="Attach a photo" />
                                <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
                                <button className="btn btn-primary" type="submit">Send</button>
                            </form>
                        </>
                    )}
                </div>

                <div className="stack">
                    <div className="card">
                        <h3>Members ({group.memberIds.length})</h3>
                        {canSeeMembers ? (
                            group.memberIds.map((mid) => (
                                <div key={mid} className="list-row">
                                    <UserChip user={userById(mid)} />
                                    {mid === group.ownerId && <Badge>Owner</Badge>}
                                </div>
                            ))
                        ) : (
                            <p className="muted small">The member list is only visible to members of this private group.</p>
                        )}
                    </div>

                    {isMember && (
                        <div className="card">
                            <h3>Invite classmates</h3>
                            <p className="muted small">
                                Only people in {group.major} can be invited.
                                {group.isPrivate && ' This group is private, so an invitation is the only way in.'}
                            </p>
                            <form className="row gap" onSubmit={invite}>
                                <select value={inviteId} onChange={(e) => setInviteId(e.target.value)} style={{ flex: 1, minWidth: 0 }}>
                                    <option value="">Select a person…</option>
                                    {invitable.map((u) => (
                                        <option key={u.id} value={u.id}>{u.name}{u.role === 'mentor' ? ' (Mentor)' : ''}</option>
                                    ))}
                                </select>
                                <button className="btn btn-primary btn-sm" type="submit" disabled={!inviteId}>Invite</button>
                            </form>
                            {group.invitedIds.length > 0 && (
                                <>
                                    <h4 className="muted" style={{ marginTop: 12 }}>Pending invites</h4>
                                    {group.invitedIds.map((uid) => (
                                        <div key={uid} className="list-row">
                                            <UserChip user={userById(uid)} showYear={false} />
                                            <Badge>Pending</Badge>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}