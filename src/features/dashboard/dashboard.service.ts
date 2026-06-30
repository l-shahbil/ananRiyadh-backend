// dashboard.service.ts
import { prisma } from '../../shared/config/prisma.js'
import { RequestType, ListingStatus, UserStatus, Role } from '@prisma/client'

// Returns the first and last moment of the current month (used for "expiring this month" filter)
function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return { start, end }
}

// Generic lookup helper for Prisma groupBy results: finds the _count matching a given enum value
function getCountByKey<T extends { _count: number }>(
  rows: T[],
  key: keyof T,
  value: T[keyof T]
): number {
  return rows.find((row) => row[key] === value)?._count ?? 0
}

export const dashboardService = {
  async getDashboardStats() {
    const { start, end } = getCurrentMonthRange()

    const [requestsByType, listingsByStatus, expiringThisMonth, staffByStatus] =
      await Promise.all([
        prisma.request.groupBy({
          by: ['type'],
          _count: true,
        }),
        prisma.listing.groupBy({
          by: ['status'],
          _count: true,
        }),
        prisma.listing.count({
          where: {
            status: ListingStatus.active,
            expiresAt: { gte: start, lt: end },
          },
        }),
        prisma.user.groupBy({
          by: ['status'],
          where: { role: Role.staff },
          _count: true,
        }),
      ])

    return {
      requests: {
        findProperty: getCountByKey(requestsByType, 'type', RequestType.find_property),
        postListing: getCountByKey(requestsByType, 'type', RequestType.post_listing),
      },
      listings: {
        active: getCountByKey(listingsByStatus, 'status', ListingStatus.active),
        completed: getCountByKey(listingsByStatus, 'status', ListingStatus.completed),
        hidden: getCountByKey(listingsByStatus, 'status', ListingStatus.hidden),
        expired: getCountByKey(listingsByStatus, 'status', ListingStatus.expired),
        expiringThisMonth,
      },
      staff: {
        active: getCountByKey(staffByStatus, 'status', UserStatus.active),
        suspended: getCountByKey(staffByStatus, 'status', UserStatus.suspended),
      },
    }
  },
}