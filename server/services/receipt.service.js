//importing tools 
//pdfkit- going to generate the pdf(pdf engine)
//fs-writes files to disk
//path-safely builds path across OSs
//data>PDF generation > file storage


const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
//setting up a storage directory
//store all pdf in a centralised receipts folder outise this

const RECEIPTS_DIR = path.join(__dirname, "..", "receipts");

// Create the receipts directory if it doesn't exist
if (!fs.existsSync(RECEIPTS_DIR)) {
  fs.mkdirSync(RECEIPTS_DIR, { recursive: true });
}

/**
 * Generate a branded PDF receipt for a completed payment.
 */
async function generateReceipt(data) {
  return new Promise((resolve, reject) => {
    // Create a new A4-sized PDF with 50-point margins on all sides
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    // The PDF will be saved as a file named after the payment link ID
    const filePath = path.join(RECEIPTS_DIR, `${data.linkId}.pdf`);
    const stream = fs.createWriteStream(filePath);

    // Pipe the PDF content to the file
    doc.pipe(stream);

    // ---- HEADER ----
    // Large, bold title centered at the top
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .fillColor("#153564")
      .text("PAYMENT RECEIPT", { align: "center" });

    doc.moveDown(0.5); // Move down half a line height

    // Orange horizontal line under the title
    doc
      .strokeColor("#FF6600")
      .lineWidth(2)
      .moveTo(50, doc.y)       // Start at left margin, current y position
      .lineTo(545, doc.y)      // Draw to right margin
      .stroke();               // Actually render the line

    doc.moveDown(1);

    // ---- RECEIPT DETAILS (two-column layout) ----
    const startY = doc.y;      // Remember current position for alignment
    const leftCol = 50;        // Left column x position
    const rightCol = 300;      // Right column x position

    doc.fontSize(10).font("Helvetica").fillColor("#333333");

    // Left column: receipt number, date, client name
    drawField(doc, "Receipt Number", data.receiptNumber, leftCol, startY);
    drawField(doc, "Date", formatMpesaDate(data.date), leftCol, startY + 40);
    drawField(doc, "Client", data.clientName, leftCol, startY + 80);

    // Right column: phone number, reference
    drawField(doc, "Phone", formatDisplayPhone(data.phone), rightCol, startY);
    drawField(
      doc,
      "Reference",
      data.linkId.slice(0, 8).toUpperCase(),
      rightCol,
      startY + 40
    );

    // ---- AMOUNT BOX ----
    // A light blue rectangle with the payment amount prominently displayed
    doc.y = startY + 140;

    doc.rect(50, doc.y, 495, 60).fill("#F0F4F8");

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Amount Paid", 70, doc.y + 12);

    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fillColor("#153564")
      .text(`KES ${Number(data.amount).toLocaleString()}`, 70, doc.y + 28);

    doc.y += 80;

    // ---- DESCRIPTION (if provided) ----
    if (data.description) {
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .fillColor("#333333")
        .text("Description", 50, doc.y);

      doc.moveDown(0.3);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#555555")
        .text(data.description, 50, doc.y, { width: 495 });

      doc.moveDown(1);
    }

    // ---- FOOTER ----
    doc.moveDown(2);

    // Thin gray line
    doc
      .strokeColor("#CCCCCC")
      .lineWidth(0.5)
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .stroke();

    doc.moveDown(0.5);

    doc
      .fontSize(8)
      .font("Helvetica")
      .fillColor("#999999")
      .text("This is a computer-generated receipt. No signature required.", {
        align: "center",
      });

    doc.text("Powered by Mctaba Paylink", { align: "center" });

    // ---- FINALIZE ----
    doc.end(); // Signal that we're done writing to the PDF

    // Resolve the promise when the file is fully written
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
}

/**
 * Draw a label-value pair at a specific (x, y) position.
 * The label is small and gray. The value is larger and bold.
 */
function drawField(doc, label, value, x, y) {
  doc.fontSize(8).font("Helvetica").fillColor("#999999").text(label, x, y);

  doc
    .fontSize(11)
    .font("Helvetica-Bold")
    .fillColor("#333333")
    .text(value || "N/A", x, y + 14);
}

/**
 * Convert M-Pesa date format (YYYYMMDDHHmmss) to a human-readable string.
 * Example: "20260329143022" becomes "29 Mar 2026, 14:30"
 */
function formatMpesaDate(dateStr) {
  if (!dateStr || dateStr.length < 14) return dateStr;

  const s = String(dateStr);
  const year = s.slice(0, 4);
  const month = s.slice(4, 6);
  const day = s.slice(6, 8);
  const hour = s.slice(8, 10);
  const min = s.slice(10, 12);

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${parseInt(day)} ${months[parseInt(month) - 1]} ${year}, ${hour}:${min}`;
}

/**
 * Format a phone number for display on the receipt.
 * Converts 254712345678 to +254 712 345 678
 */
function formatDisplayPhone(phone) {
  const p = String(phone);
  if (p.length === 12 && p.startsWith("254")) {
    return `+254 ${p.slice(3, 6)} ${p.slice(6, 9)} ${p.slice(9)}`;
  }
  return p;
}

module.exports = { generateReceipt };