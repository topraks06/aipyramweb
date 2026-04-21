
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region');
  const slug = searchParams.get('slug');
  const featured = searchParams.get('featured');

  const brandsCrud = new CrudOperations('brand_profiles', context.token);

  const filters: Record<string, any> = { is_active: true };
  if (region && region !== 'all') filters.region = region;
  if (slug) filters.brand_slug = slug;
  if (featured === 'true') filters.is_featured = true;

  const data = await brandsCrud.findMany(filters, {
    limit: limit || 24,
    offset: offset || 0,
    orderBy: { column: 'ai_rank_score', direction: 'desc' },
  });

  return createSuccessResponse(data);
}, false);
