
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';
import { generateAdminUserToken } from '@/lib/auth';

export const POST = requestMiddleware(async (request, context) => {
  const body = await validateRequestBody(request);

  if (!body.action_type || !body.page_type) {
    return createErrorResponse({ errorMessage: 'action_type and page_type are required', status: 400 });
  }

  const adminToken = await generateAdminUserToken();
  const analyticsCrud = new CrudOperations('visitor_analytics', adminToken);

  const event = {
    domain_key: body.domain_key || 'hometex',
    visitor_id: body.visitor_id || null,
    user_id: context.payload?.sub || null,
    session_id: body.session_id || null,
    page_type: body.page_type,
    page_id: body.page_id || null,
    page_slug: body.page_slug || null,
    referrer_url: body.referrer_url || null,
    referrer_platform: body.referrer_platform || null,
    language_used: body.language_used || 'en',
    country_code: body.country_code || null,
    device_type: body.device_type || null,
    action_type: body.action_type,
    action_data: body.action_data || {},
    duration_seconds: body.duration_seconds || null,
  };

  const data = await analyticsCrud.create(event);
  return createSuccessResponse(data, 201);
}, false);
