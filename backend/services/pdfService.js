const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Create receipts directory if not exists
const receiptsDir = path.join(__dirname, "../receipts");
if (!fs.existsSync(receiptsDir)) {
  fs.mkdirSync(receiptsDir, { recursive: true });
}

/**
 * Generate PDF receipt for approved booking
 * @param {Object} booking - Booking details
 * @param {Object} user - User details
 * @returns {string} Path to generated PDF
 */
exports.generateReceiptPDF = (booking, user) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `receipt-${booking._id}.pdf`;
      const filePath = path.join(receiptsDir, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // Attractive header
      doc.save();
      doc.rect(doc.page.margins.left - 10, doc.y - 10, doc.page.width - 2 * doc.page.margins.left + 20, 60).fill('#1e40af');
      doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold').text('LUXE SALON', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('Premium Hair & Beauty Services', { align: 'center' });
      doc.fillColor('#000000');
      doc.moveDown(2);
      doc.restore();

      // Booking receipt title
      doc
        .moveDown(1)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text('BOOKING CONFIRMATION RECEIPT', { align: 'center' })
        .moveDown(0.5);

      // Booking details box (left column)
      const startX = doc.x;
      doc
        .moveTo(startX, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .stroke('#e2e8f0');

      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Booking Details')
        .fontSize(10)
        .font('Helvetica')
        .text(`Booking ID: ${String(booking._id).slice(0, 12).toUpperCase()}`)
        .text(`Date: ${new Date(booking.date).toLocaleDateString()}`)
        .text(`Time: ${booking.time}`)
        .text(`Status: APPROVED ✓`)
        .moveDown(0.5);

      // Customer info
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Customer Information')
        .fontSize(10)
        .font('Helvetica')
        .text(`Name: ${user.name || 'N/A'}`)
        .text(`Email: ${user.email || 'N/A'}`)
        .text(`Phone: ${user.phone || 'N/A'}`)
        .moveDown(0.5);

      // Service details
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Service Details')
        .fontSize(10)
        .font('Helvetica')
        .text(`Service: ${booking.serviceName}`)
        .text(`Price: Rs. ${booking.servicePrice}`)
        .text(`Appointment Date & Time: ${new Date(booking.date).toLocaleDateString()} at ${booking.time}`)
        .moveDown(0.5);

      // Payment info (right aligned)
      const total = Number(booking.servicePrice) || 0;
      doc
        .fontSize(11)
        .font('Helvetica-Bold')
        .text('Payment Summary')
        .fontSize(10)
        .font('Helvetica')
        .text(`Amount: Rs. ${total}`)
        .text(`Tax (0%): Rs. 0`);

      doc
        .moveDown(0.2)
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`Total: Rs. ${total}`, { align: 'right' });

      doc.moveDown(2);

      // Terms
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          "Terms & Conditions: This receipt confirms your appointment. Please arrive 5 minutes early. Call to reschedule or cancel.",
          {
            align: "left",
            width: 515,
          }
        )
        .moveDown(1);

      // Footer
      doc
        .fontSize(8)
        .text("Thank you for booking with Luxe Salon!", { align: "center" })
        .text("For queries, contact: support@luxesalon.com", { align: "center" });

      doc.end();

      writeStream.on('finish', () => {
        // Construct public URL for the saved receipt
        // prefer a generic BASE_URL but fall back to older APP_BASE_URL for
        // backwards compatibility.  ensure there is no trailing slash.
        const base =
          (process.env.BASE_URL || process.env.APP_BASE_URL ||
            `http://localhost:${process.env.PORT || 5000}`)
            .replace(/\/$/, "");
        const publicUrl = `${base}/receipts/${fileName}`;
        resolve({ filePath, publicUrl });
      });

      writeStream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get PDF file path
 */
exports.getReceiptPath = (bookingId) => {
  return path.join(receiptsDir, `receipt-${bookingId}.pdf`);
};

/**
 * Delete PDF file
 */
exports.deleteReceiptPDF = (bookingId) => {
  const filePath = exports.getReceiptPath(bookingId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
