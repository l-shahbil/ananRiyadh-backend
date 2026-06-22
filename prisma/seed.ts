import { PrismaClient, Role, ListingCategory, ListingType, ListingPurpose, ListingStatus } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {

  // ===== Cities =====
  const riyadh = await prisma.city.upsert({
    where: { id: 'city_riyadh' },
    update: {},
    create: {
      id: 'city_riyadh',
      nameAr: 'الرياض',
      nameEn: 'Riyadh',
    }
  })

  // ===== Districts =====
  const distNarjes = await prisma.district.upsert({
    where: { id: 'dist_narjes' },
    update: {},
    create: {
      id: 'dist_narjes',
      nameAr: 'حي النرجس',
      nameEn: 'Al Narjes',
      cityId: riyadh.id,
    }
  })

  const distYasmin = await prisma.district.upsert({
    where: { id: 'dist_yasmin' },
    update: {},
    create: {
      id: 'dist_yasmin',
      nameAr: 'حي الياسمين',
      nameEn: 'Al Yasmin',
      cityId: riyadh.id,
    }
  })

  const distOlaya = await prisma.district.upsert({
    where: { id: 'dist_olaya' },
    update: {},
    create: {
      id: 'dist_olaya',
      nameAr: 'حي العليا',
      nameEn: 'Al Olaya',
      cityId: riyadh.id,
    }
  })

  // ===== Admin =====
  const adminPassword = await bcrypt.hash('admin123456', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ananriyadh.com' },
    update: {},
    create: {
      name: 'المدير العام',
      email: 'admin@ananriyadh.com',
      passwordHash: adminPassword,
      role: Role.admin,
      whatsappNumber: '966500000000',
    }
  })

  // ===== Staff =====
  const staffPassword = await bcrypt.hash('staff123456', 10)
  const staff = await prisma.user.upsert({
    where: { email: 'staff@ananriyadh.com' },
    update: {},
    create: {
      name: 'أحمد الموظف',
      email: 'staff@ananriyadh.com',
      passwordHash: staffPassword,
      role: Role.staff,
      whatsappNumber: '966511111111',
    }
  })

  // ===== Listings =====
  await prisma.listing.createMany({
    skipDuplicates: true,
    data: [
      {
        ownerId: staff.id,
        slug: 'شقة-الرياض-حي-النرجس-1',
        titleAr: 'شقة للبيع في حي النرجس',
        titleEn: 'Apartment for Sale in Al Narjes',
        category: ListingCategory.residential,
        type: ListingType.apartment,
        purpose: ListingPurpose.sale,
        price: 850000,
        area: 180,
        cityId: riyadh.id,
        districtId: distNarjes.id,
        rooms: 4,
        bathRooms: 3,
        status: ListingStatus.active,
      },
      {
        ownerId: staff.id,
        slug: 'فيلا-الرياض-حي-الياسمين-1',
        titleAr: 'فيلا للإيجار في حي الياسمين',
        titleEn: 'Villa for Rent in Al Yasmin',
        category: ListingCategory.residential,
        type: ListingType.villa,
        purpose: ListingPurpose.rent,
        price: 120000,
        area: 400,
        cityId: riyadh.id,
        districtId: distYasmin.id,
        rooms: 6,
        bathRooms: 4,
        status: ListingStatus.active,
        isFeatured: true,
      },
      {
        ownerId: admin.id,
        slug: 'مكتب-الرياض-حي-العليا-1',
        titleAr: 'مكتب تجاري في العليا',
        titleEn: 'Commercial Office in Al Olaya',
        category: ListingCategory.commercial,
        type: ListingType.office,
        purpose: ListingPurpose.rent,
        price: 80000,
        area: 220,
        cityId: riyadh.id,
        districtId: distOlaya.id,
        status: ListingStatus.active,
      },
    ]
  })

  // ===== Settings =====
  await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      nameAr: 'عنان الرياض للعقارات',
      nameEn: 'Anan Riyadh Real Estate',
      phone: '',
      whatsapp: '',
      email: '',
      addressAr: '',
      addressEn: '',
      descriptionAr: '',
      descriptionEn: '',
      instagram: '',
      tiktok: '',
      snapshat: '',
    },
  })

  console.log('✅ Seed completed')
  console.log('👤 Admin:', admin.email, '| Password: admin123456')
  console.log('👤 Staff:', staff.email, '| Password: staff123456')
  console.log('🏙️ City: الرياض | Districts: النرجس، الياسمين، العليا')
  console.log('⚙️ Settings: initialized')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())