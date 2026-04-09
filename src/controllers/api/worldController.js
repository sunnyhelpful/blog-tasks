const { Region, Subregion, Country, State, City } = require("../../models/locations");
const { 
    preparePaginationParams,
    buildSearchFilterMongoose
} = require("../../utils/helper");
const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

const searchableFields = {
    Region: ['name'],
    Subregion: ['name'],
    Country: ['name', 'iso2', 'iso3', 'capital'],
    State: ['name', 'state_code', 'country_name'],
    City: ['name', 'state_name', 'country_name'],
};

/**
 * Adds filtering by foreign keys if present in the query params
 */
function addParentFilters(filter, query, modelName) {
    switch(modelName) {
        case 'Subregion':
            if (query.region_id) filter.region_id = query.region_id;
        break;
        case 'Country':
            if (query.subregion_id) filter.subregion_id = query.subregion_id;
        break;
        case 'State':
            if (query.country_id) filter.country_id = query.country_id;
        break;
        case 'City':
            if (query.state_id) filter.state_id = query.state_id;
        break;
    }
}

/**
 * Generic function to fetch paginated list from a model
 */
async function fetchPaginatedList(req, res, Model, modelName) {
    try {
        const paginationParams = await preparePaginationParams(req);
        if (!paginationParams) {
            return res.status(400).json(errorResponse(req.t('invalid_pagination_parameters')));
        }
        const filter = {};

        addParentFilters(filter, req.query, modelName);
        const searchFilter = buildSearchFilterMongoose(req.query, searchableFields[modelName], Model.schema);
        if (searchFilter.$or && searchFilter.$or.length) {
            filter.$and = [searchFilter];
        }

        const [items, total] = await Promise.all([
            Model.find(filter).sort(paginationParams.sort).skip(paginationParams.skip).limit(paginationParams.limit).lean(),
            Model.countDocuments(filter),
        ]);

        return res.json(successResponse(
            req.t(req.trans.messages.add_success_message, {
                attribute : modelName
            }), { data: items, 
                pagination: {
                    total,
                    page: paginationParams.page,
                    limit: paginationParams.limit,
                    totalPages: Math.ceil(total / paginationParams.limit),
                }
            }, null, null, null)
        );
    } catch (error) {
        console.error(`${modelName} List Error:`, error);
        return res.status(500).json(internalServerErrorResponse(req.t('fetch_failed', { attribute: modelName })));
    }
}

async function regions(req, res) {
    return fetchPaginatedList(req, res, Region, 'Region');
}

async function subregions(req, res) {
    return fetchPaginatedList(req, res, Subregion, 'Subregion');
}

async function countries(req, res) {
    return fetchPaginatedList(req, res, Country, 'Country');
}

async function states(req, res) {
    return fetchPaginatedList(req, res, State, 'State');
}

async function cities(req, res) {
    return fetchPaginatedList(req, res, City, 'City');
}

module.exports = {
    regions,
    subregions,
    countries,
    states,
    cities,
};
