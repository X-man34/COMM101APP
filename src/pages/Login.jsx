import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/store';
import { MAJORS } from '../data/seed';
import { Avatar, Badge, BrandMark } from '../components/ui';
import { yearLabel } from '../utils';

export default function Login() {
    const { state, login, register } = useStore();
    const navigate = useNavigate();
    const [mode, setMode] = useState('pick');
    const [form, setForm] = useState({ name: '', major: MAJORS[0], year: 1, role: 'student', bio: '' });

    const byMajor = MAJORS.map((m) => ({ major: m, users: state.users.filter((u) => u.major === m) }));

    const pick = (id) => {
        login(id);
        navigate('/');
    };

    const submit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        register({ ...form, year: Number(form.year), name: form.name.trim() });
        navigate('/');
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="brand">
                    <BrandMark size={48} />
                    <div>
                        <div className="brand-name big">Bronco Bridge</div>
                        <div className="muted">Boise State University · Study groups · Resources · Mentorship</div>
                    </div>
                </div>

                <div className="segmented" style={{ margin: '20px 0' }}>
                    <button className={mode === 'pick' ? 'active' : ''} onClick={() => setMode('pick')}>
                        Sign in as a demo user
                    </button>
                    <button className={mode === 'new' ? 'active' : ''} onClick={() => setMode('new')}>
                        Create an account
                    </button>
                </div>

                {mode === 'pick' ? (
                    <div className="login-users">
                        {byMajor.map(({ major, users }) => (
                            <div key={major}>
                                <h4 className="muted">{major}</h4>
                                <div className="login-grid">
                                    {users.map((u) => (
                                        <button key={u.id} className="user-tile" onClick={() => pick(u.id)}>
                                            <Avatar user={u} size={36} />
                                            <div>
                                                <div className="bold">{u.name}</div>
                                                <div className="muted small">
                                                    {yearLabel(u.year)} {u.role === 'mentor' && <Badge tone="gold">Mentor</Badge>}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <form className="form" onSubmit={submit}>
                        <label>
                            Full name
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Alex Rivera" required />
                        </label>
                        <label>
                            Major
                            <select value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })}>
                                {MAJORS.map((m) => <option key={m}>{m}</option>)}
                            </select>
                        </label>
                        <div className="row gap">
                            <label style={{ flex: 1 }}>
                                Year
                                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                                    {[1, 2, 3, 4].map((y) => <option key={y} value={y}>{yearLabel(y)}</option>)}
                                </select>
                            </label>
                            <label style={{ flex: 1 }}>
                                Role
                                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                                    <option value="student">Student</option>
                                    <option value="mentor">University-paid Mentor</option>
                                </select>
                            </label>
                        </div>
                        <label>
                            Short bio
                            <textarea rows={2} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="What are you studying / interested in?" />
                        </label>
                        <button className="btn btn-primary" type="submit">Create account and sign in</button>
                        <p className="muted small">Your account is stored only in this browser.</p>
                    </form>
                )}
            </div>
        </div>
    );
}