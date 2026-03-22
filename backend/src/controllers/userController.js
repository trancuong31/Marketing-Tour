const { catchAsync } = require('../utils/catchAsync');
const userService = require('../services/userService');

const getProfile = catchAsync(async (req, res) => {
    const data = await userService.getProfile(req.user.id);
    res.status(200).json({ status: 'success', message: 'Lấy thông tin thành công', data });
});

const updateProfile = catchAsync(async (req, res) => {
    let avatar_url = req.body.avatar_url;

    // Nếu có file upload thì tạo url
    if (req.file) {
        avatar_url = `/uploads/avatars/${req.file.filename}`;
    }

    const data = await userService.updateProfile(req.user.id, {
        ...req.body,
        avatar_url
    });
    res.status(200).json({ status: 'success', message: 'Cập nhật thông tin thành công', data });
});

const changePassword = catchAsync(async (req, res) => {
    const data = await userService.changePassword(req.user.id, req.body);
    res.status(200).json({ status: 'success', message: data.message });
});

const getBookings = catchAsync(async (req, res) => {
    const data = await userService.getBookings(req.user.id);
    res.status(200).json({ status: 'success', message: 'Lấy danh sách booking thành công', data });
});

module.exports = {
    getProfile,
    updateProfile,
    changePassword,
    getBookings
};
