function normalizeUrl(value) {
  const parsed = new URL(value);

  parsed.hash = '';

  const removableParams = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'fbclid',
    'gclid'
  ];

  for (const param of removableParams) {
    parsed.searchParams.delete(param);
  }

  parsed.hostname = parsed.hostname.toLowerCase();

  if (parsed.pathname !== '/') {
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
  }

  return parsed.toString();
}

function assertHttpUrl(value) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch (_error) {
    return false;
  }

  return parsed.protocol === 'http:' || parsed.protocol === 'https:';
}

module.exports = {
  normalizeUrl,
  assertHttpUrl
};
