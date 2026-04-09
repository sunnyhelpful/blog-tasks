const Role = require('../../models/role');

const seedRoles = async () => {
  try {
    const roleNames = ['admin', 'employee', 'seller', 'user'];
    const roles = [];

    for (const name of roleNames) {
      let role = await Role.findOne({ name, isDeleted: false });
      if (!role) {
        role = await Role.create({ name });
        console.log(`Created role: ${name}`);
      } else {
        console.log(`Role already exists: ${name} — skipping creation`);
      }
      roles.push(role);
    }

    return roles;
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
};

module.exports = seedRoles;
