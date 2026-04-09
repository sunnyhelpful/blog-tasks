module.exports = {
    transform(user) {
      return {
        id: user._id,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        country_code: user.country_code,
        account_type: user.account_type,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
        status: user.status,
  
        role: {
          id: user.role_id?._id || null,
          name: user.role_id?.name || null,
        },
  
        loginSecurity: {
          attempts: user.loginSecurity?.attempts || 0,
          lockUntil: user.loginSecurity?.lockUntil || null
        },
  
        work_schedule: {
          last_working_date: user.work_schedule?.last_working_date || null,
          assigned_days: user.work_schedule?.assigned_days || null
        },
  
        tokens: {
          tokenIssuedAt: user.tokens?.tokenIssuedAt || null,
          tokenExpiresAt: user.tokens?.tokenExpiresAt || null,
          refreshTokenIssuedAt: user.tokens?.refreshTokenIssuedAt || null,
          refreshTokenExpiresAt: user.tokens?.refreshTokenExpiresAt || null,
        },
  
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    },
  
    transformCollection(users) {
      if (Array.isArray(users)) {
        return users.map(user => this.transform(user));
      }
      return this.transform(users);
    }
  };
  