import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { COURSES } from '../data/seed';
import { Avatar, Badge, EmptyState, PageHeader, ScopeToggle, useScope } from '../components/ui';
import { timeAgo, courseCode, isUpperclassman } from '../utils';

export default function Forum() {
    const { state, currentUser, userById, createPost } = useStore();
    const navigate = useNavigate();
    const [scope, setScope] = useScope();
    const [course, setCourse] = useState('');
    const [filter, setFilter] = useState('all'); // all | unanswered | mentor
    const [showForm, setShowForm] = useState(false);
    const courses = COURSES[currentUser.major] || [];
    const [form, setForm] = useState({ title: '', body: '', course: '' });

    const posts = state.posts.filter((p) => {
        if (scope === 'major' && p.major !== currentUser.major) return false;
        if (course && p.course !== course) return false;
        const mentorAnswered = p.replies.some((r) => userById(r.authorId)?.role === 'mentor');
        if (filter === 'unanswered' && p.replies.length > 0) return false;
        if (filter === 'mentor' && !mentorAnswered) return false;
        return true;
    });

    const submit = (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.body.trim()) return;
        const id = createPost({ ...form, major: currentUser.major });
        navigate(`/forum/${id}`);
    };

    return (
        <>
            <PageHeader
                title="Forum"
                subtitle="Ask questions, get answers from upperclassmen and university-paid mentors in your major."
                actions={
                    <>
                        <Link to="/materials" className="btn btn-ghost">Study materials</Link>
                        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>{showForm ? 'Cancel' : '+ Ask a question'}</button>
                    </>
                }
            />

            {showForm && (
                <form className="card form" onSubmit={submit}>
                    <h3>New post</h3>
                    <label>
                        Title
                        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What's your question?" required />
                    </label>
                    <label>
                        Related course (optional)
                        <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
                            <option value="">General / {currentUser.major}</option>
                            {courses.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </label>
                    <label>
                        Details
                        <textarea rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Give some context so mentors can help." required />
                    </label>
                    <button className="btn btn-primary" type="submit">Post</button>
                </form>
            )}

            <div className="toolbar">
                <ScopeToggle scope={scope} setScope={setScope} major={currentUser.major} />
                <select value={course} onChange={(e) => setCourse(e.target.value)}>
                    <option value="">All courses</option>
                    {courses.map((c) => <option key={c}>{c}</option>)}
                </select>
                <div className="segmented">
                    <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All</button>
                    <button className={filter === 'unanswered' ? 'active' : ''} onClick={() => setFilter('unanswered')}>Unanswered</button>
                    <button className={filter === 'mentor' ? 'active' : ''} onClick={() => setFilter('mentor')}>Mentor answered</button>
                </div>
            </div>

            {posts.length === 0 ? (
                <EmptyState title="No posts match" hint="Try widening the scope or be the first to ask!" />
            ) : (
                <div className="stack">
                    {posts.map((p) => {
                        const author = userById(p.authorId);
                        const mentorAnswered = p.replies.some((r) => userById(r.authorId)?.role === 'mentor');
                        return (
                            <Link to={`/forum/${p.id}`} key={p.id} className="card post-row hover">
                                <Avatar user={author} size={40} />
                                <div className="grow">
                                    <div className="row gap wrap">
                                        <b className="big-link">{p.title}</b>
                                        {p.course && <Badge tone="blue">{courseCode(p.course)}</Badge>}
                                        {mentorAnswered && <Badge tone="gold">Mentor answered</Badge>}
                                        {p.replies.length === 0 && <Badge tone="red">Needs an answer</Badge>}
                                    </div>
                                    <p className="muted clamp">{p.body}</p>
                                    <div className="muted small">
                                        {author?.name} {author && !isUpperclassman(author) && '(underclassman)'} · {p.major} · {timeAgo(p.ts)} · {p.replies.length} {p.replies.length === 1 ? 'reply' : 'replies'}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}