import { useStore } from '../store/store';
import { Badge } from './ui';

// Shows the right control for the connection state between you and `user`.
// Renders one or two inline elements, so put it inside a `row gap wrap`.
export default function ConnectButton({ user, small = true, allowRemove = false }) {
    const {
        currentUser,
        connectionStatus,
        requestConnection,
        cancelConnectionRequest,
        respondToConnectionRequest,
        removeConnection,
    } = useStore();

    if (!user || user.id === currentUser.id) return null;
    const status = connectionStatus(user.id);
    const sz = small ? 'btn-sm' : '';

    if (status === 'connected') {
        return allowRemove ? (
            <button className={`btn btn-ghost ${sz}`} onClick={() => removeConnection(user.id)}>Remove connection</button>
        ) : (
            <Badge tone="green">Connected</Badge>
        );
    }

    if (status === 'outgoing') {
        return (
            <>
                <Badge>Request sent</Badge>
                <button className={`btn btn-ghost ${sz}`} onClick={() => cancelConnectionRequest(user.id)}>Cancel request</button>
            </>
        );
    }

    if (status === 'incoming') {
        return (
            <>
                <button className={`btn btn-primary ${sz}`} onClick={() => respondToConnectionRequest(user.id, true)}>Accept</button>
                <button className={`btn btn-ghost ${sz}`} onClick={() => respondToConnectionRequest(user.id, false)}>Decline</button>
            </>
        );
    }

    return (
        <button className={`btn btn-primary ${sz}`} onClick={() => requestConnection(user.id)}>+ Connect</button>
    );
}