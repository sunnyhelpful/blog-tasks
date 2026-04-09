const mongoose = require('mongoose');

const translationsSchema = new mongoose.Schema({
    ko: String,
    pt: String,
    "pt-BR": String,
    nl: String,
    hr: String,
    fa: String,
    de: String,
    es: String,
    fr: String,
    ja: String,
    it: String,
    "zh-CN": String,
    tr: String,
    ru: String,
    uk: String,
    pl: String,
}, { _id: false });

const refSchema = new mongoose.Schema({
    $ref: String,
    $id: Number
}, { _id: false });

const timezoneSchema = new mongoose.Schema({
    zoneName: String,
    gmtOffset: Number,
    gmtOffsetName: String,
    abbreviation: String,
    tzName: String,
}, { _id: false });

const locationSchema = new mongoose.Schema({
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
}, { _id: false });

/**
 * Region Schema
 */
const regionSchema = new mongoose.Schema({
  _id: Number,
  name: { type: String, required: true },
  translations: translationsSchema,
  wikiDataId: String,
}, { collection: 'regions' });

/**
 * Subregion Schema
 */
const subregionSchema = new mongoose.Schema({
    id: Number,
    name: String,
    region_id: Number,
    translations: translationsSchema,
    wikiDataId: String,
}, { collection: 'subregions' });

/**
 * Country Schema
 */
const countrySchema = new mongoose.Schema({
    _id: Number,
    name: String,
    iso3: String,
    iso2: String,
    numeric_code: String,
    phonecode: String,
    capital: String,
    currency: String,
    currency_name: String,
    currency_symbol: String,
    tld: String,
    native: String,
    region: refSchema,
    region_id: Number,
    subregion: refSchema,
    subregion_id: Number,
    nationality: String,
    timezones: [timezoneSchema],
    translations: translationsSchema,
    latitude: String,
    longitude: String,
    emoji: String,
    emojiU: String,
}, { collection: 'countries' });

/**
 * State Schema
 */
const stateSchema = new mongoose.Schema({
    _id: Number,
    name: { type: String, required: true },
    country_id: Number,
    country_code: String,
    country_name: String,
    state_code: String,
    type: String,
    latitude: String,
    longitude: String,
    country: refSchema,
}, { collection: 'states' });

/**
 * City Schema
 */
const citySchema = new mongoose.Schema({
    _id: Number,
    name: String,
    state_id: Number,
    state_code: String,
    state_name: String,
    country_id: Number,
    country_code: String,
    country_name: String,
    latitude: String,
    longitude: String,
    wikiDataId: String,
    state: refSchema,
    country: refSchema,
    location: locationSchema,
}, { collection: 'cities' });

// Export all models
module.exports = {
    Region: mongoose.model('Region', regionSchema),
    Subregion: mongoose.model('Subregion', subregionSchema),
    Country: mongoose.model('Country', countrySchema),
    State: mongoose.model('State', stateSchema),
    City: mongoose.model('City', citySchema),
};
