import { sendDirectMessage } from '../../shared/utils/telegram.js';
import { prisma } from '../../shared/config/prisma.js';
import type { ContactInput } from './contact.validator.js';

export const contactService = {
  async sendContactMessage(data: ContactInput) {
    // Fetch admin telegram chat id dynamically
    const admin = await prisma.user.findFirst({
      where: { role: 'admin' },
      select: { telegramChatId: true },
    });

    if (!admin?.telegramChatId) return;

    const message = [
      '📩 رسالة تواصل جديدة',
      `👤 الاسم: ${data.name}`,
      `📱 الجوال: ${data.phone}`,
      ...(data.email ? [`📧 الإيميل: ${data.email}`] : []),
      `💬 الرسالة: ${data.message}`,
    ].join('\n');

    await sendDirectMessage(admin.telegramChatId, message);
  },
};