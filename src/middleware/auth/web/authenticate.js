const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../../models/user');
const RolePermission = require('../../../models/rolePermission');
const Permission = require('../../../models/permission');
const {
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRATION,
  TOKEN_MAX_AGE
} = require('../../../config/auth').AUTH;

const authenticate = async (req, res, next) => {
  const accessToken = req.cookies.token;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    // req.flash('error', 'Please login to continue');
    return res.redirect('/admin/login');
  }

  try {
    let userId;
    let newAccessToken;

    if (accessToken) {
      try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        userId = decoded.userId;

        const currentTime = Math.floor(Date.now() / 1000);
        if (decoded.exp - currentTime < 300) {
          newAccessToken = await refreshAccessToken(refreshToken);
        }
      } catch (error) {
        if (error.name !== 'TokenExpiredError') throw error;
        newAccessToken = await refreshAccessToken(refreshToken);
      }
    } else {
      newAccessToken = await refreshAccessToken(refreshToken);
    }

    if (!userId && newAccessToken) {
      const decodedNew = jwt.verify(newAccessToken, JWT_SECRET);
      userId = decodedNew.userId;
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(`Invalid userId format: ${userId}`);
    }

    if (newAccessToken) {
      res.cookie('token', newAccessToken, {
        httpOnly: true,
        maxAge: TOKEN_MAX_AGE
      });
    }

    const user = await User.findOne({
      _id: userId,
      isDeleted: false
    }).populate('role_id').populate('profile').populate('user_profile');
    
    if (!user) throw new Error('User not found');

    if (user.status === 2) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      req.flash('error', 'Your account has been suspended. Please contact support.');
      return res.redirect('/admin/login');
    }

    const userPermissions = await getRolePermissions(user.role_id._id);

    req.user = user;
    res.locals.isAuthenticated = true;
    res.locals.userInfo = {
      id: user._id,
      name: `${user.first_name} ${user.last_name}`,
      email: user.email,
      role: user.role_id?.name || 'none',
      permissions: userPermissions,
      profile: user?.profile?.file_path ? user?.profile?.file_path : user?.user_profile?.file_path
    };

    res.locals.layout =
      user.role_id?.name === 'admin' ? 'layouts/backendLayout' : 'layouts/webLayout';

    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.clearCookie('token');
    res.clearCookie('refreshToken');

    if (error.name === 'TokenExpiredError') {
      req.flash('error', 'Session expired. Please login again.');
    } else {
      req.flash('error', 'Authentication failed');
    }

    return res.redirect('/admin/login');
  }
};

async function refreshAccessToken(refreshToken) {
  if (!refreshToken) throw new Error('No refresh token provided');

  const refreshDecoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

  if (!mongoose.Types.ObjectId.isValid(refreshDecoded.userId)) {
    throw new Error(`Invalid userId in refresh token: ${refreshDecoded.userId}`);
  }

  const user = await User.findOne({
    _id: refreshDecoded.userId,
    isDeleted: false
  });

  if (!user) throw new Error('User not found');

  return jwt.sign({ userId: user._id.toString() }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION
  });
}

const getRolePermissions = async (roleId) => {
  try {
    const rolePermissions = await RolePermission.find({
      role_id: roleId,
      isDeleted: false
    }).populate({
      path: 'permission_id',
      select: 'name title isDeleted'
    });

    const permissions = rolePermissions
      .filter(rp => rp.permission_id)
      .map(rp => rp.permission_id.name);

    return permissions;
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    throw error;
  }
};

module.exports = authenticate;