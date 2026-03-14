const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', 'config', '.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function sendEmail({ to, subject, html, attachments = [] }) {
    try {
        const info = await transporter.sendMail({
            from: `"HardwareHaven" <${process.env.EMAIL_USER}>`,
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
    return {
        to: user.email,
        subject: `Order #${order._id} - Status Updated to ${status}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2>Order Status Update</h2>
                <p>Hi ${user.name},</p>
                <p>Your order <strong style="color:#ff6600;">#${order._id}</strong> has been updated to:</p>
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
    return {
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `Order #${order._id} Cancelled by ${user.name}`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven Admin</h1>
                <h2 style="color:#e74c3c;">Order Cancelled</h2>
                <p>Order <strong style="color:#ff6600;">#${order._id}</strong> has been cancelled by <strong>${user.name}</strong> (${user.email}).</p>
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
    return {
        to: user.email,
        subject: `Order #${order._id} - Cancellation Confirmed`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2>Order Cancelled</h2>
                <p>Hi ${user.name},</p>
                <p>Your order <strong style="color:#ff6600;">#${order._id}</strong> has been cancelled.</p>
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
    return {
        to: user.email,
        subject: `Order #${order._id} - Placed Successfully`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven</h1>
                <h2>Order Confirmed!</h2>
                <p>Hi ${user.name},</p>
                <p>Your order <strong style="color:#ff6600;">#${order._id}</strong> has been placed successfully.</p>
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
    return {
        to: admin?.email || process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `Order #${order._id} Delivered Confirmation`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1a1a2e;color:#e8e8e8;padding:20px;border-radius:10px;">
                <h1 style="color:#ff6600;text-align:center;">HardwareHaven Admin</h1>
                <h2 style="color:#2ecc71;">Buyer Confirmed Delivery</h2>
                <p>Order <strong style="color:#ff6600;">#${order._id}</strong> has been marked as <strong>Delivered</strong> by the buyer.</p>
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

module.exports = {
    sendEmail,
    orderStatusUpdateEmail,
    orderCancelledAdminEmail,
    orderCancelledUserEmail,
    orderPlacedEmail,
    orderDeliveredConfirmationAdminEmail,
    passwordResetCodeEmail,
};
