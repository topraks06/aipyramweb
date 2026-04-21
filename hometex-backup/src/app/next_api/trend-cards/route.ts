
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get('domain') || 'hometex';

  const trendCrud = new CrudOperations('trend_cards', context.token);

  const data = await trendCrud.findMany(
    { domain_key: domain, is_active: true },
    {
      limit: limit || 8,
      offset: offset || 0,
      orderBy: { column: 'trend_score', direction: 'desc' },
    }
  );

  return createSuccessResponse(data);
}, false);
