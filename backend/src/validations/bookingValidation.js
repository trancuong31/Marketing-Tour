const Joi = require('joi');

/**
 * Schema validation cho đặt tour
 */
const createBookingSchema = Joi.object({
    tour_id: Joi.number().integer().positive().required()
        .messages({
            'any.required': 'Tour ID là bắt buộc',
            'number.base': 'Tour ID phải là số',
        }),
    departure_id: Joi.number().integer().positive().required()
        .messages({
            'any.required': 'Ngày khởi hành là bắt buộc',
        }),
    pickup_location_id: Joi.number().integer().positive().allow(null),
    customer_name: Joi.string().trim().min(2).max(100).required()
        .messages({
            'any.required': 'Họ tên là bắt buộc',
            'string.min': 'Họ tên phải có ít nhất 2 ký tự',
            'string.max': 'Họ tên không quá 100 ký tự',
        }),
    customer_phone: Joi.string().trim().pattern(/^(0[35789])[0-9]{8}$/).required()
        .messages({
            'any.required': 'Số điện thoại là bắt buộc',
            'string.pattern.base': 'Số điện thoại không hợp lệ (VD: 0901234567)',
        }),
    customer_email: Joi.string().trim().email().max(150).required()
        .messages({
            'any.required': 'Email là bắt buộc',
            'string.email': 'Email không hợp lệ',
        }),
    adult_qty: Joi.number().integer().min(1).max(100).default(1)
        .messages({
            'number.min': 'Phải có ít nhất 1 người lớn',
        }),
    child_qty: Joi.number().integer().min(0).max(100).default(0),
    infant_qty: Joi.number().integer().min(0).max(100).default(0),
    customer_note: Joi.string().trim().max(500).allow('', null),
    selected_options: Joi.array().items(
        Joi.object({
            option_id: Joi.number().integer().positive().required(),
            quantity: Joi.number().integer().min(1).default(1),
        }),
    ).default([]),
});

/**
 * Schema validation cho đánh giá
 */
const createVoteSchema = Joi.object({
    rating: Joi.number().integer().min(0).max(5).optional(),
    comment: Joi.string().trim().max(1000).allow('', null),
    parent_id: Joi.number().integer().positive().allow(null),
});

module.exports = { createBookingSchema, createVoteSchema };
