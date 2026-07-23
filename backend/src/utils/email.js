const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');
const { OTP_CONFIG } = require('../constants/otp');
const { normalizeLanguage } = require('./language');

const escapeHtml = (value = '') => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getAppUrl = () => process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';

const EMAIL_COPY = {
    vi: {
        brand: 'Kỳ Nghỉ Tuyệt Vời',
        registerOtpTitle: 'Xác thực tài khoản',
        resetOtpTitle: 'Đặt lại mật khẩu',
        registerOtpDescription: 'Cảm ơn bạn đã đăng ký tài khoản tại Kỳ Nghỉ Tuyệt Vời. Vui lòng sử dụng mã OTP bên dưới để xác thực email của bạn.',
        resetOtpDescription: 'Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP bên dưới để xác nhận.',
        otpExpiry: 'Mã OTP có hiệu lực trong',
        minutes: 'phút',
        otpSecurity: 'Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Không chia sẻ mã OTP với bất kỳ ai.',
        registerOtpSubject: '[Kỳ Nghỉ Tuyệt Vời] Mã xác thực',
        resetOtpSubject: '[Kỳ Nghỉ Tuyệt Vời] Mã đặt lại mật khẩu',
        otpText: 'Mã OTP của bạn là',
        welcomeSubject: 'Chào mừng đến với Kỳ Nghỉ Tuyệt Vời!',
        welcomeTitle: 'Chào mừng đến với Kỳ Nghỉ Tuyệt Vời!',
        welcomeBody: 'Chúng tôi rất vui được đồng hành cùng bạn trong những chuyến đi sắp tới.',
        reviewSubject: 'Bạn đánh giá chuyến đi của mình nhé',
        reviewTitle: 'Chuyến đi của bạn thế nào?',
        reviewGreeting: 'Xin chào',
        reviewBody: 'Cảm ơn bạn đã đồng hành cùng Kỳ Nghỉ Tuyệt Vời. Chúng tôi rất mong nhận được đánh giá của bạn về tour',
        reviewButton: 'Đánh giá tour',
        reviewFallback: 'Nếu nút không hoạt động, vui lòng mở liên kết sau',
        footer: 'Email này được gửi tự động, vui lòng không trả lời email này.',
    },
    en: {
        brand: 'Beautiful Holiday',
        registerOtpTitle: 'Verify your account',
        resetOtpTitle: 'Reset your password',
        registerOtpDescription: 'Thank you for registering with Beautiful Holiday. Please use the OTP below to verify your email.',
        resetOtpDescription: 'You requested a password reset. Please use the OTP below to confirm your request.',
        otpExpiry: 'This OTP is valid for',
        minutes: 'minutes',
        otpSecurity: 'If you did not make this request, please ignore this email. Do not share your OTP with anyone.',
        registerOtpSubject: '[Beautiful Holiday] Verification code',
        resetOtpSubject: '[Beautiful Holiday] Password reset code',
        otpText: 'Your OTP code is',
        welcomeSubject: 'Welcome to Beautiful Holiday!',
        welcomeTitle: 'Welcome to Beautiful Holiday!',
        welcomeBody: 'We are delighted to accompany you on your upcoming journeys.',
        reviewSubject: 'Please review your tour experience',
        reviewTitle: 'How was your trip?',
        reviewGreeting: 'Hello',
        reviewBody: 'Thank you for travelling with Beautiful Holiday. We would love to hear your review for',
        reviewButton: 'Review tour',
        reviewFallback: 'If the button does not work, please open this link',
        footer: 'This email was sent automatically. Please do not reply.',
    },
    zh: {
        brand: '美好假期',
        registerOtpTitle: '验证您的账户',
        resetOtpTitle: '重置密码',
        registerOtpDescription: '感谢您注册美好假期。请使用下面的 OTP 验证您的电子邮箱。',
        resetOtpDescription: '您已请求重置密码。请使用下面的 OTP 进行确认。',
        otpExpiry: '此 OTP 有效期为',
        minutes: '分钟',
        otpSecurity: '如果这不是您本人操作，请忽略此邮件。请勿向任何人透露 OTP。',
        registerOtpSubject: '[美好假期] 验证码',
        resetOtpSubject: '[美好假期] 密码重置码',
        otpText: '您的 OTP 是',
        welcomeSubject: '欢迎来到美好假期！',
        welcomeTitle: '欢迎来到美好假期！',
        welcomeBody: '我们很高兴陪伴您开启接下来的旅程。',
        reviewSubject: '请评价您的旅行体验',
        reviewTitle: '您的旅程体验如何？',
        reviewGreeting: '您好',
        reviewBody: '感谢您选择美好假期。我们期待收到您对该行程的评价',
        reviewButton: '评价行程',
        reviewFallback: '如果按钮无法打开，请访问以下链接',
        footer: '此邮件由系统自动发送，请勿直接回复。',
    },
};

const getEmailCopy = (language) => EMAIL_COPY[normalizeLanguage(language)] || EMAIL_COPY.vi;

const createTransporter = () => nodemailer.createTransport({
    host: env.email.host,
    port: env.email.port,
    secure: env.email.port === 465,
    auth: {
        user: env.email.user,
        pass: env.email.pass,
    },
});

const sendEmail = async (options) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: `${options.fromName || 'Beautiful Holiday'} <${env.email.from}>`,
        to: options.email,
        subject: options.subject,
        text: options.text,
        html: options.html,
    };

    try {
        await transporter.sendMail(mailOptions);
        logger.info(`Email sent to ${options.email}`);
    } catch (error) {
        logger.error(`Error sending email to ${options.email}:`, error);
        throw error;
    }
};

const buildEmailShell = ({ title, body, language = 'vi' }) => {
    const copy = getEmailCopy(language);

    return `
<!DOCTYPE html>
<html lang="${normalizeLanguage(language)}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,'Segoe UI',Tahoma,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px">
<tr><td align="center">
<table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden">
  <tr><td style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:28px 36px;text-align:center">
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700">${escapeHtml(copy.brand)}</h1>
  </td></tr>
  <tr><td style="padding:36px">
    <h2 style="color:#1a1a2e;margin:0 0 14px;font-size:22px;text-align:center">${escapeHtml(title)}</h2>
    ${body}
  </td></tr>
  <tr><td style="background:#f8fafc;padding:18px 36px;text-align:center;border-top:1px solid #e9ecef">
    <p style="color:#8e8ea0;font-size:12px;line-height:1.5;margin:0">${escapeHtml(copy.footer)}</p>
    <p style="color:#8e8ea0;font-size:11px;margin:8px 0 0">© ${new Date().getFullYear()} ${escapeHtml(copy.brand)}. All rights reserved.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
};

const generateOtpHtml = (otpCode, type, language = 'vi') => {
    const copy = getEmailCopy(language);
    const isRegister = type === 'register';
    const title = isRegister ? copy.registerOtpTitle : copy.resetOtpTitle;
    const description = isRegister ? copy.registerOtpDescription : copy.resetOtpDescription;
    const digits = String(otpCode).split('').map((digit) => (
        `<td style="width:48px;height:56px;text-align:center;font-size:28px;font-weight:bold;color:#0ea5e9;background:#f0f9ff;border-radius:10px;border:2px solid #bae6fd;letter-spacing:0">${escapeHtml(digit)}</td>`
    )).join('<td style="width:8px"></td>');

    const body = `
    <p style="color:#555770;font-size:15px;line-height:1.6;text-align:center;margin:0 0 28px">${escapeHtml(description)}</p>
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px"><tr>${digits}</tr></table>
    <p style="color:#8e8ea0;font-size:13px;text-align:center;margin:0 0 8px">
      ${escapeHtml(copy.otpExpiry)} <strong>${OTP_CONFIG.EXPIRY_MINUTES} ${escapeHtml(copy.minutes)}</strong>
    </p>
    <hr style="border:none;border-top:1px solid #e9ecef;margin:28px 0">
    <p style="color:#8e8ea0;font-size:12px;text-align:center;line-height:1.6;margin:0">${escapeHtml(copy.otpSecurity)}</p>`;

    return buildEmailShell({ title, body, language });
};

const sendOtpEmail = async (email, otpCode, type, language = 'vi') => {
    const copy = getEmailCopy(language);
    const isRegister = type === 'register';
    const subjectPrefix = isRegister ? copy.registerOtpSubject : copy.resetOtpSubject;

    await sendEmail({
        email,
        fromName: copy.brand,
        subject: `${subjectPrefix}: ${otpCode}`,
        text: `${copy.otpText}: ${otpCode}. ${copy.otpExpiry} ${OTP_CONFIG.EXPIRY_MINUTES} ${copy.minutes}.`,
        html: generateOtpHtml(otpCode, type, language),
    });
};

const sendWelcomeEmail = async (user, language = user.language || 'vi') => {
    const copy = getEmailCopy(language);
    const safeName = escapeHtml(user.full_name);
    const body = `
    <p style="color:#555770;font-size:15px;line-height:1.7;margin:0 0 12px">${escapeHtml(copy.reviewGreeting)} ${safeName},</p>
    <p style="color:#555770;font-size:15px;line-height:1.7;margin:0">${escapeHtml(copy.welcomeBody)}</p>`;

    await sendEmail({
        email: user.email,
        fromName: copy.brand,
        subject: copy.welcomeSubject,
        text: `${copy.reviewGreeting} ${user.full_name}, ${copy.welcomeBody}`,
        html: buildEmailShell({ title: copy.welcomeTitle, body, language }),
    });
};

const sendReviewReminderEmail = async ({ email, customerName, tourTitle, tourSlug, language = 'vi' }) => {
    const copy = getEmailCopy(language);
    const reviewUrl = `${getAppUrl().replace(/\/$/, '')}/tours/${encodeURIComponent(tourSlug)}?review=1`;
    const body = `
    <p style="color:#555770;font-size:15px;line-height:1.7;margin:0 0 12px">${escapeHtml(copy.reviewGreeting)} ${escapeHtml(customerName)},</p>
    <p style="color:#555770;font-size:15px;line-height:1.7;margin:0 0 24px">
      ${escapeHtml(copy.reviewBody)} <strong>${escapeHtml(tourTitle)}</strong>.
    </p>
    <p style="text-align:center;margin:0 0 24px">
      <a href="${escapeHtml(reviewUrl)}" style="display:inline-block;background:#0ea5e9;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:10px">
        ${escapeHtml(copy.reviewButton)}
      </a>
    </p>
    <p style="color:#8e8ea0;font-size:12px;line-height:1.6;margin:0">${escapeHtml(copy.reviewFallback)}: ${escapeHtml(reviewUrl)}</p>`;

    await sendEmail({
        email,
        fromName: copy.brand,
        subject: copy.reviewSubject,
        text: `${copy.reviewGreeting} ${customerName}, ${copy.reviewBody} ${tourTitle}. ${reviewUrl}`,
        html: buildEmailShell({ title: copy.reviewTitle, body, language }),
    });
};

module.exports = {
    sendEmail,
    sendOtpEmail,
    sendWelcomeEmail,
    sendReviewReminderEmail,
};
