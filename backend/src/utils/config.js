const parseBoolean = (value) => String(value).toLowerCase() === 'true';

export const loadConfig = () => {
  const {
    PORT,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    GOOGLE_CLIENT_ID,
    ADMIN_EMAIL,
    ADMIN_PASSWORD,
    MOCK_PAYMENT_MODE,
    TRIP_RETURN_TIME,
    TRIP_CLOSE_TIME,
  } = process.env;

  return {
    port: Number(PORT) || 4000,
    supabase: {
      url: SUPABASE_URL || '',
      key: SUPABASE_ANON_KEY || '',
    },
    googleClientId: GOOGLE_CLIENT_ID || '',
    admin: {
      email: ADMIN_EMAIL || 'admin@example.com',
      password: ADMIN_PASSWORD || 'changeme',
    },
    payments: {
      mockMode: parseBoolean(MOCK_PAYMENT_MODE || 'true'),
    },
    tripTiming: {
      returnTime: TRIP_RETURN_TIME,
      closeTime: TRIP_CLOSE_TIME,
    },
  };
};
