const Joi = require('joi');

const footerLinkSchema = Joi.object({
    title: Joi.string().trim().min(1).max(255).required()
        .messages({
            'string.empty': 'Tiêu đề không được để trống',
            'string.max': 'Tiêu đề không quá 255 ký tự',
            'any.required': 'Tiêu đề là bắt buộc',
        }),
    url: Joi.string().trim().min(1).max(500).required()
        .messages({
            'string.empty': 'Đường dẫn không được để trống',
            'string.max': 'Đường dẫn không quá 500 ký tự',
            'any.required': 'Đường dẫn là bắt buộc',
        }),
    link_type: Joi.string().valid('internal', 'external').required()
        .messages({
            'any.only': 'Loại liên kết phải là internal hoặc external',
            'any.required': 'Loại liên kết là bắt buộc',
        }),
    column_position: Joi.number().integer().min(1).max(3).required()
        .messages({
            'number.min': 'Cột phải từ 1 đến 3',
            'number.max': 'Cột phải từ 1 đến 3',
            'any.required': 'Cột hiển thị là bắt buộc',
        }),
    sort_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.number().integer().valid(0, 1).default(1),
});

const footerLinkReorderSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            id: Joi.number().integer().required(),
            sort_order: Joi.number().integer().min(0).required(),
            column_position: Joi.number().integer().min(1).max(3).optional(),
        })
    ).min(1).required()
        .messages({
            'array.min': 'Danh sách sắp xếp không được rỗng',
            'any.required': 'Danh sách sắp xếp là bắt buộc',
        }),
});

module.exports = { footerLinkSchema, footerLinkReorderSchema };
