const User = require('../../../models/user');
const RolePermission = require('../../../models/rolePermission');

const authorizePermission = (requiredPermissions = []) => {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];

  return async (req, res, next) => {
    try {
        if (permissions.length === 0) {
            return next();
        }

        if (!req.user) {
            return res.status(401).json({
                success: false,
                code: 'UNAUTHORIZED',
                message: req.trans.auth.authorization.authentication_required,
                statusCode: 401
            });
        }

        const user = await User.findOne({
            _id: req.user._id,
            isDeleted: false
        }).populate('role_id');

        if (!user) {
            return res.status(404).json({
                success: false,
                code: 'USER_NOT_FOUND',
                message: req.trans.auth.authorization.user_not_found,
                statusCode: 404
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                success: false,
                code: 'UNVERIFIED_ACCOUNT',
                message: req.trans.auth.authorization.unverified,
                statusCode: 403
            });
        }

        if (user.isLocked()) {
            return res.status(403).json({
                success: false,
                code: 'ACCOUNT_LOCKED',
                message: req.trans.auth.authorization.locked,
                statusCode: 403
            });
        }

        const rolePermissions = await RolePermission.find({
            role_id: user.role_id._id,
            isDeleted: false
        }).populate({
            path: 'permission_id',
            match: { isDeleted: false }
        });

        const hasPermission = rolePermissions.some(rp => 
            rp.permission_id && permissions.includes(rp.permission_id.name)
        );

        if (!hasPermission) {
            return res.status(403).json({
                success: false,
                code: 'FORBIDDEN',
                message: req.trans.auth.authorization.required.replace(':permissions', permissions.join(', ')),
                statusCode: 403
            });
        }

        next();
    } catch (error) {
        console.error('Permission check error:', error);
        return res.status(500).json({
            success: false,
            code: 'PERMISSION_CHECK_FAILED',
            message: req.trans.auth.authorization.check_failed,
            statusCode: 500
        });
    }
  };
};

module.exports = authorizePermission;