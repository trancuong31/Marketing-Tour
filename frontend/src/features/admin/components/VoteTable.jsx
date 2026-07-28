import { useMemo, useState } from 'react';
import { CheckCircle2, Filter, Star, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AdminTable from '@/components/ui/AdminTable';
import SearchBar from '@/components/ui/SearchBar';
import { getImageUrl } from '@/utils/imageUrl';

const VoteTable = ({ votes = [], onApprove, onReject }) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filterOptions = [
        { value: '', label: t('admin.votes.filters.all', 'All') },
        { value: 'pending', label: t('admin.votes.filters.pending', 'Pending') },
        { value: 'approved', label: t('admin.votes.filters.approved', 'Approved') },
    ];

    const filteredVotes = useMemo(() => {
        return votes.filter(vote => {
            const query = search.trim().toLowerCase();
            const matchSearch = !query
                || vote.customer_name?.toLowerCase().includes(query)
                || vote.customer_email?.toLowerCase().includes(query)
                || vote.Tour?.title?.toLowerCase().includes(query);

            const matchStatus = !statusFilter
                || (statusFilter === 'approved' && vote.is_approved)
                || (statusFilter === 'pending' && !vote.is_approved);

            return matchSearch && matchStatus;
        });
    }, [votes, search, statusFilter]);

    const columns = [
        {
            key: 'customer',
            header: t('admin.votes.columns.customer', 'Customer'),
            render: vote => (
                <div>
                    <p className="font-semibold text-text">{vote.customer_name}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{vote.customer_email}</p>
                </div>
            ),
        },
        {
            key: 'tour',
            header: t('admin.votes.columns.tour', 'Tour'),
            cellClassName: 'hidden md:table-cell',
            headerClassName: 'hidden md:table-cell',
            render: vote => (
                <span className="block max-w-[180px] truncate text-text-secondary">
                    {vote.Tour?.title || '-'}
                </span>
            ),
        },
        {
            key: 'rating',
            header: t('admin.votes.columns.rating', 'Rating'),
            render: vote => (
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                            key={index}
                            className={`h-3.5 w-3.5 ${
                                index < vote.rating ? 'fill-secondary text-secondary' : 'text-border'
                            }`}
                        />
                    ))}
                    <span className="ml-1.5 text-xs font-medium text-text-muted">{vote.rating}/5</span>
                </div>
            ),
        },
        {
            key: 'comment',
            header: t('admin.votes.columns.comment', 'Comment'),
            headerClassName: 'hidden lg:table-cell',
            cellClassName: 'hidden lg:table-cell',
            render: vote => (
                <div>
                    <p className="line-clamp-2 max-w-[220px] text-xs text-text-secondary">
                        {vote.comment || '-'}
                    </p>
                    {vote.images?.length > 0 && (
                        <div className="mt-1.5 flex max-w-[220px] gap-1 overflow-x-auto pb-1">
                            {vote.images.map((image, index) => (
                                <div key={`${image}-${index}`} className="h-10 w-10 shrink-0 rounded border border-border">
                                    <img
                                        src={getImageUrl(image)}
                                        alt={t('admin.votes.imageAlt', 'Review image')}
                                        loading="lazy"
                                        className="h-full w-full rounded object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'status',
            header: t('admin.votes.columns.status', 'Status'),
            render: vote => (
                <AdminTable.StatusBadge tone={vote.is_approved ? 'success' : 'warning'} dot>
                    {vote.is_approved
                        ? t('admin.votes.status.approved', 'Approved')
                        : t('admin.votes.status.pending', 'Pending')}
                </AdminTable.StatusBadge>
            ),
        },
        {
            key: 'actions',
            header: t('admin.votes.columns.actions', 'Actions'),
            align: 'right',
            render: vote => (
                <div className="flex justify-end gap-1.5">
                    {!vote.is_approved && (
                        <AdminTable.Action
                            icon={CheckCircle2}
                            label={t('admin.votes.actions.approve', 'Approve')}
                            tone="success"
                            onClick={() => onApprove?.(vote.id)}
                        />
                    )}
                    {vote.is_approved && (
                        <AdminTable.Action
                            icon={XCircle}
                            label={t('admin.votes.actions.reject', 'Reject')}
                            tone="danger"
                            onClick={() => onReject?.(vote.id)}
                        />
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="animate-fade-up space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                    <SearchBar
                        variant="admin"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        onClear={() => setSearch('')}
                        placeholder={t('admin.votes.searchPlaceholder', 'Search by name, email or tour...')}
                    />
                </div>

                <div className="flex items-center gap-1.5 rounded-lg bg-surface-alt p-1">
                    <Filter className="ml-2 h-3.5 w-3.5 text-text-muted" />
                    {filterOptions.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => setStatusFilter(option.value)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                statusFilter === option.value
                                    ? 'bg-surface text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            <AdminTable
                columns={columns}
                rows={filteredVotes}
                getRowKey={vote => vote.id}
                emptyMessage={t('admin.votes.empty', 'No reviews found')}
                footer={t('admin.votes.total', 'Showing {{filtered}} / {{total}} reviews', {
                    filtered: filteredVotes.length,
                    total: votes.length,
                })}
            />
        </div>
    );
};

export default VoteTable;
