
import CrudOperations from '@/lib/crud-operations';
import { createSuccessResponse, createErrorResponse } from '@/lib/create-response';
import { requestMiddleware, validateRequestBody } from '@/lib/api-utils';

export const POST = requestMiddleware(async (request, context) => {
  try {
    const body = await validateRequestBody(request);

    const {
      domain_key = 'hometex',
      page_type,
      page_id,
      page_slug,
      action_type,
      action_data,
      language_used,
      device_type,
      referrer_platform,
      duration_seconds,
    } = body;

    if (!page_type || !action_type) {
      return createErrorResponse({
        errorMessage: 'page_type and action_type are required',
        status: 400,
      });
    }

    const analyticsCrud = new CrudOperations('visitor_analytics', context.token);

    const visitor_id = body.visitor_id || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await analyticsCrud.create({
      domain_key,
      visitor_id,
      user_id: context.payload?.sub || null,
      page_type,
      page_id: page_id || null,
      page_slug: page_slug || null,
      action_type,
      action_data: action_data || {},
      language_used: language_used || 'en',
      device_type: device_type || 'desktop',
      referrer_platform: referrer_platform || null,
      duration_seconds: duration_seconds || null,
    });

    return createSuccessResponse({ tracked: true });
  } catch (error) {
    console.error('Analytics track error:', error);
    return createSuccessResponse({ tracked: false });
  }
}, false);
