const { faker } = require('@faker-js/faker');

const generateUser = (overrides = {}) => {
  return {
    first_name: faker.person.firstName(),
    last_name: faker.person.lastName(),
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password({ length: 10 }),
    account_type: 'platform_user',
    isVerified: faker.datatype.boolean(),
    ...overrides
  };
};

module.exports = {
  generateUser,
};
