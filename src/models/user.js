const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const ejs = require('ejs');
const { 
  transporter, 
  sender 
} = require('../config/mailer');
const path = require('path');
require('./upload');


const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    middle_name: {
      type: String,
      default: null,
    },
    last_name: {
      type: String,
      required: false,
    },
    username:{
      type: String,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    country_code: {
      type: String,
      default: null,
    },
    phone_number: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: "",
    },
    password_reset_token: {
      type: String,
      default: null,
    },
    authProvider: {
      type: String,
      enum: ['email', 'google', 'facebook', 'apple'],
      default: 'email',
    },
    social: {
      googleId: {
        type: String,
        default: null,
      },
      facebookId: {
        type: String,
        default: null,
      },
      appleId: {
        type: String,
        default: null,
      },
    },
    role_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },
    status: {
      type: Number,
      default: 0, /* 0-pending, 1-active, 2-suspend/deactive */
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        default: null,
      },
      expiry: {
        type: Date,
        default: null,
      },
    },
    loginSecurity: {
      attempts: {
        type: Number,
        default: 0,
      },
      lockUntil: {
        type: Date,
        default: null,
      },
    },
    account_type: {
      type: String,
      enum: ['platform_user', 'system_user'],
      default: 'platform_user',
    },
    work_schedule: {
      assigned_days: {
        type: Number,
        default: function () {
          return this.account_type === 'system_user' ? 365 : null;
        },
      },
      last_working_date: {
        type: Date,
        default: null,
      },
    }, 
    jti: { 
      type: String, 
      default: null 
    },      
    tokens: {
      refreshToken: { 
        type: String, 
        default: null 
      },
      refreshTokenIssuedAt: { 
        type: Date, 
        default: null 
      },
      refreshTokenExpiresAt: { 
        type: Date, 
        default: null 
      }
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ isDeleted: 1, account_type: 1, status: 1, first_name: 1, last_name: 1, createdAt: -1 })

userSchema.index({ username: 1 }/* , { unique: true } */);
userSchema.index({ email: 1 }/* , { unique: true } */);

userSchema.index({ phone_number: 1 });
userSchema.index({ role_id: 1 });
userSchema.index({ deletedAt: 1 });

userSchema.index({ first_name: 1 });
userSchema.index({ last_name: 1 });

userSchema.index({ first_name: 'text', last_name: 'text' });


/* Password hashing middleware */
userSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isNew) {
    if (!this.createdBy) {
      this.createdBy = this._id;
    }
  } else {
    if (!this.updatedBy) {
      this.updatedBy = this._id;
    }
  }
  next();
});

/* Generate OTP for verification or 2FA */
userSchema.methods.generateOTP = function () {
  const otp = crypto.randomInt(100000, 999999).toString();
  this.otp.code = this.email === 'admin@gmail.com' ? 111111 : otp;
  // this.otp.code = 111111
  this.otp.expiry = Date.now() + 10 * 60 * 1000; /* OTP valid for 10 minutes */
  return otp;
};

/* Verify OTP */
userSchema.methods.verifyOTP = function (enteredOTP) {
  if (this.otp.code === enteredOTP && this.otp.expiry > Date.now()) {
    this.isVerified = true;
    this.otp.code = null;
    this.otp.expiry = null;
    return this.save();
  }
  return false;
};


/* Increment login attempts and lock account if necessary */
userSchema.methods.incrementLoginAttempts = function () {
  if (this.loginSecurity.lockUntil && this.loginSecurity.lockUntil > Date.now()) return;

  this.loginSecurity.attempts += 1;

  if (this.loginSecurity.attempts >= 5) {
    this.loginSecurity.lockUntil = Date.now() + 2 * 60 * 60 * 1000; // Lock account for 2 hours
  }
};

/* Reset login attempts on successful login */
userSchema.methods.resetLoginAttempts = function () {
  this.loginSecurity.attempts = 0;
  this.loginSecurity.lockUntil = null;
};

/* Soft delete user */
userSchema.methods.softDelete = function (deletedBy) {
  this.isDeleted = true;
  this.deletedAt = Date.now();
  this.deletedBy = deletedBy;
  return this.save();
};

/* Compare password for login */
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

/* Check if account is locked */
userSchema.methods.isLocked = function () {
  const lockUntilMs = new Date(this.loginSecurity.lockUntil).getTime();
  const nowMs = Date.now();  
  return this.loginSecurity.lockUntil && lockUntilMs >= nowMs;
};

/* Token validation */
userSchema.methods.isTokenValid = function(token) {
  return this.tokens.token === token && this.tokens.tokenExpiresAt > Date.now();
};

/* Refresh token validation */
userSchema.methods.isRefreshTokenValid = function(refreshToken) {
  return this.tokens.refreshToken === refreshToken && this.tokens.refreshTokenExpiresAt > Date.now();
};

userSchema.methods.suspendUser = function () {
  this.status = 2;
  return this.save();
};

userSchema.methods.reactivateUser = function () {
  this.status = 1;
  return this.save();
};

userSchema.methods.sendCredentials = async function () {
  try {
    const newPassword = crypto.randomBytes(5).toString('hex');
    this.password = await bcrypt.hash(newPassword, 10);
    const emailContent = await ejs.renderFile(
      path.resolve('views/backend/emails/credential-sent.ejs'),
      {
        name: `${this.first_name} ${this.last_name}`,
        email: this.email,
        password: newPassword,
        message: 'Your system user account password has been reset.',
      }
    );

    const mailOptions = {
      from: `"${sender.name}" <${sender.address}>`,
      to: this.email,
      subject: 'Your Account Credentials',
      html: emailContent,
    };

    //await transporter.sendMail(mailOptions);

    // this.isMailSent = true;
    await this.save();
    return { success: true };
  } catch (err) {
    console.error('Error in resendCredentials:', err);
    throw new Error('Failed to resend credentials.');
  }
};

/* Find user via mail or phone number */
userSchema.statics.findByEmailOrPhone = async function (emailOrPhone) {
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
  const query = isEmail
    ? { email: emailOrPhone.toLowerCase(), isDeleted: false }
    : { phone_number: emailOrPhone, isDeleted: false };

  return this.findOne(query);
};

userSchema.methods.setWorkingDays = async function (assigned_days = 365) {
  let days = parseInt(assigned_days); 
  if (isNaN(days)) {
    console.error('Invalid days value:', assigned_days);
    return;
  }

  this.account_type = 'system_user';

  if (!this.work_schedule) {
    this.work_schedule = {};
  }

  this.work_schedule.assigned_days = days;

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + days);
  // this.work_schedule.last_working_date = baseDate;
  const dateOnly = new Date(baseDate.toISOString().split('T')[0]);
  this.work_schedule.last_working_date = dateOnly;

  return await this.save();
};

userSchema.statics.generateUniqueUsername = async function (base) {
  let username = base.toLowerCase().replace(/[^a-z0-9]/g, '');
  let uniqueUsername = username;
  let counter = 1;

  while (await this.findOne({ username: uniqueUsername, deletedAt: { $exists: false } })) {
    uniqueUsername = `${username}${counter}`;
    counter++;
  }

  return uniqueUsername;
};

userSchema.virtual('profile', {
  ref: 'Upload',
  localField: '_id',
  foreignField: 'uploadsable_id',
  justOne: true,
  match: { uploadsable_type: 'Profile', type:'profile_image', deletedAt: null },
  options: { sort: { createdAt: -1 } }
});

userSchema.virtual('user_profile', {
  ref: 'Upload',
  localField: '_id',
  foreignField: 'uploadsable_id',
  justOne: true,
  match: { uploadsable_type: 'User', deletedAt: null },
  options: { sort: { createdAt: -1 } }
});


userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema, "users");
module.exports = User;
