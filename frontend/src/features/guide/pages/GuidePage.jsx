import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { guideService } from '@/services/tourService';
import ClientLayout from '@/components/layout/ClientLayout';
import { ArrowLeft, BookOpen, Briefcase, CalendarDays, Headphones, Loader2, ShieldCheck, Waves } from 'lucide-react';
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

    // Trang danh sách
    if (!slug) {
        return (
            <ClientLayout>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-text mb-3 tracking-tight">{t('guide.title')}</h1>
                        <p className="text-text-muted">{t('guide.subtitle')}</p>
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
                                    className="block bg-surface rounded-lg border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all animate-fade-up"
                                    style={{ animationDelay: `${i * 80}ms` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-text">{g.title}</h3>
                                            <p className="text-xs text-text-muted mt-0.5">
                                                {t('guide.updatedAt')}: {new Date(g.updated_at).toLocaleDateString(dateLocale)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-text-muted py-12">{t('guide.empty')}</p>
                    )}
                </div>
            </ClientLayout>
        );
    }

    // Trang chi tiết
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
