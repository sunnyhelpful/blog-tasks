const RolePermission = require('../../models/rolePermission');

const seedRolePermissions = async (roles, permissions) => {
  try {
    const createdRolePermissions = [];

    const addPermissionIfNotExists = async (roleName, permissionName) => {
      const role = roles.find(r => r.name === roleName);
      const permission = permissions.find(p => p.name === permissionName);
      if (!role || !permission) return;

      const alreadyAssigned = await RolePermission.findOne({
        role_id: role._id,
        permission_id: permission._id,
        isDeleted: false
      });

      if (!alreadyAssigned) {
        const rolePermission = await RolePermission.create({
          role_id: role._id,
          permission_id: permission._id
        });
        createdRolePermissions.push(rolePermission);
        console.log(`Assigned '${permissionName}' to '${roleName}'`);
      } else {
        console.log(`'${permissionName}' already assigned to '${roleName}'`);
      }
    };

    for (const permission of permissions) {
      if (permission.name !== 'delete_profile') {
        await addPermissionIfNotExists('admin', permission.name);
      } else {
        console.log(`Skipping 'delete_profile' for 'admin' role`);
      }
    }    

    const employeePermissions = [
      'access_dashboard', 'access_profile', 'edit_profile', 'delete_profile',
      'access_system_user', 'create_system_user', 'view_system_user',
      'access_category', 'create_category', 'edit_category', 'view_category'
    ];
    for (const permission of employeePermissions) {
      await addPermissionIfNotExists('employee', permission);
    }

    const sellerPermissions = ['access_dashboard', 'access_profile', 'edit_profile', 'delete_profile'];
    for (const permission of sellerPermissions) {
      await addPermissionIfNotExists('seller', permission);
    }

    const userPermissions = ['access_dashboard', 'access_profile', 'edit_profile', 'delete_profile'];
    for (const permission of userPermissions) {
      await addPermissionIfNotExists('user', permission);
    }

    console.log('Role-permissions seeding complete (non-destructive)');

    return createdRolePermissions;
  } catch (error) {
    console.error('Error seeding role-permissions:', error);
    throw error;
  }
};

module.exports = seedRolePermissions;
