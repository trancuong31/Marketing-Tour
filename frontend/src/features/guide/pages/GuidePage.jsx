import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { guideService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react';

const GuidePage = () => {
    const { slug } = useParams();
    const [guide, setGuide] = useState(null);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (slug) {
                    const res = await guideService.getBySlug(slug);
                    setGuide(res.data.data);
                } else {
                    const res = await guideService.getAll();
                    setGuides(res.data.data || []);
                }
            } catch (err) {
                console.error('Lỗi tải hướng dẫn:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug]);

    // Trang danh sách
    if (!slug) {
        return (
            <ClientLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-extrabold text-text mb-2">Hướng Dẫn Du Lịch</h1>
                        <p className="text-text-muted">Mẹo và thông tin hữu ích cho chuyến đi của bạn</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : guides.length > 0 ? (
                        <div className="space-y-4">
                            {guides.map((g, i) => (
                                <Link
                                    key={g.id}
                                    to={`/guides/${g.slug}`}
                                    className="block bg-surface rounded-xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all animate-fade-up"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text">{g.title}</h3>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                Cập nhật: {new Date(g.updated_at).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-text-muted py-12">Chưa có bài hướng dẫn nào</p>
                    )}
                </div>
            </ClientLayout>
        );
    }

    // Trang chi tiết
    return (
        <ClientLayout>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : guide ? (
                    <>
                        <Link to="/guides" className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary-dark mb-6 transition">
                            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
                        </Link>

                        <h1 className="text-3xl font-extrabold text-text mb-4">{guide.title}</h1>
                        <p className="text-sm text-text-muted mb-6">
                            Cập nhật: {new Date(guide.updated_at).toLocaleDateString('vi-VN')}
                        </p>

                        <div
                            className="prose-content"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(guide.content) }}
                        />
                    </>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-bold text-text mb-2">Không tìm thấy</h2>
                        <p className="text-text-muted mb-4">Bài hướng dẫn không tồn tại hoặc đã bị ẩn.</p>
                        <Link to="/guides" className="text-primary hover:text-primary-dark">← Quay lại</Link>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default GuidePage;
