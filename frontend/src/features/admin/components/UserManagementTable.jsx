import { Ban, CheckCircle2, Eye, Shield } from 'lucide-react';
import AdminTable from '@/components/ui/AdminTable';
import { getImageUrl } from '@/utils/imageUrl';

const formatDate = (value) => {
    if (!value) return '—';
    return new Intl.DateTimeFormat('vi-VN').format(new Date(value));
};

const UserAvatar = ({ user }) => {
    const avatar = getImageUrl(user?.avatar_url);

    if (avatar) {
        return <img src={avatar} alt={user?.full_name || 'User'} className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/10" />;
    }

    return (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
            {String(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
        </div>
    );
};

const UserManagementTable = ({ users, loading, onView, onToggleStatus }) => {
    const columns = [
        {
            key: 'user',
            header: 'Người dùng',
            render: (user) => (
                <div className="flex min-w-[260px] items-center gap-3">
                    <UserAvatar user={user} />
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-text">{user.full_name}</p>
                        <p className="truncate text-xs font-medium text-text-muted">{user.email}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'phone_number',
            header: 'SĐT',
            cellClassName: 'whitespace-nowrap font-medium text-text-secondary',
            render: (user) => user.phone_number || '—',
        },
        {
            key: 'role',
            header: 'Vai trò',
            render: (user) => (
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary">
                    <Shield className="h-3.5 w-3.5" /> {user.role_name}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Trạng thái',
            render: (user) => (
                <AdminTable.StatusBadge tone={user.is_active ? 'success' : 'danger'} dot>
                    {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                </AdminTable.StatusBadge>
            ),
        },
        {
            key: 'created_at',
            header: 'Ngày tham gia',
            cellClassName: 'whitespace-nowrap text-text-secondary',
            render: (user) => formatDate(user.created_at),
        },
        {
            key: 'actions',
            header: 'Thao tác',
            align: 'right',
            render: (user) => (
                <div className="flex justify-end gap-3">
                    <AdminTable.Action compact icon={Eye} label="Xem chi tiết" tone="primary" onClick={() => onView(user.id)} />
                    <AdminTable.Action
                        compact
                        icon={user.is_active ? Ban : CheckCircle2}
                        label={user.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                        tone={user.is_active ? 'danger' : 'success'}
                        onClick={() => onToggleStatus(user)}
                    />
                </div>
            ),
        },
    ];

    return (
        <AdminTable
            columns={columns}
            rows={users}
            getRowKey={user => user.id}
            emptyMessage="Không có người dùng phù hợp."
            minWidth="860px"
            className="min-h-0 flex-1"
            scrollable
            loading={loading}
        />
    );
};

export default UserManagementTable;
