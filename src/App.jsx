import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store/store';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Forum from './pages/Forum';
import PostDetail from './pages/PostDetail';
import Materials from './pages/Materials';
import MaterialNew from './pages/MaterialNew';
import MaterialDetail from './pages/MaterialDetail';
import People from './pages/People';

function RequireAuth({ children }) {
    const { currentUser } = useStore();
    const location = useLocation();
    if (!currentUser) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
}

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route
                path="/"
                element={
                    <RequireAuth>
                        <Layout />
                    </RequireAuth>
                }
            >
                <Route index element={<Dashboard />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/:id" element={<GroupDetail />} />
                <Route path="forum" element={<Forum />} />
                <Route path="forum/:id" element={<PostDetail />} />
                <Route path="materials" element={<Materials />} />
                <Route path="materials/new" element={<MaterialNew />} />
                <Route path="materials/:id" element={<MaterialDetail />} />
                <Route path="people" element={<People />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}