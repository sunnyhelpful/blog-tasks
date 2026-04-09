const { 
    successResponse, 
    errorResponse, 
    internalServerErrorResponse 
} = require('../../utils/apiResponses');

async function translator(req, res) {
    try {
        const { lang = 'en' } = req.body;
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
        console.error("Error updating translation: ", error.stack);
        return res.status(500).json(
            internalServerErrorResponse(
                req.t(req.trans.messages.oops_something_went_wrong, {
                    attribute: req.trans.cruds.MODULE.TRANSLATION
                })
            )
        );
    }
}


/* 
** Template mode color
*/
async function templateMode(req, res) {
    try {
        let { mode } = req.body;

        if (typeof mode === 'boolean') {
            const themeMode = mode ? 'dark-only' : 'light';

            req.session.mode = themeMode;
            res.cookie('darkMode', themeMode, { 
                maxAge: 30 * 24 * 60 * 60 * 1000,
                httpOnly: false
            });

            return res.status(200).json(successResponse(
                req.t(req.trans.messages.update_success_message, {
                    attribute: req.trans.cruds.MODULE.THEME
                }), { mode: themeMode }, null, null, null
            ));
        } else {
            return res.status(400).json(errorResponse('Invalid mode value. Use boolean true or false.'));
        }
    } catch (error) {
        console.error("Error updating theme: ", error.stack);
        return res.status(500).json(
            internalServerErrorResponse(
                req.t(req.trans.messages.oops_something_went_wrong, {
                    attribute: req.trans.cruds.MODULE.THEME
                })
            )
        );
    }
}


module.exports = { 
    translator, 
    templateMode 
};