
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const searchParams = request.nextUrl.searchParams;
  const slotType = searchParams.get('slot_type') || 'homepage_hero';
  const domain = searchParams.get('domain') || 'hometex';

  const slotsCrud = new CrudOperations('featured_slots', context.token);

  const now = new Date().toISOString();
  const filters: Record<string, any> = {
    is_active: true,
    domain_key: domain,
    slot_type: slotType,
    payment_status: 'paid',
  };

  const data = await slotsCrud.findMany(filters, {
    limit: 10,
    offset: 0,
    orderBy: { column: 'slot_position', direction: 'asc' },
  });

  return createSuccessResponse(data);
}, false);
