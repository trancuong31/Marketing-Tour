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
    },
    {
        slug: 'blog-du-lich',
        title: 'Blog Du Lịch',
        content: `
            <h1>Blog Du Lịch</h1>
            <p>Nơi tổng hợp kinh nghiệm du lịch, gợi ý điểm đến, lưu ý trước chuyến đi và các thông tin hữu ích cho khách hàng.</p>
            <p>Tham khảo thêm <a href="/guides/ve-chung-toi">Về Chúng Tôi</a> và <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>
        `,
    },
    {
        slug: 'dieu-khoan-su-dung',
        title: 'Điều Khoản Sử Dụng',
        content: `
            <h1>Điều Khoản Sử Dụng</h1>
            <p>Khi sử dụng website và dịch vụ của Kỳ Nghỉ Tuyệt Vời, khách hàng đồng ý tuân thủ các điều khoản đặt tour, thanh toán và sử dụng thông tin được công bố.</p>
            <p>Vui lòng đọc thêm <a href="/guides/chinh-sach-bao-mat">Chính Sách Bảo Mật</a> và <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>.</p>
        `,
    },
    {
        slug: 'cau-hoi-thuong-gap',
        title: 'Câu Hỏi Thường Gặp',
        content: `
            <h1>Câu Hỏi Thường Gặp</h1>
            <p>Trang này tổng hợp các câu hỏi thường gặp về đặt tour, lịch khởi hành, xác nhận đơn hàng, thanh toán và chính sách hỗ trợ.</p>
            <p>Nếu bạn cần thông tin thanh toán, xem <a href="/guides/huong-dan-thanh-toan">Hướng Dẫn Thanh Toán</a>. Nếu cần điều khoản dịch vụ, xem <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>
        `,
    },
    {
        slug: 'chinh-sach-bao-mat',
        title: 'Chính Sách Bảo Mật',
        content: `
            <h1>Chính Sách Bảo Mật</h1>
            <p>Kỳ Nghỉ Tuyệt Vời cam kết bảo vệ thông tin cá nhân của khách hàng và chỉ sử dụng dữ liệu trong phạm vi tư vấn, đặt tour, chăm sóc khách hàng và vận hành dịch vụ.</p>
            <p>Vui lòng xem thêm <a href="/guides/dieu-khoan-su-dung">Điều Khoản Sử Dụng</a>.</p>
        `,
    },
    {
        slug: 'huong-dan-thanh-toan',
        title: 'Hướng Dẫn Thanh Toán',
        content: `
            <h1>Hướng Dẫn Thanh Toán</h1>
            <p>Khách hàng có thể thanh toán theo hướng dẫn của nhân viên tư vấn hoặc theo thông tin được cung cấp trong quá trình đặt tour.</p>
            <p>Sau khi thanh toán, vui lòng giữ lại chứng từ để đối chiếu khi cần. Xem thêm <a href="/guides/cau-hoi-thuong-gap">Câu Hỏi Thường Gặp</a>.</p>
        `,
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
