const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const { JWT_SECRET } = require('../../../config/auth');
const blacklist = require('../../../config/blacklist');

const isNotAuthenticated = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return next();
    }

    try {
        if (blacklist.isBlacklisted(token)) {
            return next();
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({
            _id: decoded.userId,
            isDeleted: false
        });

        if (user) {
        return res.status(403).json({
            success: false,
            code: 'ALREADY_AUTHENTICATED',
            message: req.t(req.trans.messages.you_are_already, {
                attribute : req.trans.global.logged_in
            }),
            statusCode: 403
        });
        }

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            blacklist.revoke(token);
            return next();
        }
        
        if (error.name === 'JsonWebTokenError') {
            return next();
        }

        console.error('Guest check error:', error);
        next();
    }
};

module.exports = isNotAuthenticated;