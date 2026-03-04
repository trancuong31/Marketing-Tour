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
    number_of_people: Joi.number().integer().min(1).max(100).default(1)
        .messages({
            'number.min': 'Số người phải ít nhất 1',
            'number.max': 'Số người không quá 100',
        }),
    customer_note: Joi.string().trim().max(500).allow('', null),
});

/**
 * Schema validation cho đánh giá
 */
const createVoteSchema = Joi.object({
    customer_name: Joi.string().trim().min(2).max(100).required()
        .messages({
            'any.required': 'Họ tên là bắt buộc',
        }),
    customer_email: Joi.string().trim().email().max(150).required()
        .messages({
            'any.required': 'Email là bắt buộc',
            'string.email': 'Email không hợp lệ',
        }),
    rating: Joi.number().integer().min(1).max(5).required()
        .messages({
            'any.required': 'Đánh giá sao là bắt buộc',
            'number.min': 'Đánh giá từ 1-5 sao',
            'number.max': 'Đánh giá từ 1-5 sao',
        }),
    comment: Joi.string().trim().max(1000).allow('', null),
});

module.exports = { createBookingSchema, createVoteSchema };
