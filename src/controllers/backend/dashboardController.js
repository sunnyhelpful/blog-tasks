const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../utils/apiResponses');

const User = require('../../models/user');
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
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json(internalServerErrorResponse('Failed to retrieve users'));
  }
}

module.exports = {
    dashboard
};