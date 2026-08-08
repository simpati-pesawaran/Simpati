// ============================================================================
// Usulan Share API - Get WhatsApp share message
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://simpati-silk.vercel.app';
  const publicFormUrl = `${appUrl}/form-usulan`;

  const message = `Halo! 👋

Ingin menyampaikan usulan agenda/kegiatan? Silakan sampaikan usulan Anda melalui link berikut:

${publicFormUrl}

Kami senang dapat menerima masukan dan usulan dari masyarakat. Terima kasih! 🙏`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/?text=${encodedMessage}`;

  return NextResponse.json({
    success: true,
    data: {
      url: publicFormUrl,
      message: message,
      whatsapp_link: whatsappLink
    }
  });
}
