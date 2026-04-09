const jwt = require('jsonwebtoken');
const auth = require('../config/auth');

const blacklistedTokens = new Set();

module.exports = {
  revoke: (token) => {
    blacklistedTokens.add(token);
  },
  isBlacklisted: (token) => {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {
      blacklistedTokens.delete(token);
      return true;
    }
    return blacklistedTokens.has(token);
  },
  getBlacklistSize: () => blacklistedTokens.size,
  clearExpired: () => {
    for (const token of blacklistedTokens) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp && Date.now() >= decoded.exp * 1000) {
        blacklistedTokens.delete(token);
      }
    }
  },
};