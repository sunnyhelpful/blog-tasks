const mongoose = require('mongoose');
const connect = require('../../dbConnect');
const { waitForConnection } = require('../seedDBConnections');

const seedPermissions = require('./permissionSeeder');
const seedRoles = require('./rolesSeeder');
const seedRolePermissions = require('./rolePermissionSeeder');
const seedUsers = require('./userSeeder');
const seedSettings = require('./settingSeeder');
const seedCategoryType = require('./categoriesTypeSeeder');
const seedTier = require('./tierSeeder');

/* World Database */
const {
    seedRegions,
    seedSubRegions,
    seedCountries,
    seedStates,
    seedCities,
} = require('./seedLocations');

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
    await seedSettings();
    
    console.log("Starting categories type seeding...");
    await seedCategoryType();

    console.log("Starting tier seeding...");
    await seedTier();

    /*  */
    console.log("Start world database seeding...")
    // await seedRegions();
    // await seedSubRegions();
    // await seedCountries();
    // await seedStates();
    // await seedCities();

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