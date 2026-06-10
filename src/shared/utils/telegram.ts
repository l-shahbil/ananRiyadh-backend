import { prisma } from '../config/prisma.js';
import  {type Request, RequestType ,Role,UserStatus,ListingType,ListingCategory,Desire,FamilyType} from '@prisma/client';

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId:string,text:string){
    await fetch(`${TELEGRAM_API}/sendMessage`,{
        method:'POST',
        headers:{ 'Content-Type': 'application/json' },
        body:JSON.stringify({
            chat_id:chatId,
            text,
            parse_mode:"HTML"
        })
    })
}

function buildRequestMessage(request: Request):string{

   let typeLabel: string = '—';

    if (request.type === RequestType.find_property) {
    typeLabel = '🔍 طلب عقار معين';
    } else if (request.type === RequestType.post_listing) {
    typeLabel = '📋 طلب نشر إعلان';
    }

  const desire = translateDesire(request.desire);
const category = translateCategory(request.propertyCategory);
const propertyType = translatePropertyType(request.propertyType);
  const city = request.city ?? '—';
  const district = request.district ? ` - ${request.district}` : '';
  const price = request.priceMin && request.priceMax
  ? `${request.priceMin} - ${request.priceMax}`
  : request.priceMin
  ? `${request.priceMin}`
  : '—';
  const message = request.message ?? '—';

  return `
${typeLabel}
───────────────
👤 الاسم: ${request.name}
📞 الجوال: ${request.phone}
🎯 الرغبة: ${desire}
🏠 التصنيف: ${category}
🔑 النوع: ${propertyType}
📍 المدينة: ${city}${district}
💰 السعر: ${price}
💬 ملاحظة: ${message}
  `.trim();
}

// send request notification based on type
export async function sendRequestNotification(request: Request) {
  const text = buildRequestMessage(request);

  if (request.type === RequestType.find_property) {
    // send to all active staff with telegramChatId
    const staff = await prisma.user.findMany({
      where: {
        status: UserStatus.active,
        telegramChatId: { not: null },
      },
      select: { telegramChatId: true },
    });

    await Promise.all(
      staff.map((s) => sendMessage(s.telegramChatId!, text))
    );
  } else {
    // send to admin only
    const admin = await prisma.user.findFirst({
        where:{role: Role.admin},
        select:{
            telegramChatId:true
        }
    })
    if(admin?.telegramChatId){
        await sendMessage(admin.telegramChatId, text);
    }
  }
}

// send notification to a specific chat id (for cron jobs)
export async function sendDirectMessage(chatId: string, text: string) {
  await sendMessage(chatId, text);
}

function translateDesire(desire: Desire | null): string {
  const map: Record<Desire, string> = {
    buy: 'شراء',
    rent: 'إيجار',
    sale: 'بيع',
  };
  return desire ? map[desire] : '—';
}

function translateCategory(category: ListingCategory | null): string {
  const map: Record<ListingCategory, string> = {
    residential: 'سكني',
    commercial: 'تجاري',
    industrial: 'صناعي',
    land: 'أرض',
  };
  return category ? map[category] : '—';
}
function translatePropertyType(type: ListingType | null): string {
  const map: Record<ListingType, string> = {
    apartment: 'شقة',
    floor: 'دور',
    building: 'عمارة',
    villa: 'فيلا',
    duplex: 'دوبلكس',
    palace: 'قصر',
    townhouse: 'تاون هاوس',
    studio: 'استوديو',
    room: 'غرفة',
    office: 'مكتب',
    showroom: 'معرض',
    station: 'محطة',
    warehouse: 'مستودع',
    shop: 'محل',
    workshop: 'ورشة',
    factory: 'مصنع',
    depot: 'مخزن',
    residential_land: 'أرض سكنية',
    commercial_land: 'أرض تجارية',
    industrial_land: 'أرض صناعية',
  };
  return type ? map[type] : '—';
}