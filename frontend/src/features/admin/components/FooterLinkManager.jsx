import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Plus,
    Edit2,
    Trash2,
    ExternalLink,
    Link as LinkIcon,
    ArrowUp,
    ArrowDown,
    Loader2,
    X,
    CheckCircle2,
    AlertCircle,
    Eye,
    EyeOff,
    Filter,
} from 'lucide-react';
import { footerLinkService } from '@/services/footerLinkService';

const COLUMN_NAMES = {
    1: 'Cột 1: Về Chúng Tôi',
    2: 'Cột 2: Thông Tin Cần Biết',
    3: 'Cột 3: Đối Tác',
};

const DEFAULT_FORM = {
    title: '',
    url: '',
    link_type: 'internal',
    column_position: 1,
    sort_order: 1,
    is_active: 1,
};

const FooterLinkManager = ({ guides = [] }) => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedColumn, setSelectedColumn] = useState('all');
    const [modal, setModal] = useState({ open: false, isEdit: false, item: null });
    const [form, setForm] = useState(DEFAULT_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const showNotification = (msg, isErr = false) => {
        if (isErr) {
            setErrorMsg(msg);
            setTimeout(() => setErrorMsg(''), 4000);
        } else {
            setSuccessMsg(msg);
            setTimeout(() => setSuccessMsg(''), 4000);
        }
    };

    const fetchLinks = useCallback(async () => {
        try {
            const res = await footerLinkService.getAdmin();
            setLinks(res.data?.data || []);
        } catch {
            showNotification('Không thể tải danh sách liên kết footer', true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLinks();
    }, [fetchLinks]);

    const filteredLinks = useMemo(() => {
        let list = [...links];
        if (selectedColumn !== 'all') {
            list = list.filter((l) => Number(l.column_position) === Number(selectedColumn));
        }
        return list.sort((a, b) => {
            if (a.column_position !== b.column_position) {
                return a.column_position - b.column_position;
            }
            return a.sort_order - b.sort_order;
        });
    }, [links, selectedColumn]);

    const selectedGuideSlug = useMemo(() => {
        if (form.link_type !== 'internal' || !form.url) return '';
        const clean = form.url.replace(/^\/guides\//, '').replace(/^\//, '');
        const found = guides.find((g) => g.slug === clean || `/guides/${g.slug}` === form.url);
        return found ? found.slug : clean;
    }, [form.link_type, form.url, guides]);

    const handleGuideChange = (e) => {
        const slug = e.target.value;
        if (slug) {
            const selectedGuide = guides.find((g) => g.slug === slug);
            setForm((prev) => ({
                ...prev,
                url: `/guides/${slug}`,
                title: prev.title.trim() ? prev.title : (selectedGuide?.title || ''),
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                url: '',
            }));
        }
    };

    const handleLinkTypeChange = (newType) => {
        if (newType === form.link_type) return;
        setForm((prev) => ({
            ...prev,
            link_type: newType,
            url: newType === 'internal'
                ? (prev.url.startsWith('/') ? prev.url : '')
                : (prev.url.startsWith('http') ? prev.url : ''),
        }));
    };

    const openCreateModal = () => {
        const nextCol = selectedColumn === 'all' ? 1 : Number(selectedColumn);
        const colLinks = links.filter((l) => Number(l.column_position) === nextCol);
        const maxSort = colLinks.reduce((max, l) => Math.max(max, l.sort_order || 0), 0);

        setForm({
            ...DEFAULT_FORM,
            column_position: nextCol,
            sort_order: maxSort + 1,
            link_type: nextCol === 3 ? 'external' : 'internal',
        });
        setModal({ open: true, isEdit: false, item: null });
    };

    const openEditModal = (item) => {
        setForm({
            title: item.title,
            url: item.url,
            link_type: item.link_type,
            column_position: Number(item.column_position),
            sort_order: Number(item.sort_order),
            is_active: Number(item.is_active),
        });
        setModal({ open: true, isEdit: true, item });
    };

    const closeModal = () => {
        setModal({ open: false, isEdit: false, item: null });
        setForm(DEFAULT_FORM);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!form.title.trim()) {
            showNotification('Vui lòng nhập tiêu đề hiển thị', true);
            return;
        }

        if (form.link_type === 'internal') {
            if (!form.url || !form.url.trim()) {
                showNotification('Vui lòng chọn bài viết nội bộ cho liên kết', true);
                return;
            }
        } else {
            if (!form.url || !form.url.trim()) {
                showNotification('Vui lòng nhập đường dẫn URL cho liên kết ngoài', true);
                return;
            }
        }

        setSubmitting(true);
        try {
            const payload = {
                title: form.title.trim(),
                url: form.url.trim(),
                link_type: form.link_type,
                column_position: Number(form.column_position),
                sort_order: Number(form.sort_order),
                is_active: Number(form.is_active),
            };

            if (modal.isEdit && modal.item) {
                await footerLinkService.update(modal.item.id, payload);
                showNotification('Cập nhật liên kết footer thành công');
            } else {
                await footerLinkService.create(payload);
                showNotification('Thêm mới liên kết footer thành công');
            }

            closeModal();
            await fetchLinks();
        } catch (err) {
            showNotification(err.response?.data?.message || 'Có lỗi xảy ra', true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await footerLinkService.toggle(id);
            await fetchLinks();
            showNotification('Đã thay đổi trạng thái hiển thị');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Không thể đổi trạng thái', true);
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa liên kết "${title}"?`)) {
            return;
        }
        try {
            await footerLinkService.delete(id);
            await fetchLinks();
            showNotification(`Đã xóa liên kết "${title}"`);
        } catch (err) {
            showNotification(err.response?.data?.message || 'Không thể xóa liên kết', true);
        }
    };

    const handleMove = async (item, direction) => {
        // Find links in the same column
        const colLinks = links
            .filter((l) => Number(l.column_position) === Number(item.column_position))
            .sort((a, b) => a.sort_order - b.sort_order);

        const currentIndex = colLinks.findIndex((l) => l.id === item.id);
        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (targetIndex < 0 || targetIndex >= colLinks.length) return;

        const targetItem = colLinks[targetIndex];

        // Swap sort_orders
        const reorderPayload = [
            { id: item.id, sort_order: targetItem.sort_order },
            { id: targetItem.id, sort_order: item.sort_order },
        ];

        // If they had the exact same sort_order, normalize them
        if (item.sort_order === targetItem.sort_order) {
            colLinks.forEach((link, idx) => {
                if (link.id === item.id) {
                    link.sort_order = direction === 'up' ? idx - 1 : idx + 1;
                } else {
                    link.sort_order = idx;
                }
            });
            reorderPayload.length = 0;
            colLinks.forEach((l) => reorderPayload.push({ id: l.id, sort_order: l.sort_order }));
        }

        try {
            await footerLinkService.reorder(reorderPayload);
            await fetchLinks();
            showNotification('Đã cập nhật thứ tự liên kết');
        } catch (err) {
            showNotification(err.response?.data?.message || 'Không thể đổi thứ tự', true);
        }
    };

    return (
        <div className="space-y-6">
            {/* Notifications */}
            {successMsg && (
                <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm animate-fade-up">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{successMsg}</span>
                </div>
            )}
            {errorMsg && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm animate-fade-up">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{errorMsg}</span>
                </div>
            )}

            {/* Filter and Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider mr-2">
                        <Filter className="w-4 h-4" />
                        Lọc theo cột:
                    </div>
                    {['all', 1, 2, 3].map((col) => (
                        <button
                            key={col}
                            onClick={() => setSelectedColumn(col)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                                selectedColumn === col
                                    ? 'bg-primary text-white shadow-sm'
                                    : 'bg-surface-alt text-text-secondary hover:bg-surface-hover hover:text-primary'
                            }`}
                        >
                            {col === 'all' ? 'Tất cả cột' : COLUMN_NAMES[col]}
                        </button>
                    ))}
                </div>

                <button
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" />
                    Thêm liên kết mới
                </button>
            </div>

            {/* Content Table / Cards */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-surface rounded-2xl border border-border">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-muted mt-3">Đang tải danh sách liên kết footer...</p>
                </div>
            ) : filteredLinks.length === 0 ? (
                <div className="bg-surface rounded-2xl border border-border p-12 text-center">
                    <LinkIcon className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-text mb-1">Chưa có liên kết nào</h3>
                    <p className="text-sm text-text-muted mb-4">
                        Bấm nút &quot;Thêm liên kết mới&quot; để tạo liên kết hiển thị dưới chân trang website.
                    </p>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition"
                    >
                        <Plus className="w-4 h-4" />
                        Thêm liên kết
                    </button>
                </div>
            ) : (
                <div className="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-alt border-b border-border text-xs uppercase text-text-muted">
                                <tr>
                                    <th className="py-3.5 px-4 font-semibold w-16 text-center">Thứ tự</th>
                                    <th className="py-3.5 px-4 font-semibold">Tiêu đề liên kết</th>
                                    <th className="py-3.5 px-4 font-semibold">Cột Footer</th>
                                    <th className="py-3.5 px-4 font-semibold">Loại liên kết</th>
                                    <th className="py-3.5 px-4 font-semibold">Đường dẫn / URL</th>
                                    <th className="py-3.5 px-4 font-semibold text-center">Hiển thị</th>
                                    <th className="py-3.5 px-4 font-semibold text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredLinks.map((item, index) => {
                                    const colLinks = links
                                        .filter((l) => Number(l.column_position) === Number(item.column_position))
                                        .sort((a, b) => a.sort_order - b.sort_order);
                                    const itemIdxInCol = colLinks.findIndex((l) => l.id === item.id);
                                    const isFirstInCol = itemIdxInCol === 0;
                                    const isLastInCol = itemIdxInCol === colLinks.length - 1;

                                    return (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-surface-alt/60 transition-colors group"
                                        >
                                            {/* Sort buttons */}
                                            <td className="py-3.5 px-4 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <span className="font-mono text-xs font-bold text-text-muted w-5">
                                                        {item.sort_order}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <button
                                                            disabled={isFirstInCol}
                                                            onClick={() => handleMove(item, 'up')}
                                                            title="Di chuyển lên"
                                                            className="p-0.5 rounded text-text-muted hover:text-primary hover:bg-surface disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-text-muted transition"
                                                        >
                                                            <ArrowUp className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            disabled={isLastInCol}
                                                            onClick={() => handleMove(item, 'down')}
                                                            title="Di chuyển xuống"
                                                            className="p-0.5 rounded text-text-muted hover:text-primary hover:bg-surface disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-text-muted transition"
                                                        >
                                                            <ArrowDown className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Title */}
                                            <td className="py-3.5 px-4 font-medium text-text">
                                                <div className="flex items-center gap-2">
                                                    {item.link_type === 'external' ? (
                                                        <ExternalLink className="w-4 h-4 text-sky-500 shrink-0" />
                                                    ) : (
                                                        <LinkIcon className="w-4 h-4 text-primary shrink-0" />
                                                    )}
                                                    <span className="font-semibold">{item.title}</span>
                                                </div>
                                            </td>

                                            {/* Column */}
                                            <td className="py-3.5 px-4">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        Number(item.column_position) === 1
                                                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            : Number(item.column_position) === 2
                                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}
                                                >
                                                    {COLUMN_NAMES[item.column_position] || `Cột ${item.column_position}`}
                                                </span>
                                            </td>

                                            {/* Link type */}
                                            <td className="py-3.5 px-4">
                                                {item.link_type === 'external' ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                                                        Liên kết ngoài
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                        Trang nội bộ
                                                    </span>
                                                )}
                                            </td>

                                            {/* URL */}
                                            <td className="py-3.5 px-4 text-xs font-mono text-text-secondary max-w-[240px] truncate">
                                                <a
                                                    href={item.url}
                                                    target={item.link_type === 'external' ? '_blank' : '_self'}
                                                    rel="noopener noreferrer"
                                                    className="hover:text-primary hover:underline transition"
                                                    title={item.url}
                                                >
                                                    {item.url}
                                                </a>
                                            </td>

                                            {/* Toggle Active */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() => handleToggle(item.id)}
                                                    title={item.is_active ? 'Bấm để ẩn' : 'Bấm để hiển thị'}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                                                        item.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-zinc-100 text-zinc-500 border border-zinc-200 hover:bg-zinc-200'
                                                    }`}
                                                >
                                                    {item.is_active ? (
                                                        <>
                                                            <Eye className="w-3.5 h-3.5" />
                                                            <span>Hiển thị</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3.5 h-3.5" />
                                                            <span>Đang ẩn</span>
                                                        </>
                                                    )}
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => openEditModal(item)}
                                                        className="p-1.5 rounded-lg text-text-muted hover:text-primary hover:bg-primary/10 transition"
                                                        title="Chỉnh sửa liên kết"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.title)}
                                                        className="p-1.5 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition"
                                                        title="Xóa liên kết"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal Create / Edit */}
            {modal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-fade-up">
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface">
                            <div>
                                <h3 className="text-lg font-bold text-text">
                                    {modal.isEdit ? 'Chỉnh sửa liên kết footer' : 'Thêm liên kết footer mới'}
                                </h3>
                                <p className="text-xs text-text-muted mt-0.5">
                                    Nội dung sẽ hiển thị tại cột tương ứng dưới footer website
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="p-2 rounded-lg hover:bg-surface-hover transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1 block">
                                    Tiêu đề hiển thị <span className="text-error">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Ví dụ: Về Chúng Tôi, Vietnam Airlines..."
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                    required
                                />
                            </div>

                            {/* Column Position */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1 block">
                                    Cột hiển thị dưới Footer <span className="text-error">*</span>
                                </label>
                                <select
                                    value={form.column_position}
                                    onChange={(e) => setForm({ ...form, column_position: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                >
                                    <option value={1}>Cột 1: Về Chúng Tôi</option>
                                    <option value={2}>Cột 2: Thông Tin Cần Biết</option>
                                    <option value={3}>Cột 3: Đối Tác</option>
                                </select>
                            </div>

                            {/* Link Type */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1 block">
                                    Loại liên kết <span className="text-error">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleLinkTypeChange('internal')}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition ${
                                            form.link_type === 'internal'
                                                ? 'bg-primary/10 border-primary text-primary'
                                                : 'bg-surface-alt border-border text-text-secondary hover:bg-surface-hover'
                                        }`}
                                    >
                                        <LinkIcon className="w-4 h-4" />
                                        Trang nội bộ
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLinkTypeChange('external')}
                                        className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-semibold transition ${
                                            form.link_type === 'external'
                                                ? 'bg-sky-50 border-sky-500 text-sky-700'
                                                : 'bg-surface-alt border-border text-text-secondary hover:bg-surface-hover'
                                        }`}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Liên kết ngoài
                                    </button>
                                </div>
                            </div>

                            {/* Cho Trang nội bộ: Chọn bài viết đã có */}
                            {form.link_type === 'internal' && (
                                <div>
                                    <label className="text-sm font-semibold text-text mb-1 block">
                                        Chọn bài viết đã có <span className="text-error">*</span>
                                    </label>
                                    <select
                                        value={selectedGuideSlug}
                                        onChange={handleGuideChange}
                                        className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                    >
                                        <option value="">-- Chọn bài viết đã có --</option>
                                        {guides.map((g) => (
                                            <option key={g.id} value={g.slug}>
                                                {g.title} (/{g.slug})
                                            </option>
                                        ))}
                                        {selectedGuideSlug && !guides.some((g) => g.slug === selectedGuideSlug) && (
                                            <option value={selectedGuideSlug}>
                                                {form.title || selectedGuideSlug} (/{selectedGuideSlug})
                                            </option>
                                        )}
                                    </select>
                                    {form.url && (
                                        <p className="text-[11px] text-text-muted mt-1.5 flex items-center gap-1.5">
                                            <span>Đường dẫn bài viết:</span>
                                            <code className="bg-surface-alt border border-border px-1.5 py-0.5 rounded font-mono text-primary text-[11px] font-semibold">
                                                {form.url}
                                            </code>
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Cho Liên kết ngoài: Nhập URL bên ngoài */}
                            {form.link_type === 'external' && (
                                <div>
                                    <label className="text-sm font-semibold text-text mb-1 block">
                                        Đường dẫn liên kết ngoài (URL) <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={form.url}
                                        onChange={(e) => setForm({ ...form, url: e.target.value })}
                                        placeholder="https://example.com"
                                        className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                    />
                                    <p className="text-[11px] text-text-muted mt-1">
                                        Nhập URL trang web bên ngoài, ví dụ: https://www.vietnamairlines.com
                                    </p>
                                </div>
                            )}

                            {/* Sort Order & Active */}
                            <div className="grid grid-cols-2 gap-4 pt-1">
                                <div>
                                    <label className="text-sm font-semibold text-text mb-1 block">
                                        Thứ tự sắp xếp
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.sort_order}
                                        onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                    />
                                </div>

                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center gap-3 p-2 bg-surface-alt rounded-xl border border-border">
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.is_active === 1}
                                                onChange={(e) =>
                                                    setForm({ ...form, is_active: e.target.checked ? 1 : 0 })
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-9 h-5 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 after:shadow-sm" />
                                        </label>
                                        <span className="text-xs font-semibold text-text">
                                            {form.is_active === 1 ? 'Hiển thị' : 'Đang ẩn'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-border mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 bg-surface-alt text-text-secondary font-semibold rounded-xl hover:bg-surface-hover transition text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/25 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {modal.isEdit ? 'Lưu thay đổi' : 'Tạo liên kết'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FooterLinkManager;
