import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import AdminRoute from './AdminRoute';
import PrivateRoute from './PrivateRoute';

const lazyPage = (importer) => lazy(async () => {
    const module = await importer();
    if (!module?.default) {
        throw new Error('Lazy page module must export a default React component.');
    }
    return { default: module.default };
});

// Client pages
const HomePage = lazyPage(() => import('../features/home/pages/HomePage'));
const TourListPage = lazyPage(() => import('../features/tour/pages/TourListPage'));
const TourDetailPage = lazyPage(() => import('../features/tour/pages/TourDetailPage'));
const HistoryPage = lazyPage(() => import('../features/history/pages/HistoryPage'));
const NotificationsPage = lazyPage(() => import('../features/notification/pages/NotificationsPage'));
const LookupBookingPage = lazyPage(() => import('../features/lookup/pages/LookupBookingPage'));
const GuidePage = lazyPage(() => import('../features/guide/pages/GuidePage'));
const NotFoundPage = lazyPage(() => import('../features/common/pages/NotFoundPage'));

const ProfilePage = lazyPage(() => import('../features/profile/pages/ProfilePage'));

// Admin pages
const AdminLoginPage = lazyPage(() => import('../features/admin/pages/AdminLoginPage'));
const BookingManagementPage = lazyPage(() => import('../features/admin/pages/BookingManagementPage'));
const TourManagementPage = lazyPage(() => import('../features/admin/pages/TourManagementPage'));
const ContentManagementPage = lazyPage(() => import('../features/admin/pages/ContentManagementPage'));
const BannerManagementPage = lazyPage(() => import('../features/admin/pages/BannerManagementPage'));
const ReviewManagementPage = lazyPage(() => import('../features/admin/pages/ReviewManagementPage'));
const TranslationManagementPage = lazyPage(() => import('../features/admin/pages/TranslationManagementPage'));

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
                <Route path="/admin/translations" element={<AdminRoute><TranslationManagementPage /></AdminRoute>} />
                <Route path="/admin" element={<Navigate to="/admin/bookings" replace />} />

                {/* 404 */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
