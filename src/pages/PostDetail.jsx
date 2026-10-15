import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, BackLink, Badge } from '../components/ui';
import { timeAgo, courseCode, yearLabel } from '../utils';

const TYPE_LABEL = { quiz: 'Quiz', flashcards: 'Flashcards', notes: 'Notes' };

export default function PostDetail() {
    const { id } = useParams();
    const { state, currentUser, userById, replyToPost } = useStore();
    const post = state.posts.find((p) => p.id === id);
    const [text, setText] = useState('');

    if (!post) return <p>Post not found. <Link to="/forum">Back to forum</Link></p>;

    const author = userById(post.authorId);
    const relatedMaterials = state.materials.filter((m) => post.course && m.course === post.course);

    const submit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        replyToPost(post.id, text.trim());
        setText('');
    };

    return (
        <>
            <BackLink to="/forum">Back to forum</BackLink>
            <div className="card">
                <div className="row gap wrap">
                    <h1 style={{ margin: 0 }}>{post.title}</h1>
                    {post.course && <Badge tone="blue">{courseCode(post.course)}</Badge>}
                </div>
                <div className="row gap" style={{ margin: '10px 0' }}>
                    <Avatar user={author} size={32} />
                    <div className="small">
                        <Link to={`/people/${author?.id}`} className="chip-name bold">{author?.name}</Link> · {yearLabel(author?.year)} · {post.major}
                        <div className="muted">{timeAgo(post.ts)}</div>
                    </div>
                </div>
                <p className="prewrap">{post.body}</p>
            </div>

            {relatedMaterials.length > 0 && (
                <div className="card subtle">
                    <b>Related study materials for {courseCode(post.course)}</b>
                    <div className="row gap wrap" style={{ marginTop: 8 }}>
                        {relatedMaterials.map((m) => (
                            <Link key={m.id} to={`/materials/${m.id}`} className="btn btn-ghost btn-sm">
                                {TYPE_LABEL[m.type]}: {m.title}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <h2>{post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}</h2>
            <div className="stack">
                {post.replies.length === 0 && (
                    <p className="muted">
                        No replies yet. {currentUser.role === 'mentor' ? 'As a mentor, you can be the first to help!' : 'A mentor will hopefully jump in soon.'}
                    </p>
                )}
                {post.replies.map((r) => {
                    const u = userById(r.authorId);
                    const mentor = u?.role === 'mentor';
                    return (
                        <div key={r.id} className={`card reply ${mentor ? 'mentor-reply' : ''}`}>
                            <div className="row gap">
                                <Avatar user={u} size={32} />
                                <div className="small">
                                    <Link to={`/people/${u?.id}`} className="chip-name bold">{u?.name}</Link>{' '}
                                    {mentor && <Badge tone="gold">University-paid Mentor</Badge>}{' '}
                                    <span className="muted">· {yearLabel(u?.year)}</span>
                                    <div className="muted">{timeAgo(r.ts)}</div>
                                </div>
                            </div>
                            <p className="prewrap" style={{ marginTop: 8 }}>{r.text}</p>
                        </div>
                    );
                })}
            </div>

            <form className="card form" onSubmit={submit} style={{ marginTop: 16 }}>
                <h3>Write a reply {currentUser.role === 'mentor' && <Badge tone="gold">Replying as Mentor</Badge>}</h3>
                <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your answer or experience…" />
                <button className="btn btn-primary" type="submit" disabled={!text.trim()}>Post reply</button>
            </form>
        </>
    );
}