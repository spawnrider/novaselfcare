// Secrets de DÉMO uniquement – à remplacer par des variables d'environnement hors poste local.
module.exports = ({ env }) => ({
  auth: { secret: env('ADMIN_JWT_SECRET', 'demo-admin-jwt-secret') },
  apiToken: { salt: env('API_TOKEN_SALT', 'demo-api-token-salt') },
  transfer: { token: { salt: env('TRANSFER_TOKEN_SALT', 'demo-transfer-token-salt') } },
  secrets: { encryptionKey: env('ENCRYPTION_KEY', 'demo-encryption-key') },
});
