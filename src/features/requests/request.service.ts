import { prisma } from '../../shared/config/prisma.js';
import { Role} from "@prisma/client"
import type { CreateRequestInput } from './requests.validator.js';
import { sendRequestNotification } from '../../shared/utils/telegram.js';


export const requestService =  {
 async createRequest(input: CreateRequestInput) {
    const request = await prisma.request.create({
      data: {
        type: input.type,
        name: input.name,
        phone: input.phone,
        message: input.message ?? null,
        desire: input.desire,
        propertyCategory: input.propertyCategory,
        propertyType: input.propertyType ?? null,
        city: input.city,
        district: input.district ?? null,
        priceMin: input.priceMin ?? null,
        priceMax: input.priceMax ?? null,
        familyType: input.familyType ?? null,
      },
    });

    // send telegram notification to admin
    await sendRequestNotification(request);

    return request;
  },

  async getRequests(userId: string, role: string) {
    // admin sees all, staff sees only assigned
    const where = role === Role.admin ? {} : { assignedTo: userId };

    return await prisma.request.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: {
          select: { id: true, email: true, phone: true },
        },
      },
    });
  },

  async markAsDone(requestId: string, userId: string) {
    return await prisma.request.update({
      where: { id: requestId },
      data: {
        status: 'done',
        assignedTo: userId,
      },
    });
  }
}