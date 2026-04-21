
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, parseQueryParams, validateRequestBody } from '@/lib/api-utils';

export const GET = requestMiddleware(async (request, context) => {
  const { limit, offset } = parseQueryParams(request);
  const requestsCrud = new CrudOperations('buyer_requests', context.token);
  
  const user_id = context.payload?.sub;
  const filters: Record<string, any> = {};
  
  if (!context.payload?.isAdmin) {
    filters.user_id = user_id;
  }
  
  const data = await requestsCrud.findMany(filters, { 
    limit: limit || 20, 
    offset: offset || 0,
    orderBy: { column: 'created_at', direction: 'desc' }
  });
  
  return createSuccessResponse(data);
}, true);

export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);
  
  if (!body.category_id || !body.title || !body.description || !body.quantity) {
    return createErrorResponse({
      errorMessage: 'Category, title, description and quantity are required',
      status: 400,
    });
  }
  
  const user_id = context.payload?.sub;
  const requestsCrud = new CrudOperations('buyer_requests', context.token);
  
  const data = await requestsCrud.create({
    user_id,
    category_id: body.category_id,
    subcategory_id: body.subcategory_id,
    title: body.title,
    description: body.description,
    quantity: body.quantity,
    unit_of_measure: body.unit_of_measure,
    budget_min: body.budget_min,
    budget_max: body.budget_max,
    currency: body.currency || 'USD',
    target_country: body.target_country,
    delivery_timeline: body.delivery_timeline,
    quality_requirements: body.quality_requirements,
    certifications_required: body.certifications_required,
    status: 'open'
  });
  
  return createSuccessResponse(data, 201);
}, true);

export const PUT = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: 'ID parameter is required',
      status: 400,
    });
  }
  
  const body = await validateRequestBody(request);
  const requestsCrud = new CrudOperations('buyer_requests', context.token);
  
  const existing = await requestsCrud.findById(id);
  if (!existing) {
    return createErrorResponse({
      errorMessage: 'Request not found',
      status: 404,
    });
  }
  
  const user_id = context.payload?.sub;
  const parsedUserId = user_id ? parseInt(user_id, 10) : null;
  
  if (existing.user_id !== parsedUserId && !context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: 'Unauthorized',
      status: 403,
    });
  }
  
  const data = await requestsCrud.update(id, body);
  return createSuccessResponse(data);
}, true);

export const DELETE = requestMiddleware(async (request, context) => {
  const { id } = parseQueryParams(request);
  
  if (!id) {
    return createErrorResponse({
      errorMessage: 'ID parameter is required',
      status: 400,
    });
  }
  
  const requestsCrud = new CrudOperations('buyer_requests', context.token);
  
  const existing = await requestsCrud.findById(id);
  if (!existing) {
    return createErrorResponse({
      errorMessage: 'Request not found',
      status: 404,
    });
  }
  
  const user_id = context.payload?.sub;
  const parsedUserId = user_id ? parseInt(user_id, 10) : null;
  
  if (existing.user_id !== parsedUserId && !context.payload?.isAdmin) {
    return createErrorResponse({
      errorMessage: 'Unauthorized',
      status: 403,
    });
  }
  
  const data = await requestsCrud.delete(id);
  return createSuccessResponse(data);
}, true);
