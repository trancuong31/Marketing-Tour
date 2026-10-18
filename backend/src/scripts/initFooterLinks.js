require('../config/env');
const { sequelize } = require('../config/database');
const { FooterLink } = require('../models');

const INITIAL_LINKS = [
    // Cột 1: Về chúng tôi
    { title: 'Về Chúng Tôi', url: '/guides/ve-chung-toi', link_type: 'internal', column_position: 1, sort_order: 1, is_active: 1 },
    { title: 'Blog Du Lịch', url: '/guides/blog-du-lich', link_type: 'internal', column_position: 1, sort_order: 2, is_active: 1 },
    { title: 'Điều Khoản Sử Dụng', url: '/guides/dieu-khoan-su-dung', link_type: 'internal', column_position: 1, sort_order: 3, is_active: 1 },
    { title: 'Câu Hỏi Thường Gặp', url: '/guides/cau-hoi-thuong-gap', link_type: 'internal', column_position: 1, sort_order: 4, is_active: 1 },

    // Cột 2: Thông tin cần biết
    { title: 'Điều Khoản Sử Dụng', url: '/guides/dieu-khoan-su-dung', link_type: 'internal', column_position: 2, sort_order: 1, is_active: 1 },
    { title: 'Chính Sách Bảo Mật', url: '/guides/chinh-sach-bao-mat', link_type: 'internal', column_position: 2, sort_order: 2, is_active: 1 },
    { title: 'Hướng Dẫn Thanh Toán', url: '/guides/huong-dan-thanh-toan', link_type: 'internal', column_position: 2, sort_order: 3, is_active: 1 },

    // Cột 3: Đối tác
    { title: 'Vietnam Airlines', url: 'https://www.vietnamairlines.com', link_type: 'external', column_position: 3, sort_order: 1, is_active: 1 },
    { title: 'VNExpress', url: 'https://vnexpress.net', link_type: 'external', column_position: 3, sort_order: 2, is_active: 1 },
    { title: 'Booking.com', url: 'https://www.booking.com', link_type: 'external', column_position: 3, sort_order: 3, is_active: 1 },
    { title: 'TripAdvisor', url: 'https://www.tripadvisor.com', link_type: 'external', column_position: 3, sort_order: 4, is_active: 1 },
];

async function init() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Synchronizing FooterLink table...');
        await FooterLink.sync();

        const count = await FooterLink.count();
        if (count === 0) {
            console.log('Seeding initial footer links...');
            await FooterLink.bulkCreate(INITIAL_LINKS);
            console.log(`Seeded ${INITIAL_LINKS.length} footer links successfully!`);
        } else {
            console.log(`FooterLink table already has ${count} records. Skipping seed.`);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error initializing footer links:', err);
        process.exit(1);
    }
}

init();
