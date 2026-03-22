const { User, Booking, Tour } = require('../models');
const { AppError } = require('../utils/appError');
const { HTTP_CODES } = require('../constants/httpCodes');
const bcrypt = require('bcryptjs');

const getProfile = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'full_name', 'email', 'phone_number', 'avatar_url', 'role_id']
    });
    if (!user) throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);
    return user;
};

const updateProfile = async (userId, data) => {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);

    const { full_name, phone_number, avatar_url } = data;

    // Check nếu sđt trùng với người khác
    if (phone_number && phone_number !== user.phone_number) {
        const existing = await User.findOne({ where: { phone_number } });
        if (existing) throw new AppError('Số điện thoại đã được sử dụng', HTTP_CODES.CONFLICT);
    }

    await user.update({
        full_name: full_name || user.full_name,
        phone_number: phone_number || user.phone_number,
        avatar_url: avatar_url || user.avatar_url,
        updated_at: new Date()
    });

    return await getProfile(userId);
};

const changePassword = async (userId, { currentPassword, newPassword }) => {
    const user = await User.findByPk(userId);
    if (!user) throw new AppError('Tài khoản không tồn tại', HTTP_CODES.NOT_FOUND);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new AppError('Mật khẩu hiện tại không đúng', HTTP_CODES.BAD_REQUEST);

    // Validate strong password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        throw new AppError('Mật khẩu mới phải từ 8 ký tự, gồm ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt', HTTP_CODES.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await user.update({ password: hashedPassword, updated_at: new Date() });

    return { message: 'Đổi mật khẩu thành công' };
};

const getBookings = async (userId) => {
    return await Booking.findAll({
        where: { user_id: userId },
        include: [{ model: Tour, attributes: ['id', 'title', 'slug', 'price_adult', 'sale_price_adult', 'cover_image'] }],
        order: [['created_at', 'DESC']]
    });
};

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getBookings
};
