import PDFDocument from 'pdfkit';
import { Response } from 'express';

export class PDFUtils {
  static generateVolunteerReport(res: Response, data: any[]) {
    const doc = new PDFDocument({ margin: 50 });

    // Stream the PDF directly to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=volunteer_report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text('LÖSEV İnci Portalı - Gönüllülük Raporu', { align: 'center' })
      .moveDown();

    doc
      .fontSize(10)
      .text(`Oluşturma Tarihi: ${new Date().toLocaleString('tr-TR')}`, { align: 'right' })
      .moveDown();

    // Table Header
    const tableTop = 150;
    const itemWidths = [120, 100, 150, 50, 80];
    const columns = ['Gönüllü', 'Okul', 'Proje', 'Saat', 'Tarih'];
    
    let currentY = tableTop;

    doc.fontSize(12).fillColor('#444444');
    columns.forEach((col, i) => {
      const x = 50 + itemWidths.slice(0, i).reduce((a, b) => a + b, 0);
      doc.text(col, x, currentY);
    });

    doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
    currentY += 25;

    // Table Rows
    doc.fontSize(10).fillColor('black');
    data.forEach(item => {
      const rowData = [
        item.volunteer,
        item.school || '-',
        item.project,
        item.hours.toString(),
        item.date
      ];

      rowData.forEach((text, i) => {
        const x = 50 + itemWidths.slice(0, i).reduce((a, b) => a + b, 0);
        doc.text(text, x, currentY, { width: itemWidths[i] - 10, ellipsis: true });
      });

      currentY += 20;

      // New page if needed
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
      }
    });

    doc.end();
  }

  static generateCertificate(res: Response, userData: any, stats: any) {
    const doc = new PDFDocument({
      layout: 'landscape',
      size: 'A4',
      margin: 0
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sertifika_${userData.firstName}_${userData.lastName}.pdf`);

    doc.pipe(res);

    // Background or Border
    doc
      .rect(20, 20, doc.page.width - 40, doc.page.height - 40)
      .lineWidth(5)
      .strokeColor('#E30613') // LÖSEV Red
      .stroke();

    doc
      .rect(30, 30, doc.page.width - 60, doc.page.height - 60)
      .lineWidth(1)
      .strokeColor('#000000')
      .stroke();

    // Content
    const centerX = doc.page.width / 2;

    doc
      .moveDown(4)
      .fontSize(40)
      .fillColor('#E30613')
      .text('TEŞEKKÜR BELGESİ', { align: 'center' })
      .moveDown(1);

    doc
      .fontSize(20)
      .fillColor('#333333')
      .text('Sayın', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(35)
      .fillColor('#000000')
      .text(`${userData.firstName} ${userData.lastName}`.toUpperCase(), { align: 'center' })
      .moveDown(1);

    doc
      .fontSize(16)
      .fillColor('#333333')
      .text(
        `LÖSEV İnci Portalı aracılığıyla gerçekleştirdiğiniz ${stats.totalHours} saatlik değerli gönüllü katkılarınız ve toplumda yarattığınız fark için teşekkür eder, başarılarınızın devamını dileriz.`,
        100,
        doc.y,
        { align: 'center', width: doc.page.width - 200, lineGap: 5 }
      )
      .moveDown(2);

    const bottomY = doc.page.height - 150;

    doc
      .fontSize(12)
      .text('Düzenleme Tarihi', 150, bottomY, { align: 'left' })
      .text(new Date().toLocaleDateString('tr-TR'), 150, bottomY + 20, { align: 'left' });

    doc
      .fontSize(12)
      .text('LÖSEV İnci Portalı Yönetimi', doc.page.width - 300, bottomY, { align: 'right' })
      .moveDown(0.5)
      .text('Elektronik Olarak Onaylanmıştır', doc.page.width - 300, bottomY + 20, { align: 'right' });

    doc.end();
  }
}
