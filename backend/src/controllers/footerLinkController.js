const { FooterLink } = require('../models');
const { sequelize } = require('../config/database');
const { catchAsync } = require('../utils/catchAsync');
const { AppError } = require('../utils/appError');
const { footerLinkSchema, footerLinkReorderSchema } = require('../validations/footerLinkValidation');

/**
 * Public: Lấy danh sách liên kết footer đang hoạt động
 */
const getPublicFooterLinks = catchAsync(async (_req, res) => {
    const links = await FooterLink.findAll({
        where: { is_active: 1 },
        order: [
            ['column_position', 'ASC'],
            ['sort_order', 'ASC'],
            ['id', 'ASC'],
        ],
    });

    res.status(200).json({
        status: 'success',
        data: links,
    });
});

/**
 * Admin: Lấy toàn bộ danh sách liên kết footer
 */
const getAdminFooterLinks = catchAsync(async (_req, res) => {
    const links = await FooterLink.findAll({
        order: [
            ['column_position', 'ASC'],
            ['sort_order', 'ASC'],
            ['id', 'ASC'],
        ],
    });

    res.status(200).json({
        status: 'success',
        data: links,
    });
});

/**
 * Admin: Thêm mới liên kết footer
 */
const createFooterLink = catchAsync(async (req, res) => {
    const { error, value } = footerLinkSchema.validate(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    // Nếu không truyền sort_order, tự động tính giá trị cao nhất trong cột + 1
    if (value.sort_order === undefined || value.sort_order === 0) {
        const maxSort = await FooterLink.max('sort_order', {
            where: { column_position: value.column_position },
        });
        value.sort_order = (maxSort || 0) + 1;
    }

    const newLink = await FooterLink.create(value);

    res.status(201).json({
        status: 'success',
        message: 'Tạo liên kết footer thành công',
        data: newLink,
    });
});

/**
 * Admin: Cập nhật liên kết footer
 */
const updateFooterLink = catchAsync(async (req, res) => {
    const { id } = req.params;
    const { error, value } = footerLinkSchema.validate(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    const link = await FooterLink.findByPk(id);
    if (!link) {
        throw new AppError('Không tìm thấy liên kết footer', 404);
    }

    await link.update(value);

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật liên kết footer thành công',
        data: link,
    });
});

/**
 * Admin: Xóa liên kết footer
 */
const deleteFooterLink = catchAsync(async (req, res) => {
    const { id } = req.params;
    const link = await FooterLink.findByPk(id);
    if (!link) {
        throw new AppError('Không tìm thấy liên kết footer', 404);
    }

    await link.destroy();

    res.status(200).json({
        status: 'success',
        message: 'Xóa liên kết footer thành công',
    });
});

/**
 * Admin: Bật/tắt trạng thái hiển thị
 */
const toggleFooterLink = catchAsync(async (req, res) => {
    const { id } = req.params;
    const link = await FooterLink.findByPk(id);
    if (!link) {
        throw new AppError('Không tìm thấy liên kết footer', 404);
    }

    const newStatus = link.is_active === 1 ? 0 : 1;
    await link.update({ is_active: newStatus });

    res.status(200).json({
        status: 'success',
        message: `Đã ${newStatus === 1 ? 'hiển thị' : 'ẩn'} liên kết`,
        data: link,
    });
});

/**
 * Admin: Thay đổi thứ tự sắp xếp hàng loạt
 */
const reorderFooterLinks = catchAsync(async (req, res) => {
    const { error, value } = footerLinkReorderSchema.validate(req.body);
    if (error) {
        throw new AppError(error.details[0].message, 400);
    }

    await sequelize.transaction(async (t) => {
        for (const item of value.items) {
            const updateData = { sort_order: item.sort_order };
            if (item.column_position !== undefined) {
                updateData.column_position = item.column_position;
            }
            await FooterLink.update(updateData, {
                where: { id: item.id },
                transaction: t,
            });
        }
    });

    const updatedLinks = await FooterLink.findAll({
        order: [
            ['column_position', 'ASC'],
            ['sort_order', 'ASC'],
            ['id', 'ASC'],
        ],
    });

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật thứ tự thành công',
        data: updatedLinks,
    });
});

module.exports = {
    getPublicFooterLinks,
    getAdminFooterLinks,
    createFooterLink,
    updateFooterLink,
    deleteFooterLink,
    toggleFooterLink,
    reorderFooterLinks,
};
