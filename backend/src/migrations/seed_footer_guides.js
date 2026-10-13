/**
 * Seed editable footer articles.
 * Run: node src/migrations/seed_footer_guides.js
 */
require('../config/env');
const { sequelize } = require('../config/database');
const logger = require('../config/logger');
const { Guide, GuideTranslation } = require('../models');

const footerGuides = [
    {
        slug: 've-chung-toi',
        title: 'Về Chúng Tôi',
        content: `
            <h1>Về Chúng Tôi</h1>
            <p>Kỳ Nghỉ Tuyệt Vời đồng hành cùng khách hàng trong việc lựa chọn tour du lịch, lịch khởi hành và các dịch vụ phù hợp cho từng hành trình.</p>
            <p>Bạn có thể xem thêm <a href="/guides/blog-du-lich">Blog Du Lịch</a>, <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a> hoặc <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>.</p>
        `,
        translations: [
            {
                language: 'en',
                title: 'About Us',
                slug: 'about-us',
                content: `
                    <h1>About Us</h1>
                    <p>Ky Nghi Tuyet Voi helps travelers choose tours, departure dates, and services suited to every journey.</p>
                    <p>Explore our <a href="/guides/blog-du-lich">Travel Blog</a>, <a href="/guides/cau-hoi-thuong-gap">Frequently Asked Questions</a>, and <a href="/guides/huong-dan-thanh-toan">Payment Guide</a>.</p>
                `,
            },
            {
                language: 'zh',
                title: '关于我们',
                slug: 'guan-yu-wo-men',
                content: `
                    <h1>关于我们</h1>
                    <p>美好假期为旅客提供旅游线路、出发日期和配套服务建议，陪伴您规划每一段旅程。</p>
                    <p>欢迎了解我们的<a href="/guides/blog-du-lich">旅行博客</a>、<a href="/guides/cau-hoi-thuong-gap">常见问题</a>和<a href="/guides/huong-dan-thanh-toan">付款指南</a>。</p>
                `,
            },
        ],
    },
    {
        slug: 'blog-du-lich',
        title: 'Blog Du Lịch',
        content: `
            <h1>Blog Du Lịch</h1>
            <p>Nơi tổng hợp kinh nghiệm du lịch, gợi ý điểm đến, lưu ý trước chuyến đi và các thông tin hữu ích cho khách hàng.</p>
            <p>Tham khảo thêm <a href="/guides/ve-chung-toi">Về Chúng Tôi</a> và <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>
        `,
        translations: [
            { language: 'en', title: 'Travel Blog', slug: 'travel-blog', content: '<h1>Travel Blog</h1><p>Travel tips, destination ideas, pre-trip reminders, and useful information for your next journey.</p><p>Learn more <a href="/guides/ve-chung-toi">About Us</a> and browse our <a href="/guides/cau-hoi-thuong-gap">Frequently Asked Questions</a>.</p>' },
            { language: 'zh', title: '旅行博客', slug: 'lv-xing-bo-ke', content: '<h1>旅行博客</h1><p>这里汇集旅行经验、目的地推荐、出行前提示以及旅客实用信息。</p><p>了解<a href="/guides/ve-chung-toi">关于我们</a>，也可查看<a href="/guides/cau-hoi-thuong-gap">常见问题</a>。</p>' },
        ],
    },
    {
        slug: 'dieu-khoan-su-dung',
        title: 'Điều Khoản Sử Dụng',
        content: `
            <h1>Điều Khoản Sử Dụng</h1>
            <p>Khi sử dụng website và dịch vụ của Kỳ Nghỉ Tuyệt Vời, khách hàng đồng ý tuân thủ các điều khoản đặt tour, thanh toán và sử dụng thông tin được công bố.</p>
            <p>Vui lòng đọc thêm <a href="/guides/chinh-sach-bao-mat">Chính Sách Bảo Mật</a> và <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>.</p>
        `,
        translations: [
            { language: 'en', title: 'Terms of Use', slug: 'terms-of-use', content: '<h1>Terms of Use</h1><p>By using the Ky Nghi Tuyet Voi website and services, customers agree to follow the published terms for tour bookings, payments, and use of information.</p><p>Please also read our <a href="/guides/chinh-sach-bao-mat">Privacy Policy</a> and <a href="/guides/huong-dan-thanh-toan">Payment Guide</a>.</p>' },
            { language: 'zh', title: '使用条款', slug: 'shi-yong-tiao-kuan', content: '<h1>使用条款</h1><p>使用美好假期网站及服务即表示您同意遵守已公布的旅游预订、付款和信息使用条款。</p><p>请同时阅读<a href="/guides/chinh-sach-bao-mat">隐私政策</a>和<a href="/guides/huong-dan-thanh-toan">付款指南</a>。</p>' },
        ],
    },
    {
        slug: 'cau-hoi-thuong-gap',
        title: 'Câu Hỏi Thường Gặp',
        content: `
            <h1>Câu Hỏi Thường Gặp</h1>
            <p>Trang này tổng hợp các câu hỏi thường gặp về đặt tour, lịch khởi hành, xác nhận đơn hàng, thanh toán và chính sách hỗ trợ.</p>
            <p>Nếu bạn cần thông tin thanh toán, xem <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>. Nếu cần điều khoản dịch vụ, xem <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>
        `,
        translations: [
            { language: 'en', title: 'Frequently Asked Questions', slug: 'frequently-asked-questions', content: '<h1>Frequently Asked Questions</h1><p>Answers to common questions about tour bookings, departure dates, order confirmations, payments, and customer support.</p><p>For payment information, see our <a href="/guides/huong-dan-thanh-toan">Payment Guide</a>. For service terms, see <a href="/guides/dieu-khoan-su-dung">Terms of Use</a>.</p>' },
            { language: 'zh', title: '常见问题', slug: 'chang-jian-wen-ti', content: '<h1>常见问题</h1><p>本页汇总旅游预订、出发日期、订单确认、付款和客户支持等常见问题。</p><p>付款信息请查看<a href="/guides/huong-dan-thanh-toan">付款指南</a>；服务条款请查看<a href="/guides/dieu-khoan-su-dung">使用条款</a>。</p>' },
        ],
    },
    {
        slug: 'chinh-sach-bao-mat',
        title: 'Chính Sách Bảo Mật',
        content: `
            <h1>Chính Sách Bảo Mật</h1>
            <p>Kỳ Nghỉ Tuyệt Vời cam kết bảo vệ thông tin cá nhân của khách hàng và chỉ sử dụng dữ liệu trong phạm vi tư vấn, đặt tour, chăm sóc khách hàng và vận hành dịch vụ.</p>
            <p>Vui lòng xem thêm <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>
        `,
        translations: [
            { language: 'en', title: 'Privacy Policy', slug: 'privacy-policy', content: '<h1>Privacy Policy</h1><p>Ky Nghi Tuyet Voi is committed to protecting customers’ personal information and using it only for consultation, tour bookings, customer care, and service operations.</p><p>Please also read our <a href="/guides/dieu-khoan-su-dung">Terms of Use</a>.</p>' },
            { language: 'zh', title: '隐私政策', slug: 'yin-si-zheng-ce', content: '<h1>隐私政策</h1><p>美好假期承诺保护客户个人信息，并仅将其用于咨询、旅游预订、客户服务和业务运营。</p><p>请同时阅读<a href="/guides/dieu-khoan-su-dung">使用条款</a>。</p>' },
        ],
    },
    {
        slug: 'huong-dan-thanh-toan',
        title: 'Hướng Dẫn Thanh Toán',
        content: `
            <h1>Hướng Dẫn Thanh Toán</h1>
            <p>Khách hàng có thể thanh toán theo hướng dẫn của nhân viên tư vấn hoặc theo thông tin được cung cấp trong quá trình đặt tour.</p>
            <p>Sau khi thanh toán, vui lòng giữ lại chứng từ để đối chiếu khi cần. Xem thêm <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>
        `,
        translations: [
            { language: 'en', title: 'Payment Guide', slug: 'payment-guide', content: '<h1>Payment Guide</h1><p>Customers can pay by following their travel consultant’s instructions or the payment information provided during booking.</p><p>Please keep your payment receipt for reference. See our <a href="/guides/cau-hoi-thuong-gap">Frequently Asked Questions</a> for more information.</p>' },
            { language: 'zh', title: '付款指南', slug: 'fu-kuan-zhi-nan', content: '<h1>付款指南</h1><p>客户可按照顾问的指引，或按照预订过程中提供的付款信息完成付款。</p><p>请保留付款凭证以便核对。更多信息请查看<a href="/guides/cau-hoi-thuong-gap">常见问题</a>。</p>' },
        ],
    },
];

const seedFooterGuides = async () => {
    await sequelize.authenticate();

    for (const item of footerGuides) {
        const [guide, created] = await Guide.findOrCreate({
            where: { slug: item.slug },
            defaults: {
                title: item.title,
                slug: item.slug,
                content: item.content.trim(),
                is_active: 1,
                updated_at: new Date(),
            },
        });

        if (!created) {
            await guide.update({ is_active: 1 });
        }

        await GuideTranslation.findOrCreate({
            where: { guide_id: guide.id, language: 'vi' },
            defaults: {
                guide_id: guide.id,
                language: 'vi',
                title: guide.title,
                slug: guide.slug,
                content: guide.content,
            },
        });

        for (const translation of item.translations || []) {
            await GuideTranslation.findOrCreate({
                where: { guide_id: guide.id, language: translation.language },
                defaults: {
                    guide_id: guide.id,
                    language: translation.language,
                    title: translation.title,
                    slug: translation.slug,
                    content: translation.content.trim(),
                },
            });
        }

        logger.info(`${created ? 'Created' : 'Ensured'} footer guide: ${item.slug}`);
    }
};

seedFooterGuides()
    .then(() => {
        logger.info('Footer guide seed completed.');
        process.exit(0);
    })
    .catch((error) => {
        logger.error('Footer guide seed failed:', error);
        process.exit(1);
    });
