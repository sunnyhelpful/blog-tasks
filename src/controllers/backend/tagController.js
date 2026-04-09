const Tag = require("../../models/tag");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const tagTransformer = require('../../transformers/backend/tagTransformer');
const { addTagRequest, editTagRequest } = require('../../requests/backend/tagRequest');
const { ObjectId } = require('mongoose').Types;
const { 
    saveUpload 
} = require('../../utils/saveUpload');
const { 
    successResponse, 
    errorResponse, 
    internalServerErrorResponse 
} = require('../../utils/apiResponses');
const constant = require('../../config/constant');

/**
 * Show a list of all tags with pagination, sorting, and search
 */
async function index(req, res) {
    try {
        if (!req.xhr && !req.headers.accept.includes('json')) {
            return res.render('backend/tags/index');
        }

        const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['title', 'createdAt'], Tag.schema);
        const finalSortColumn = sortColumn || 'createdAt';
        const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

        const totalCount = await Tag.countDocuments({ isDeleted: false });
        const filteredCount = await Tag.countDocuments({ isDeleted: false, ...searchFilter });

        const tags = await Tag.find({ isDeleted: false, ...searchFilter })
            .skip(pageStart)
            .limit(pageSize)
            .sort({ [finalSortColumn]: finalSortOrder });

        const transformedTags = tagTransformer.transformCollection(tags, req.session.lang);

        return res.json({
            draw: parseInt(req.query.draw) || 1,
            recordsTotal: totalCount,
            recordsFiltered: filteredCount,
            data: transformedTags,
        });
    } catch (error) {
        console.error('Error fetching tags:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TAG,
            })
        ));
    }
}

/**
 * Render the form to create a new tag
 */
async function create(req, res) {
    try {
        const filter = {
            isDeleted: false,
            deletedAt: null,
        };
        const tagRaw = await Tag.find(filter);
        const tags = tagRaw.map((tag) => ({
            ...tag.toObject(),
            title: Object.fromEntries(tag.title),
            description: Object.fromEntries(tag.description),
        }));

        return res.render("backend/tags/create", {
            tag: {},
            tags: tags,
            tagTypes: constant.TAGS.TYPE,
            tagVisibility: constant.TAGS.VISIBILITY,
        });
    } catch (error) {
        console.error("Error rendering tag creation form:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TAG,
            })
        ));
    }
}

/**
 * Store a new tag in the database
 */
async function store(req, res) {
    const validationErrors = await addTagRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    try {
        const {
            title_en, title_ar, description_en, description_ar, metaTitle, metaDescription, searchKeywords, visibility, priority, tagType, parentTag, relatedTags
        } = req.body;

        let parsedKeywords = [];
        try {
            parsedKeywords = typeof searchKeywords === 'string' 
                ? JSON.parse(searchKeywords).map(item => item.value)
                : searchKeywords.map(item => item.value);
        } catch (e) {
            parsedKeywords = [];
        }

        const tagData = {
            title: {
                en: title_en.trim(),
                ar: title_ar.trim()
            },
            description: {
                en: description_en?.trim() || '',
                ar: description_ar?.trim() || ''
            },
            metaTitle: metaTitle?.trim() || '',
            metaDescription: metaDescription?.trim() || '',
            searchKeywords: parsedKeywords,
            visibility: visibility || 'public',
            priority: parseInt(priority) || 0,
            tagType: tagType || 'product',
            status: req.body.status || 'active',
            createdBy: req.user._id,
            parentTag: parentTag || null,
            relatedTags: relatedTags || []
        };

        const storeTag = await Tag.create(tagData);

    let fileMetadata = null;
    if (req.files) {
        const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
        if (req.files?.tag_image?.[0]) {
            fileMetadata = await saveUpload(storeTag._id, 'Tag', req.files?.tag_image?.[0], 'tag_image', isS3);
        }
        if (req.files?.tag_icon?.[0]) {
            fileMetadata = await saveUpload(storeTag._id, 'Tag', req.files?.tag_icon?.[0], 'tag_icon', isS3);
        }
    }
    
    return res.status(201).json(
      successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute : req.trans.cruds.MODULE.TAG
        }), {
            storeTag,
    }, null, null, '/admin/tags'));
    } catch (error) {
        console.error('Error creating tag:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TAG,
            })
        ));
    }
}

/**
 * Show a single tag by ID
 */
async function show(req, res) {
    try {
        const { id } = req.params;
        const filter = {
            _id: id,
            isDeleted: false,
        }

        const tagDoc = await Tag.findOne(filter).populate('parentTag').populate('tag_image').populate('tag_icon');
        if(!tagDoc){
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.TAG,
            }));
            return res.redirect('/admin/tags');
        }
        
        const tag = {
            ...tagDoc.toObject(),
            title: Object.fromEntries(tagDoc.title),
            description: Object.fromEntries(tagDoc.description),
        };

        if (tag.parentTag && tagDoc.parentTag?.title instanceof Map) {
            tag.parentTag.title = Object.fromEntries(tagDoc.parentTag.title);
        }
        if (tag.parentTag && tagDoc.parentTag?.description instanceof Map) {
            tag.parentTag.description = Object.fromEntries(tagDoc.parentTag.description);
        }
    
        const parentHierarchy = await tagDoc.getHierarchy();
        const childHierarchy = await tagDoc.getChildHierarchy();
        let hierarchy = [];
        if (tag.parentTag) {
            hierarchy = parentHierarchy[0]?.children || [];
        } else {
            hierarchy = childHierarchy;
        }
        return res.render("backend/tags/show", {
            tag,
            hierarchy
        });
    } catch (error) {
        console.error("Error fetching tag:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TAG,
            })
        ));
    }
}

/**
 * Render the form to edit an existing tag
 */
async function edit(req, res) {
    try {
        const { id } = req.params;
        const filter = {
            _id: id,
            isDeleted: false,
        };

        const tagRaw = await Tag.find({ 
            isDeleted: false, deletedAt: null,
        });
        
        const tags = tagRaw.map((tag) => ({
            ...tag.toObject(),
            title: Object.fromEntries(tag.title),
            description: Object.fromEntries(tag.description),
        }));

        const tagDoc = await Tag.findOne(filter).populate('tag_image').populate('tag_icon');
        if(!tagDoc){
            req.flash("error_with_popup", req.t(req.trans.messages.not_found, {
                attribute: req.trans.cruds.MODULE.TAG,
            }));
            return res.redirect('/admin/tags');
        }
        
        const tag = {
            ...tagDoc.toObject(),
            title: Object.fromEntries(tagDoc.title),
            description: Object.fromEntries(tagDoc.description),
        };
        return res.render("backend/tags/edit", {
            tag,
            tags: tags,
            tagTypes: constant.TAGS.TYPE,
            tagVisibility: constant.TAGS.VISIBILITY,
        });
    } catch (error) {
        console.error("Error fetching tag for editing:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TAG,
            })
        ));
    }
}

/**
 * Update an existing tag by ID
 */
async function update(req, res) {
    const validationErrors = await editTagRequest(req);
    if (validationErrors) {
        return res.status(400).json(errorResponse(req.trans.messages.validation_error, validationErrors));
    }

    try {
        const {
            title_en, title_ar, description_en, description_ar, metaTitle, metaDescription, searchKeywords, visibility, priority, tagType, parentTag, relatedTags
        } = req.body;
    
        let parsedKeywords = [];
        try {
            parsedKeywords = typeof searchKeywords === 'string' 
                ? JSON.parse(searchKeywords).map(item => item.value)
                : searchKeywords.map(item => item.value);
        } catch (e) {
            parsedKeywords = [];
        }
    
        const tagData = {
            title: {
                en: title_en.trim(),
                ar: title_ar.trim()
            },
            description: {
                en: description_en?.trim() || '',
                ar: description_ar?.trim() || ''
            },
            metaTitle: metaTitle?.trim() || '',
            metaDescription: metaDescription?.trim() || '',
            searchKeywords: parsedKeywords,
            visibility: visibility || 'public',
            priority: parseInt(priority) || 0,
            tagType: tagType || 'product',
            status: req.body.status || 'active',
            createdBy: req.user._id,
            parentTag: parentTag || null,
            relatedTags: relatedTags || []
        };
    
        const updatedTag = await Tag.findByIdAndUpdate(req.params.id, tagData, { new: true });
        let fileMetadata = null;
        if (req.files) {
            const isS3 = !!process.env.AWS_SDK_API_KEY && !!process.env.AWS_SDK_API_SECRET_KEY;
            if (req.files?.tag_image?.[0]) {
                fileMetadata = await saveUpload(updatedTag._id, 'Tag', req.files?.tag_image?.[0], 'tag_image', isS3);
            }
            if (req.files?.tag_icon?.[0]) {
                fileMetadata = await saveUpload(updatedTag._id, 'Tag', req.files?.tag_icon?.[0], 'tag_icon', isS3);
            }
        }
        
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute: req.trans.cruds.MODULE.TAG
            }),{ updatedTag
        }, null, null, '/admin/tags'));
    } catch (error) {
        console.error("Error updating tag:", error);
        console.error("Error fetching tag for editing:", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute: req.trans.cruds.MODULE.TAG,
            })
        ));
    }
} 


/**
 * Soft delete a tag by ID
 */
async function destroy(req, res) {
    try {
        const tag = await Tag.findById(req.params.id);
        
        if (!tag || tag.isDeleted) {
            return res.status(400).json(errorResponse(
                req.t(req.trans.messages.not_found, {
                    attribute: req.trans.cruds.MODULE.TAG
                })
            ));
        }

        const childTags = await Tag.find({ parentTag: req.params.id, isDeleted: false });
        
        if (childTags.length > 0) {
            for (let child of childTags) {
                const grandChildTags = await Tag.find({ parentTag: child.id, isDeleted: false });
                
                if (grandChildTags.length > 0) {
                    for (let grandChild of grandChildTags) {
                        await grandChild.softDelete(req.user._id);
                    }
                }
                
                await child.softDelete(req.user._id);
            }
        }

        await tag.softDelete(req.user._id);
        return res.status(200).json(successResponse(
            req.t(req.trans.messages.delete_success_message, {
                attribute : req.trans.cruds.MODULE.TAG
            }), { tag,
        }, null, null, '/admin/tags'));
    } catch (error) {
        console.error("Error deleting tag: ", error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.TAG
            })
        ));
    }
}

async function statusUpdate(req, res) {
    try {
        const { status } = req.body;
        const { id } = req.params;
        if (!['active', 'inactive', 'archived'].includes(status)) {
            return res.status(400).json(
                errorResponse(
                    req.t(req.trans.messages.invalid_key, {
                        attribute : req.trans.cruds.TAG.fields.status,
                    })
                )
            );
        }

        await Tag.findByIdAndUpdate(id, { status });
        return res.status(200).json(
            successResponse(
                req.t(req.trans.messages.key_update, {
                    attribute : req.trans.cruds.MODULE.TAG,
                    status : status,
                }), {}, null, null, null
            )
        );
    } catch (error) {
        console.error('Error while updating tags status:', error);
        return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
                attribute : req.trans.cruds.MODULE.TAG
            })
        ));
    }
}


module.exports = {
    index,
    create,
    store,
    show,
    edit,
    update,
    destroy,
    statusUpdate
};
