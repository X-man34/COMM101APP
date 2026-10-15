export const uid = () =>
    Math.random().toString(36).slice(2, 8) + Date.now().toString(36);

export function timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 7) return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
}

export const yearLabel = (y) =>
    ['', 'Freshman', 'Sophomore', 'Junior', 'Senior'][y] || `Year ${y}`;

export const isUpperclassman = (u) => u.year >= 3;

export const initials = (name) =>
    name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

export const courseCode = (course) => course.split(' - ')[0];

// University email, e.g. "Maya Chen" -> mayachen@u.boisestate.edu
export const makeEmail = (name) =>
    `${(name || '').toLowerCase().replace(/[^a-z]/g, '') || 'student'}@u.boisestate.edu`;

export const emailFor = (user) => user?.email || makeEmail(user?.name);