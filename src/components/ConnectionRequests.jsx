import { useStore } from '../store/store';
import { UserChip } from './ui';
import { timeAgo } from '../utils';

// Card listing people who have asked to connect with you. Renders nothing if there are none.
export default function ConnectionRequests() {
    const { incomingRequests, userById, respondToConnectionRequest } = useStore();
    const incoming = incomingRequests();
    if (incoming.length === 0) return null;

    return (
        <div className="card highlight">
            <h3>Connection requests ({incoming.length})</h3>
            {incoming.map((r) => {
                const u = userById(r.from);
                if (!u) return null;
                return (
                    <div key={r.from} className="list-row">
                        <div>
                            <UserChip user={u} />
                            <div className="muted small">{u.major} · sent {timeAgo(r.ts)}</div>
                        </div>
                        <div className="row gap">
                            <button className="btn btn-primary btn-sm" onClick={() => respondToConnectionRequest(r.from, true)}>Accept</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => respondToConnectionRequest(r.from, false)}>Decline</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}