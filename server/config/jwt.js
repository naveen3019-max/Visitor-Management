const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '24h';

module.exports = {
  JWT_SECRET,
  JWT_EXPIRE
};
