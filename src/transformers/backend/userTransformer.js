module.exports = {
    transform(user) {
      return {
        id: user._id,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        full_name: (user.first_name ? user.first_name : '') + ' ' + 
          (user.middle_name ? user.middle_name : '') + ' ' + 
          (user.last_name ? user.last_name : ''),
        username: user.username,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role || 'None',
        status: user.status,
        last_working_date: user.last_working_date || null,
        city: null,
        tier: null,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
    },
  
    transformCollection(users) {
      return users.map(user => this.transform(user));
    }
  };
  