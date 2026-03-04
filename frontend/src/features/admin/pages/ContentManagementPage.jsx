import { useState, useEffect } from 'react';
import { adminService } from '@/services/tourService';
import AdminLayout from '@/components/layout/AdminLayout';
import { Star, CheckCircle2, XCircle, Loader2, FileText, Edit2, Plus, X } from 'lucide-react';

const ContentManagementPage = () => {
    const [tab, setTab] = useState('votes'); // 'votes' | 'guides'
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
    const handleVoteAction = async (id, approved) => {
        try {
            await adminService.updateVote(id, { is_approved: approved });
            await fetchVotes();
        } catch (err) {
            alert('Lỗi cập nhật');
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

    const handleGuideSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (guideModal.guide) {
                await adminService.updateGuide(guideModal.guide.id, guideForm);
            } else {
                await adminService.createGuide(guideForm);
            }
            setGuideModal({ open: false, guide: null });
            await fetchGuides();
        } catch (err) {
            alert(err.response?.data?.message || 'Lỗi lưu');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-surface-alt p-1 rounded-xl w-fit">
                <button
                    onClick={() => setTab('votes')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        tab === 'votes' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text'
                    }`}
                >
                    <Star className="w-4 h-4 inline mr-1" /> Đánh giá
                </button>
                <button
                    onClick={() => setTab('guides')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        tab === 'guides' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary hover:text-text'
                    }`}
                >
                    <FileText className="w-4 h-4 inline mr-1" /> Hướng dẫn
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
            ) : tab === 'votes' ? (
                /* ═══ VOTES TAB ═══ */
                <div className="bg-surface rounded-xl border border-border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-surface-alt border-b border-border">
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Khách hàng</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden md:table-cell">Tour</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Sao</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary hidden sm:table-cell">Nhận xét</th>
                                <th className="px-4 py-3 text-left font-semibold text-text-secondary">Trạng thái</th>
                                <th className="px-4 py-3 text-right font-semibold text-text-secondary">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {votes.map(vote => (
                                <tr key={vote.id} className="border-b border-border last:border-0 hover:bg-surface-alt/50 transition">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-text">{vote.customer_name}</p>
                                        <p className="text-xs text-text-muted">{vote.customer_email}</p>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell text-text-secondary truncate max-w-[150px]">
                                        {vote.Tour?.title}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < vote.rating ? 'text-secondary fill-secondary' : 'text-border'}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell text-text-secondary text-xs max-w-[200px] truncate">
                                        {vote.comment}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                            vote.is_approved ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                                        }`}>
                                            {vote.is_approved ? 'Đã duyệt' : 'Chờ duyệt'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            {!vote.is_approved && (
                                                <button onClick={() => handleVoteAction(vote.id, true)}
                                                    className="p-1.5 rounded-lg hover:bg-success/10 transition" title="Duyệt">
                                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                                </button>
                                            )}
                                            {vote.is_approved && (
                                                <button onClick={() => handleVoteAction(vote.id, false)}
                                                    className="p-1.5 rounded-lg hover:bg-error/10 transition" title="Hủy duyệt">
                                                    <XCircle className="w-4 h-4 text-error" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {votes.length === 0 && <div className="text-center py-12 text-text-muted">Chưa có đánh giá nào</div>}
                </div>
            ) : (
                /* ═══ GUIDES TAB ═══ */
                <div>
                    <div className="flex justify-end mb-4">
                        <button onClick={openGuideCreate}
                            className="px-4 py-2 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition flex items-center gap-2 text-sm">
                            <Plus className="w-4 h-4" /> Thêm bài viết
                        </button>
                    </div>

                    <div className="space-y-3">
                        {guides.map(guide => (
                            <div key={guide.id} className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between hover:shadow-sm transition">
                                <div>
                                    <h4 className="font-semibold text-text">{guide.title}</h4>
                                    <div className="flex gap-3 mt-1 text-xs text-text-muted">
                                        <span>Slug: {guide.slug}</span>
                                        <span className={guide.is_active ? 'text-success' : 'text-error'}>
                                            {guide.is_active ? '● Hiển thị' : '● Ẩn'}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => openGuideEdit(guide)}
                                    className="p-2 rounded-lg hover:bg-primary/10 transition">
                                    <Edit2 className="w-4 h-4 text-primary" />
                                </button>
                            </div>
                        ))}
                        {guides.length === 0 && <p className="text-center text-text-muted py-8">Chưa có bài hướng dẫn nào</p>}
                    </div>
                </div>
            )}

            {/* ═══ GUIDE MODAL ═══ */}
            {guideModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setGuideModal({ open: false, guide: null })} />
                    <div className="relative bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-up">
                        <div className="sticky top-0 bg-surface z-10 px-6 py-4 border-b border-border flex items-center justify-between">
                            <h3 className="text-lg font-bold text-text">{guideModal.guide ? 'Sửa bài viết' : 'Thêm bài viết'}</h3>
                            <button onClick={() => setGuideModal({ open: false, guide: null })}><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleGuideSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-text mb-1 block">Tiêu đề *</label>
                                <input value={guideForm.title} onChange={e => setGuideForm(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" required />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-text mb-1 block">Nội dung *</label>
                                {ReactQuill ? (
                                    <ReactQuill theme="snow" value={guideForm.content}
                                        onChange={val => setGuideForm(p => ({ ...p, content: val }))}
                                        className="bg-surface rounded-xl [&_.ql-toolbar]:rounded-t-xl [&_.ql-container]:rounded-b-xl [&_.ql-editor]:min-h-[200px]" />
                                ) : (
                                    <textarea value={guideForm.content} onChange={e => setGuideForm(p => ({ ...p, content: e.target.value }))}
                                        rows={8} className="w-full px-3 py-2.5 bg-surface-alt border border-border rounded-xl text-sm" />
                                )}
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={guideForm.is_active === 1}
                                    onChange={e => setGuideForm(p => ({ ...p, is_active: e.target.checked ? 1 : 0 }))}
                                    className="w-4 h-4 rounded border-border text-primary" />
                                <span className="text-sm text-text">Hiển thị công khai</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setGuideModal({ open: false, guide: null })}
                                    className="flex-1 py-2.5 bg-surface-alt text-text-secondary font-semibold rounded-xl hover:bg-surface-hover transition text-sm">Hủy</button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:opacity-90 transition text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {guideModal.guide ? 'Cập nhật' : 'Tạo mới'}
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
