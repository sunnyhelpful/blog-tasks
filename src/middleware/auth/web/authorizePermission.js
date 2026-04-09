const Permission = require('../../../models/permission');
const RolePermission = require('../../../models/rolePermission');

const authorizePermission = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      if (!requiredPermissions.length) return next();

      if (!req.user || !req.user.role_id) {
        // req.flash('error', 'Please log in to access this page');
        return res.redirect('/admin/login');
      }

      const rolePermissions = await RolePermission.find({
        role_id: req.user.role_id._id,
        isDeleted: false
      }).populate({
        path: 'permission_id',
        select: 'name',
        match: { 
          isDeleted: false 
        },
        model: 'Permission'
      });

      const userPermissions = rolePermissions
        .filter(rp => rp.permission_id)
        .map(rp => rp.permission_id.name);

      const hasPermission = requiredPermissions.every(perm =>
        userPermissions.includes(perm)
      );

      if (!hasPermission) {
        req.flash('error', 'You do not have permission to access this page');
        return res.redirect('/admin/dashboard');
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      req.flash('error', 'Permission verification failed');
      return res.redirect('/admin/login');
    }
  };
};

module.exports = authorizePermission;