const Address = require('../../models/address');
const { 
    preparePaginationParams,
    buildSearchFilterMongoose
} = require("../../utils/helper");

const addressTransformer = require('../../transformers/api/addressTransformer');
const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

/* 
**  Fetch Address..
*/
async function index(req, res) {
    try {
        
        
    } catch (error) {
        logInfo(`Address controller index.. ${error.stack} ${error.message}`);

    }
}

/* 
**  Create Address..
*/
async function create(req, res) {
    try {
        
    } catch (error) {
        logInfo(`Address controller create.. ${error.stack} ${error.message}`);
    }
}


/* 
** Store Address ...
*/
async function store(req, res){
    try {
        
    } catch (error) {
        logInfo(`Address controller store.. ${error.stack} ${error.message}`);
    }
}

/* 
** Show Address ...
*/
async function show(req, res){
    try {
        
    } catch (error) {
        logInfo(`Address controller show.. ${error.stack} ${error.message}`);
    }
}

/* 
** Edit Address ...
*/
async function edit(req, res){
    try{

    } catch(error){
        logInfo(`Address controller edit.. ${error.stack} ${error.message}`);
    }
}


/* 
** Update Address ...
*/
async function update(req, res){
    try {
        
    } catch (error) {
        logInfo(`Address controller update.. ${error.stack} ${error.message}`);
    }
}


/* 
** Delete Address ...
*/
async function destroy(req, res){
    try {
        
    } catch (error) {
        logInfo(`Address controller delete.. ${error.stack} ${error.message}`);
    }
}


module.exports = {
    index,
    create,
    store,
    show,
    edit,
    update,
    destroy
}