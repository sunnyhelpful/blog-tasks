const Permission = require("../../models/permission");

const seedPermissions = async () => {
  try {
    const permissionData = [
      /* Dashboard */
      {
        title: "Access Dashboard",
        name: "access_dashboard",
        module: "Dashboard",
      },

      /* Profile */
      { title: "Access Profile", name: "access_profile", module: "Profile" },
      { title: "Edit Profile", name: "edit_profile", module: "Profile" },
      { title: "Delete Profile", name: "delete_profile", module: "Profile" },

      /* Role Module */
      { title: "Access Role", name: "access_role", module: "Role" },
      { title: "Create Role", name: "create_role", module: "Role" },
      { title: "Edit Role", name: "edit_role", module: "Role" },
      { title: "View Role", name: "view_role", module: "Role" },
      { title: "Delete Role", name: "delete_role", module: "Role" },

      /* Blog Module */
      { title: "Access Blog", name: "access_blog", module: "Blog" },
      { title: "Create Blog", name: "create_blog", module: "Blog" },
      { title: "Edit Blog", name: "edit_blog", module: "Blog" },
      { title: "View Blog", name: "view_blog", module: "Blog" },
      { title: "Delete Blog", name: "delete_blog", module: "Blog" },

      /* User Module */
      { title: "Access User", name: "access_user", module: "User" },
      { title: "Create User", name: "create_user", module: "User" },
      { title: "Edit User", name: "edit_user", module: "User" },
      { title: "View User", name: "view_user", module: "User" },
      { title: "Delete User", name: "delete_user", module: "User" },
    ];

    const createdPermissions = [];
    let createdCount = 0;

    for (const perm of permissionData) {
      const exists = await Permission.findOne({
        name: perm.name,
        isDeleted: false,
      });

      if (!exists) {
        const createdPermission = await Permission.create({
          ...perm,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        createdPermissions.push(createdPermission);
        console.log(`Created permission: ${perm.name}`);
        createdCount++;
      } else {
        console.log(`Permission already exists: ${perm.name}`);
      }
    }

    console.log(
      `Permissions seeding completed! ${createdCount} new permission(s) created.`,
    );
    return createdPermissions;
  } catch (error) {
    console.error("Error seeding permissions:", error);
    throw error;
  }
};

module.exports = seedPermissions;
