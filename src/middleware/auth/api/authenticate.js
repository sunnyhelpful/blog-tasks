const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const blacklist = require('../../../config/blacklist');
const auth = require('../../../config/auth');
const {
    JWT_SECRET,
    JWT_REFRESH_SECRET,
    JWT_EXPIRATION,
    TOKEN_MAX_AGE
} = require('../../../config/auth').AUTH;

/**
 * Middleware to ensure the user is authenticated.
 */
const authenticate = async (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided',
                statusCode: 401,
            });
    }

    try {
        const isBlacklisted = await blacklist.isBlacklisted(token);
        if (isBlacklisted) {
            return res.status(401).json({
                success: false,
                message: 'Token has been revoked',
                statusCode: 401,
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findOne({ _id: decoded.userId, isDeleted: false });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                statusCode: 401,
            });
        }

        if (req.session.currentToken && req.session.currentToken !== token) {
            blacklist.revoke(token);
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
                statusCode: 401,
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            blacklist.revoke(token);
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                statusCode: 401,
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            statusCode: 401,
        });
    }
};

module.exports = authenticate;