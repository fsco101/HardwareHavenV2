const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') });
const { toOrderNumber } = require('./orderNumber');

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPassword = process.env.SMTP_PASSWORD || process.env.EMAIL_PASS;
const smtpFromEmail = process.env.SMTP_FROM_EMAIL || smtpUser;
const smtpFromName = process.env.SMTP_FROM_NAME || 'HardwareHaven';

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: smtpUser,
        pass: smtpPassword,
    },
});

async function sendEmail({ to, subject, html, attachments = [] }) {
    try {
        const info = await transporter.sendMail({
            from: `"${smtpFromName}" <${smtpFromEmail}>`,
            to,
            subject,
            html,
            attachments,
        });
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error.message);
        return { success: false, error: error.message };
    }
}

function orderStatusUpdateEmail(order, user, status) {
    const statusColor = status === 'Delivered' ? '#2ecc71' : status === 'Processing' ? '#f39c12' : '#ff6600';
    const orderNumber = toOrderNumber(order);
    return {
        to: user.email,
        subject: `Order #${orderNumber} - Status Updated to ${status}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2>Order Status Update</h2>
                <p>Hi ${user.name},</p>
                <p>Your order <strong style="color:#ff6600;">#${orderNumber}</strong> has been updated to:</p>
                <div style="background:#16213e;padding:15px;border-radius:8px;text-align:center;margin:15px 0;">
                    <span style="font-size:24px;font-weight:bold;color:${statusColor};">${status}</span>
                </div>
                <p>Thank you for shopping with us!</p>
                <p style="color:#a0a0b0;font-size:12px;">HardwareHaven - Your trusted hardware store</p>
            </div>
        `,
    };
}

function orderCancelledAdminEmail(order, user, reason) {
    const orderNumber = toOrderNumber(order);
    return {
        to: process.env.ADMIN_EMAIL || smtpFromEmail || process.env.EMAIL_USER,
        subject: `Order #${orderNumber} Cancelled by ${user.name}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven Admin</h1>
                <h2 style="color:#e74c3c;">Order Cancelled</h2>
                <p>Order <strong style="color:#ff6600;">#${orderNumber}</strong> has been cancelled by <strong>${user.name}</strong> (${user.email}).</p>
                <div style="background:#16213e;padding:15px;border-radius:8px;margin:15px 0;">
                    <p><strong>Reason:</strong></p>
                    <p style="color:#f39c12;">${reason}</p>
                </div>
                <p style="color:#a0a0b0;font-size:12px;">HardwareHaven Admin Notification</p>
            </div>
        `,
    };
}

function orderCancelledUserEmail(order, user, reason) {
    const orderNumber = toOrderNumber(order);
    return {
        to: user.email,
        subject: `Order #${orderNumber} - Cancellation Confirmed`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2>Order Cancelled</h2>
                <p>Hi ${user.name},</p>
                <p>Your order <strong style="color:#ff6600;">#${orderNumber}</strong> has been cancelled.</p>
                <div style="background:#16213e;padding:15px;border-radius:8px;margin:15px 0;">
                    <p><strong>Reason:</strong> ${reason}</p>
                </div>
                <p>If you have any questions, please contact us.</p>
                <p style="color:#a0a0b0;font-size:12px;">HardwareHaven - Your trusted hardware store</p>
            </div>
        `,
    };
}

function orderPlacedEmail(order, user) {
    const orderNumber = toOrderNumber(order);
    return {
        to: user.email,
        subject: `Order #${orderNumber} - Placed Successfully`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2>Order Confirmed!</h2>
                <p>Hi ${user.name},</p>
                <p>Your order <strong style="color:#ff6600;">#${orderNumber}</strong> has been placed successfully.</p>
                <div style="background:#16213e;padding:15px;border-radius:8px;margin:15px 0;">
                    <p><strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}</p>
                    <p><strong>Total:</strong> <span style="color:#ffd60a;font-size:18px;">&#8369;${(order.totalPrice || 0).toFixed(2)}</span></p>
                </div>
                <p>We'll notify you when your order status updates.</p>
                <p style="color:#a0a0b0;font-size:12px;">HardwareHaven - Your trusted hardware store</p>
            </div>
        `,
    };
}

function orderDeliveredConfirmationAdminEmail(order, buyer, admin) {
    const orderNumber = toOrderNumber(order);
    return {
        to: admin?.email || process.env.ADMIN_EMAIL || smtpFromEmail || process.env.EMAIL_USER,
        subject: `Order #${orderNumber} Delivered Confirmation`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven Admin</h1>
                <h2 style="color:#2ecc71;">Buyer Confirmed Delivery</h2>
                <p>Order <strong style="color:#ff6600;">#${orderNumber}</strong> has been marked as <strong>Delivered</strong> by the buyer.</p>
                <div style="background:#16213e;padding:15px;border-radius:8px;margin:15px 0;">
                    <p><strong>Buyer:</strong> ${buyer?.name || 'N/A'} (${buyer?.email || 'N/A'})</p>
                    <p><strong>Delivered At:</strong> ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : new Date().toLocaleString()}</p>
                    <p><strong>Status Lock:</strong> This order is now locked and cannot be changed by admin.</p>
                </div>
                <p style="color:#a0a0b0;font-size:12px;">HardwareHaven Admin Notification</p>
            </div>
        `,
    };
}

function passwordResetCodeEmail(user, code) {
    return {
        to: user.email,
        subject: 'HardwareHaven Password Reset Code',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2>Password Reset Request</h2>
                <p>Hi ${user.name || 'there'},</p>
                <p>Use the code below to reset your password:</p>
                <div style="background:#16213e;padding:16px;border-radius:8px;text-align:center;margin:16px 0;">
                    <span style="font-size:28px;letter-spacing:6px;font-weight:bold;color:#ffd60a;">${code}</span>
                </div>
                <p>This code will expire in <strong>10 minutes</strong>.</p>
                <p>If you did not request this reset, you can ignore this email.</p>
                <p style="color:#a0a0b0;font-size:12px;">HardwareHaven - Security Notification</p>
            </div>
        `,
    };
}

function accountDeactivatedEmail(user, reason) {
    const safeReason = String(reason || 'No reason provided by admin.').trim();
    return {
        to: user.email,
        subject: 'Your HardwareHaven account was deactivated',
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2 style="color:#e74c3c;">Account Deactivated</h2>
                <p>Hi ${user?.name || 'there'},</p>
                <p>Your account has been deactivated by an administrator.</p>
                <div style="background:#16213e;padding:15px;border-radius:8px;margin:15px 0;">
                    <p><strong>Reason:</strong> ${safeReason}</p>
                </div>
                <p>If you believe this is a mistake, please contact support or admin.</p>
                <p style="color:#a0a0b0;font-size:12px;">HardwareHaven - Account Notification</p>
            </div>
        `,
    };
}

module.exports = {
    sendEmail,
    orderStatusUpdateEmail,
    orderCancelledAdminEmail,
    orderCancelledUserEmail,
    orderPlacedEmail,
    orderDeliveredConfirmationAdminEmail,
    passwordResetCodeEmail,
    accountDeactivatedEmail,
};
