import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { guideService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import {
    ArrowLeft, BookOpen, Briefcase, CalendarDays, ChevronRight,
    Globe, Headphones, HelpCircle, LayoutGrid, Loader2,
    MapPin, Send, Shield, ShieldCheck, Star, Waves
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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

const GUIDE_STYLES = [
    { icon: BookOpen, bg: 'bg-blue-50', ring: 'ring-blue-200', text: 'text-blue-500' },
    { icon: Globe, bg: 'bg-emerald-50', ring: 'ring-emerald-200', text: 'text-emerald-500' },
    { icon: MapPin, bg: 'bg-orange-50', ring: 'ring-orange-200', text: 'text-orange-500' },
    { icon: HelpCircle, bg: 'bg-violet-50', ring: 'ring-violet-200', text: 'text-violet-500' },
    { icon: Shield, bg: 'bg-teal-50', ring: 'ring-teal-200', text: 'text-teal-500' },
    { icon: Star, bg: 'bg-amber-50', ring: 'ring-amber-200', text: 'text-amber-500' },
    { icon: LayoutGrid, bg: 'bg-cyan-50', ring: 'ring-cyan-200', text: 'text-cyan-500' },
];

const GuideHeroIllustration = ({ imageSrc, title }) => (
    <div className="relative mx-auto mt-5 mb-7 w-full max-w-[360px] sm:max-w-[430px]">
        <div className="absolute -left-24 top-20 hidden h-24 w-40 rounded-full bg-primary/5 blur-xl sm:block" />
        <div className="absolute -right-24 top-28 hidden h-24 w-40 rounded-full bg-primary/5 blur-xl sm:block" />
        <div className="absolute left-1/2 top-1/2 h-[78%] w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-[48%] border border-primary/30 bg-gradient-to-b from-sky-100 via-sky-50 to-white" />
        <div className="relative overflow-hidden rounded-[46%] border-4 border-white bg-gradient-to-b from-sky-200 via-cyan-100 to-white shadow-[0_18px_60px_rgba(22,119,255,0.18)]">
            {imageSrc ? (
                <img
                    src={imageSrc}
                    alt={title}
                    className="h-[230px] w-full object-cover sm:h-[285px]"
                    loading="lazy"
                />
            ) : (
                <div className="relative flex h-[230px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.9),rgba(56,189,248,0.42)_38%,rgba(14,165,233,0.18)_70%,rgba(255,255,255,0.95))] sm:h-[285px]">
                    <div className="absolute inset-x-8 top-8 h-24 rounded-full bg-white/30 blur-2xl" />
                    <span className="relative text-[108px] drop-shadow-xl sm:text-[140px]" role="img" aria-label="Sea turtle">
                        🐢
                    </span>
                </div>
            )}
        </div>
        <div className="absolute -bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 text-primary">
            <span className="h-px w-12 bg-primary/30" />
            <Waves className="h-7 w-7" />
            <span className="h-px w-12 bg-primary/30" />
        </div>
    </div>
);

const GuideFeature = ({ icon: Icon, title, description }) => (
    <div className="flex items-start gap-3 px-3 py-2 text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
        </div>
        <div>
            <h3 className="text-sm font-bold text-text">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>
        </div>
    </div>
);

const GuidePage = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const [guide, setGuide] = useState(null);
    const [guides, setGuides] = useState([]);
    const [loading, setLoading] = useState(true);
    const dateLocale = getDateLocale(i18n.language);
    const sanitizedContent = DOMPurify.sanitize(guide?.content || '');
    const heroImage = getFirstImageSrc(sanitizedContent);
    const contentWithoutHeroImage = stripFirstImage(sanitizedContent);

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
    }, [slug, i18n.language]);

    // ═══ Trang danh sách (Redesigned) ═══
    if (!slug) {
        return (
            <ClientLayout>
                <div className="relative overflow-hidden bg-gradient-to-b from-sky-50/80 via-blue-50/30 to-white min-h-[60vh]">
                    {/* ═══ Decorative background blobs ═══ */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-sky-100/50 rounded-full blur-3xl" />
                        <div className="absolute top-40 -left-32 w-80 h-80 bg-blue-50/80 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-20 w-72 h-48 bg-sky-50/40 rounded-full blur-2xl" />
                    </div>

                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
                        {/* ═══ Header Section ═══ */}
                        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-12 mb-10 sm:mb-14">
                            {/* Left: Text content */}
                            <div className="flex-1 max-w-2xl">
                                {/* "Khám phá thêm" badge pill */}
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-sm border border-sky-100 text-sm font-medium text-primary mb-5">
                                    <Send className="w-4 h-4" />
                                    {t('guide.badge')}
                                </div>

                                {/* Title: "Blog & Cẩm Nang Du Lịch" */}
                                <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-black text-gray-900 leading-tight mb-4 tracking-tight">
                                    {t('guide.titleMain')}{' '}
                                    <span className="text-primary">{t('guide.titleHighlight')}</span>
                                </h1>

                                {/* Subtitle */}
                                <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-lg">
                                    {t('guide.subtitle')}
                                </p>
                            </div>

                            {/* Right: Decorative travel illustration */}
                            <div className="hidden lg:flex relative w-72 h-56 shrink-0 items-center justify-center">
                                {/* Organic blob background */}
                                <div className="absolute inset-0 bg-gradient-to-br from-sky-100/60 via-blue-50/40 to-transparent rounded-[40%_60%_55%_45%] blur-sm" />

                                {/* Map pin icon */}
                                <div className="absolute -top-2 -right-2 z-10">
                                    <MapPin className="w-10 h-10 text-primary drop-shadow-md" fill="rgba(59,130,246,0.15)" />
                                </div>

                                {/* Cloud shapes */}
                                <div className="absolute top-4 left-8 w-24 h-8 bg-white/70 rounded-full shadow-sm" />
                                <div className="absolute top-14 right-12 w-16 h-6 bg-white/60 rounded-full" />
                                <div className="absolute bottom-20 left-4 w-20 h-6 bg-white/50 rounded-full" />

                                {/* Airplane dashed path */}
                                <div className="absolute top-8 left-20 z-10">
                                    <svg width="120" height="50" viewBox="0 0 120 50" className="text-primary/30">
                                        <path d="M5 40 Q30 10 60 20 Q90 30 115 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
                                    </svg>
                                </div>
                                <div className="absolute top-3 right-6 text-2xl transform -rotate-45 z-10 drop-shadow-md">✈️</div>

                                {/* Pagoda center */}
                                <div className="relative z-10 text-6xl drop-shadow-lg mt-4">🏯</div>

                                {/* Bottom landmarks silhouette */}
                                <div className="absolute -bottom-2 inset-x-0 flex justify-center opacity-[0.12] text-sky-900">
                                    <svg width="180" height="40" viewBox="0 0 180 40" fill="currentColor">
                                        <path d="M10 40 L10 25 L5 25 L15 10 L25 25 L20 25 L20 40Z" />
                                        <path d="M40 40 L40 15 L45 10 L50 15 L50 40Z" />
                                        <path d="M65 40 L65 25 Q75 10 85 25 L85 40Z" />
                                        <path d="M100 40 L100 30 L95 30 L105 20 L115 30 L110 30 L110 40Z M102 20 L98 20 L105 12 L112 20 L108 20Z" />
                                        <path d="M130 40 L130 18 L140 18 L140 40Z M132 22 L138 22 L138 24 L132 24Z M132 26 L138 26 L138 28 L132 28Z" />
                                        <path d="M155 40 L155 22 L160 15 L165 22 L165 40Z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* ═══ Guide List ═══ */}
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : guides.length > 0 ? (
                            <div className="space-y-3 sm:space-y-4">
                                {guides.map((g, i) => {
                                    const style = GUIDE_STYLES[i % GUIDE_STYLES.length];
                                    const IconComp = style.icon;
                                    return (
                                        <Link
                                            key={g.id}
                                            to={`/guides/${g.slug}`}
                                            className="group flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-5 sm:px-6 py-4 sm:py-5 hover:shadow-lg hover:border-primary/20 hover:bg-white transition-all duration-300 animate-fade-up"
                                            style={{ animationDelay: `${i * 80}ms` }}
                                        >
                                            {/* Colored icon */}
                                            <div className={`w-11 h-11 sm:w-12 sm:h-12 ${style.bg} ring-1 ${style.ring} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
                                                <IconComp className={`w-5 h-5 sm:w-6 sm:h-6 ${style.text}`} />
                                            </div>

                                            {/* Title only — no update date */}
                                            <h3 className="flex-1 font-bold text-gray-800 group-hover:text-primary transition-colors text-sm sm:text-base">
                                                {g.title}
                                            </h3>

                                            {/* Chevron arrow */}
                                            <div className="w-9 h-9 bg-gray-50 group-hover:bg-primary group-hover:shadow-md rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300">
                                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-text-muted py-12">{t('guide.empty')}</p>
                        )}
                    </div>
                </div>
            </ClientLayout>
        );
    }

    // ═══ Trang chi tiết ═══
    return (
        <ClientLayout>
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : guide ? (
                    <article className="relative overflow-hidden rounded-[28px] border border-primary/10 bg-white px-5 py-7 shadow-[0_24px_80px_rgba(22,119,255,0.16)] sm:px-8 lg:px-12">
                        <div className="pointer-events-none absolute -left-20 bottom-16 h-52 w-52 rounded-full bg-primary/5 blur-3xl" />
                        <div className="pointer-events-none absolute -right-20 bottom-10 h-52 w-52 rounded-full bg-sky-200/30 blur-3xl" />

                        <Link
                            to="/guides"
                            className="relative z-10 inline-flex items-center gap-2 rounded-full border border-primary/60 bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-primary hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            {t('guide.backToList')}
                        </Link>

                        <header className="relative z-10 mx-auto max-w-4xl text-center">
                            <div className="mx-auto mb-5 mt-2 flex items-center justify-center gap-4 text-primary">
                                <span className="h-px w-20 bg-primary/25" />
                                <Waves className="h-6 w-6" />
                                <span className="h-px w-20 bg-primary/25" />
                            </div>

                            <h1 className="text-4xl font-black uppercase leading-tight tracking-tight text-primary-dark sm:text-5xl lg:text-6xl">
                                {guide.title}
                            </h1>
                            <p className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-medium text-text-muted">
                                <CalendarDays className="h-4 w-4" />
                                {t('guide.updatedAt')}: {new Date(guide.updated_at).toLocaleDateString(dateLocale)}
                            </p>

                            <GuideHeroIllustration imageSrc={heroImage} title={guide.title} />
                        </header>

                        <div
                            className="prose-content relative z-10 mx-auto mt-10 max-w-3xl text-center text-base leading-8 text-text-secondary [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_img]:mx-auto [&_img]:rounded-3xl [&_img]:shadow-lg"
                            dangerouslySetInnerHTML={{ __html: contentWithoutHeroImage }}
                        />

                        <div className="relative z-10 mx-auto mt-9 grid max-w-4xl gap-4 border-t border-primary/15 pt-6 sm:grid-cols-3 sm:divide-x sm:divide-primary/15">
                            <GuideFeature
                                icon={Briefcase}
                                title={t('guide.features.diverse.title')}
                                description={t('guide.features.diverse.desc')}
                            />
                            <GuideFeature
                                icon={ShieldCheck}
                                title={t('guide.features.trusted.title')}
                                description={t('guide.features.trusted.desc')}
                            />
                            <GuideFeature
                                icon={Headphones}
                                title={t('guide.features.support.title')}
                                description={t('guide.features.support.desc')}
                            />
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-20">
                        <h2 className="text-xl font-bold text-text mb-2">{t('guide.notFoundTitle')}</h2>
                        <p className="text-text-muted mb-4">{t('guide.notFoundDesc')}</p>
                        <Link to="/guides" className="text-primary hover:text-primary-dark">{t('guide.back')}</Link>
                    </div>
                )}
            </div>
        </ClientLayout>
    );
};

export default GuidePage;
