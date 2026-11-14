import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { guideService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import {
    ArrowLeft,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Loader2,
    Sparkles,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import tokyoImg from '@/assets/images/tokyo.webp';

const getDateLocale = (language) => {
    if (language?.startsWith('zh')) return 'zh-CN';
    if (language?.startsWith('en')) return 'en-US';
    return 'vi-VN';
};

const getFirstImageSrc = (html = '') => {
    const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
    return match?.[1] || '';
};

const stripFirstImage = (html = '') => html.replace(/<img[^>]+>/i, '');

const GuidePage = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const [guide, setGuide] = useState(null);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const dateLocale = getDateLocale(i18n.language);

    useEffect(() => {
        let isMounted = true;
        const fetchData = async () => {
            setLoading(true);
            try {
                if (slug) {
                    const res = await guideService.getBySlug(slug);
                    if (isMounted) setGuide(res.data?.data || null);
                } else {
                    const res = await guideService.getAll();
                    if (isMounted) setGuides(res.data?.data || []);
                }
            } catch (err) {
                console.error('Lỗi tải dữ liệu bài viết:', err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchData();
        return () => {
            isMounted = false;
        };
    }, [slug, i18n.language]);

    // ══════════════════════════════════════════════════════════
    // 1. TRANG DANH SÁCH (khi không có slug - theo form ảnh mẫu)
    // ══════════════════════════════════════════════════════════
    if (!slug) {
        return (
            <ClientLayout>
                <div className="min-h-screen bg-gradient-to-b from-[#EEF4FC] via-[#F4F8FD] to-[#E8F1FA]">
                    {/* Top Hero Section (Ảnh tokyo.webp sắc nét, có màu nền xanh thương hiệu ở sau ảnh) */}
                    <div className="relative overflow-hidden border-b border-[#C2D8F0]/70 pt-16 pb-16 sm:pt-24 sm:pb-24 px-4 text-center bg-gradient-to-b from-[#A5CEF2] via-[#C2DEF7] to-[#EEF4FC]">
                        {/* Background Image: giữ ảnh sắc nét, màu tươi, không dùng blur */}
                        <img
                            src={tokyoImg}
                            alt="Hero background"
                            className="absolute inset-0 w-full h-full object-cover object-center opacity-80 contrast-[1.05] saturate-[1.1] select-none pointer-events-none"
                        />
                        {/* Lớp phủ chuyển tiếp rất nhẹ để giữ nét ảnh tối đa */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-[#EEF4FC] pointer-events-none" />

                        {/* Centered content on top of background */}
                        <div className="relative z-10 max-w-3xl mx-auto">
                            {/* What's new pill badge */}
                            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/95 backdrop-blur-sm border border-primary/30 rounded-full text-xs font-bold text-primary shadow-sm">
                                <Sparkles className="w-3.5 h-3.5 text-primary" />
                                <span>{t('guide.badge', "What's new")}</span>
                            </div>

                            {/* Main Title in Navy tone with drop shadow for clarity */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A3566] tracking-tight mt-4 drop-shadow-[0_1px_2px_rgba(255,255,255,0.9)]">
                                {t('guide.title', 'Blog & Cẩm Nang Du Lịch')}
                            </h1>

                            {/* Subtitle */}
                            <p className="mt-3 text-[#224370] text-sm sm:text-base max-w-lg mx-auto leading-relaxed font-semibold drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                                {t('guide.subtitle', 'Mẹo và thông tin hữu ích cho chuyến đi của bạn')}
                            </p>

                            {/* CTA Button */}
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        document.getElementById('guide-list')?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white border border-primary rounded-xl text-sm font-bold shadow-md hover:bg-primary-dark hover:shadow-lg transition-all duration-200"
                                >
                                    {t('guide.exploreMore', 'Khám phá thêm')}
                                </button>
                            </div>

                            {/* Feature checkmarks */}
                            <div className="mt-5 flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#1A3566] font-bold flex-wrap drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="text-primary font-black">✓</span>
                                    {t('guide.features.diverse.title', 'Tour đa dạng')}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="text-primary font-black">✓</span>
                                    {t('guide.features.trusted.title', 'Dịch vụ uy tín')}
                                </span>
                                <span className="inline-flex items-center gap-1.5">
                                    <span className="text-primary font-black">✓</span>
                                    {t('guide.features.support.title', 'Hỗ trợ 24/7')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Danh sách các bài viết dạng thẻ có mũi tên */}
                    <div id="guide-list" className="max-w-2xl sm:max-w-3xl mx-auto px-4 py-12 sm:py-16">
                        {loading ? (
                            <div className="space-y-3 sm:space-y-3.5">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className="h-14 bg-white/70 rounded-2xl border border-[#C2D8F0]/60 animate-pulse"
                                    />
                                ))}
                            </div>
                        ) : guides.length > 0 ? (
                            <div className="space-y-3 sm:space-y-3.5">
                                {guides.map((g, index) => (
                                    <Link
                                        key={g.id || g.slug}
                                        to={`/guides/${g.slug}`}
                                        className="group flex items-center gap-3.5 px-5 py-4 sm:py-4.5 bg-white/95 backdrop-blur-sm border border-[#C2D8F0]/80 rounded-2xl shadow-[0_2px_10px_rgba(30,111,191,0.04)] hover:border-primary hover:shadow-md hover:bg-white transition-all duration-200"
                                    >
                                        <div className="text-primary/60 group-hover:text-primary transition-colors shrink-0">
                                            {index === 0 ? (
                                                <ChevronUp className="w-4 h-4 transition-transform" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 transition-transform" />
                                            )}
                                        </div>
                                        <span className="text-sm sm:text-base font-semibold text-[#1A3566] group-hover:text-primary transition-colors flex-1">
                                            {g.title}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-text-muted">
                                <p>{t('guide.empty', 'Chưa có bài hướng dẫn nào')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </ClientLayout>
        );
    }

    // ══════════════════════════════════════════════════════════
    // 2. TRANG CHI TIẾT BÀI VIẾT (khi có slug)
    // ══════════════════════════════════════════════════════════
    const sanitizedContent = DOMPurify.sanitize(guide?.content || '');
    const heroImage = getFirstImageSrc(sanitizedContent);
    const contentWithoutHeroImage = stripFirstImage(sanitizedContent);

    return (
        <ClientLayout>
            <div className="min-h-screen bg-gradient-to-b from-[#EEF4FC] via-[#F4F8FD] to-[#E8F1FA] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 text-text-muted">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
                            <p className="text-sm">Đang tải nội dung bài viết...</p>
                        </div>
                    ) : guide ? (
                        <article className="bg-white/95 backdrop-blur-sm rounded-3xl border border-[#C2D8F0]/80 shadow-[0_8px_30px_rgba(30,111,191,0.06)] p-6 sm:p-10 lg:p-12">
                            {/* Back button */}
                            <Link
                                to="/guides"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#C2D8F0] rounded-xl text-sm font-semibold text-[#1A3566] hover:text-primary hover:border-primary/50 shadow-sm transition mb-8"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('guide.backToList', 'Quay lại danh sách')}
                            </Link>

                            {/* Title & Metadata */}
                            <header className="mb-8">
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1A3566] tracking-tight leading-tight">
                                    {guide.title}
                                </h1>
                                {guide.updated_at && (
                                    <p className="mt-3 text-xs sm:text-sm text-text-muted flex items-center gap-1.5">
                                        <CalendarDays className="w-4 h-4" />
                                        {t('guide.updatedAt')}: {new Date(guide.updated_at).toLocaleDateString(dateLocale)}
                                    </p>
                                )}
                            </header>

                            {/* Featured / Hero Image if article has one */}
                            {heroImage ? (
                                <div className="rounded-2xl overflow-hidden max-h-[440px] shadow-sm mb-10 border border-[#C2D8F0]/60 bg-surface-alt">
                                    <img
                                        src={heroImage}
                                        alt={guide.title}
                                        className="w-full h-full object-cover max-h-[440px]"
                                    />
                                </div>
                            ) : null}

                            {/* Content Body */}
                            <div
                                className="prose prose-zinc max-w-none text-text-secondary leading-relaxed text-base sm:text-lg [&_a]:text-primary [&_a]:underline [&_img]:rounded-2xl [&_img]:my-6 [&_img]:shadow-sm [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-[#1A3566] [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-[#1A3566] [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5"
                                dangerouslySetInnerHTML={{ __html: contentWithoutHeroImage || sanitizedContent }}
                            />

                            {/* Bottom Navigation */}
                            <div className="mt-14 pt-8 border-t border-[#C2D8F0]/70 flex justify-between items-center">
                                <Link
                                    to="/guides"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t('guide.backToList', 'Quay lại danh sách')}
                                </Link>
                            </div>
                        </article>
                    ) : (
                        <div className="text-center py-24 bg-white/90 backdrop-blur-sm rounded-3xl border border-[#C2D8F0]/80 p-12">
                            <h2 className="text-xl font-bold text-[#1A3566] mb-2">
                                {t('guide.notFoundTitle', 'Không tìm thấy')}
                            </h2>
                            <p className="text-sm text-text-muted mb-6">
                                {t('guide.notFoundDesc', 'Bài hướng dẫn không tồn tại hoặc đã bị ẩn.')}
                            </p>
                            <Link
                                to="/guides"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark shadow-sm transition"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                {t('guide.backToList', 'Quay lại danh sách')}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </ClientLayout>
    );
};

export default GuidePage;
