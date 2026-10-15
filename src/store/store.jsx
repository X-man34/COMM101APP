import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { seedState } from '../data/seed';
import { uid } from '../utils';

const STORAGE_KEY = 'campusconnect-demo-v1';

function load() {
    try {
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
        case 'TOGGLE_CONNECTION': {
            const [a, b] = action.pair;
            const exists = state.connections.some(
                ([x, y]) => (x === a && y === b) || (x === b && y === a)
            );
            return {
                ...state,
                connections: exists
                    ? state.connections.filter(([x, y]) => !((x === a && y === b) || (x === b && y === a)))
                    : [...state.connections, [a, b]],
            };
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
        return {
            login: (userId) => dispatch({ type: 'LOGIN', userId }),
            logout: () => dispatch({ type: 'LOGOUT' }),
            register: ({ name, major, year, role, bio }) =>
                dispatch({
                    type: 'REGISTER',
                    user: { id: uid(), name, major, year, role, bio: bio || '', courses: [] },
                }),
            resetDemo: () => dispatch({ type: 'RESET' }),

            // ---- Study groups ----
            createGroup: ({ name, course, description, major }) => {
                const group = {
                    id: uid(),
                    name,
                    course,
                    major,
                    description,
                    ownerId: me(),
                    memberIds: [me()],
                    invitedIds: [],
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
                    updater: (g) =>
                        g.memberIds.includes(me()) ? g : { ...g, memberIds: [...g.memberIds, me()] },
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
            toggleConnection: (otherId) => dispatch({ type: 'TOGGLE_CONNECTION', pair: [me(), otherId] }),
        };
    }, [state.currentUserId]);

    const currentUser = state.users.find((u) => u.id === state.currentUserId) || null;

    const helpers = {
        userById: (id) => state.users.find((u) => u.id === id),
        isConnected: (a, b) =>
            state.connections.some(([x, y]) => (x === a && y === b) || (x === b && y === a)),
        myConnections: () =>
            state.connections
                .filter(([x, y]) => x === state.currentUserId || y === state.currentUserId)
                .map(([x, y]) => (x === state.currentUserId ? y : x)),
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