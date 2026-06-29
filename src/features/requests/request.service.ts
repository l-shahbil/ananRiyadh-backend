import { prisma } from '../../shared/config/prisma.js';
import { Role, RequestType, RequestStatus,ListingCategory,ListingType } from "@prisma/client"
import { AppError } from '../../shared/utils/error.js';
import type { CreateRequestInput } from './requests.validator.js';
import { sendRequestNotification } from '../../shared/utils/telegram.js';

interface GetRequestsParams {
  role:          Role;
  userId:        string;
  page:          number;
  limit:         number;
  type?:         RequestType | undefined;
  category?:     ListingCategory | undefined;
  propertyType?: ListingType | undefined;
  status?:       RequestStatus | undefined;
  assignedToMe?: boolean | undefined;
  staffId?: string | undefined;
}

export const requestService = {

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

    await sendRequestNotification(request);

    return request;
  },

  // BR-024: admin sees everything — staff sees find_property only,
  // including ones already handled by other staff (BR-037: transparency on who handled it)
async getRequests(params: GetRequestsParams) {
  const { role, userId, page, limit, type, category, propertyType, status, assignedToMe,staffId } = params;

  const skip = (page - 1) * limit;

  const where = {
    ...(role !== Role.admin && { type: RequestType.find_property }),
    ...(staffId && role === Role.admin && { assignedTo: staffId }),
    ...(type         && !staffId && { type             }),
    ...(category     && { propertyCategory: category   }),
    ...(propertyType && { propertyType                 }),
    ...(status       && { status                       }),
    ...(assignedToMe && !staffId && { assignedTo: userId }),
  };

  const [requests, total, pendingCounts] = await Promise.all([
    prisma.request.findMany({
      where,
      skip,
      take:    limit,
      orderBy: { createdAt: 'desc' },
      include: {
        assignee: { select: { id: true, name: true, phone: true } },
      },
    }),
    prisma.request.count({ where }),
    prisma.request.groupBy({
      by:    ['type'],
      where: { status: RequestStatus.new },
      _count: { _all: true },
    }),
  ]);

  const findPropertyPending =
    pendingCounts.find((c) => c.type === RequestType.find_property)?._count._all ?? 0;
  const postListingPending  =
    pendingCounts.find((c) => c.type === RequestType.post_listing)?._count._all  ?? 0;

  return {
    requests,
    meta:  { total, page, limit, totalPages: Math.ceil(total / limit) },
    stats: { findPropertyPending, postListingPending },
  };
},

  // find_property: any staff or admin can claim it (race — first one wins)
  // post_listing: admin only
  async markAsDone(requestId: string, userId: string, role: Role) {
    const allowedTypes: RequestType[] =
      role === Role.admin
        ? [RequestType.find_property, RequestType.post_listing]
        : [RequestType.find_property];

    // Single atomic operation — claims the request only if it's still 'new'
    // AND its type is allowed for this role. No separate read-then-write step.
    const result = await prisma.request.updateMany({
      where: {
        id: requestId,
        status: RequestStatus.new,
        type: { in: allowedTypes },
      },
      data: { status: RequestStatus.done, assignedTo: userId },
    });

    if (result.count === 0) {
      // Failure path only — determine the exact reason for a precise error
      const request = await prisma.request.findUnique({
        where: { id: requestId },
        select: { type: true },
      });

      if (!request) throw new AppError('الطلب غير موجود', 404);

      if (request.type === RequestType.post_listing && role !== Role.admin) {
        throw new AppError('هذا الطلب مخصص للأدمن فقط', 403);
      }

      throw new AppError('تم التعامل مع هذا الطلب مسبقاً', 409);
    }

    return prisma.request.findUnique({
      where: { id: requestId },
      include: { assignee: { select: { id: true, name: true, phone: true } } },
    });
  },
}