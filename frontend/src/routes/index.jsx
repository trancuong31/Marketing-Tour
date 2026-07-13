import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminRoute from './AdminRoute';
import PrivateRoute from './PrivateRoute';

// Client pages
const HomePage = lazy(() => import('../features/home/pages/HomePage'));
const TourListPage = lazy(() => import('../features/tour/pages/TourListPage'));
const TourDetailPage = lazy(() => import('../features/tour/pages/TourDetailPage'));
const HistoryPage = lazy(() => import('../features/history/pages/HistoryPage'));
const NotificationsPage = lazy(() => import('../features/notification/pages/NotificationsPage'));
const LookupBookingPage = lazy(() => import('../features/lookup/pages/LookupBookingPage'));
const GuidePage = lazy(() => import('../features/guide/pages/GuidePage'));
const NotFoundPage = lazy(() => import('../features/common/pages/NotFoundPage'));

const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));

// Admin pages
const AdminLoginPage = lazy(() => import('../features/admin/pages/AdminLoginPage'));
const BookingManagementPage = lazy(() => import('../features/admin/pages/BookingManagementPage'));
const TourManagementPage = lazy(() => import('../features/admin/pages/TourManagementPage'));
const ContentManagementPage = lazy(() => import('../features/admin/pages/ContentManagementPage'));
const BannerManagementPage = lazy(() => import('../features/admin/pages/BannerManagementPage'));
const ReviewManagementPage = lazy(() => import('../features/admin/pages/ReviewManagementPage'));

const Loading = () => (
    <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-text-muted text-sm">Đang tải...</span>
        </div>
    </div>
);

const AppRoutes = () => {
    return (
        <Suspense fallback={<Loading />}>
            <Routes>
                {/* ═══ CLIENT ═══ */}
                <Route path="/" element={<HomePage />} />
                <Route path="/tours/noi-dia" element={<TourListPage />} />
                <Route path="/tours/quoc-te" element={<TourListPage />} />
                <Route path="/tours" element={<TourListPage />} />
                <Route path="/tours/:slug" element={<TourDetailPage />} />
                <Route path="/history" element={<PrivateRoute><HistoryPage /></PrivateRoute>} />
                <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
                <Route path="/lookup-booking" element={<LookupBookingPage />} />
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/guides" element={<GuidePage />} />
                <Route path="/guides/:slug" element={<GuidePage />} />

                {/* ═══ ADMIN ═══ */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/bookings" element={<AdminRoute><BookingManagementPage /></AdminRoute>} />
                <Route path="/admin/tours" element={<AdminRoute><TourManagementPage /></AdminRoute>} />
                <Route path="/admin/banners" element={<AdminRoute><BannerManagementPage /></AdminRoute>} />
                <Route path="/admin/content" element={<AdminRoute><ContentManagementPage /></AdminRoute>} />
                <Route path="/admin/reviews" element={<AdminRoute><ReviewManagementPage /></AdminRoute>} />
                <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />

                {/* 404 */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
