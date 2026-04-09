const User = require('../../models/user');

const seedUsers = async (roles) => {
  try {
    const adminRole = roles.find(role => role.name === 'admin');
    const employeeRole = roles.find(role => role.name === 'employee');
    const sellerRole = roles.find(role => role.name === 'seller');
    const userRole = roles.find(role => role.name === 'user');

    const usersToSeed = [
      {
        email: 'admin@gmail.com',
        first_name: 'Admin',
        last_name: 'User',
        username: 'admin',
        password: 'Admin@123',
        account_type: 'system_user',
        role: adminRole
      },
      {
        email: 'employee@gmail.com',
        first_name: 'Employee',
        last_name: 'User',
        username: 'employee',
        password: 'Employee@123',
        account_type: 'system_user',
        role: employeeRole
      },
      {
        email: 'seller@gmail.com',
        first_name: 'Regular',
        last_name: 'Seller',
        username: 'seller',
        password: 'Seller@123',
        account_type: 'platform_user',
        role: sellerRole
      },
      {
        email: 'user@gmail.com',
        first_name: 'Regular',
        last_name: 'User',
        username: 'user',
        password: 'User@123',
        account_type: 'platform_user',
        role: userRole
      },
      {
        email: 'sunnykumar.hipl@gmail.com',
        first_name: 'Sunny',
        last_name: 'Kumar',
        username: 'sunnyadmin',
        password: 'Admin@123',
        account_type: 'system_user',
        role: adminRole
      },
      {
        email: 'manishnagar.his@gmail.com',
        first_name: 'Manish',
        last_name: 'Nagar',
        username: 'manishadmin',
        password: 'Admin@123',
        account_type: 'system_user',
        role: adminRole
      },
      {
        email: 'mayursharma.his@gmail.com',
        first_name: 'Mayur',
        last_name: 'Sharma',
        username: 'mayuradmin',
        password: 'Admin@123',
        account_type: 'system_user',
        role: adminRole
      }
    ];

    for (const userData of usersToSeed) {
      const existingUser = await User.findOne({ isDeleted: false, email: userData.email });

      if (!existingUser) {
        const newUser = new User({
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          account_type: userData.account_type,
          role_id: userData.role._id,
          isVerified: true
        });

        await newUser.save();
        console.log(`${userData.first_name} ${userData.last_name} seeded successfully!`);
      } else {
        console.log(`${userData.email} already exists.`);
      }
    }
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers;