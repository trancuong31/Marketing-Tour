const Joi = require('joi');

const register = Joi.object({
    full_name: Joi.string().min(2).max(100).required().messages({
        'string.min': 'Họ tên phải có ít nhất 2 ký tự',
        'string.max': 'Họ tên không được vượt quá 100 ký tự',
        'any.required': 'Họ tên là bắt buộc',
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Vui lòng nhập email hợp lệ',
        'any.required': 'Email là bắt buộc',
    }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
            'string.max': 'Mật khẩu không được vượt quá 128 ký tự',
            'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
            'any.required': 'Mật khẩu là bắt buộc',
        }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Mật khẩu xác nhận không khớp',
        'any.required': 'Vui lòng xác nhận mật khẩu',
    }),
    phone_number: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .allow('', null)
        .messages({
            'string.pattern.base': 'Số điện thoại phải có 10-11 chữ số',
        }),
});

const login = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Vui lòng nhập email hợp lệ',
        'any.required': 'Email là bắt buộc',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Mật khẩu là bắt buộc',
    }),
});

const verifyOtp = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Vui lòng nhập email hợp lệ',
        'any.required': 'Email là bắt buộc',
    }),
    otp_code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
        'string.length': 'Mã OTP phải có 6 chữ số',
        'string.pattern.base': 'Mã OTP chỉ chứa chữ số',
        'any.required': 'Mã OTP là bắt buộc',
    }),
});

const forgotPassword = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Vui lòng nhập email hợp lệ',
        'any.required': 'Email là bắt buộc',
    }),
});

const resetPassword = Joi.object({
    reset_token: Joi.string().required().messages({
        'any.required': 'Token đặt lại mật khẩu là bắt buộc',
    }),
    password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.min': 'Mật khẩu phải có ít nhất 8 ký tự',
            'string.max': 'Mật khẩu không được vượt quá 128 ký tự',
            'string.pattern.base': 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số',
            'any.required': 'Mật khẩu là bắt buộc',
        }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Mật khẩu xác nhận không khớp',
        'any.required': 'Vui lòng xác nhận mật khẩu',
    }),
});

const resendOtp = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Vui lòng nhập email hợp lệ',
        'any.required': 'Email là bắt buộc',
    }),
    type: Joi.string().valid('register', 'reset_password').required().messages({
        'any.only': 'Loại OTP không hợp lệ',
        'any.required': 'Loại OTP là bắt buộc',
    }),
});

module.exports = {
    register,
    login,
    verifyOtp,
    forgotPassword,
    resetPassword,
    resendOtp,
};
