const DEFAULT_FRONTEND_URL = 'http://localhost:5173';

export const normalizeFrontendOrigin = (value?: string | null): string | null => {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const url = new URL(trimmed);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return null;
    }

    return url.origin;
  } catch {
    return null;
  }
};

export const getDefaultFrontendOrigin = (): string => {
  return normalizeFrontendOrigin(process.env.FRONTEND_URL) || DEFAULT_FRONTEND_URL;
};

export const getAllowedFrontendOrigins = (): string[] => {
  const configuredOrigins = [
    process.env.FRONTEND_URL,
    ...(process.env.FRONTEND_URLS || '').split(',')
  ];

  const origins = configuredOrigins
    .map((origin) => normalizeFrontendOrigin(origin))
    .filter((origin): origin is string => Boolean(origin));

  return Array.from(new Set([getDefaultFrontendOrigin(), ...origins]));
};

export const resolveFrontendOrigin = (value: unknown): string => {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalizedOrigin =
    typeof candidate === 'string' ? normalizeFrontendOrigin(candidate) : null;

  if (normalizedOrigin && getAllowedFrontendOrigins().includes(normalizedOrigin)) {
    return normalizedOrigin;
  }

  return getDefaultFrontendOrigin();
};
