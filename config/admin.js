module.exports = ({ env }) => {
  const nonEmpty = (value) => (typeof value === 'string' ? value.trim() : '');
  const getSecret = (name, fallback) => {
    const v = nonEmpty(env(name));
    return v || fallback;
  };

  return {
    auth: {
      // For production, set ADMIN_JWT_SECRET explicitly.
      // For local/dev, fall back to JWT_SECRET (auto-generated) or a deterministic default.
      secret: getSecret('ADMIN_JWT_SECRET', getSecret('JWT_SECRET', 'weather-api-dev-admin-jwt-secret')),
    },
    apiToken: {
      // For production, set API_TOKEN_SALT explicitly.
      salt: getSecret('API_TOKEN_SALT', 'weather-api-dev-api-token-salt'),
    },
    transfer: {
      token: {
        // For production, set TRANSFER_TOKEN_SALT explicitly.
        salt: getSecret('TRANSFER_TOKEN_SALT', 'weather-api-dev-transfer-token-salt'),
      },
    },
    secrets: {
      // For production, set ENCRYPTION_KEY explicitly.
      // Must be long enough for Strapi's crypto usage.
      encryptionKey: getSecret('ENCRYPTION_KEY', 'weather-api-dev-encryption-key-32bytes!!'),
    },
    flags: {
      nps: env.bool('FLAG_NPS', true),
      promoteEE: env.bool('FLAG_PROMOTE_EE', true),
    },
  };
};
