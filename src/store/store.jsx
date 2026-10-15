import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { seedState } from '../data/seed';
import { uid, makeEmail } from '../utils';

const STORAGE_KEY = 'broncobridge-demo-v2';
const OLD_KEYS = ['campusconnect-demo-v1', 'broncobridge-demo-v1'];

function load() {
    try {
        OLD_KEYS.forEach((k) => localStorage.removeItem(k));
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {
        console.warn('Could not read saved state, reseeding.', e);
    }
    return seedState();
}

function updateById(list, id, updater) {
    return list.map((item) => (item.id === id ? updater(item) : item));
}

const samePair = ([x, y], a, b) => (x === a && y === b) || (x === b && y === a);
const isRequest = (r, from, to) => r.from === from && r.to === to;

function reducer(state, action) {
    switch (action.type) {
        case 'LOGIN':
            return { ...state, currentUserId: action.userId };
        case 'LOGOUT':
            return { ...state, currentUserId: null };
        case 'REGISTER':
            return { ...state, users: [...state.users, action.user], currentUserId: action.user.id };
        case 'ADD_GROUP':
            return { ...state, groups: [action.group, ...state.groups] };
        case 'UPDATE_GROUP':
            return { ...state, groups: updateById(state.groups, action.id, action.updater) };
        case 'ADD_POST':
            return { ...state, posts: [action.post, ...state.posts] };
        case 'UPDATE_POST':
            return { ...state, posts: updateById(state.posts, action.id, action.updater) };
        case 'ADD_MATERIAL':
            return { ...state, materials: [action.material, ...state.materials] };

        // ---- Connections: request -> accept/decline ----
        case 'REQUEST_CONNECTION': {
            const { from, to, ts } = action;
            const requests = state.connectionRequests || [];
            if (from === to) return state;
            if (state.connections.some((c) => samePair(c, from, to))) return state;
            // They already asked me, so my request counts as accepting theirs.
            if (requests.some((r) => isRequest(r, to, from))) {
                return {
                    ...state,
                    connections: [...state.connections, [to, from]],
                    connectionRequests: requests.filter((r) => !isRequest(r, to, from)),
                };
            }
            if (requests.some((r) => isRequest(r, from, to))) return state;
            return { ...state, connectionRequests: [...requests, { from, to, ts }] };
        }
        case 'CANCEL_REQUEST': {
            const requests = state.connectionRequests || [];
            return { ...state, connectionRequests: requests.filter((r) => !isRequest(r, action.from, action.to)) };
        }
        case 'RESPOND_REQUEST': {
            const { from, to, accept } = action;
            const requests = state.connectionRequests || [];
            if (!requests.some((r) => isRequest(r, from, to))) return state;
            const already = state.connections.some((c) => samePair(c, from, to));
            return {
                ...state,
                connectionRequests: requests.filter((r) => !isRequest(r, from, to)),
                connections: accept && !already ? [...state.connections, [from, to]] : state.connections,
            };
        }
        case 'REMOVE_CONNECTION': {
            const [a, b] = action.pair;
            return { ...state, connections: state.connections.filter((c) => !samePair(c, a, b)) };
        }

        case 'RESET':
            return seedState();
        default:
            return state;
    }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, null, load);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const api = useMemo(() => {
        const me = () => state.currentUserId;
        const iAmMentor = () => state.users.find((u) => u.id === state.currentUserId)?.role === 'mentor';
        return {
            login: (userId) => dispatch({ type: 'LOGIN', userId }),
            logout: () => dispatch({ type: 'LOGOUT' }),
            register: ({ name, major, year, role, bio }) =>
                dispatch({
                    type: 'REGISTER',
                    user: { id: uid(), name, major, year, role, bio: bio || '', courses: [], email: makeEmail(name) },
                }),
            resetDemo: () => dispatch({ type: 'RESET' }),

            // ---- Study groups ----
            createGroup: ({ name, course, description, major, isPrivate = false, inviteIds = [] }) => {
                const group = {
                    id: uid(),
                    name,
                    course,
                    major,
                    description,
                    isPrivate,
                    ownerId: me(),
                    memberIds: [me()],
                    invitedIds: inviteIds.filter((id) => id !== me()),
                    createdAt: Date.now(),
                    messages: [],
                };
                dispatch({ type: 'ADD_GROUP', group });
                return group.id;
            },
            inviteToGroup: (groupId, userId) =>
                dispatch({
                    type: 'UPDATE_GROUP',
                    id: groupId,
                    updater: (g) =>
                        g.invitedIds.includes(userId) || g.memberIds.includes(userId)
                            ? g
                            : { ...g, invitedIds: [...g.invitedIds, userId] },
                }),
            respondToInvite: (groupId, accept) =>
                dispatch({
                    type: 'UPDATE_GROUP',
                    id: groupId,
                    updater: (g) => ({
                        ...g,
                        invitedIds: g.invitedIds.filter((id) => id !== me()),
                        memberIds: accept && !g.memberIds.includes(me()) ? [...g.memberIds, me()] : g.memberIds,
                    }),
                }),
            joinGroup: (groupId) =>
                dispatch({
                    type: 'UPDATE_GROUP',
                    id: groupId,
                    updater: (g) => {
                        if (g.memberIds.includes(me())) return g;
                        // Private groups are invite-only, except for university-paid mentors.
                        if (g.isPrivate && !g.invitedIds.includes(me()) && !iAmMentor()) return g;
                        return {
                            ...g,
                            memberIds: [...g.memberIds, me()],
                            invitedIds: g.invitedIds.filter((id) => id !== me()),
                        };
                    },
                }),
            leaveGroup: (groupId) =>
                dispatch({
                    type: 'UPDATE_GROUP',
                    id: groupId,
                    updater: (g) => ({ ...g, memberIds: g.memberIds.filter((id) => id !== me()) }),
                }),
            sendMessage: (groupId, text) =>
                dispatch({
                    type: 'UPDATE_GROUP',
                    id: groupId,
                    updater: (g) => ({
                        ...g,
                        messages: [...g.messages, { id: uid(), userId: me(), text, ts: Date.now() }],
                    }),
                }),

            // ---- Forum ----
            createPost: ({ title, body, course, major }) => {
                const post = { id: uid(), authorId: me(), title, body, course, major, ts: Date.now(), replies: [] };
                dispatch({ type: 'ADD_POST', post });
                return post.id;
            },
            replyToPost: (postId, text) =>
                dispatch({
                    type: 'UPDATE_POST',
                    id: postId,
                    updater: (p) => ({
                        ...p,
                        replies: [...p.replies, { id: uid(), authorId: me(), text, ts: Date.now() }],
                    }),
                }),

            // ---- Materials ----
            createMaterial: ({ type, title, course, major, content }) => {
                const material = { id: uid(), type, title, course, major, authorId: me(), ts: Date.now(), content };
                dispatch({ type: 'ADD_MATERIAL', material });
                return material.id;
            },

            // ---- People ----
            requestConnection: (otherId) =>
                dispatch({ type: 'REQUEST_CONNECTION', from: me(), to: otherId, ts: Date.now() }),
            cancelConnectionRequest: (otherId) =>
                dispatch({ type: 'CANCEL_REQUEST', from: me(), to: otherId }),
            respondToConnectionRequest: (fromId, accept) =>
                dispatch({ type: 'RESPOND_REQUEST', from: fromId, to: me(), accept }),
            removeConnection: (otherId) =>
                dispatch({ type: 'REMOVE_CONNECTION', pair: [me(), otherId] }),
        };
    }, [state.currentUserId]);

    const currentUser = state.users.find((u) => u.id === state.currentUserId) || null;
    const requests = state.connectionRequests || [];
    const meId = state.currentUserId;

    const helpers = {
        userById: (id) => state.users.find((u) => u.id === id),
        isConnected: (a, b) => state.connections.some((c) => samePair(c, a, b)),
        myConnections: () =>
            state.connections
                .filter(([x, y]) => x === meId || y === meId)
                .map(([x, y]) => (x === meId ? y : x)),
        // 'connected' | 'outgoing' (I asked) | 'incoming' (they asked) | 'none'
        connectionStatus: (otherId) => {
            if (state.connections.some((c) => samePair(c, meId, otherId))) return 'connected';
            if (requests.some((r) => isRequest(r, meId, otherId))) return 'outgoing';
            if (requests.some((r) => isRequest(r, otherId, meId))) return 'incoming';
            return 'none';
        },
        incomingRequests: () => requests.filter((r) => r.to === meId),
        outgoingRequests: () => requests.filter((r) => r.from === meId),
    };

    return (
        <StoreContext.Provider value={{ state, currentUser, ...api, ...helpers }}>
            {children}
        </StoreContext.Provider>
    );
}

export function useStore() {
    const ctx = useContext(StoreContext);
    if (!ctx) throw new Error('useStore must be used inside StoreProvider');
    return ctx;
}