const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Use /tmp directory for serverless environments (Vercel), otherwise use local reports folder
const reportsDir = process.env.NODE_ENV === 'production' 
  ? path.join(os.tmpdir(), 'reports')
  : path.join(__dirname, '../../reports');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const generateVisitorReport = (visitors, filename = 'visitor-report.pdf') => {
  return new Promise((resolve, reject) => {
    try {
      const filePath = path.join(reportsDir, filename);
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Visitor Management Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Summary
      doc.fontSize(14).text('Summary', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11)
        .text(`Total Visitors: ${visitors.length}`);
      doc.moveDown(2);

      // Table header
      doc.fontSize(12).text('Visitor Details', { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const itemHeight = 25;

      // Table headers
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Name', 50, tableTop, { width: 100, continued: true });
      doc.text('Contact', 160, tableTop, { width: 90, continued: true });
      doc.text('Purpose', 260, tableTop, { width: 120, continued: true });
      doc.text('Status', 390, tableTop, { width: 70, continued: true });
      doc.text('Time In', 470, tableTop, { width: 90 });

      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

      // Table rows
      doc.font('Helvetica').fontSize(9);
      visitors.slice(0, 30).forEach((visitor, index) => {
        const y = tableTop + (index + 1) * itemHeight + 10;

        // Check if we need a new page
        if (y > 700) {
          doc.addPage();
          return;
        }

        doc.text(visitor.name || 'N/A', 50, y, { width: 100, continued: true });
        doc.text(visitor.contact || 'N/A', 160, y, { width: 90, continued: true });
        doc.text(visitor.purpose || 'N/A', 260, y, { width: 120, continued: true });
        doc.text(visitor.status || 'N/A', 390, y, { width: 70, continued: true });
        doc.text(
          visitor.timeIn ? new Date(visitor.timeIn).toLocaleDateString() : 'N/A',
          470,
          y,
          { width: 90 }
        );
      });

      if (visitors.length > 30) {
        doc.moveDown(2);
        doc.fontSize(9).text(`Note: Showing first 30 of ${visitors.length} visitors`, { italics: true });
      }

      // Footer
      doc.fontSize(8)
        .text(
          'Visitor Management System - Generated Report',
          50,
          doc.page.height - 50,
          { align: 'center', width: doc.page.width - 100 }
        );

      doc.end();

      stream.on('finish', () => {
        resolve(filePath);
      });

      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateVisitorReport };
