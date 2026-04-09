const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../utils/apiResponses');

const User = require('../../models/user');
const Brand = require('../../models/brand');
const Category = require('../../models/category');
const Role = require('../../models/role')
const constant = require('../../config/constant');

/**
* Show dashboard
*/
async function dashboard(req, res) {
  try {
    const wantsJSON = req.xhr || (req.headers.accept && req.headers.accept.includes('json'));
    if (!wantsJSON) {
      const months = constant.SHORT_MONTHS[req.session.lang || 'en'];
      return res.render('backend/dashboard/dashboard', {
        layout: "layouts/backendLayout",
        months: JSON.stringify(months)
      });
    }

    const adminRole = await Role.findOne({
      isDeleted: false,
      name: 'admin',
    });

    const adminRoleId = adminRole?._id;

    const [
      systemUserCount,
      activeSystemUserCount,
      platformUserCount,
      activePlatformUserCount,
      brandCount,
      activeBrandCount,
      categoryCount,
      activeCategoryCount
    ] = await Promise.all([
      User.countDocuments({
        isDeleted: false,
        account_type: 'system_user',
        ...(adminRoleId && { role_id: { $ne: adminRoleId } })
      }),
      User.countDocuments({
        isDeleted: false,
        account_type: 'system_user',
        status: 1,
        ...(adminRoleId && { role_id: { $ne: adminRoleId } })
      }),
      User.countDocuments({ isDeleted: false, account_type: 'platform_user' }),
      User.countDocuments({ isDeleted: false, account_type: 'platform_user', status: 1 }),
      Brand.countDocuments({ isDeleted: false }),
      Brand.countDocuments({ isDeleted: false, status: 'active' }),
      Category.countDocuments({ isDeleted: false, /* category_type: { $ne: 'category_type' } */ }),
      Category.countDocuments({ isDeleted: false, /* category_type: { $ne: 'category_type' }, */ status: 'active' }),
    ]);

    res.set('Cache-Control', 'no-store');

    return res.status(200).json(successResponse(
      req.t(req.trans.messages.fetch_success_message, {
        attribute: req.trans.cruds.MODULE.DASHBOARD
      }), {
        system_users: systemUserCount,
        active_system_users: activeSystemUserCount,
        platform_users: platformUserCount,
        active_platform_users: activePlatformUserCount,
        brands: brandCount,
        active_brands: activeBrandCount,
        categories: categoryCount,
        active_categories: activeCategoryCount
      }
    ));
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to retrieve users'));
  }
}

module.exports = {
    dashboard
};