import { Star, FileText, TrendingUp } from 'lucide-react';

const stats = [
    {
        key: 'totalVotes',
        label: 'Tổng đánh giá',
        icon: Star,
        gradient: 'from-primary to-primary-dark',
        bgLight: 'bg-primary/10',
    },
    {
        key: 'avgRating',
        label: 'Sao trung bình',
        icon: TrendingUp,
        gradient: 'from-secondary to-secondary-dark',
        bgLight: 'bg-secondary/10',
    },
    {
        key: 'totalGuides',
        label: 'Tổng bài viết',
        icon: FileText,
        gradient: 'from-accent to-accent',
        bgLight: 'bg-accent/10',
    },
];

const ContentStatsBar = ({ votes = [], guides = [] }) => {
    const totalVotes = votes.length;
    const avgRating = totalVotes > 0
        ? (votes.reduce((sum, v) => sum + (v.rating || 0), 0) / totalVotes).toFixed(1)
        : '0.0';
    const totalGuides = guides.length;

    const values = { totalVotes, avgRating, totalGuides };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {stats.map((stat, idx) => (
                <div
                    key={stat.key}
                    className="relative overflow-hidden bg-surface rounded-2xl border border-border p-5 flex items-center gap-4 group hover:shadow-lg transition-all duration-300 animate-fade-up"
                    style={{ animationDelay: `${idx * 80}ms` }}
                >
                    {/* Gradient accent bar */}
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`} />

                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${stat.bgLight} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <stat.icon className={`w-5.5 h-5.5 bg-gradient-to-br ${stat.gradient} bg-clip-text`}
                            style={{ color: 'var(--color-primary)' }}
                        />
                    </div>

                    {/* Text */}
                    <div>
                        <p className="text-2xl font-bold text-text leading-none">{values[stat.key]}</p>
                        <p className="text-sm text-text-muted mt-1">{stat.label}</p>
                    </div>

                    {/* Decorative circle */}
                    <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.06] group-hover:opacity-[0.12] transition-opacity`} />
                </div>
            ))}
        </div>
    );
};

export default ContentStatsBar;
