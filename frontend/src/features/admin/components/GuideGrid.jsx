import { Plus, Edit2, FileText, BookOpen } from 'lucide-react';

/** Strip HTML tags and truncate text */
const stripHtml = (html, maxLen = 100) => {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
    return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
};

const GuideGrid = ({ guides = [], onEdit, onCreate }) => {
    return (
        <div className="space-y-4 animate-fade-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-text-muted">
                    {guides.length > 0 ? `${guides.length} bài viết` : ''}
                </p>
                <button
                    onClick={onCreate}
                    className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2 text-sm"
                >
                    <Plus className="w-4 h-4" /> Thêm bài viết
                </button>
            </div>

            {/* Grid */}
            {guides.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                    <div className="w-16 h-16 rounded-2xl bg-surface-alt flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-medium text-sm">Chưa có bài viết nào</p>
                    <p className="text-xs mt-1">Bấm "Thêm bài viết" để tạo bài mới</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {guides.map((guide, idx) => (
                        <div
                            key={guide.id}
                            className="group relative bg-surface rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
                            style={{ animationDelay: `${idx * 60}ms` }}
                        >
                            {/* Top accent */}
                            <div className={`h-1 w-full ${guide.is_active ? 'bg-gradient-to-r from-primary to-accent' : 'bg-border'}`} />

                            <div className="p-5">
                                {/* Status + Slug */}
                                <div className="flex items-center justify-between mb-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-full ${
                                        guide.is_active
                                            ? 'bg-success/10 text-success'
                                            : 'bg-text-muted/10 text-text-muted'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                            guide.is_active ? 'bg-success' : 'bg-text-muted'
                                        }`} />
                                        {guide.is_active ? 'Hiển thị' : 'Đang ẩn'}
                                    </span>
                                    <span className="text-[11px] text-text-muted font-mono bg-surface-alt px-2 py-0.5 rounded-md">
                                        /{guide.slug}
                                    </span>
                                </div>

                                {/* Title */}
                                <h4 className="font-bold text-text text-base leading-snug mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {guide.title}
                                </h4>

                                {/* Content preview */}
                                <p className="text-xs text-text-muted leading-relaxed line-clamp-3 mb-4">
                                    {stripHtml(guide.content, 120) || 'Chưa có nội dung...'}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-border">
                                    <div className="flex items-center gap-1.5 text-text-muted">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span className="text-xs">
                                            {guide.created_at
                                                ? new Date(guide.created_at).toLocaleDateString('vi-VN')
                                                : '—'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => onEdit?.(guide)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary bg-primary/5 hover:bg-primary/10 transition-colors"
                                    >
                                        <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default GuideGrid;
