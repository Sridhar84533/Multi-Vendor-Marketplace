const PDFDocument = require('pdfkit');
const fs = require('fs');

exports.generateInvoicePDF = (order, path) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });

    doc.on('error', reject);
    const stream = fs.createWriteStream(path);
    stream.on('finish', resolve);
    stream.on('error', reject);
    doc.pipe(stream);

    // Header
    doc
      .fillColor('#131921')
      .fontSize(20)
      .text('MULTI-VENDOR MARKETPLACE', 50, 50, { bold: true })
      .fontSize(10)
      .fillColor('#565959')
      .text('Invoice / Bill of Sale', 50, 75)
      .moveDown();

    // Order Details
    doc
      .fillColor('#0F1111')
      .fontSize(10)
      .text(`Invoice Number: INV-${order._id.toString().toUpperCase()}`, 350, 50)
      .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 65)
      .text(`Payment Status: ${order.paymentStatus}`, 350, 80)
      .moveDown();

    // Billing / Shipping Addresses
    doc
      .fontSize(12)
      .fillColor('#131921')
      .text('Shipping Address:', 50, 110, { underline: true })
      .fontSize(10)
      .fillColor('#0F1111')
      .text(order.shippingAddress.name, 50, 130)
      .text(order.shippingAddress.street, 50, 145)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 50, 160)
      .text(`Phone: ${order.shippingAddress.phone}`, 50, 175);

    // Table Header
    let y = 220;
    doc
      .rect(50, y, 500, 20)
      .fill('#232F3E');

    doc
      .fillColor('#FFFFFF')
      .fontSize(10)
      .text('Item Description', 60, y + 5)
      .text('Price', 300, y + 5)
      .text('Qty', 380, y + 5)
      .text('Total', 460, y + 5);

    // Items list
    y += 20;
    doc.fillColor('#0F1111');
    order.items.forEach((item) => {
      doc
        .text(item.title.substring(0, 40), 60, y + 5)
        .text(`Rs. ${item.price.toFixed(2)}`, 300, y + 5)
        .text(item.quantity.toString(), 380, y + 5)
        .text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 460, y + 5);
      y += 20;
    });

    // Summary calculations
    y += 10;
    doc
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();

    y += 10;
    doc
      .text('Subtotal:', 350, y)
      .text(`Rs. ${order.subtotal.toFixed(2)}`, 460, y);
    
    y += 15;
    doc
      .text('Shipping Fee:', 350, y)
      .text(`Rs. ${order.shippingFee.toFixed(2)}`, 460, y);


    y += 15;
    doc
      .text('Discount:', 350, y)
      .text(`- Rs. ${order.discount.toFixed(2)}`, 460, y);

    y += 15;
    doc
      .fontSize(12)
      .fillColor('#CC0C39')
      .text('Grand Total:', 350, y, { bold: true })
      .text(`Rs. ${order.total.toFixed(2)}`, 460, y, { bold: true });

    doc.end();
  });
};
