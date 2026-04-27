import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore();

    // Chưa đăng nhập
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Không phải admin (role_id = 1 hoặc 2)
    if (user?.role_id !== 1 && user?.role_id !== 2) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;
