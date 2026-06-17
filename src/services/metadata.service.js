const axios = require('axios');
const cheerio = require('cheerio');

function firstContent($, selectors) {
  for (const selector of selectors) {
    const value = $(selector).attr('content') || $(selector).attr('href') || $(selector).text();
    if (value && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function toAbsoluteUrl(value, baseUrl) {
  if (!value) return null;

  try {
    return new URL(value, baseUrl).toString();
  } catch (_error) {
    return null;
  }
}

async function extractMetadata(url) {
  try {
    const response = await axios.get(url, {
      timeout: 5000,
      maxRedirects: 3,
      responseType: 'text',
      headers: {
        'User-Agent': 'NexusLinkCollectorBot/1.0',
        Accept: 'text/html,application/xhtml+xml'
      }
    });

    const contentType = response.headers['content-type'] || '';

    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      return fallbackMetadata(url);
    }

    const html = String(response.data).slice(0, 1024 * 1024);
    const $ = cheerio.load(html);

    const title = firstContent($, [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title'
    ]);

    const description = firstContent($, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]'
    ]);

    const image = firstContent($, [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]'
    ]);

    const favicon = firstContent($, [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]'
    ]);

    const siteName = firstContent($, [
      'meta[property="og:site_name"]',
      'meta[name="application-name"]'
    ]);

    const parsed = new URL(url);

    return {
      title: title || parsed.hostname,
      description,
      image_url: toAbsoluteUrl(image, url),
      favicon_url: toAbsoluteUrl(favicon, url) || `${parsed.origin}/favicon.ico`,
      site_name: siteName,
      metadata: {
        content_type: contentType,
        canonical_url: toAbsoluteUrl($('link[rel="canonical"]').attr('href'), url),
        html_lang: $('html').attr('lang') || null
      }
    };
  } catch (_error) {
    return fallbackMetadata(url);
  }
}

function fallbackMetadata(url) {
  const parsed = new URL(url);

  return {
    title: parsed.hostname,
    description: null,
    image_url: null,
    favicon_url: `${parsed.origin}/favicon.ico`,
    site_name: parsed.hostname,
    metadata: {
      enrichment_status: 'fallback'
    }
  };
}

module.exports = { extractMetadata };
