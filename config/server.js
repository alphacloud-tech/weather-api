module.exports = ({ env }) => {
  const envKeysRaw = env.array('APP_KEYS');
  const envKeys = Array.isArray(envKeysRaw)
    ? envKeysRaw.map((k) => (typeof k === 'string' ? k.trim() : '')).filter(Boolean)
    : [];

  const keys =
    envKeys.length > 0
      ? envKeys
      : [
          'weather-api-dev-key-1',
          'weather-api-dev-key-2',
          'weather-api-dev-key-3',
          'weather-api-dev-key-4',
        ];

  return {
    host: env('HOST', '0.0.0.0'),
    port: env.int('PORT', 1337),
    app: {
      // Strapi requires app keys for the session middleware.
      // In production, set APP_KEYS in your environment (comma-separated).
      keys,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};
