import { useState, useMemo } from 'react';
import { Star, CheckCircle2, XCircle, Search, Filter, Inbox } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUrl';

const filterOptions = [
    { value: '', label: 'Tất cả' },
    { value: 'pending', label: 'Chờ duyệt' },
    { value: 'approved', label: 'Đã duyệt' },
];

const VoteTable = ({ votes = [], onApprove, onReject }) => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const filteredVotes = useMemo(() => {
        return votes.filter(vote => {
            // Search filter
            const query = search.toLowerCase();
            const matchSearch = !query
                || vote.customer_name?.toLowerCase().includes(query)
                || vote.customer_email?.toLowerCase().includes(query)
                || vote.Tour?.title?.toLowerCase().includes(query);

            // Status filter
            const matchStatus = !statusFilter
                || (statusFilter === 'approved' && vote.is_approved)
                || (statusFilter === 'pending' && !vote.is_approved);

            return matchSearch && matchStatus;
        });
    }, [votes, search, statusFilter]);

    return (
        <div className="space-y-4 animate-fade-up">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Tìm theo tên, email hoặc tour..."
                        className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
                    />
                </div>

                {/* Status filter pills */}
                <div className="flex items-center gap-1.5 bg-surface-alt p-1 rounded-xl">
                    <Filter className="w-3.5 h-3.5 text-text-muted ml-2" />
                    {filterOptions.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => setStatusFilter(opt.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                statusFilter === opt.value
                                    ? 'bg-surface text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            {filteredVotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                    <Inbox className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm font-medium">Không tìm thấy đánh giá nào</p>
                    <p className="text-xs mt-1">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </div>
            ) : (
                <div className="bg-surface rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-surface-alt/70">
                                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">
                                        Tour
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Đánh giá
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">
                                        Nhận xét
                                    </th>
                                    <th className="px-4 py-3.5 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-4 py-3.5 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                                        Hành động
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredVotes.map(vote => (
                                    <tr key={vote.id} className="hover:bg-surface-alt/40 transition-colors">
                                        <td className="px-4 py-3.5">
                                            <p className="font-semibold text-text text-sm">{vote.customer_name}</p>
                                            <p className="text-xs text-text-muted mt-0.5">{vote.customer_email}</p>
                                        </td>
                                        <td className="px-4 py-3.5 hidden md:table-cell">
                                            <span className="text-text-secondary text-sm truncate block max-w-[180px]">
                                                {vote.Tour?.title}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-3.5 h-3.5 ${
                                                            i < vote.rating
                                                                ? 'text-secondary fill-secondary'
                                                                : 'text-border'
                                                        }`}
                                                    />
                                                ))}
                                                <span className="text-xs text-text-muted ml-1.5 font-medium">
                                                    {vote.rating}/5
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 hidden lg:table-cell">
                                            <p className="text-text-secondary text-xs max-w-[220px] line-clamp-2">
                                                {vote.comment || '—'}
                                            </p>
                                            {vote.images && vote.images.length > 0 && (
                                                <div className="flex gap-1 mt-1.5 overflow-x-auto max-w-[220px] pb-1">
                                                    {vote.images.map((img, i) => (
                                                        <div key={i} className="w-10 h-10 shrink-0 rounded border border-border">
                                                            <img 
                                                                src={getImageUrl(img)} 
                                                                alt="review" 
                                                                className="w-full h-full object-cover rounded"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${
                                                vote.is_approved
                                                    ? 'bg-success/10 text-success'
                                                    : 'bg-warning/10 text-warning'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                                    vote.is_approved ? 'bg-success' : 'bg-warning'
                                                }`} />
                                                {vote.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {!vote.is_approved && (
                                                    <button
                                                        onClick={() => onApprove?.(vote.id)}
                                                        className="p-2 rounded-lg hover:bg-success/10 transition-colors group"
                                                        title="Duyệt"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 text-success group-hover:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                                {vote.is_approved && (
                                                    <button
                                                        onClick={() => onReject?.(vote.id)}
                                                        className="p-2 rounded-lg hover:bg-error/10 transition-colors group"
                                                        title="Hủy duyệt"
                                                    >
                                                        <XCircle className="w-4 h-4 text-error group-hover:scale-110 transition-transform" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-surface-alt/40 border-t border-border flex items-center justify-between text-xs text-text-muted">
                        <span>Hiển thị {filteredVotes.length} / {votes.length} đánh giá</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VoteTable;
