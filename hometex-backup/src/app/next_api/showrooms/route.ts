
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  const searchParams = request.nextUrl.searchParams;
  const region = searchParams.get('region');
  const featured = searchParams.get('featured');

  const showroomsCrud = new CrudOperations('showrooms', context.token);

  const filters: Record<string, any> = {
    is_active: true,
    status: 'approved',
  };

  const data = await showroomsCrud.findMany(filters, {
    limit: limit || 24,
    offset: offset || 0,
    orderBy: { column: 'view_count', direction: 'desc' },
  });

  return createSuccessResponse(data);
}, false);
