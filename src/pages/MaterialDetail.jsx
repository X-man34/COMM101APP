import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useStore } from '../store/store';
import { Avatar, BackLink, Badge, Icon } from '../components/ui';
import { timeAgo, yearLabel } from '../utils';

function QuizPlayer({ questions }) {
    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const score = questions.filter((q, i) => answers[i] === q.answer).length;

    return (
        <div className="stack">
            {questions.map((q, i) => (
                <div key={i} className="card subtle">
                    <b className="prewrap">{i + 1}. {q.q}</b>
                    <div className="stack" style={{ marginTop: 10 }}>
                        {q.options.map((o, k) => {
                            let cls = 'quiz-option';
                            if (submitted) {
                                if (k === q.answer) cls += ' correct';
                                else if (answers[i] === k) cls += ' wrong';
                            } else if (answers[i] === k) cls += ' selected';
                            return (
                                <label key={k} className={cls}>
                                    <input type="radio" name={`q${i}`} disabled={submitted} checked={answers[i] === k} onChange={() => setAnswers({ ...answers, [i]: k })} />
                                    {o}
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
            {!submitted ? (
                <button className="btn btn-primary" disabled={Object.keys(answers).length < questions.length} onClick={() => setSubmitted(true)}>
                    Submit answers
                </button>
            ) : (
                <div className="card highlight center">
                    <h2>You scored {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)</h2>
                    <button className="btn btn-ghost" onClick={() => { setAnswers({}); setSubmitted(false); }}>Retake quiz</button>
                </div>
            )}
        </div>
    );
}

function FlashcardPlayer({ cards }) {
    const [i, setI] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const go = (d) => { setI((i + d + cards.length) % cards.length); setFlipped(false); };

    return (
        <div className="center stack">
            <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(!flipped)}>
                <div className="flashcard-face">
                    <span className="muted small">{flipped ? 'BACK' : 'FRONT'} · click to flip</span>
                    <p>{flipped ? cards[i].back : cards[i].front}</p>
                </div>
            </div>
            <div className="row gap center">
                <button className="btn btn-ghost" onClick={() => go(-1)}>Previous</button>
                <span className="muted">{i + 1} / {cards.length}</span>
                <button className="btn btn-ghost" onClick={() => go(1)}>Next</button>
            </div>
            <details style={{ width: '100%' }}>
                <summary className="muted">Show all cards as a list</summary>
                <table className="table">
                    <thead><tr><th>Front</th><th>Back</th></tr></thead>
                    <tbody>{cards.map((c, k) => <tr key={k}><td>{c.front}</td><td>{c.back}</td></tr>)}</tbody>
                </table>
            </details>
        </div>
    );
}

function Attachment({ file }) {
    const url = `${import.meta.env.BASE_URL}${file.path}`;
    return (
        <div className="card">
            <div className="row between wrap gap">
                <div className="row gap">
                    <Icon name="file" size={26} />
                    <div>
                        <b>{file.name}</b>
                        <div className="muted small">{file.meta}</div>
                    </div>
                </div>
                <div className="row gap">
                    <a className="btn btn-primary btn-sm" href={url} target="_blank" rel="noreferrer">Open PDF</a>
                    <a className="btn btn-ghost btn-sm" href={url} download={file.name}>Download</a>
                </div>
            </div>
            <object className="pdf-preview" data={url} type="application/pdf" aria-label={`Preview of ${file.name}`}>
                <p className="muted small">An inline preview isn't available in this browser. Use "Open PDF" instead.</p>
            </object>
        </div>
    );
}

export default function MaterialDetail() {
    const { id } = useParams();
    const { state, userById } = useStore();
    const m = state.materials.find((x) => x.id === id);
    if (!m) return <p>Material not found. <Link to="/materials">Back to materials</Link></p>;
    const author = userById(m.authorId);
    const tone = m.type === 'quiz' ? 'blue' : m.type === 'flashcards' ? 'purple' : 'green';

    return (
        <>
            <BackLink to="/materials">Back to materials</BackLink>
            <div className="page-header">
                <div>
                    <h1>{m.title} <Badge tone={tone}>{m.type}</Badge></h1>
                    <p className="muted">{m.course} · {m.major}</p>
                    <div className="row gap small" style={{ marginTop: 6 }}>
                        <Avatar user={author} size={26} />
                        <span>
                            by <Link to={`/people/${author?.id}`} className="chip-name bold">{author?.name}</Link> · {yearLabel(author?.year)}{' '}
                            {author?.role === 'mentor' && <Badge tone="gold">Mentor</Badge>} · {timeAgo(m.ts)}
                        </span>
                    </div>
                </div>
            </div>

            {m.type === 'quiz' && <QuizPlayer questions={m.content.questions} />}
            {m.type === 'flashcards' && <FlashcardPlayer cards={m.content.cards} />}
            {m.type === 'notes' && (
                <>
                    <div className="card">
                        <pre className="notes">{m.content.body}</pre>
                    </div>
                    {m.content.attachment && <Attachment file={m.content.attachment} />}
                </>
            )}
        </>
    );
}