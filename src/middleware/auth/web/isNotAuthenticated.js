const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../../config/auth').AUTH;
const User = require('../../../models/user');

const isNotAuthenticated = async (req, res, next) => {
  const authRoutes = new Set([
    'login', 
    'register', 
    'forgot-password', 
    'reset-password', 
    'verify-email', 
    'resend-verification', 
    'verify-otp'
  ]);

  // Check ALL path segments for auth route matches
  const pathSegments = req.path.split('/')
    .filter(segment => segment.trim().length > 0);

  const isAuthRoute = pathSegments.some(segment => authRoutes.has(segment));

  // Skip middleware if no auth routes found in path
  if (!isAuthRoute) {
    return next();
  }

  const accessToken = req.cookies.token;
  if (!accessToken) {
    return next();
  }

  try {
    const decoded = jwt.verify(accessToken, JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.userId,
      isDeleted: false
    }).populate({
      path: 'role_id',
      select: '_id name'
    });

    if (!user) {
      res.clearCookie('token');
      return next();
    }

    if (user.role_id.name) {
      /* req.flash('info', req.t(req.trans.messages.you_are_already, {
          attribute : req.trans.global.logged_in
        })
      ); */
      return res.redirect('/admin/dashboard');
    }

    res.clearCookie('token');
    req.flash('error', 'Access restricted to admin users');
    return res.redirect('/admin/login');

  } catch (error) {
    res.clearCookie('token');
    if (error.name !== 'TokenExpiredError') {
      console.error('Authentication error:', error);
    }
    return next();
  }
};

module.exports = isNotAuthenticated;