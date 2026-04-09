const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const blacklist = require('../../../config/blacklist');
const whatsApp = require('../../../config/whatsappOtp');
const User = require('../../../models/user');
const Role = require('../../../models/role');
const auth = require('../../../config/auth');
const ejs = require('ejs');
const path = require('path');
const { 
  transporter, 
  sender 
} = require('../../../config/mailer');
const emailTemplate = require('../../../config/emailTemplate');
const { 
  loginRequest, 
  registerRequest 
} = require('../../../requests/api/authRequest');

const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../../utils/apiResponses');

/* Login */
const login = async (req, res) => {
  const validationErrors = await loginRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.auth.validation_error, {
        error_type: 'VALIDATION_ERROR', ...validationErrors
      })
    );
  }

  try {
    const { email_or_phone , password } = req.body;

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_or_phone);
    const query = isEmail
      ? { email: email_or_phone.toLowerCase(), isDeleted: false }
      : { phone_number: email_or_phone, isDeleted: false };

    const user = await User.findOne(query).populate({
      path: 'role_id',
      select: '_id name'
    }).populate('profile').populate('user_profile');

    if (!user)
      return res.status(404).json(errorResponse(req.trans.auth.invalidCredentials, {
        error_type: 'USER_NOT_FOUND'
      }));

    if (user.account_type === 'system_user')
      return res.status(403).json(errorResponse(req.trans.auth.invalidCredentials, {
        error_type: 'SYSTEM_USER'
      }));

    if (user.status === 2){
      return res.status(403).json(errorResponse(req.trans.auth.suspendAccount, {
        error_type: 'ACCOUNT_SUSPENDED'
      }));
    }

    if (user.isLocked && user.isLocked())
      return res.status(403).json(errorResponse(req.trans.auth.account.locked, {
        error_type: 'ACCOUNT_LOCKED'
      }));

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.incrementLoginAttempts();
      await user.save();
      return res.status(401).json(errorResponse(req.trans.auth.invalidCredentials, {
        error_type: 'INVALID_PASSWORD'
      }));
    }
    
    if (!user.isVerified){
      const otp = user.generateOTP();
      await user.save();
      
      if (user.phone_number) {
        await whatsApp.sendOTP(`${user.country_code}${user.phone_number}`, otp);
      }

      const mailOptions = {
        from: `"${sender.name}" <${sender.address}>`,
        to: user.email,
        subject: 'Verify Your Email Address',
        text: `Please verify your email using this OTP: ${otp}\nExpires in 10 minutes`,
      };

      await transporter.sendMail(mailOptions);
      return res.status(403).json(errorResponse(req.trans.auth.notVerified, {
        error_type: 'ACCOUNT_NOT_VERIFIED',
        email: user.email,
      }));
    }

    if (user.status === 0) user.status = 1;
    user.resetLoginAttempts && user.resetLoginAttempts();

    const jti = crypto.randomBytes(32).toString('hex');

    const token = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_SECRET, {
      expiresIn: auth.AUTH.JWT_EXPIRATION
    });

    const refreshToken = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_REFRESH_SECRET, {
      expiresIn: auth.AUTH.JWT_REFRESH_EXPIRATION
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
        success_type: 'LOGIN_SUCCESS',
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        role: user.role_id?.name || null,
        profile: user?.profile || user?.user_profile || null,
        token,
        refreshToken,
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

/* logout */
const logout = async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(400).json(errorResponse(req.trans.auth.noToken, {
        error_type: 'NO_TOKEN_PROVIDED'
      }));
    }

    blacklist.revoke(token);
    if (req.session.currentToken) {
      req.session.currentToken = null;
    }

    return res.json(successResponse(req.trans.auth.messages.logout.success, {
      success_type: 'LOGOUT_SUCCESS',
      LOGOUT_SUCCESS: true
    }));
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

/* Register */
const register = async (req, res) => {
  req.body.country_code = req.body.country_code || '+91';
  const validationErrors = await registerRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.auth.validation_error, {
      error_type: 'VALIDATION_ERROR',
      ...validationErrors
    }));
  }

  try {
    const {
      first_name,
      middle_name,
      last_name,
      username,
      email,
      phone_number,
      country_code,
      password
    } = req.body;

    const userRole = await Role.findOne({ name: 'user', isDeleted: false });
    if (!userRole) {
      return res.status(500).json(
        internalServerErrorResponse('Default user role not found. Please contact administrator.', {
          error_type: 'ROLE_MISSING'
        })
      );
    }

    const newUser = new User({
      first_name,
      middle_name: middle_name || null,
      last_name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      country_code: country_code || '+91',
      phone_number: phone_number || null,
      password,
      role_id: userRole._id || null
    });

    const otp = newUser.generateOTP();
    await newUser.save();

    /*
    if (phone_number) {
      await whatsApp.sendOTP(`${country_code}${phone_number}`, otp);
    }
    */

    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to: newUser.email,
      subject: 'Verify Your Email Address',
      text: `Please verify your email using this OTP: ${otp}\nExpires in 10 minutes`,
    };

    await transporter.sendMail(mailOptions);

    return res.json(successResponse(req.trans.auth.messages.registration.success, {
      success_type: 'REGISTRATION_SUCCESS',
      id: newUser._id,
      first_name: newUser.first_name,
      middle_name: newUser.middle_name,
      last_name: newUser.last_name,
      username: newUser.username,
      email: newUser.email,
      country_code: newUser.country_code,
      phone_number: newUser.phone_number,
      authProvider: newUser.authProvider,
    }));
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(400).json(errorResponse(req.trans.auth.validation_error, {
        error_type: 'VALIDATION_ERROR',
        [duplicateField]: req.t('validation.duplicate_entry', {
          attribute: req.trans.cruds.USER.fields[duplicateField]
        })
      }));
    }

    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

/* Verify Email */
const verifyEmail = async (req, res) => {
  try {
    const { token, email_or_phone, type, otp } = req.body;

    if (!email_or_phone && !token) {
      return res.status(400).json(errorResponse(
        req.trans.auth.messages.resend_verification.missing_input || 'Email/phone or token is required.',
        { error_type: 'MISSING_INPUT' }
      ));
    }

    const missing = [];
    if (!otp) missing.push('otp');

    if (missing.length > 0) {
      return res.status(400).json(errorResponse(
        `${req.trans.auth.missingFields} ${missing.join(', ')}.`,{ error_type: 'MISSING_FIELDS', fields: missing }
      ));
    }

    let user = null;
    if (email_or_phone) {
      user = await User.findByEmailOrPhone(email_or_phone);
    }

    if (!user && token) {
      try {
        const decoded = jwt.verify(token, auth.AUTH.JWT_SECRET);
        user = await User.findById(decoded.userId);
      } catch (err) {
        return res.status(401).json(errorResponse(
          req.trans.auth.tokenRevoked || 'Invalid or expired token.',
          { error_type: 'INVALID_OR_EXPIRED_TOKEN' }
        ));
      }
    }

    const now = new Date();

    if (!user || !user.otp || user.otp.code !== otp || new Date(user.otp.expiry) <= now) {
      return res.status(400).json(errorResponse(req.trans.auth.otpInvalidOrExpire, {
        error_type: 'OTP_INVALID_OR_EXPIRED'
      }));
    }

    const isVerified = await user.verifyOTP(otp);
    if (!isVerified) {
      return res.status(400).json(errorResponse(req.trans.auth.otpInvalid, {
        error_type: 'OTP_INVALID'
      }));
    }

    if (type === 'login') {
      const role = Role.findOne({
        _id: user.role_id, isDeleted: false
      });
      const jti = crypto.randomBytes(32).toString('hex');

      const token = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_SECRET, {
        expiresIn: auth.AUTH.JWT_EXPIRATION
      });

      const refreshToken = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_REFRESH_SECRET, {
        expiresIn: auth.AUTH.JWT_REFRESH_EXPIRATION
      });

      if (user.status === 0) user.status = 1;
      user.resetLoginAttempts && user.resetLoginAttempts();

      user.tokens = {
        refreshToken,
        refreshTokenIssuedAt: new Date(),
        refreshTokenExpiresAt: new Date(Date.now() + auth.AUTH.REFRESH_TOKEN_MAX_AGE)
      };
      user.jti = jti;
      await user.save();

      req.session.currentToken = token;

      return res.json(successResponse(
        req.trans.auth.messages.email_verification.account_verified,
        {
          success_type: 'EMAIL_VERIFICATION_SUCCESS',
          first_name: user.first_name,
          middle_name: user.middle_name,
          last_name: user.last_name,
          username: user.username,
          email: user.email,
          role: role?.name || null,
          token,
          refreshToken,
        }
      ));
    } else if(type == 'forgot_password'){
      if (user.password_reset_token !== token) {
        return res.status(400).json(errorResponse('Invalid token or user.', {
          error_type: 'INVALID_TOKEN_OR_USER'
        }));
      }

      user.password_reset_token = '';
      await user.save();
      
      const newToken = jwt.sign({ userId: user._id }, auth.AUTH.JWT_SECRET, {
        expiresIn: auth.AUTH.JWT_EXPIRATION
      });

      return res.json(successResponse(
        req.trans.auth.messages.email_verification.account_verified,
        {
          success_type: 'EMAIL_VERIFICATION_SUCCESS',
          token: newToken,
        }
      ));

    }else {
      const newToken = jwt.sign({ userId: user._id }, auth.AUTH.JWT_SECRET, {
        expiresIn: auth.AUTH.JWT_EXPIRATION
      });

      return res.json(successResponse(
        req.trans.auth.messages.email_verification.account_verified,
        {
          success_type: 'EMAIL_VERIFICATION_SUCCESS',
          token: newToken,
        }
      ));
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};


/* Resend Verification Email */
const resendVerificationOtp = async (req, res) => {
  try {
    const { email_or_phone, token, type } = req.body;
    const lang = req.session.lang || 'en';

    let user;

    if (!email_or_phone && !token) {
      return res.status(400).json(errorResponse(
        req.trans.auth.messages.resend_verification.missing_input || 'Email/phone or token is required.',
        { error_type: 'MISSING_INPUT' }
      ));
    }

    if (email_or_phone) {
      user = await User.findByEmailOrPhone(email_or_phone);
    }

    if (!user && token) {
      try {
        const decoded = jwt.verify(token, auth.AUTH.JWT_SECRET);
        user = await User.findById(decoded.userId);
      } catch (err) {
        return res.status(401).json(errorResponse(
          req.trans.auth.tokenRevoked || 'Invalid or expired token.',
          { error_type: 'INVALID_OR_EXPIRED_TOKEN' }
        ));
      }
    }

    if (!user) {
      return res.status(404).json(errorResponse(
        req.trans.auth.messages.resend_verification.email_not_found,
        { error_type: 'USER_NOT_FOUND' }
      ));
    }

    /* if (user.isVerified) {
      return res.status(400).json(errorResponse(
        req.trans.auth.messages.resend_verification.email_already_verified,
        { error_type: 'EMAIL_ALREADY_VERIFIED' }
      ));
    } */

    const otp = user.generateOTP();

    if (user.phone_number) {
      await whatsApp.sendOTP(`${user.country_code || ''}${user.phone_number}`, otp);
    }

    const newToken = jwt.sign({ userId: user._id }, auth.AUTH.JWT_SECRET, {
      expiresIn: auth.AUTH.JWT_EXPIRATION
    });

    if(type == 'forgot_password'){
      user.password_reset_token = newToken;
    }
    await user.save();

    const emailBody = (lang === 'ar'
      ? emailTemplate.login_otp_verification.twoStepVerificationAr
      : emailTemplate.login_otp_verification.twoStepVerificationEn
    )
      .replace('{name}', user.first_name)
      .replace('{otp}', otp);

    const subject = lang === 'ar'
      ? 'رمز التحقق الجديد لحسابك'
      : 'Your New Verification Code';

    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to: user.email,
      subject,
      text: emailBody,
    };
    await transporter.sendMail(mailOptions);

    return res.json(successResponse(
      req.trans.auth.messages.resend_verification.email_sent || 'Verification email sent successfully.',
      {
        success_type: 'RESEND_VERIFICATION_SUCCESS',
        token: newToken,
        email: user.email,
        phone_number: `${user.country_code || ''}${user.phone_number}`,
      }
    ));
  } catch (error) {
    console.error('Error in resendVerificationOtp:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

/* Forgot Password */
const forgotPassword = async (req, res) => {
  try {
    const { email_or_phone } = req.body;

    if (!email_or_phone) {
      return res.status(400).json(
        errorResponse(req.trans.auth.messages.forgot_password.validation.missing_input, {
          error_type: 'MISSING_INPUT'
        })
      );
    }

    const user = await User.findByEmailOrPhone(email_or_phone);
    if (!user) {
      return res.status(404).json(
        errorResponse(req.trans.auth.messages.forgot_password.validation.email_not_found, {
          error_type: 'USER_NOT_FOUND'
        })
      );
    }

    const resetToken = jwt.sign({ userId: user._id }, auth.AUTH.JWT_SECRET, {
      expiresIn: auth.AUTH.JWT_EXPIRATION
    });

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const resetPasswordUrl = `${baseUrl}/reset-password?token=${resetToken}`;

    const lang = req.session.lang || 'en';
    const htmlContent = await ejs.renderFile(
      path.join(__dirname, '../../../../views/auth/', 'reset-email.ejs'),
      {
        name: `${user.first_name} ${user.last_name}`,
        resetUrl: resetPasswordUrl,
        lang: lang
      }
    );

    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to: user.email,
      subject: lang === 'ar' ? 'تعليمات إعادة تعيين كلمة المرور' : 'Password Reset Instructions',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    const otp = user.generateOTP();
    user.password_reset_token = resetToken;
    await user.save();

    return res.json(successResponse(
      req.trans.auth.messages.forgot_password.validation.password_reset,
      {
        success_type: 'PASSWORD_RESET_OTP_SENT',
        token: resetToken,
        email_or_phone
      }
    ));
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

/* Reset Password */
const resetPassword = async (req, res) => {
  try {
    const { token, email_or_phone, reset_password } = req.body;

    if (!token || !reset_password) {
      return res.status(400).json(errorResponse(
        req.trans.auth.tokenMissingAndPassword,
        { error_type: 'MISSING_TOKEN_OR_PASSWORD' }
      ));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, auth.AUTH.JWT_SECRET);
    } catch {
      return res.status(400).json(errorResponse(
        req.trans.auth.token.invalid,
        { error_type: 'INVALID_OR_EXPIRED_TOKEN' }
      ));
    }

    const userId = decoded.userId;

    let user;
    if (email_or_phone) {
      user = await User.findByEmailOrPhone(email_or_phone);
      if (!user || user._id.toString() !== userId) {
        return res.status(400).json(errorResponse(
          req.trans.auth.messages.forgot_password.validation.invalid_token_email,
          { error_type: 'INVALID_TOKEN_EMAIL_COMBINATION' }
        ));
      }
    } else {
      user = await User.findById(userId);
    }

    if (!user || user.isDeleted) {
      return res.status(404).json(errorResponse(
        req.trans.auth.userNotFound,
        { error_type: 'USER_NOT_FOUND' }
      ));
    }

    user.password = reset_password;
    await user.save();
    return res.json(successResponse(
      req.trans.auth.messages.reset_password.success,
      {
        success_type: 'PASSWORD_RESET_SUCCESS',
      }
    ));
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

/* Refresh Token */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(errorResponse(
        req.trans.auth.token.refresh.required,
        { error_type: 'REFRESH_TOKEN_MISSING' }
      ));
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, auth.AUTH.JWT_REFRESH_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json(errorResponse(
          req.trans.auth.token.refresh.expired,
          { error_type: 'REFRESH_TOKEN_EXPIRED' }
        ));
      }
      return res.status(403).json(errorResponse(
        req.trans.auth.token.refresh.invalid,
        { error_type: 'INVALID_REFRESH_TOKEN' }
      ));
    }

    const user = await User.findOne({
      _id: decoded.userId,
      isDeleted: false,
      'tokens.refreshToken': refreshToken,
      'tokens.refreshTokenExpiresAt': { $gt: new Date() }
    });

    if (!user) {
      return res.status(403).json(errorResponse(
        req.trans.auth.token.refresh.invalid_or_expire,
        { error_type: 'REFRESH_TOKEN_NOT_FOUND_OR_EXPIRED' }
      ));
    }

    if (user.jti !== decoded.jti) {
      return res.status(403).json(errorResponse(
        req.trans.auth.token.refresh.replay_detect,
        { error_type: 'REPLAY_ATTACK_DETECTED' }
      ));
    }

    const newJti = crypto.randomBytes(32).toString('hex');

    const newToken = jwt.sign({ userId: user._id, jti: newJti }, auth.AUTH.JWT_SECRET, {
      expiresIn: auth.AUTH.JWT_EXPIRATION
    });

    const newRefreshToken = jwt.sign({ userId: user._id, jti: newJti }, auth.AUTH.JWT_REFRESH_SECRET, {
      expiresIn: auth.AUTH.JWT_REFRESH_EXPIRATION
    });

    user.tokens = {
      refreshToken: newRefreshToken,
      refreshTokenIssuedAt: new Date(),
      refreshTokenExpiresAt: new Date(Date.now() + auth.AUTH.REFRESH_TOKEN_MAX_AGE)
    };
    user.jti = newJti;
    await user.save();

    return res.json(successResponse(
      req.trans.auth.token.refresh.success,
      {
        success_type: 'REFRESH_SUCCESS',
        token: newToken,
        refreshToken: newRefreshToken,
      }
    ));
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      }),
      { error_type: 'INTERNAL_SERVER_ERROR' }
    ));
  }
};

module.exports = {
  login,
  logout,
  register,
  verifyEmail,
  resendVerificationOtp,
  forgotPassword,
  resetPassword,
  refreshToken,
};