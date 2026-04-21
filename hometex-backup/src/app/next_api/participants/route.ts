
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region');
  const featured = searchParams.get('featured');
  const sponsored = searchParams.get('sponsored');
  const slug = searchParams.get('slug');

  const participantsCrud = new CrudOperations('fair_participants', context.token);

  const filters: Record<string, any> = { is_active: true };
  if (region && region !== 'all') filters.region_key = region;
  if (featured === 'true') filters.is_featured = true;
  if (sponsored === 'true') filters.is_sponsored = true;
  if (slug) filters.display_slug = slug;

  const data = await participantsCrud.findMany(filters, {
    limit: limit || 24,
    offset: offset || 0,
    orderBy: { column: 'ai_rank_score', direction: 'desc' },
  });

  return createSuccessResponse(data);
}, false);
