const mongoose = require('mongoose');
const { connect } = require('../../config/database');
const { waitForConnection } = require('../seedDBConnections');

const seedPermissions = require('./permissionSeeder');
const seedRoles = require('./rolesSeeder');
const seedRolePermissions = require('./rolePermissionSeeder');
const seedUsers = require('./userSeeder');


const runSeeders = async () => {
  try {
    console.log('Connecting to database...');
    await connect();
    await waitForConnection();
    console.log('Database connected successfully');

    console.log('Starting permission seeding...');
    const permissions = await seedPermissions();
    
    console.log('Starting role seeding...');
    const roles = await seedRoles();
    
    console.log('Starting role-permission seeding...');
    await seedRolePermissions(roles, permissions);
    
    console.log('Starting user seeding...');
    await seedUsers(roles);

    console.log('All seeders have been executed successfully!');
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    console.log('Closing database connection...');
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit();
  }
};

runSeeders();