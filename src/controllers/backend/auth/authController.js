const jwt = require('jsonwebtoken');
const whatsApp = require('../../../config/whatsappOtp');
const User = require('../../../models/user');
const Role = require('../../../models/role');
const auth = require('../../../config/auth');
const { transporter, sender } = require('../../../config/mailer');
const { loginRequest } = require('../../../requests/backend/authRequest');
const ejs = require('ejs');
const path = require('path');
const emailTemplate = require('../../../config/emailTemplate');


const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../../utils/apiResponses');

/* Login */
const login = async (req, res) => {
  const validationErrors = await loginRequest(req);
  if (validationErrors) {
    return res.status(400).json(errorResponse(req.trans.auth.validation_error, validationErrors));
  }

  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).populate({
      path: 'role_id',
      select: '_id name'
    });

    if (!user) {
      return res.status(404).json(errorResponse(req.trans.auth.invalidCredentials));
    }

    if (!user.isVerified) {
      return res.status(403).json(errorResponse(req.trans.auth.notVerified));
    }

    if (user.isLocked()) {
      return res.status(403).json(errorResponse(req.trans.auth.account.locked));
    }

    /* if (user.loginSecurity.lockUntil && user.loginSecurity.lockUntil < Date.now()) {
      user.resetLoginAttempts();
      await user.save();
    } */

    if (user.status === 2) {
      return res.status(403).json(errorResponse(req.trans.auth.suspendAccount));
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      user.incrementLoginAttempts();
      await user.save();
      return res.status(401).json(errorResponse(req.trans.auth.invalidCredentials));
    }
    
    if(user.account_type === 'platform_user'){
      return res.status(401).json(errorResponse(req.trans.auth.accessDenied));
    }    

    if (user.status === 0) {
      user.status = 1;
    }

    user.resetLoginAttempts();
    const otp = user.generateOTP();
    await user.save();

    const baseUrl = req.protocol + '://' + req.headers.host;
    const verificationLink = `${baseUrl}/verify-email/${user._id}/${otp}`;
    
    let emailBody = null;
    if (req.session.lang === 'ar') {
      emailBody = emailTemplate.login_otp_verification.twoStepVerificationAr
        .replace('{name}', user.first_name)
        .replace('{otp}', otp);
    } else {
      emailBody = emailTemplate.login_otp_verification.twoStepVerificationEn
        .replace('{name}', user.first_name)
        .replace('{otp}', otp);
    }

    const subject = req.session.lang === 'ar'
      ? 'التحقق بخطوتين لحسابك'
      : 'Two-Step Verification for Your Account';

    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to: user.email,
      subject: subject,
      text: emailBody,
    };

    const otpResp = await transporter.sendMail(mailOptions);
    const redirectUrl = `/admin/verify-otp/${user._id}`;
    
    return res.status(200).json(
      successResponse(req.trans.auth.loginSuccess, {
        id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        authProvider: user.authProvider,
        role_id: user.role_id,
        isVerified: user.isVerified
      }, null, null, redirectUrl)
    );
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.AUTH,
      })
    ));
  }
};


/* Verify OTP */
const verifyOtp = async (req, res) => {
  const { userid, otp } = req.body;
  try {
    const user = await User.findOne({
      _id: userid,
      "otp.code": otp,
      "otp.expiry": { $gte: Date.now() },
      isDeleted: false,
    });
    if (!user) {
      return res.status(400).json(errorResponse('Invalid or expired OTP'));
    }
    const isVerified = await user.verifyOTP(otp);
    if (!isVerified) {
      return res.status(400).json(errorResponse('Invalid OTP'));
    }

    const jti = require('crypto').randomBytes(32).toString('hex');
    const token = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_SECRET, {
      expiresIn: auth.AUTH.JWT_EXPIRATION,
    });
    const refreshToken = jwt.sign({ userId: user._id, jti }, auth.AUTH.JWT_REFRESH_SECRET, {
      expiresIn: auth.AUTH.JWT_REFRESH_EXPIRATION,
    });

    res.cookie('token', token, { httpOnly: true, maxAge: auth.AUTH.TOKEN_MAX_AGE });
    res.cookie('refreshToken', refreshToken, { httpOnly: true, maxAge: auth.AUTH.REFRESH_TOKEN_MAX_AGE });

    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    const redirectUrl = `/admin/dashboard`;
    return res.json(
      successResponse(req.trans.auth.loginSuccess, {
        id: user._id,
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        authProvider: user.authProvider,
        role_id: user.role_id,
        isVerified: user.isVerified,
        token,
        refreshToken,
      }, null, null, redirectUrl),
    );
  } catch (error) {
    console.error('OTP Verification error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.AUTH,
      })
    ));
  }
};

/* Resend Verification Email */
const resendVerificationOtp = async (req, res) => {
  try {
    const { userid } = req.params;
    const userId = userid;

    const user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });

    if (!user) {
      req.flash('error', req.trans.auth.userNotFound);
      return res.redirect(`/admin/verify-otp/${user._id}`);
    }

    const otp = user.generateOTP();
    await user.save();

    let emailBody = null;
    const lang = req.session.lang || 'en';

    if (lang === 'ar') {
      emailBody = emailTemplate.login_otp_verification.twoStepVerificationAr
        .replace('{name}', user.first_name)
        .replace('{otp}', otp);
    } else {
      emailBody = emailTemplate.login_otp_verification.twoStepVerificationEn
        .replace('{name}', user.first_name)
        .replace('{otp}', otp);
    }

    const subject = lang === 'ar'
      ? 'التحقق بخطوتين لحسابك'
      : 'Two-Step Verification for Your Account';

    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to: user.email,
      subject: subject,
      text: emailBody,
    };

    await transporter.sendMail(mailOptions);
    const redirectUrl = `/admin/verify-otp/${user._id}`;
    return res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in resendVerificationOtp:', error);
    req.flash('error', req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
    }));
    return res.redirect('/admin/verify-otp');
  }
};


/* Logout */
const logout = async (req, res) => {
  try {
    if (req.user) {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json(internalServerErrorResponse(
            req.t(req.trans.messages.oops_something_went_wrong, {
              attribute: req.trans.cruds.MODULE.AUTH,
            })
          ));
        }
        return res.json(successResponse(req.trans.auth.messages.logout.success));
      });
    } else {
      req.flash('success', req.trans.auth.messages.logout.success);
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
          attribute: req.trans.cruds.MODULE.AUTH,
      })
    ));
  }
};

/* Forgot Password */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    const filter = {
      email: email,
      isDeleted: false,
      account_type: 'system_user',
    };

    const user = await User.findOne(filter);
    if (!user) {
      return res.status(404).json(errorResponse(req.trans.auth.userNotFound));
    }

    const resetToken = jwt.sign({ userId: user._id }, auth.AUTH.JWT_SECRET, { expiresIn: '2h' });

    const baseUrl = req.protocol + '://' + req.headers.host;
    const resetPasswordUrl = `${baseUrl}/admin/reset-password?token=${resetToken}`;

    const lang = req.session.lang || 'en';
    const htmlContent = await ejs.renderFile(path.resolve('views/auth/reset-email.ejs'), {
      name: user.name,
      resetUrl: resetPasswordUrl,
      lang: lang
    });

    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to: user.email,
      subject: lang === 'ar' ? 'تعليمات إعادة تعيين كلمة المرور' : 'Password Reset Instructions',
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    user.password_reset_token = resetToken;
    await user.save();

    return res.status(200).json(
      successResponse(req.trans.auth.messages.forgot_password.validation.password_reset, { user }, null, null, null)
    );
  } catch (error) {
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      })
    ));
  }
}

async function showResetPasswordPage(req, res) {
  try {
    const { token } = req.query;
    return res.render("auth/reset-password", {
      layout:'layouts/authLayout', token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).render('common/pages/page-500', { 
      layout: 'layouts/pageLayout',
      message: 'Something went wrong while fetching data.' 
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    let userId;

    const decoded = jwt.verify(token, auth.AUTH.JWT_SECRET);
    userId = decoded.userId;
    const user = await User.findById(userId);
    if (!user || user.isDeleted) {
      return res.status(404).json(errorResponse(req.trans.auth.userNotFound));
    }

    if (user.password_reset_token !== token) {
      return res.status(404).json(errorResponse(req.trans.auth.otpInvalidOrExpire));
    }

    user.password = password;
    user.password_reset_token = "";
    await user.save();

    return res.status(200).json(
      successResponse(req.trans.auth.messages.reset_password.success, { user }, null, null, null)
    );
  } catch (error) {
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.AUTH,
      })
    ));
  }
}

module.exports = {
  login,
  verifyOtp,
  resendVerificationOtp,
  logout,
  forgotPassword,
  showResetPasswordPage,
  resetPassword,
};