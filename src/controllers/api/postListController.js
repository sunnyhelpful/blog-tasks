const Category = require('../../models/category');
const CategoryAttribute = require('../../models/categoryAttribute');
const { 
    preparePaginationParams,
    buildSearchFilterMongoose,
    checkFileExists
} = require("../../utils/helper");
const {
    successResponse,
    errorResponse,
    internalServerErrorResponse,
} = require('../../utils/apiResponses');

const formatIdentifier = require('../../utils/identifierFormat');

/**
* Show a post list form
**/
async function fetchProductFormConfig(req, res) {
    try {
        const lang = req.session.lang || 'en';
        const {
            category
        } = req.query;

        const identifierCondition = formatIdentifier(category);

        const filter = {
            ...identifierCondition,
            isDeleted: false,
        };

        const categoryDoc = await Category.findOne(filter);
        if (!categoryDoc) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.CATEGORY,
                })
            ));
        }
        const categoryAttributes = await findCategoryAttributesUpward(categoryDoc._id);

        if (!categoryAttributes) {
            return res.status(404).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.CATEGORY.form_builder.title_singular,
                }), {
                    error_type: 'FORM_BUILDER_NOT_FOUND'
                }
            ));
        }

        const fallbackImage = 'backend/images/dummy-image.jpg';
        const formBuilder = await Promise.all(categoryAttributes.map(async catAttr => {
            const attr = catAttr.attributeId;

            const options = await Promise.all(
                Array.isArray(attr.options) ? attr.options.map(async (opt) => {
                    const meta = opt.meta || {};

                    const fileUrl = meta?.[`fileUrl_${lang}`] || '';
                    const exists = await checkFileExists(fileUrl);
                    const finalFileUrl = exists ? fileUrl : fallbackImage;

                    const filteredMeta = {
                        fileId: meta[`fileId_${lang}`] || '',
                        fileUrl: finalFileUrl,
                        originalFileName: meta[`originalFileName_${lang}`] || '',
                        mimetype: meta[`mimetype_${lang}`] || '',
                        isCloned: meta.isCloned ?? false
                    };

                    return {
                        _id: opt._id,
                        value: opt.value?.[lang] ?? opt.value?.en ?? '',
                        meta: filteredMeta,
                    };
                }) : []
            );

            return {
                id: catAttr._id.toString(),
                categoryId: catAttr.categoryId.toString(),
                attributeId: attr._id.toString(),
                title: attr.title?.[lang] || attr.title?.en || '',
                description: attr.description?.[lang] || attr.description?.en || '',
                type: attr.type,
                label: attr.label?.[lang] || attr.label?.en || '',
                placeholder: attr.placeholder?.[lang] || attr.placeholder?.en || '',
                searchable: catAttr.searchable,
                position: catAttr.position,
                options
            };
        }));

        return res.json(successResponse(
            req.t(req.trans.messages.fetch_success_message, {
                attribute: req.trans.cruds.MODULE.POST_LIST
            }), { 
                success_type: 'FETCH_FORM_BUILDER',
                formBuilder 
        }, null, null, null));
    } catch (error) {
        logInfo('Error in fetchProductFormConfig function:', error?.stack || error?.message || error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.POST_LIST,
            }),
            { error_type: 'INTERNAL_SERVER_ERROR' }
        ));
    }
}

const findCategoryAttributesUpward = async (categoryId) => {
    let currentCategory = await Category.findOne({
        _id: categoryId,
        isDeleted: false,
    }).lean();
    
    while (currentCategory) {
        const categoryAttributes = await CategoryAttribute.find({
            categoryId: currentCategory._id,
            isDeleted: false,
        }).populate('attributeId').lean();

        if (categoryAttributes.length > 0) {
            return categoryAttributes;
        }

        if (currentCategory.parentId) {
            currentCategory = await Category.findById({
                _id: currentCategory.parentId,
                isDeleted: false,
            }).lean();
        } else {
            break;
        }
    }
    
    return null;
};



module.exports = {
    fetchProductFormConfig,
};