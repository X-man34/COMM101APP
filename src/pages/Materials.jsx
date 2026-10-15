import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store/store';
import { COURSES } from '../data/seed';
import { Badge, EmptyState, PageHeader, ScopeToggle, useScope } from '../components/ui';
import { timeAgo, courseCode } from '../utils';

const TYPE_META = {
    quiz: { icon: '❓', tone: 'blue', label: 'Quiz' },
    flashcards: { icon: '🃏', tone: 'purple', label: 'Flashcards' },
    notes: { icon: '📝', tone: 'green', label: 'Notes' },
};

export default function Materials() {
    const { state, currentUser, userById } = useStore();
    const [scope, setScope] = useScope();
    const [type, setType] = useState('');
    const [course, setCourse] = useState('');
    const courses = COURSES[currentUser.major] || [];

    const items = state.materials.filter((m) => {
        if (scope === 'major' && m.major !== currentUser.major) return false;
        if (type && m.type !== type) return false;
        if (course && m.course !== course) return false;
        return true;
    });

    const summary = (m) => {
        if (m.type === 'quiz') return `${m.content.questions.length} questions`;
        if (m.type === 'flashcards') return `${m.content.cards.length} cards`;
        return `${m.content.body.split(/\s+/).length} words`;
    };

    return (
        <>
            <PageHeader
                title="Study Materials"
                subtitle="Quizzes, flashcards and notes shared by students and mentors in your classes."
                actions={<Link to="/materials/new" className="btn btn-primary">+ Create material</Link>}
            />

            <div className="toolbar">
                <ScopeToggle scope={scope} setScope={setScope} major={currentUser.major} />
                <div className="segmented">
                    <button className={type === '' ? 'active' : ''} onClick={() => setType('')}>All types</button>
                    {Object.entries(TYPE_META).map(([k, v]) => (
                        <button key={k} className={type === k ? 'active' : ''} onClick={() => setType(k)}>{v.icon} {v.label}</button>
                    ))}
                </div>
                <select value={course} onChange={(e) => setCourse(e.target.value)}>
                    <option value="">All courses</option>
                    {courses.map((c) => <option key={c}>{c}</option>)}
                </select>
            </div>

            {items.length === 0 ? (
                <EmptyState title="No materials yet" hint="Be the first to share something for this class.">
                    <Link to="/materials/new" className="btn btn-primary btn-sm">Create one</Link>
                </EmptyState>
            ) : (
                <div className="grid-3">
                    {items.map((m) => {
                        const meta = TYPE_META[m.type];
                        const author = userById(m.authorId);
                        return (
                            <Link key={m.id} to={`/materials/${m.id}`} className="card material-card hover">
                                <div className="row between">
                                    <span className="material-icon">{meta.icon}</span>
                                    <Badge tone={meta.tone}>{meta.label}</Badge>
                                </div>
                                <b className="big-link">{m.title}</b>
                                <div className="muted small">{courseCode(m.course)} · {summary(m)}</div>
                                <div className="muted small" style={{ marginTop: 'auto' }}>
                                    by {author?.name} {author?.role === 'mentor' && <Badge tone="gold">Mentor</Badge>} · {timeAgo(m.ts)}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </>
    );
}