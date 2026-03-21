const PDFDocument = require('pdfkit');
const { toOrderNumber } = require('./orderNumber');

function money(value) {
    return `P${Number(value || 0).toFixed(2)}`;
}

function generateReceiptPDF(order, user) {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const buffers = [];

            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', reject);

            // Header
            doc.fontSize(24).fillColor('#ff6600').text('HardwareHaven', { align: 'center' });
            doc.fontSize(10).fillColor('#666666').text('Your trusted hardware store', { align: 'center' });
            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#cccccc');
            doc.moveDown();

            // Receipt title
            doc.fontSize(18).fillColor('#333333').text('Order Receipt', { align: 'center' });
            doc.moveDown();

            const orderNumber = toOrderNumber(order);

            // Order info
            doc.fontSize(11).fillColor('#333333');
            doc.text(`Order Number: ${orderNumber}`);
            doc.text(`Date: ${new Date(order.dateOrdered).toLocaleDateString()}`);
            doc.text(`Status: ${order.status}`);
            doc.text(`Payment: ${order.paymentMethod || 'N/A'}`);
            doc.text(`Payment Status: ${order.paymentStatus || 'Pending'}`);
            doc.moveDown();

            // Customer info
            doc.fontSize(13).fillColor('#ff6600').text('Customer Information');
            doc.fontSize(11).fillColor('#333333');
            doc.text(`Name: ${user.name}`);
            doc.text(`Email: ${user.email}`);
            doc.text(`Phone: ${order.phone}`);
            doc.moveDown();

            // Shipping address
            doc.fontSize(13).fillColor('#ff6600').text('Shipping Address');
            doc.fontSize(11).fillColor('#333333');
            doc.text(order.shippingAddress1 || '');
            if (order.shippingAddress2) doc.text(order.shippingAddress2);
            const addrParts = [
                order.barangay, order.cityMunicipality, order.province,
                order.region, order.city, order.zip, order.country
            ].filter(Boolean);
            if (addrParts.length) doc.text(addrParts.join(', '));
            doc.moveDown();

            // Items table
            doc.fontSize(13).fillColor('#ff6600').text('Order Items');
            doc.moveDown(0.5);

            const tableTop = doc.y;
            doc.fontSize(10).fillColor('#666666');
            doc.text('Item Details', 50, tableTop, { width: 290 });
            doc.text('Qty', 345, tableTop, { width: 40, align: 'center' });
            doc.text('Unit', 390, tableTop, { width: 70, align: 'right' });
            doc.text('Total', 465, tableTop, { width: 80, align: 'right' });
            doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke('#cccccc');

            let y = tableTop + 25;
            let subtotal = 0;

            if (order.orderItems) {
                for (const item of order.orderItems) {
                    const product = item.product || {};
                    const name = product.name || 'Product';
                    const brand = product.brand || 'N/A';
                    const category = product.category?.name || 'N/A';
                    const qty = item.quantity || 1;
                    const price = product.price || 0;
                    const total = qty * price;
                    subtotal += total;

                    doc.fontSize(10).fillColor('#333333');
                    doc.text(name, 50, y, { width: 290 });
                    doc.text(qty.toString(), 345, y, { width: 40, align: 'center' });
                    doc.text(money(price), 390, y, { width: 70, align: 'right' });
                    doc.text(money(total), 465, y, { width: 80, align: 'right' });

                    y += 14;
                    doc.fontSize(9).fillColor('#666666');
                    doc.text(`Brand: ${brand} | Category: ${category}`, 50, y, { width: 290 });
                    y += 14;

                    if (y > 700) {
                        doc.addPage();
                        y = 50;
                    }
                }
            }

            doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke('#cccccc');
            y += 15;
            doc.fontSize(11).fillColor('#333333').text('Subtotal:', 380, y, { width: 80, align: 'right' });
            doc.fontSize(11).fillColor('#333333').text(money(subtotal), 465, y, { width: 80, align: 'right' });

            y += 14;
            doc.fontSize(11).fillColor('#333333').text('Shipping:', 380, y, { width: 80, align: 'right' });
            doc.fontSize(11).fillColor('#333333').text(money(0), 465, y, { width: 80, align: 'right' });

            y += 16;
            doc.fontSize(12).fillColor('#333333').text('Grand Total:', 380, y, { width: 80, align: 'right' });
            doc.fontSize(14).fillColor('#ff6600').text(
                money(order.totalPrice || subtotal),
                465, y, { width: 80, align: 'right' }
            );

            // Footer
            doc.moveDown(3);
            doc.fontSize(9).fillColor('#999999').text('Thank you for shopping at HardwareHaven!', { align: 'center' });
            doc.text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { generateReceiptPDF };
