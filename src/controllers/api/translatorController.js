const { successResponse, internalServerErrorResponse } = require('../../utils/apiResponses');

async function translator(req, res) {
    try {
        const lang = req.headers["accept-language"] || 'en';
        req.session.lang = lang;

        res.cookie('preferredLang', lang, { 
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: false
        });

        return res.status(200).json(successResponse(
            req.t(req.trans.messages.update_success_message, {
                attribute: req.trans.cruds.MODULE.TRANSLATION
            }),{ lang 
        },null, null, null));
    } catch (error) {
        return res.status(500).json(
            internalServerErrorResponse(
                req.t(req.trans.messages.oops_something_went_wrong, {
                    attribute: req.trans.cruds.MODULE.TRANSLATION
                })
            )
        );
    }
}

module.exports = { translator };