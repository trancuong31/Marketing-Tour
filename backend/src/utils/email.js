const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');
const { OTP_CONFIG } = require('../constants/otp');

/**
 * Create email transporter
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: env.email.host,
        port: env.email.port,
        secure: env.email.port === 465,
        auth: {
            user: env.email.user,
            pass: env.email.pass,
        },
    });
};

/**
 * Send email
 */
const sendEmail = async (options) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `KyNghiTuyetVoi <${env.email.from}>`,
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

/**
 * Generate OTP email HTML template
 */
const generateOtpHtml = (otpCode, type) => {
    const isRegister = type === 'register';
    const title = isRegister ? 'Xác thực tài khoản' : 'Đặt lại mật khẩu';
    const description = isRegister
        ? 'Cảm ơn bạn đã đăng ký tài khoản tại KyNghiTuyetVoi. Vui lòng sử dụng mã OTP bên dưới để xác thực email của bạn.'
        : 'Bạn đã yêu cầu đặt lại mật khẩu. Vui lòng sử dụng mã OTP bên dưới để xác nhận.';

    const digits = otpCode.split('').map(d =>
        `<td style="width:48px;height:56px;text-align:center;font-size:28px;font-weight:bold;color:#0ea5e9;background:#f0f9ff;border-radius:10px;border:2px solid #bae6fd;letter-spacing:0">${d}</td>`
    ).join('<td style="width:8px"></td>');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px">
<tr><td align="center">
<table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden">
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#0ea5e9,#0284c7);padding:32px 40px;text-align:center">
    <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700">✈️ KyNghiTuyetVoi</h1>
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:40px">
    <h2 style="color:#1a1a2e;margin:0 0 12px;font-size:22px;text-align:center">${title}</h2>
    <p style="color:#555770;font-size:15px;line-height:1.6;text-align:center;margin:0 0 28px">${description}</p>
    <!-- OTP Code -->
    <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px">
      <tr>${digits}</tr>
    </table>
    <p style="color:#8e8ea0;font-size:13px;text-align:center;margin:0 0 8px">
      ⏱ Mã OTP có hiệu lực trong <strong>${OTP_CONFIG.EXPIRY_MINUTES} phút</strong>
    </p>
    <hr style="border:none;border-top:1px solid #e9ecef;margin:28px 0">
    <p style="color:#8e8ea0;font-size:12px;text-align:center;margin:0">
      Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.<br>
      Không chia sẻ mã OTP với bất kỳ ai.
    </p>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e9ecef">
    <p style="color:#8e8ea0;font-size:11px;margin:0">© ${new Date().getFullYear()} KyNghiTuyetVoi. All rights reserved.</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
};

/**
 * Send OTP email
 */
const sendOtpEmail = async (email, otpCode, type) => {
    const isRegister = type === 'register';
    const subject = isRegister
        ? `[KyNghiTuyetVoi] Mã xác thực: ${otpCode}`
        : `[KyNghiTuyetVoi] Mã đặt lại mật khẩu: ${otpCode}`;

    await sendEmail({
        email,
        subject,
        text: `Mã OTP của bạn là: ${otpCode}. Mã có hiệu lực trong ${OTP_CONFIG.EXPIRY_MINUTES} phút.`,
        html: generateOtpHtml(otpCode, type),
    });
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
    await sendEmail({
        email: user.email,
        subject: 'Chào mừng đến với KyNghiTuyetVoi!',
        text: `Xin chào ${user.full_name}, Chào mừng bạn đến với KyNghiTuyetVoi!`,
        html: `
      <h1>Chào mừng đến với KyNghiTuyetVoi!</h1>
      <p>Xin chào ${user.full_name},</p>
      <p>Chào mừng bạn đến với KyNghiTuyetVoi! Chúng tôi rất vui được đồng hành cùng bạn.</p>
    `,
    });
};

module.exports = {
    sendEmail,
    sendOtpEmail,
    sendWelcomeEmail,
};
