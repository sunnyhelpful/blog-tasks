const constants = require("../config/constant");
const fs = require("fs");
const path = require("path");

/**
 * Utility to capitalize the first word of the statement
 *
 * @param {string} str - The input string.
 * @returns {string} - The string with the first letter of the first word capitalized.
 */
const firstWordCapitalize = (str) => {
  const firstWord = str.split(" ")[0];
  const restOfString = str.slice(firstWord.length);

  return (
    firstWord.charAt(0).toUpperCase() +
    firstWord.slice(1).toLowerCase() +
    restOfString
  );
};

/**
 * Prepare pagination, sorting, and search parameters for DataTables using Mongoose.
 *
 * @param {Object} req - The request object containing query params from DataTables.
 * @param {Array} searchableFields - Fields to search across.
 * @returns {Object} - An object with parsed pagination, sorting, and search filter.
 */
const prepareMongooseDataTablesParams = (
  req,
  searchableFields,
  schema,
  customFieldTypes = {},
) => {
  const { start, length, search, order, columns } = req.query;

  const pageSize = parseInt(length) || 10;
  const pageStart = parseInt(start) || 0;

  const sortColumnIndex =
    order && order[0] && order[0].column ? order[0].column : 0;
  const sortDirection =
    order && order[0] && order[0].dir ? order[0].dir : "asc";
  const sortColumn =
    columns && columns[sortColumnIndex] && columns[sortColumnIndex].data
      ? columns[sortColumnIndex].data
      : null;

  const sortOrder = sortDirection.toUpperCase() === "DESC" ? "DESC" : "ASC";

  let searchFilter = {};

  if (search && search.value) {
    const searchValue = search.value.trim();
    searchFilter = { $or: [] };

    searchableFields.forEach((field) => {
      if (!schema.path(field)) return;

      // const fieldType = schema.path(field).instance;
      let fieldType;
      if (customFieldTypes[field]) {
        fieldType = customFieldTypes[field];
      } else {
        const path = schema.path(field);
        if (!path) return;
        fieldType = path.instance;
      }

      if (fieldType === "Map") {
        const SUPPORTED_LANGUAGES = ["en", "ar"];
        const languageConditions = SUPPORTED_LANGUAGES.map((lang) => ({
          [`${field}.${lang}`]: { $regex: new RegExp(searchValue, "i") },
        }));
        searchFilter.$or.push(...languageConditions);
      } else if (fieldType === "String") {
        searchFilter.$or.push({
          [field]: { $regex: new RegExp(searchValue, "i") },
        });
      } else if (fieldType === "Date" && !isNaN(Date.parse(searchValue))) {
        const searchDate = new Date(searchValue);
        const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999));

        searchFilter.$or.push({
          [field]: { $gte: startOfDay, $lte: endOfDay },
        });
      } else if (fieldType === "Number" && !isNaN(searchValue)) {
        searchFilter.$or.push({
          [field]: parseFloat(searchValue),
        });
      }
    });
  }

  return {
    pageSize,
    pageStart,
    searchFilter,
    sortColumn,
    sortOrder,
  };
};

/*
 ** Here export all functions
 */
module.exports = {
  firstWordCapitalize,
  prepareMongooseDataTablesParams,
};