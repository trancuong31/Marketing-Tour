require('../config/env');
const { Guide, GuideTranslation } = require('../models');

const GUIDES_DATA = [
    {
        title: 'Về Chúng Tôi',
        slug: 've-chung-toi',
        content: '<h2>Về Chúng Tôi - Kỳ Nghỉ Tuyệt Vời</h2><p>Chào mừng bạn đến với <strong>Marketing Tour</strong>, đơn vị tiên phong trong lĩnh vực tổ chức và cung cấp các dịch vụ du lịch, lữ hành chất lượng cao tại Việt Nam và quốc tế.</p><p>Với đội ngũ chuyên gia giàu kinh nghiệm, tận tâm và chuyên nghiệp, chúng tôi cam kết mang đến cho quý khách những trải nghiệm du lịch trọn vẹn, đáng nhớ và an toàn nhất.</p><h3>Tầm nhìn & Sứ mệnh</h3><p>Trở thành thương hiệu du lịch hàng đầu, kết nối du khách với những danh lam thắng cảnh tươi đẹp và văn hóa đặc sắc trên khắp mọi miền đất nước.</p>',
        is_active: 1,
        translations: [
            { language: 'en', title: 'About Us', slug: 'about-us', content: '<h2>About Us - Wonderful Vacation</h2><p>Welcome to <strong>Marketing Tour</strong>, a pioneer in organizing and providing high-quality travel and tourism services in Vietnam and internationally.</p><p>With a team of experienced, dedicated, and professional experts, we are committed to delivering complete, memorable, and safe travel experiences for our valued guests.</p>' },
            { language: 'zh', title: '关于我们', slug: 'about-us-zh', content: '<h2>关于我们 - 美好假期</h2><p>欢迎来到 <strong>Marketing Tour</strong>，越南及国际高品质旅游出行服务的先锋品牌。</p><p>凭借经验丰富、尽心尽力的专业团队，我们致力于为每一位客户带来圆满、难忘且安全的旅行体验。</p>' },
        ],
    },
    {
        title: 'Blog Du Lịch',
        slug: 'blog-du-lich',
        content: '<h2>Cẩm Nang & Blog Du Lịch</h2><p>Khám phá những điểm đến hấp dẫn, kinh nghiệm du lịch tự túc, văn hóa ẩm thực và những mẹo du lịch hữu ích cùng Marketing Tour.</p><p>Các bài viết được cập nhật liên tục bởi đội ngũ hướng dẫn viên và những du khách đam mê trải nghiệm, giúp bạn có sự chuẩn bị tốt nhất cho mỗi chuyến hành trình.</p>',
        is_active: 1,
        translations: [
            { language: 'en', title: 'Travel Blog', slug: 'travel-blog', content: '<h2>Travel Guide & Blog</h2><p>Explore exciting destinations, travel tips, local cuisine, and helpful advice with Marketing Tour.</p>' },
            { language: 'zh', title: '旅游博客', slug: 'travel-blog-zh', content: '<h2>旅游指南与博客</h2><p>与 Marketing Tour 一起探索精彩的目的地、实用旅游攻略以及丰富的当地美食文化。</p>' },
        ],
    },
    {
        title: 'Điều Khoản Sử Dụng',
        slug: 'dieu-khoan-su-dung',
        content: '<h2>Điều Khoản Sử Dụng Dịch Vụ</h2><p>Khi truy cập và sử dụng dịch vụ trên website của Marketing Tour, quý khách đồng ý tuân thủ các điều khoản và quy định dưới đây.</p><h3>1. Đặt tour và xác nhận dịch vụ</h3><p>Quý khách vui lòng cung cấp thông tin chính xác về họ tên, số điện thoại, email và số lượng hành khách khi đăng ký tour.</p><h3>2. Thay đổi và hủy dịch vụ</h3><p>Mọi yêu cầu thay đổi lịch trình hoặc hủy tour cần được thông báo bằng văn bản hoặc qua các kênh hỗ trợ chính thức của chúng tôi.</p>',
        is_active: 1,
        translations: [
            { language: 'en', title: 'Terms of Use', slug: 'terms-of-use', content: '<h2>Terms of Service</h2><p>By accessing and using Marketing Tour services, you agree to comply with the terms and conditions outlined below.</p>' },
            { language: 'zh', title: '使用条款', slug: 'terms-of-use-zh', content: '<h2>服务使用条款</h2><p>当您访问并使用 Marketing Tour 网站服务时，即表示您同意遵守以下各项条款与规则。</p>' },
        ],
    },
    {
        title: 'Câu Hỏi Thường Gặp',
        slug: 'cau-hoi-thuong-gap',
        content: '<h2>Câu Hỏi Thường Gặp (FAQ)</h2><h3>1. Làm thế nào để đặt tour trên website?</h3><p>Quý khách chỉ cần chọn tour mong muốn, chọn ngày khởi hành, điền thông tin liên hệ và bấm &quot;Đặt tour ngay&quot;. Nhân viên tư vấn sẽ liên hệ lại trong vòng 15 phút.</p><h3>2. Tôi có thể thanh toán bằng những hình thức nào?</h3><p>Chúng tôi chấp nhận thanh toán qua chuyển khoản ngân hàng, thẻ tín dụng/ghi nợ quốc tế, ví điện tử hoặc thanh toán trực tiếp tại văn phòng.</p><h3>3. Giá tour đã bao gồm bảo hiểm du lịch chưa?</h3><p>Tất cả các tour trọn gói của chúng tôi đều đã bao gồm bảo hiểm du lịch theo quy định.</p>',
        is_active: 1,
        translations: [
            { language: 'en', title: 'Frequently Asked Questions', slug: 'faq', content: '<h2>Frequently Asked Questions (FAQ)</h2><h3>1. How do I book a tour on the website?</h3><p>Simply choose your preferred tour, select a departure date, enter contact details, and click &quot;Book Now&quot;.</p>' },
            { language: 'zh', title: '常见问题', slug: 'faq-zh', content: '<h2>常见问题 (FAQ)</h2><h3>1. 如何在网站上预订旅游行程？</h3><p>只需选择您心仪的行程、出行日期，填写联系信息并点击“立即预订”。</p>' },
        ],
    },
    {
        title: 'Chính Sách Bảo Mật',
        slug: 'chinh-sach-bao-mat',
        content: '<h2>Chính Sách Bảo Mật Thông Tin</h2><p>Marketing Tour cam kết tôn trọng và bảo vệ quyền riêng tư của mọi khách hàng khi truy cập và giao dịch trên nền tảng của chúng tôi.</p><h3>1. Thu thập thông tin</h3><p>Chúng tôi chỉ thu thập thông tin cá nhân cần thiết để xử lý đặt tour, gửi thông báo và hỗ trợ khách hàng trong suốt chuyến đi.</p><h3>2. Bảo mật dữ liệu</h3><p>Mọi thông tin cá nhân đều được mã hóa và bảo mật nghiêm ngặt theo các tiêu chuẩn an toàn thông tin hiện đại.</p>',
        is_active: 1,
        translations: [
            { language: 'en', title: 'Privacy Policy', slug: 'privacy-policy', content: '<h2>Privacy Policy</h2><p>Marketing Tour is committed to protecting your privacy and safeguarding your personal information.</p>' },
            { language: 'zh', title: '隐私政策', slug: 'privacy-policy-zh', content: '<h2>信息隐私政策</h2><p>Marketing Tour 承诺尊重并保护每位客户在我们平台上访问和交易时的隐私权。</p>' },
        ],
    },
    {
        title: 'Hướng Dẫn Thanh Toán',
        slug: 'huong-dan-thanh-toan',
        content: '<h2>Hướng Dẫn Thanh Toán</h2><p>Nhằm tạo điều kiện thuận lợi nhất cho quý khách, Marketing Tour cung cấp các phương thức thanh toán linh hoạt và an toàn:</p><h3>1. Chuyển khoản ngân hàng</h3><p>Quý khách có thể chuyển khoản trực tiếp qua tài khoản ngân hàng chính thức của công ty. Nội dung chuyển khoản ghi rõ: [Mã đơn tour] - [Số điện thoại].</p><h3>2. Thanh toán trực tuyến</h3><p>Hỗ trợ thanh toán nhanh chóng qua thẻ ATM nội địa, Visa, MasterCard, JCB và các ví điện tử phổ biến.</p><h3>3. Thanh toán tại văn phòng</h3><p>Quý khách có thể đến trực tiếp văn phòng của chúng tôi để thanh toán bằng tiền mặt hoặc quẹt thẻ.</p>',
        is_active: 1,
        translations: [
            { language: 'en', title: 'Payment Guide', slug: 'payment-guide', content: '<h2>Payment Instructions</h2><p>Marketing Tour provides flexible and secure payment methods including bank transfer, online credit/debit cards, and in-person payment.</p>' },
            { language: 'zh', title: '付款指南', slug: 'payment-guide-zh', content: '<h2>付款指南与方式</h2><p>为给客户提供最大便利，Marketing Tour 提供银行转账、线上信用卡/银联以及前往办公地点现场付款等多种灵活方式。</p>' },
        ],
    },
];

async function seed() {
    try {
        console.log('Seeding footer guides...');
        for (const item of GUIDES_DATA) {
            const [guide, created] = await Guide.findOrCreate({
                where: { slug: item.slug },
                defaults: {
                    title: item.title,
                    slug: item.slug,
                    content: item.content,
                    is_active: item.is_active,
                    updated_at: new Date(),
                },
            });
            console.log(`${created ? 'Created' : 'Existing'} guide: ${guide.title} (slug: ${guide.slug})`);

            for (const tr of item.translations) {
                await GuideTranslation.findOrCreate({
                    where: { guide_id: guide.id, language: tr.language },
                    defaults: {
                        guide_id: guide.id,
                        language: tr.language,
                        title: tr.title,
                        slug: tr.slug,
                        content: tr.content,
                    },
                });
            }
        }
        console.log('Done seeding footer guides!');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding footer guides:', err);
        process.exit(1);
    }
}

seed();
