
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset, search } = parseQueryParams(request);
  const productsCrud = new CrudOperations('products', context.token);
  
  const filters: Record<string, any> = {
    status: 'active'
  };
  
  const data = await productsCrud.findMany(filters, { 
    limit: limit || 20, 
    offset: offset || 0,
    orderBy: { column: 'created_at', direction: 'desc' }
  });
  
  return createSuccessResponse(data);
}, false);
