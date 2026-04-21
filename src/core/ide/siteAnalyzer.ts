import axios from 'axios';
import * as cheerio from 'cheerio';

export interface SiteAnalysisResult {
  hasTitle: boolean;
  hasH1: boolean;
  hasMetaDescription: boolean;
  length: number;
  statusCode: number;
  error?: string;
}

export async function analyzeSite(url: string): Promise<SiteAnalysisResult> {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AIPyram-Commander-Bot/1.0'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    return {
      statusCode: response.status,
      hasTitle: $('title').length > 0 && $('title').text().trim().length > 0,
      hasH1: $('h1').length > 0,
      hasMetaDescription: $('meta[name="description"]').length > 0 && !!$('meta[name="description"]').attr('content'),
      length: html.length
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      hasTitle: false,
      hasH1: false,
      hasMetaDescription: false,
      length: 0,
      error: error.message
    };
  }
}
