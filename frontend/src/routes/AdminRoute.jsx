import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';

const AdminRoute = ({ children }) => {
    const { token } = useAuthStore();

    if (!token) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default AdminRoute;
