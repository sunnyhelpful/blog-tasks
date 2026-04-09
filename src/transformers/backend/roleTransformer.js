module.exports = {
    transform(role) {
      return {
        id: role._id,
        name: role.name,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt
      };
    },
  
    transformCollection(roles) {
      return roles.map(role => this.transform(role));
    }
  };
  