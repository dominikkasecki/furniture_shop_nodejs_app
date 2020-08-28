const fs = require('fs');
const PDFDocument = require('pdfkit');

function createInvoice(invoice, path, res) {
  let doc = new PDFDocument({ size: 'A4', margin: 50 });

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.pipe(res);
  doc.end();
}

function generateHeader(doc) {
  doc

    .fillColor('#444444')
    .fontSize(20)
    .text('DOMINIK.', 110, 57)
    .fontSize(10)
    .text('Dominik Inc.', 200, 50, { align: 'right' })
    .text(`Florianska 10`, 200, 65, {
      align: 'right',
    })
    .text('08-110 Siedlce', 200, 80, {
      align: 'right',
    })
    .moveDown();
}

function generateCustomerInformation(doc, invoice) {
  doc
    .fillColor('#444444')
    .fontSize(20)
    .text('Faktura', 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text('Numer faktury', 50, customerInformationTop)
    .font('Helvetica-Bold')
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font('Helvetica')
    .text('Data faktury', 50, customerInformationTop + 15)
    .text(
      formatDate(new Date()),
      150,
      customerInformationTop + 15
    )
    .text('Podatek:', 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.subtotal - invoice.paid),
      150,
      customerInformationTop + 30
    )

    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc, invoice) {
  let i;
  const invoiceTableTop = 330;

  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    invoiceTableTop,
    'Mebel',
    'Opis',
    'Cena sztuki',
    'Ilosc',
    'Calkowita cena'
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font('Helvetica');

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.description,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    '',
    '',
    'Cena bez podatku',
    '',
    formatCurrency(invoice.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    '',
    '',
    'Podatek',
    '',
    formatCurrency(invoice.paid)
  );

  const duePosition = paidToDatePosition + 25;
  doc.font('Helvetica-Bold');
  generateTableRow(
    doc,
    duePosition,
    '',
    '',
    'Calkowity koszt',
    '',
    formatCurrency(invoice.subtotal - invoice.paid)
  );
  doc.font('Helvetica');
}

function generateFooter(doc) {
  doc
    .fontSize(10)
    .text(
      'Zwrot pieniedzy mozliwy do 15 dni. Dziekujemy za zakup',
      50,
      780,
      { align: 'center', width: 500 }
    );
}

function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: 'right' })
    .text(quantity, 370, y, { width: 90, align: 'right' })
    .text(lineTotal, 0, y, { align: 'right' });
}

function generateHr(doc, y) {
  doc
    .strokeColor('#aaaaaa')
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}

function formatCurrency(cents) {
  return '$' + (cents / 100).toFixed(2);
}

function formatDate(date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + '/' + month + '/' + day;
}

module.exports = {
  createInvoice,
};
