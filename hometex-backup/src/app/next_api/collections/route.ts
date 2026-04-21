
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  const searchParams = request.nextUrl.searchParams;
  const trending = searchParams.get('trending');
  const featured = searchParams.get('featured');
  const showroomId = searchParams.get('showroom_id');

  const collectionsCrud = new CrudOperations('collections', context.token);

  const filters: Record<string, any> = { is_active: true };
  if (trending === 'true') filters.is_trending = true;
  if (featured === 'true') filters.is_featured = true;
  if (showroomId) filters.showroom_id = showroomId;

  const data = await collectionsCrud.findMany(filters, {
    limit: limit || 12,
    offset: offset || 0,
    orderBy: { column: 'trend_score', direction: 'desc' },
  });

  return createSuccessResponse(data);
}, false);
