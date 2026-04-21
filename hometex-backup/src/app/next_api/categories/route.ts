
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  const categoriesCrud = new CrudOperations('product_categories', context.token);
  
  const data = await categoriesCrud.findMany(
    { is_active: true }, 
    { 
      limit: limit || 50, 
      offset: offset || 0,
      orderBy: { column: 'display_order', direction: 'asc' }
    }
  );
  
  return createSuccessResponse(data);
}, false);
