const Role = require("../../models/role");
const Permission = require("../../models/permission");
const RolePermission = require("../../models/rolePermission");
const { prepareMongooseDataTablesParams } = require("../../utils/helper");
const roleTransformer = require('../../transformers/backend/roleTransformer');
const { addRoleRequest, editRoleRequest } = require('../../requests/backend/roleRequest');

const {
  successResponse,
  errorResponse,
  internalServerErrorResponse,
} = require('../../utils/apiResponses');

/**
 * Show a list of all roles with pagination, sorting, and search
 */
async function index(req, res) {
  try {
    if (!req.xhr && !req.headers.accept.includes('json')) {
      return res.render('backend/roles/index');
    }

    const { pageSize, pageStart, searchFilter, sortColumn, sortOrder } = prepareMongooseDataTablesParams(req, ['name', 'createdAt'], Role.schema);

    const finalSortColumn = sortColumn || 'createdAt';
    const finalSortOrder = sortOrder === 'ASC' ? 1 : -1;

    const excludedNames = ['admin', 'user'];
    const baseFilter = {
      isDeleted: false,
      name: { $nin: excludedNames }
    };


    const totalCount = await Role.countDocuments(baseFilter);
    const filteredCount = await Role.countDocuments({ ...baseFilter, ...searchFilter });

    const roles = await Role.find({ ...baseFilter, ...searchFilter })
        .skip(pageStart)
        .limit(pageSize)
        .sort({ [finalSortColumn]: finalSortOrder })
        .lean();

    const transformedRoles = roleTransformer.transformCollection(roles);

    return res.json({
      draw: parseInt(req.query.draw) || 1,
      recordsTotal: totalCount,
      recordsFiltered: filteredCount,
      data: transformedRoles,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ROLE
      })
    ));
  }
}


/**
 * Create a role
 */
async function create(req, res) {
  try {
    const groupedPermissions = await fetchGroupedPermissions(req);
    return res.render("backend/roles/create", {
      groupedPermissions,
      role: {},
      assignedPermissions: [],
    });
  } catch (error) {
    console.error('Error preparing role creation:', error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.ROLE,
      })
    );
    return res.redirect('/admin/roles/');
  }
}

/**
 * Store a new role
 */
async function store(req, res) {
  try {
    const validationErrors = await addRoleRequest(req);
    if (validationErrors) {
      return res.status(400).json(errorResponse(req.trans.auth.validation_error, validationErrors));
    }

    const permissions = req.body.permissions;

    const totalPermissionsCount = await Permission.countDocuments();
    if (permissions.length === totalPermissionsCount) {
      return res.status(400).json(
        errorResponse(
          req.t('You cannot assign all permissions to a role. This would give full access, which is not allowed.')
        )
      );
    }

    const role = {
      name: req.body.name,
    };

    const saveData = await Role.create(role);

    for (const permissionId of permissions) {
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        console.error(`Permission with ID ${permissionId} not found`);
        continue;
      }

      const rolePermission = new RolePermission({
        permission_id: permission._id,
        role_id: saveData._id
      });

      await rolePermission.save();
    }

    const url = req.body.save_continue == 1 ? '/admin/role/create' : '/admin/roles';
    return res.status(201).json(successResponse(
        req.t(req.trans.messages.add_success_message, {
          attribute: req.trans.cruds.ROLE.title_singular
        }), { saveData 
    }, null, null, url));
  } catch (error) {
    console.error('Error creating role:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ROLE
      })
    ));
  }
}

/**
 * Show a specific role
 */
async function show(req, res) {
  try {
    
  } catch (error) {
    console.error('Error fetching role:', error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.ROLE,
      })
    );
    return res.redirect('/admin/roles');
  }
}

/**
 * Display form data for editing a role (not typically needed for API, but included)
 */
async function edit(req, res) {
  try {
    const { id } = req.params;
    const filter = { 
      _id: id, 
      isDeleted: false,
    };

    const role = await Role.findOne(filter);

    if (!role) {
      req.flash("error_with_popup", 
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.ROLE,
        })
      );
      return res.redirect('/admin/roles');
    }

    const groupedPermissions = await fetchGroupedPermissions(req);

    const rolePermissions = await RolePermission.find({
      role_id: role._id,
      isDeleted: false,
    }).select('permission_id');

    const assignedPermissions = rolePermissions.map(rolePermission => rolePermission.permission_id.toString());

    return res.render("backend/roles/edit", {
      groupedPermissions: groupedPermissions,
      role: role,
      assignedPermissions: assignedPermissions,
    });
  } catch (error) {
    console.error('Error preparing role edit:', error);
    req.flash("error_with_popup", req.t(
      req.trans.messages.oops_something_went_wrong, {
        attribute: req.trans.cruds.MODULE.ROLE,
      })
    );
    return res.redirect('/admin/roles');
  }
}

/**
 * Update a role
 */
async function update(req, res) {
  try {
    const validationErrors = await editRoleRequest(req);
    if (validationErrors) {
      return res.status(400).json(errorResponse(req.trans.auth.validation_error, validationErrors));
    }

    const role = {
      name: req.body.name,
    };

    const roleUpdate = await Role.findByIdAndUpdate(req.params.id, role, { new: true });
    if (!roleUpdate) {
      return res.status(404).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.ROLE,
        })
      ));
    }

    const permissions = req.body.permissions || [];

    await RolePermission.deleteMany({ role_id: roleUpdate._id });

    for (const permissionId of permissions) {
      const permission = await Permission.findById(permissionId);
      if (!permission) {
        console.error(`Permission with ID ${permissionId} not found`);
        continue;
      }

      const rolePermission = new RolePermission({
        permission_id: permission._id,
        role_id: roleUpdate._id
      });

      await rolePermission.save();
      // console.log(`RolePermission saved for Role: ${roleUpdate.name} and Permission: ${permissionId}`);
    }

    const url = req.body.update_continue == 1 ? `/admin/role/${req.params.id}/edit` : '/admin/roles';
    return res.status(200).json(successResponse(
        req.t(req.trans.messages.update_success_message, {
          attribute: req.trans.cruds.ROLE.title_singular
        }), { roleUpdate
    }, null, null, url));
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ROLE
      })
    ));
  }
}


/**
 * Soft delete a role
 */
async function destroy(req, res) {
  try {
    const { id } = req.params;

    const role = await Role.findOne({
        _id: id, 
        isDeleted: false 
    });
    if (!role) {
      return res.status(404).json(errorResponse(
        req.t(req.trans.messages.not_found, {
          attribute: req.trans.cruds.MODULE.ROLE,
        })
      ));
    }

    await role.softDelete();
    return res.json(successResponse(
        req.t(req.trans.messages.delete_success_message, {
        attribute : req.trans.cruds.ROLE.title_singular
    }), { id }));
  } catch (error) {
    console.error('Error deleting role:', error);
    return res.status(500).json(internalServerErrorResponse(
      req.t(req.trans.messages.oops_something_went_wrong, {
        attribute : req.trans.cruds.MODULE.ROLE
      })
    ));
  }
}

/* 
** common function for fetch permissions
*/
async function fetchGroupedPermissions(req) {
  const filter = {
    isDeleted: false,
    deletedAt: null,
  };

  const permissionRows = await Permission.find(filter).lean();
  const lang = req.session?.lang || 'en';

  const permissions = permissionRows.map(per => ({
    ...per,
    title: per.title[lang] || per.title['en'] || '',
    module: per.module[lang] || per.module['en'] || ''
  }));

  const groupedPermissions = {};
  for (const perm of permissions) {
    const mod = perm.module || 'Other';
    if (!groupedPermissions[mod]) {
      groupedPermissions[mod] = [];
    }
    groupedPermissions[mod].push(perm);
  }

  return groupedPermissions;
}


module.exports = {
    index,
    create,
    store,
    show,
    edit,
    update,
    destroy,
};