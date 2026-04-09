const jwt = require('jsonwebtoken');
const User = require('../../../models/user');
const Role = require('../../../models/role');
const auth = require('../../../config/auth');
const { socialRequest } = require('../../../requests/api/authRequest');
const { 
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../../utils/apiResponses');
const crypto = require('crypto');

const socialLogin = async (req, res) => {
  const validationErrors = await socialRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.auth.validation_error, {
      error_type: 'VALIDATION_ERROR', 
      ...validationErrors
    }));
  }

  try {
    const { provider, socialId, email, first_name, middle_name, last_name } = req.body;

    const socialField = `${provider}Id`;
    let user = await User.findOne({ [`social.${socialField}`]: socialId, isDeleted: false });
    if (!user && email) {
      const existingUser = await User.findOne({ email });
      
      if (existingUser && existingUser.isDeleted) {
        user = null;
      } else if (existingUser) {
        return res.status(400).json(errorResponse(
          req.t('validation.duplicate_entry', { 
            attribute: req.trans.cruds.USER.fields.email 
          }), { error_type: 'VALIDATION_ERROR' }
        ));
      }
    }

    const firstName = first_name || 'User';
    const lastName = last_name || '';
    const middleName = middle_name || '';
    const usernameBase = email ? email.split('@')[0] : `user${Math.random().toString(36).substring(2, 8)}`;
    const username = await User.generateUniqueUsername(usernameBase);

    const userRole = await Role.findOne({ name: 'user', isDeleted: false });
    if (!user) {
      user = new User({
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        email: email || null,
        username,
        authProvider: provider,
        social: { [socialField]: socialId },
        isVerified: true,
        role_id: userRole ? userRole._id : null,
      });

      await user.save();
    }

    const jti = crypto.randomBytes(32).toString('hex');
    const token = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_SECRET, {
      expiresIn: auth.AUTH.JWT_EXPIRATION,
    });

    const refreshToken = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_REFRESH_SECRET, {
      expiresIn: auth.AUTH.JWT_REFRESH_EXPIRATION,
    });

    user.tokens = {
      refreshToken,
      refreshTokenIssuedAt: new Date(),
      refreshTokenExpiresAt: new Date(Date.now() + auth.AUTH.REFRESH_TOKEN_MAX_AGE)
    };
    user.jti = jti;
    await user.save();

    req.session.currentToken = token;

    return res.json(
      successResponse(req.trans.auth.loginSuccess, {
        success_type: 'SOCIAL_LOGIN_SUCCESS',
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: userRole ? userRole?.name : null,
        token,
        refreshToken,
      })
    );
  } catch (error) {
    console.error('Social login error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

module.exports = { socialLogin };