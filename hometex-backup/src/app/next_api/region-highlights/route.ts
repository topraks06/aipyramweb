
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain') || 'hometex';

  const regionCrud = new CrudOperations('region_highlight_blocks', context.token);

  const filters: Record<string, any> = {
    is_active: true,
    domain_key: domain,
  };

  const data = await regionCrud.findMany(filters, {
    limit: 10,
    offset: 0,
    orderBy: { column: 'display_order', direction: 'asc' },
  });

  return createSuccessResponse(data);
}, false);
