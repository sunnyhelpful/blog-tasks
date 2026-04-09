const path = require('path');
const fs = require('fs');

const translationCache = new Map();
const defaultLang = 'en';
const localesDir = path.join(__dirname, '..', 'locales');
const files = ['auth', 'cruds', 'global', 'messages', 'validation'];

(function preloadDefaultLang() {
  const defaultTranslations = {};
  files.forEach((fileName) => {
    try {
      defaultTranslations[fileName] = require(path.join(localesDir, defaultLang, `${fileName}.js`));
    } catch (error) {
      console.error(`Error loading default ${fileName} translations:`, error);
      defaultTranslations[fileName] = {};
    }
  });
  translationCache.set(defaultLang, defaultTranslations);
})();

/**
 * Enhanced interpolation with fallback and nested parameter support
 * @param {string} message - The message template
 * @param {Object} params - Values for placeholders
 * @returns {string} - Interpolated message
 */
function interpolateMessage(message, params = {}) {
  if (typeof message !== 'string') return message;

  const predefinedPlaceholders = [
    'attribute', 'min', 'max', 'value', 'min_length', 'max_length',
    'email', 'required', 'username', 'password', 'date', 'number',
    'size', 'type', 'url', 'current', 'old', 'new', 'confirmation',
    'field', 'code', 'token', 'amount', 'currency', 'limit', 'invoice',
    'method', 'action', 'permission', 'role', 'latitude', 'longitude', 'timezone',
  ];

  const placeholders = Object.keys(params).length > 0 ? Object.keys(params) : predefinedPlaceholders;

  const regex = new RegExp(`:(${placeholders.join('|')})`, 'g');
  return message.replace(regex, (match, p1) => {
    // return params[p1] !== undefined ? params[p1] : match;
    if (params[p1] !== undefined) {
      if (p1 === 'attribute') {
        return params[p1].toLowerCase();
      }
      return params[p1];
    }
  });
}

/**
 * Load language file with enhanced error handling
 */
function loadLanguageFile(lang, fileName) {
  const cacheKey = `${lang}:${fileName}`;
  if (translationCache.has(cacheKey)) return translationCache.get(cacheKey);

  const filePath = path.join(localesDir, lang, `${fileName}.js`);
  try {
    if (fs.existsSync(filePath)) {
      const translations = require(filePath);
      translationCache.set(cacheKey, translations);
      return translations;
    }
    throw new Error('File not found');
  } catch (error) {
    console.warn(`Localization file for '${fileName}' in '${lang}' not found. Using '${defaultLang}'.`);
    const defaultTranslations = translationCache.get(defaultLang)?.[fileName] || {};
    translationCache.set(cacheKey, defaultTranslations);
    return defaultTranslations;
  }
}

/**
 * Enhanced localization with fallback chains
 */
function localization(lang = defaultLang) {
  if (translationCache.has(lang)) return translationCache.get(lang);

  const loadLocale = {};
  files.forEach((fileName) => {
    loadLocale[fileName] = loadLanguageFile(lang, fileName);
  });

  translationCache.set(lang, loadLocale);
  return loadLocale;
}

module.exports = { 
  localization, 
  interpolateMessage
};