import { useState, useEffect } from 'react';
import { adminService } from '@/services/tourService';
import AdminLayout from '@/components/layout/AdminLayout';
import ContentStatsBar from '@/features/admin/components/ContentStatsBar';
import VoteTable from '@/features/admin/components/VoteTable';
import GuideGrid from '@/features/admin/components/GuideGrid';
import { Star, FileText, Loader2, X } from 'lucide-react';

const tabs = [
    { key: 'votes', label: 'Đánh giá', icon: Star },
    { key: 'guides', label: 'Bài viết', icon: FileText },
];

const ContentManagementPage = () => {
    const [tab, setTab] = useState('votes');
    const [votes, setVotes] = useState([]);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [guideModal, setGuideModal] = useState({ open: false, guide: null });
    const [guideForm, setGuideForm] = useState({ title: '', content: '', is_active: 1 });
    const [submitting, setSubmitting] = useState(false);
    const [ReactQuill, setReactQuill] = useState(null);

    useEffect(() => {
        import('react-quill-new').then(mod => setReactQuill(() => mod.default));
        import('react-quill-new/dist/quill.snow.css');
    }, []);

    const fetchVotes = async () => {
        try {
            const res = await adminService.getVotes();
            setVotes(res.data.data || []);
        } catch { /* ignore */ }
    };

    const fetchGuides = async () => {
        try {
            const res = await adminService.getGuides();
            setGuides(res.data.data || []);
        } catch { /* ignore */ }
    };

    useEffect(() => {
        setLoading(true);
        Promise.all([fetchVotes(), fetchGuides()]).finally(() => setLoading(false));
    }, []);

    // ── VOTES ──
    const handleApproveVote = async (id) => {
        try {
            await adminService.updateVote(id, { is_approved: true });
            await fetchVotes();
        } catch {
            alert('Lỗi cập nhật đánh giá');
        }
    };

    const handleRejectVote = async (id) => {
        try {
            await adminService.updateVote(id, { is_approved: false });
            await fetchVotes();
        } catch {
            alert('Lỗi cập nhật đánh giá');
        }
    };

    // ── GUIDES ──
    const openGuideCreate = () => {
        setGuideForm({ title: '', content: '', is_active: 1 });
        setGuideModal({ open: true, guide: null });
    };

    const openGuideEdit = (guide) => {
        setGuideForm({ title: guide.title, content: guide.content, is_active: guide.is_active });
        setGuideModal({ open: true, guide });
    };

    const closeGuideModal = () => setGuideModal({ open: false, guide: null });

    const handleGuideSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (guideModal.guide) {
                await adminService.updateGuide(guideModal.guide.id, guideForm);
            } else {
                await adminService.createGuide(guideForm);
            }
            closeGuideModal();
            await fetchGuides();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi lưu bài viết');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            {/* ═══ PAGE HEADER ═══ */}
            <div className="mb-6 animate-fade-up">
                <h2 className="text-2xl font-bold text-text">Quản lý Nội dung</h2>
                <p className="text-sm text-text-muted mt-1">
                    Quản lý đánh giá từ khách hàng và bài viết hướng dẫn du lịch
                </p>
            </div>

            {/* ═══ STATS BAR ═══ */}
            {!loading && <ContentStatsBar votes={votes} guides={guides} />}

            {/* ═══ TABS ═══ */}
            <div className="flex items-center gap-1 p-1 bg-surface-alt rounded-2xl w-fit mb-6 animate-fade-up" style={{ animationDelay: '120ms' }}>
                {tabs.map(t => {
                    const isActive = tab === t.key;
                    const count = t.key === 'votes' ? votes.length : guides.length;
                    return (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                                isActive
                                    ? 'bg-surface text-primary shadow-sm'
                                    : 'text-text-secondary hover:text-text'
                            }`}
                        >
                            <t.icon className={`w-4 h-4 ${isActive ? 'text-primary' : ''}`} />
                            {t.label}
                            {!loading && (
                                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-surface-hover text-text-muted'
                                }`}>
                                    {count}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* ═══ CONTENT ═══ */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-text-muted mt-3">Đang tải dữ liệu...</p>
                </div>
            ) : tab === 'votes' ? (
                <VoteTable
                    votes={votes}
                    onApprove={handleApproveVote}
                    onReject={handleRejectVote}
                />
            ) : (
                <GuideGrid
                    guides={guides}
                    onCreate={openGuideCreate}
                    onEdit={openGuideEdit}
                />
            )}

            {/* ═══ GUIDE MODAL ═══ */}
            {guideModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeGuideModal}
                    />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-up">
                        {/* Header */}
                        <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-text">
                                    {guideModal.guide ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
                                </h3>
                                <p className="text-xs text-text-muted mt-0.5">
                                    {guideModal.guide ? 'Cập nhật nội dung bài viết' : 'Tạo bài viết hướng dẫn du lịch'}
                                </p>
                            </div>
                            <button
                                onClick={closeGuideModal}
                                className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
                            >
                                <X className="w-5 h-5 text-text-muted" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleGuideSubmit} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1.5 block">
                                    Tiêu đề bài viết <span className="text-error">*</span>
                                </label>
                                <input
                                    value={guideForm.title}
                                    onChange={e => setGuideForm(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Nhập tiêu đề bài viết..."
                                    className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition"
                                    required
                                />
                            </div>

                            {/* Content Editor */}
                            <div>
                                <label className="text-sm font-semibold text-text mb-1.5 block">
                                    Nội dung <span className="text-error">*</span>
                                </label>
                                {ReactQuill ? (
                                    <ReactQuill
                                        theme="snow"
                                        value={guideForm.content}
                                        onChange={val => setGuideForm(p => ({ ...p, content: val }))}
                                        className="bg-surface rounded-xl [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[240px] [&_.ql-toolbar]:border-border [&_.ql-container]:border-border"
                                    />
                                ) : (
                                    <textarea
                                        value={guideForm.content}
                                        onChange={e => setGuideForm(p => ({ ...p, content: e.target.value }))}
                                        rows={10}
                                        placeholder="Viết nội dung bài hướng dẫn..."
                                        className="w-full px-4 py-3 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition resize-none"
                                    />
                                )}
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3 p-3 bg-surface-alt rounded-xl">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={guideForm.is_active === 1}
                                        onChange={e => setGuideForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-10 h-5.5 bg-border rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:after:translate-x-[18px] after:shadow-sm" />
                                </label>
                                <div>
                                    <p className="text-sm font-medium text-text">Hiển thị công khai</p>
                                    <p className="text-xs text-text-muted">Bài viết sẽ xuất hiện trên trang người dùng</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-3 border-t border-border">
                                <button
                                    type="button"
                                    onClick={closeGuideModal}
                                    className="flex-1 py-3 bg-surface-alt text-text-secondary font-semibold rounded-xl hover:bg-surface-hover transition text-sm"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 text-sm disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {guideModal.guide ? 'Cập nhật bài viết' : 'Tạo bài viết'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default ContentManagementPage;
