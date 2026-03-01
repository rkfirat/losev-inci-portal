import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

interface CertificateData {
    fullName: string;
    totalHours: number;
    school?: string;
    startDate: string;
    endDate: string;
    badgeName?: string;
}

const CERTIFICATE_HTML = (data: CertificateData) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f8f9fa;
    font-family: 'Inter', sans-serif;
  }

  .certificate {
    width: 700px;
    padding: 50px;
    background: white;
    border: 3px solid #6366F1;
    border-radius: 16px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .certificate::before {
    content: '';
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    border-radius: 50%;
    opacity: 0.1;
  }

  .certificate::after {
    content: '';
    position: absolute;
    bottom: -30px;
    left: -30px;
    width: 150px;
    height: 150px;
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    border-radius: 50%;
    opacity: 0.1;
  }

  .header {
    margin-bottom: 30px;
  }

  .logo-text {
    font-size: 14px;
    color: #6366F1;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-weight: 600;
  }

  .title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    color: #1F2937;
    margin: 10px 0;
  }

  .subtitle {
    font-size: 14px;
    color: #6B7280;
  }

  .divider {
    width: 80px;
    height: 3px;
    background: linear-gradient(to right, #6366F1, #8B5CF6);
    margin: 25px auto;
    border-radius: 2px;
  }

  .name {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    color: #6366F1;
    margin: 15px 0;
  }

  .content {
    font-size: 16px;
    color: #374151;
    line-height: 1.8;
    margin: 20px 0;
  }

  .hours-badge {
    display: inline-block;
    background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
    color: white;
    padding: 10px 30px;
    border-radius: 50px;
    font-size: 20px;
    font-weight: 700;
    margin: 15px 0;
  }

  .badge-name {
    display: inline-block;
    background: #FEF3C7;
    color: #92400E;
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    margin-top: 10px;
  }

  .footer {
    margin-top: 30px;
    display: flex;
    justify-content: space-between;
    border-top: 1px solid #E5E7EB;
    padding-top: 20px;
  }

  .footer-item {
    text-align: center;
    flex: 1;
  }

  .footer-label {
    font-size: 11px;
    color: #9CA3AF;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .footer-value {
    font-size: 14px;
    color: #374151;
    font-weight: 600;
    margin-top: 4px;
  }

  .seal {
    width: 60px;
    height: 60px;
    border: 3px solid #6366F1;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
    font-size: 24px;
  }
</style>
</head>
<body>
<div class="certificate">
  <div class="header">
    <div class="logo-text">LÖSEV İNCİ GÖNÜLLÜLÜK PORTALI</div>
    <h1 class="title">Gönüllülük Sertifikası</h1>
    <div class="subtitle">Volunteer Service Certificate</div>
  </div>

  <div class="divider"></div>

  <p class="content">Bu belge,</p>
  <h2 class="name">${data.fullName}</h2>
  ${data.school ? `<p style="color: #6B7280; font-size: 14px;">🏫 ${data.school}</p>` : ''}

  <p class="content">
    adlı gönüllünün ${data.startDate} - ${data.endDate} tarihleri arasında
    LÖSEV İnci Gönüllülük Programı kapsamında toplam
  </p>

  <div class="hours-badge">🕐 ${data.totalHours} Saat</div>

  <p class="content">gönüllü hizmet verdiğini belgelendirir.</p>

  ${data.badgeName ? `<div class="badge-name">🏅 ${data.badgeName}</div>` : ''}

  <div class="footer">
    <div class="footer-item">
      <div class="footer-label">Düzenlenme Tarihi</div>
      <div class="footer-value">${new Date().toLocaleDateString('tr-TR')}</div>
    </div>
    <div class="footer-item">
      <div class="seal">🏛️</div>
    </div>
    <div class="footer-item">
      <div class="footer-label">Sertifika No</div>
      <div class="footer-value">INCI-${Date.now().toString(36).toUpperCase()}</div>
    </div>
  </div>
</div>
</body>
</html>
`;

export const certificateService = {
    /**
     * Generate and share a volunteer certificate as PDF
     */
    async generateCertificate(data: CertificateData): Promise<void> {
        const html = CERTIFICATE_HTML(data);

        const { uri } = await Print.printToFileAsync({
            html,
            width: 842,
            height: 595,
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(uri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Gönüllülük Sertifikanız',
                UTI: 'com.adobe.pdf',
            });
        }
    },

    /**
     * Get badge name based on total hours
     */
    getBadgeForHours(hours: number): string | undefined {
        if (hours >= 200) return 'Platin İnci';
        if (hours >= 100) return 'Altın İnci';
        if (hours >= 50) return 'Gümüş İnci';
        if (hours >= 25) return 'Bronz İnci';
        return undefined;
    },
};
