import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
    Ban, CheckCircle2, ChevronLeft, ChevronRight, KeyRound,
    Loader2, Mail, Phone, Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminLayout from '@/components/layout/AdminLayout';
import SearchBar from '@/components/ui/SearchBar';
import CustomSelect from '@/components/ui/CustomSelect/CustomSelect';
import { adminService } from '@/services/tourService';
import { getImageUrl } from '@/utils/imageUrl';
import UserManagementTable from '@/features/admin/components/UserManagementTable';

const PAGE_SIZE = 10;

const formatDateTime = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(new Date(value));
};

const formatDate = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
};

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
}).format(Number(value || 0));

const getStatusBadge = (isActive) => (
    isActive
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
        : 'bg-rose-50 text-rose-700 ring-rose-200'
);

const BookingStatusBadge = ({ status }) => {
    const config = {
        approved: ['Đã duyệt', 'bg-emerald-50 text-emerald-700'],
        cancelled: ['Đã hủy', 'bg-rose-50 text-rose-700'],
        pending: ['Đang chờ', 'bg-amber-50 text-amber-700'],
    }[status] || ['Đang chờ', 'bg-amber-50 text-amber-700'];

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${config[1]}`}>
            {config[0]}
        </span>
    );
};

const UserAvatar = ({ user, size = 'md' }) => {
    const className = size === 'lg' ? 'h-16 w-16 text-xl' : 'h-10 w-10 text-sm';
    const avatar = getImageUrl(user?.avatar_url);

    if (avatar) {
        return <img src={avatar} alt={user?.full_name || 'User'} className={`${className} rounded-full object-cover ring-2 ring-primary/10`} />;
    }

    return (
        <div className={`${className} rounded-full bg-primary/10 text-primary flex items-center justify-center font-black`}>
            {String(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
    );
};

const UserDetailModal = ({ detail, roles, loading, onClose, onToggleStatus, onChangeRole, onSendReset }) => {
    if (!detail && !loading) return null;

    const user = detail?.user;
    const stats = detail?.stats || {};
    const bookings = detail?.bookings || [];

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                    <div>
                        <h2 className="text-xl font-black text-text">Chi tiết người dùng</h2>
                        <p className="text-sm text-text-muted">Thông tin cá nhân, thống kê và lịch sử booking</p>
                    </div>
                    <button onClick={onClose} className="rounded-full px-3 py-1.5 text-sm font-bold text-text-muted hover:bg-surface-alt">
                        Đóng
                    </button>
                </div>

                {loading ? (
                    <div className="flex h-72 items-center justify-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="max-h-[calc(90vh-82px)] overflow-y-auto p-6">
                        <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
                            <div className="rounded-2xl border border-border bg-surface p-5">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                    <UserAvatar user={user} size="lg" />
                                    <div className="min-w-0 flex-1">
                                        <h3 className="truncate text-2xl font-black text-text">{user.full_name}</h3>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                                <Shield className="h-3.5 w-3.5" /> {user.role_name}
                                            </span>
                                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${getStatusBadge(user.is_active)}`}>
                                                {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                    <Info icon={Mail} label="Email" value={user.email} />
                                    <Info icon={Phone} label="Số điện thoại" value={user.phone_number || '—'} />
                                    <Info label="Ngày tạo" value={formatDateTime(user.created_at)} />
                                    <Info label="Đăng nhập cuối" value={formatDateTime(user.last_login)} />
                                </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-primary/5 p-5">
                                <h4 className="mb-4 text-sm font-black uppercase tracking-wider text-primary">Thao tác nhanh</h4>
                                <div className="space-y-3">
                                    <CustomSelect
                                        value={String(user.role_id)}
                                        onChange={(val) => onChangeRole(user.id, Number(val))}
                                        options={roles.map(role => ({ label: role.role_name, value: String(role.id) }))}
                                        placeholder="Chọn vai trò"
                                    />
                                    <button
                                        onClick={() => onToggleStatus(user)}
                                        className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-black text-white ${user.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                    >
                                        {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                                        {user.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                    </button>
                                    <button
                                        onClick={() => onSendReset(user)}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white hover:bg-slate-800"
                                    >
                                        <KeyRound className="h-4 w-4" /> Gửi reset password
                                    </button>
                                </div>
                            </div>
                        </section>

                        <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            <Stat label="Đơn đặt tour" value={stats.total || 0} />
                            <Stat label="Đã hoàn thành" value={stats.approved || 0} />
                            <Stat label="Đã hủy" value={stats.cancelled || 0} />
                            <Stat label="Đang xử lý" value={stats.pending || 0} />
                            <Stat label="Tổng chi tiêu" value={formatCurrency(stats.total_spent)} wide />
                        </section>

                        <section className="mt-5 rounded-2xl border border-border bg-white overflow-hidden">
                            <div className="border-b border-border px-5 py-4">
                                <h4 className="font-black text-text">Lịch sử đặt tour</h4>
                            </div>
                            <div className="divide-y divide-border">
                                {bookings.length === 0 ? (
                                    <div className="p-6 text-center text-sm text-text-muted">Người dùng chưa có booking.</div>
                                ) : bookings.map(booking => (
                                    <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-surface-alt/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 min-w-0 flex-1">
                                            <div className="font-mono font-black text-primary text-sm shrink-0 sm:w-44 truncate">
                                                {booking.booking_code}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-text truncate">{booking.tour_title_snapshot || 'Tour'}</p>
                                                <p className="text-xs text-text-muted mt-0.5">
                                                    {formatDate(booking.departure_date_snapshot)} · {booking.adult_qty} NL · {booking.child_qty} TE · {booking.infant_qty} EB
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/50">
                                            <BookingStatusBadge status={booking.status} />
                                            <div className="text-right font-black text-text text-sm sm:w-32">{formatCurrency(booking.total_price)}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

const Info = ({ icon: Icon, label, value }) => (
    <div className="rounded-xl bg-surface-alt p-3">
        <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-muted">
            {Icon && <Icon className="h-3.5 w-3.5" />} {label}
        </p>
        <p className="break-words text-sm font-bold text-text">{value}</p>
    </div>
);

const Stat = ({ label, value }) => (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted">{label}</p>
        <p className="mt-2 text-xl font-black text-text">{value}</p>
    </div>
);

const UserManagementPage = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState({ role_id: '', status: '', sort: 'newest' });
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, totalItems: 0 });
    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const params = useMemo(() => ({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        role_id: filters.role_id || undefined,
        status: filters.status || undefined,
        sort: filters.sort,
    }), [filters, page, search]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes] = await Promise.all([
                adminService.getUsers(params),
                roles.length ? Promise.resolve(null) : adminService.getUserRoles(),
            ]);
            setUsers(usersRes.data.data || []);
            setPagination(usersRes.data.pagination || { totalPages: 1, totalItems: 0 });
            if (rolesRes) setRoles(rolesRes.data.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không tải được danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, [params, roles.length]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const openDetail = async (userId) => {
        setDetailLoading(true);
        setDetail(null);
        try {
            const res = await adminService.getUserDetail(userId);
            setDetail(res.data.data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không tải được chi tiết người dùng');
        } finally {
            setDetailLoading(false);
        }
    };

    const refreshDetail = async (userId) => {
        const res = await adminService.getUserDetail(userId);
        setDetail(res.data.data);
    };

    const handleToggleStatus = async (user) => {
        const nextStatus = user.is_active ? 0 : 1;
        const message = user.is_active
            ? `Khóa tài khoản ${user.full_name}?`
            : `Mở khóa tài khoản ${user.full_name}?`;

        if (!window.confirm(message)) return;

        try {
            await adminService.updateUserStatus(user.id, { is_active: nextStatus });
            toast.success(nextStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
            await fetchUsers();
            if (detail?.user?.id === user.id) await refreshDetail(user.id);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không cập nhật được trạng thái');
        }
    };

    const handleChangeRole = async (userId, roleId) => {
        try {
            await adminService.updateUserRole(userId, { role_id: roleId });
            toast.success('Đã cập nhật vai trò');
            await fetchUsers();
            if (detail?.user?.id === userId) await refreshDetail(userId);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không cập nhật được vai trò');
        }
    };

    const handleSendReset = async (user) => {
        if (!window.confirm(`Gửi email đặt lại mật khẩu cho ${user.email}?`)) return;

        try {
            await adminService.sendUserResetPassword(user.id);
            toast.success('Đã gửi OTP đặt lại mật khẩu');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Không gửi được email đặt lại mật khẩu');
        }
    };

    const roleOptions = useMemo(() => [
        { label: 'Tất cả vai trò', value: '' },
        ...roles.map(role => ({ label: role.role_name, value: String(role.id) })),
    ], [roles]);

    const statusOptions = useMemo(() => [
        { label: 'Tất cả trạng thái', value: '' },
        { label: 'Hoạt động', value: 'active' },
        { label: 'Đã khóa', value: 'locked' },
    ], []);

    const sortOptions = useMemo(() => [
        { label: 'Mới nhất', value: 'newest' },
        { label: 'Cũ nhất', value: 'oldest' },
        { label: 'Tên A-Z', value: 'name' },
    ], []);

    const pageNumbers = useMemo(() => {
        const total = pagination.totalPages || 1;
        const current = page || 1;
        const start = Math.max(1, current - 2);
        const end = Math.min(total, start + 4);

        return Array.from({ length: end - start + 1 }, (_, index) => start + index);
    }, [page, pagination.totalPages]);

    return (
        <AdminLayout>
            <div className="flex h-[calc(100dvh-6.5rem)] flex-col gap-4 overflow-hidden sm:h-[calc(100dvh-5.5rem)]">
                <div className="shrink-0">
                    <p className="text-sm text-text-muted">
                        {t('admin.users.pageDescription', 'Quản lý danh sách người dùng, phân quyền vai trò và trạng thái tài khoản.')}
                    </p>
                </div>

                <div className="shrink-0 rounded-lg border border-border bg-surface p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Bộ lọc bên trái với CustomSelect */}
                        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:w-auto lg:min-w-[540px]">
                            <CustomSelect
                                value={String(filters.role_id)}
                                onChange={(val) => { setFilters(prev => ({ ...prev, role_id: val })); setPage(1); }}
                                options={roleOptions}
                                placeholder="Tất cả vai trò"
                            />
                            <CustomSelect
                                value={filters.status}
                                onChange={(val) => { setFilters(prev => ({ ...prev, status: val })); setPage(1); }}
                                options={statusOptions}
                                placeholder="Tất cả trạng thái"
                            />
                            <CustomSelect
                                value={filters.sort}
                                onChange={(val) => { setFilters(prev => ({ ...prev, sort: val })); setPage(1); }}
                                options={sortOptions}
                                placeholder="Sắp xếp"
                            />
                        </div>

                        {/* Ô tìm kiếm ở góc phải (không dùng btn search) */}
                        <div className="w-full shrink-0 lg:w-96">
                            <SearchBar
                                variant="admin"
                                value={search}
                                onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                                onClear={() => { setSearch(''); setPage(1); }}
                                placeholder={t('admin.users.searchPlaceholder', 'Tìm theo tên, email hoặc SĐT...')}
                            />
                        </div>
                    </div>
                </div>

                <UserManagementTable
                    users={users}
                    loading={loading}
                    onView={openDetail}
                    onToggleStatus={handleToggleStatus}
                    page={page}
                    pageSize={PAGE_SIZE}
                />

                {pagination.totalPages > 1 && (
                    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2">
                        <button
                            type="button"
                            onClick={() => setPage(prev => Math.max(1, prev - 1))}
                            disabled={loading || page <= 1}
                            className="rounded-lg border border-border bg-surface p-2.5 text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                            aria-label={t('common.previous', 'Previous')}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>

                        {pageNumbers.map(p => (
                            <button
                                key={p}
                                type="button"
                                onClick={() => setPage(p)}
                                disabled={loading || p === page}
                                className={`h-10 w-10 rounded-lg border text-sm font-bold ${
                                    p === page
                                        ? 'border-primary bg-primary text-white'
                                        : 'border-border bg-surface text-text-secondary hover:bg-surface-hover'
                                }`}
                            >
                                {p}
                            </button>
                        ))}

                        <button
                            type="button"
                            onClick={() => setPage(prev => Math.min(pagination.totalPages, prev + 1))}
                            disabled={loading || page >= pagination.totalPages}
                            className="rounded-lg border border-border bg-surface p-2.5 text-text-secondary hover:bg-surface-hover disabled:opacity-50"
                            aria-label={t('common.next', 'Next')}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>

            {(detail || detailLoading) && (
                <UserDetailModal
                    detail={detail}
                    roles={roles}
                    loading={detailLoading}
                    onClose={() => setDetail(null)}
                    onToggleStatus={handleToggleStatus}
                    onChangeRole={handleChangeRole}
                    onSendReset={handleSendReset}
                />
            )}
        </AdminLayout>
    );
};

export default UserManagementPage;
