import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pageSource = readFileSync(
    new URL('../features/tour/pages/TourDetailPage.jsx', import.meta.url),
    'utf8'
);

const locales = ['vi', 'en', 'zh'].map((language) => ({
    language,
    tour: JSON.parse(readFileSync(new URL(`../i18n/${language}/tour.json`, import.meta.url), 'utf8')),
}));

describe('community review localization and encoding', () => {
    it('uses locale keys for admin replies and acknowledgements', () => {
        expect(pageSource).toContain("t('tour.review.adminReply')");
        expect(pageSource).toContain("t('tour.review.officialAcknowledgement')");
        expect(pageSource).not.toContain('Pháº£n há»“i cá»§a KyNghiTuyetVoi');
        expect(pageSource).not.toContain('Ä‘Ã£ ghi nháº­n');
    });

    it('provides the intended review labels in Vietnamese, English, and Chinese', () => {
        const expected = {
            vi: {
                adminReply: 'Phản hồi của KyNghiTuyetVoi',
                acknowledgement: 'KyNghiTuyetVoi đã ghi nhận',
                heading: 'Đánh giá cộng đồng ({{count}})',
                empty: 'Chưa có đánh giá nào. Hãy là người đầu tiên!',
            },
            en: {
                adminReply: 'KyNghiTuyetVoi reply',
                acknowledgement: 'KyNghiTuyetVoi acknowledged',
                heading: 'Community Reviews ({{count}})',
                empty: 'No reviews yet. Be the first to share your experience!',
            },
            zh: {
                adminReply: 'KyNghiTuyetVoi 回复',
                acknowledgement: 'KyNghiTuyetVoi 已确认',
                heading: '社区评价（{{count}}）',
                empty: '暂无评价。成为第一个分享体验的人吧！',
            },
        };

        locales.forEach(({ language, tour }) => {
            expect(tour.review.adminReply).toBe(expected[language].adminReply);
            expect(tour.review.officialAcknowledgement).toBe(expected[language].acknowledgement);
            expect(tour.detail.communityReviews).toBe(expected[language].heading);
            expect(tour.detail.noCommunityReviews).toBe(expected[language].empty);
        });
    });
});