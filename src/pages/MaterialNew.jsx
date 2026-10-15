import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { COURSES } from '../data/seed';
import { PageHeader } from '../components/ui';

const blankQuestion = () => ({ q: '', options: ['', '', '', ''], answer: 0 });
const blankCard = () => ({ front: '', back: '' });

export default function MaterialNew() {
    const { currentUser, createMaterial } = useStore();
    const navigate = useNavigate();
    const courses = COURSES[currentUser.major] || [];

    const [type, setType] = useState('quiz');
    const [title, setTitle] = useState('');
    const [course, setCourse] = useState(courses[0] || '');
    const [questions, setQuestions] = useState([blankQuestion()]);
    const [cards, setCards] = useState([blankCard(), blankCard()]);
    const [body, setBody] = useState('');

    const updateQ = (i, patch) => setQuestions((qs) => qs.map((q, j) => (j === i ? { ...q, ...patch } : q)));
    const updateOpt = (i, k, v) => updateQ(i, { options: questions[i].options.map((o, j) => (j === k ? v : o)) });
    const updateCard = (i, patch) => setCards((cs) => cs.map((c, j) => (j === i ? { ...c, ...patch } : c)));

    const valid = () => {
        if (!title.trim()) return false;
        if (type === 'quiz') return questions.every((q) => q.q.trim() && q.options.every((o) => o.trim()));
        if (type === 'flashcards') return cards.every((c) => c.front.trim() && c.back.trim());
        return body.trim().length > 0;
    };

    const submit = (e) => {
        e.preventDefault();
        if (!valid()) return;
        const content =
            type === 'quiz' ? { questions } : type === 'flashcards' ? { cards } : { body };
        const id = createMaterial({ type, title: title.trim(), course, major: currentUser.major, content });
        navigate(`/materials/${id}`);
    };

    return (
        <>
            <Link to="/materials" className="link">← Back to materials</Link>
            <PageHeader title="Create study material" subtitle={`Shared with students in ${currentUser.major} who take the same class.`} />

            <form className="card form" onSubmit={submit}>
                <div className="segmented">
                    <button type="button" className={type === 'quiz' ? 'active' : ''} onClick={() => setType('quiz')}>❓ Quiz</button>
                    <button type="button" className={type === 'flashcards' ? 'active' : ''} onClick={() => setType('flashcards')}>🃏 Flashcards</button>
                    <button type="button" className={type === 'notes' ? 'active' : ''} onClick={() => setType('notes')}>📝 Notes</button>
                </div>

                <label>
                    Title
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Chapter 4 Review" required />
                </label>
                <label>
                    Course
                    <select value={course} onChange={(e) => setCourse(e.target.value)}>
                        {courses.map((c) => <option key={c}>{c}</option>)}
                    </select>
                </label>

                {type === 'quiz' && (
                    <div className="stack">
                        {questions.map((q, i) => (
                            <div key={i} className="card subtle">
                                <div className="row between">
                                    <b>Question {i + 1}</b>
                                    {questions.length > 1 && (
                                        <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => setQuestions(questions.filter((_, j) => j !== i))}>Remove</button>
                                    )}
                                </div>
                                <textarea rows={2} value={q.q} onChange={(e) => updateQ(i, { q: e.target.value })} placeholder="Question text" />
                                <div className="grid-2" style={{ marginTop: 8 }}>
                                    {q.options.map((o, k) => (
                                        <label key={k} className="option-input">
                                            <input type="radio" name={`answer-${i}`} checked={q.answer === k} onChange={() => updateQ(i, { answer: k })} title="Mark as correct" />
                                            <input value={o} onChange={(e) => updateOpt(i, k, e.target.value)} placeholder={`Option ${k + 1}`} />
                                        </label>
                                    ))}
                                </div>
                                <p className="muted small">Select the radio next to the correct answer.</p>
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost" onClick={() => setQuestions([...questions, blankQuestion()])}>+ Add question</button>
                    </div>
                )}

                {type === 'flashcards' && (
                    <div className="stack">
                        {cards.map((c, i) => (
                            <div key={i} className="row gap card-row">
                                <span className="muted small" style={{ width: 24 }}>{i + 1}</span>
                                <input value={c.front} onChange={(e) => updateCard(i, { front: e.target.value })} placeholder="Front (term / question)" />
                                <input value={c.back} onChange={(e) => updateCard(i, { back: e.target.value })} placeholder="Back (definition / answer)" />
                                {cards.length > 1 && (
                                    <button type="button" className="btn btn-ghost btn-sm danger" onClick={() => setCards(cards.filter((_, j) => j !== i))}>✕</button>
                                )}
                            </div>
                        ))}
                        <button type="button" className="btn btn-ghost" onClick={() => setCards([...cards, blankCard()])}>+ Add card</button>
                    </div>
                )}

                {type === 'notes' && (
                    <label>
                        Notes
                        <textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write or paste your notes here. Line breaks are preserved." />
                    </label>
                )}

                <div className="row gap">
                    <button className="btn btn-primary" type="submit" disabled={!valid()}>Publish</button>
                    <Link to="/materials" className="btn btn-ghost">Cancel</Link>
                </div>
            </form>
        </>
    );
}