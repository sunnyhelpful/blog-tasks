// const Permission = require('../../models/permission');

// const seedPermissions = async () => {
//   try {
//     const permissionData = [
//       /* Dashboard */
//       { title: 'Access Dashboard', name: 'access_dashboard', module: 'Dashboard' },

//       /* Profile */
//       { title: 'Access Profile', name: 'access_profile', module: 'Profile' },
//       { title: 'Edit Profile', name: 'edit_profile', module: 'Profile' },
//       { title: 'Delete Profile', name: 'delete_profile', module: 'Profile' },

//       /* Notification */
//       { title: 'Access Notification', name: 'access_notification', module: 'Notification' },
//       { title: 'View Notification', name: 'view_notification', module: 'Notification' },
//       { title: 'Delete Notification', name: 'delete_notification', module: 'Notification' },
//       { title: 'Mark Notification as Read', name: 'mark_notification_read', module: 'Notification' },

//       /* System User Module */
//       { title: 'Access System User', name: 'access_system_user', module: 'System User' },
//       { title: 'Create System User', name: 'create_system_user', module: 'System User' },
//       { title: 'Edit System User', name: 'edit_system_user', module: 'System User' },
//       { title: 'View System User', name: 'view_system_user', module: 'System User' },
//       { title: 'Delete System User', name: 'delete_system_user', module: 'System User' },
//       { title: 'Edit System User Status', name: 'system_user_status', module: 'System User' },
//       { title: 'Resend System User Credential', name: 'resend_system_user_credential', module: 'System User' },
//       { title: 'Assign Last Working Days', name: 'assign_system_user_last_working_days', module: 'System User' },

//       /* Platform User Module */
//       { title: 'Access Platform User', name: 'access_platform_user', module: 'Platform User' },
//       { title: 'Create Platform User', name: 'create_platform_user', module: 'Platform User' },
//       { title: 'Edit Platform User', name: 'edit_platform_user', module: 'Platform User' },
//       { title: 'View Platform User', name: 'view_platform_user', module: 'Platform User' },
//       { title: 'Delete Platform User', name: 'delete_platform_user', module: 'Platform User' },
//       { title: 'Edit Platform User Status', name: 'platform_user_status', module: 'Platform User' },

//       /* Role Module */
//       { title: 'Access Role', name: 'access_role', module: 'Role' },
//       { title: 'Create Role', name: 'create_role', module: 'Role' },
//       { title: 'Edit Role', name: 'edit_role', module: 'Role' },
//       { title: 'View Role', name: 'view_role', module: 'Role' },
//       { title: 'Delete Role', name: 'delete_role', module: 'Role' },

//       /* Attribute */
//       { title: 'Access Attribute', name: 'access_attribute', module: 'Attribute' },
//       { title: 'Create Attribute', name: 'create_attribute', module: 'Attribute' },
//       { title: 'Edit Attribute', name: 'edit_attribute', module: 'Attribute' },
//       { title: 'View Attribute', name: 'view_attribute', module: 'Attribute' },
//       { title: 'Delete Attribute', name: 'delete_attribute', module: 'Attribute' },
//       { title: 'Attribute Status', name: 'attribute_status', module: 'Attribute' },
//       { title: 'Attribute Verification', name: 'attribute_verification', module: 'Attribute' },

//       /* Category Type */
//       /* { title: 'Access Category Type', name: 'access_category_type', module: 'Category Type' },
//       { title: 'Create Category Type', name: 'create_category_type', module: 'Category Type' },
//       { title: 'Edit Category Type', name: 'edit_category_type', module: 'Category Type' },
//       { title: 'View Category Type', name: 'view_category_type', module: 'Category Type' },
//       { title: 'Delete Category Type', name: 'delete_category_type', module: 'Category Type' },
//       { title: 'Category Type Status', name: 'category_type_status', module: 'Category Type' }, */

//       /* Category */
//       { title: 'Access Category', name: 'access_category', module: 'Category' },
//       { title: 'Create Category', name: 'create_category', module: 'Category' },
//       { title: 'Edit Category', name: 'edit_category', module: 'Category' },
//       { title: 'View Category', name: 'view_category', module: 'Category' },
//       { title: 'Delete Category', name: 'delete_category', module: 'Category' },
//       { title: 'Category Status', name: 'category_status', module: 'Category' },
//       { title: 'Category Verification', name: 'category_verification', module: 'Category' },
//       { title: 'Category Import', name: 'category_import', module: 'Category' },

//       /* Brand */
//       { title: 'Access Brand', name: 'access_brand', module: 'Brand' },
//       { title: 'Create Brand', name: 'create_brand', module: 'Brand' },
//       { title: 'Edit Brand', name: 'edit_brand', module: 'Brand' },
//       { title: 'View Brand', name: 'view_brand', module: 'Brand' },
//       { title: 'Delete Brand', name: 'delete_brand', module: 'Brand' },
//       { title: 'Brand Status', name: 'brand_status', module: 'Brand' },
//       { title: 'Brand Verification', name: 'brand_verification', module: 'Brand' },

//       /* Tag */
//       { title: 'Access Tag', name: 'access_tag', module: 'Tag' },
//       { title: 'Create Tag', name: 'create_tag', module: 'Tag' },
//       { title: 'Edit Tag', name: 'edit_tag', module: 'Tag' },
//       { title: 'View Tag', name: 'view_tag', module: 'Tag' },
//       { title: 'Delete Tag', name: 'delete_tag', module: 'Tag' },
//       { title: 'Tag Status', name: 'tag_status', module: 'Tag' },

//       /* Product */
//       { title: 'Access Product', name: 'access_product', module: 'Product' },
//       { title: 'Create Product', name: 'create_product', module: 'Product' },
//       { title: 'Edit Product', name: 'edit_product', module: 'Product' },
//       { title: 'View Product', name: 'view_product', module: 'Product' },
//       { title: 'Delete Product', name: 'delete_product', module: 'Product' },
//       { title: 'Product Status', name: 'product_status', module: 'Product' },

//       /* Order */
//       { title: 'Access Order', name: 'access_order', module: 'Order' },
//       { title: 'View Order', name: 'view_order', module: 'Order' },
//       { title: 'Delete Order', name: 'delete_order', module: 'Order' },
//       { title: 'Order Status', name: 'order_status', module: 'Order' },

//       /* Reports and Analytics */
//       { title: 'Access Reports and Analytics', name: 'access_report_analytics', module: 'Reports and Analytics' },
//       { title: 'View Reports and Analytics', name: 'view_reports_analytics', module: 'Reports and Analytics' },
//       { title: 'Export Reports Data', name: 'export_reports_data', module: 'Reports and Analytics' },

//       /* Return & Refund */
//       { title: 'Access Return & Refund', name: 'access_return_refund', module: 'Return & Refund' },
//       { title: 'Create Return Request', name: 'create_return_request', module: 'Return & Refund' },
//       { title: 'Edit Return Request', name: 'edit_return_request', module: 'Return & Refund' },
//       { title: 'View Return Request', name: 'view_return_request', module: 'Return & Refund' },
//       { title: 'Delete Return Request', name: 'delete_return_request', module: 'Return & Refund' },
//       { title: 'Refund Status', name: 'refund_status', module: 'Return & Refund' },

//       /* Ticket Support */
//       { title: 'Access Support Tickets', name: 'access_support_ticket', module: 'Support Ticket' },
//       { title: 'Create Support Ticket', name: 'create_support_ticket', module: 'Support Ticket' },
//       { title: 'Edit Support Ticket', name: 'edit_support_ticket', module: 'Support Ticket' },
//       { title: 'View Support Ticket', name: 'view_support_ticket', module: 'Support Ticket' },
//       { title: 'Close Support Ticket', name: 'close_support_ticket', module: 'Support Ticket' },
//       { title: 'Reply to Support Ticket', name: 'reply_support_ticket', module: 'Support Ticket' },

//       /* Reviews */
//       { title: 'Access Reviews', name: 'access_reviews', module: 'Reviews' },
//       { title: 'View Review', name: 'view_review', module: 'Reviews' },
//       { title: 'Edit Review', name: 'edit_review', module: 'Reviews' },
//       { title: 'Delete Review', name: 'delete_review', module: 'Reviews' },
//       { title: 'Approve Review', name: 'approve_review', module: 'Reviews' },
//       { title: 'Reject Review', name: 'reject_review', module: 'Reviews' },

//       /* Announcement */
//       { title: 'Access Announcement', name: 'access_announcement', module: 'Announcement' },
//       { title: 'Create Announcement', name: 'create_announcement', module: 'Announcement' },
//       { title: 'Edit Announcement', name: 'edit_announcement', module: 'Announcement' },
//       { title: 'View Announcement', name: 'view_announcement', module: 'Announcement' },
//       { title: 'Delete Announcement', name: 'delete_announcement', module: 'Announcement' },
//       { title: 'Announcement Status', name: 'announcement_status', module: 'Announcement' },
      
//       /* Tier */
//       { title: 'Access Tier', name: 'access_tier', module: 'Tier' },
//       { title: 'Create Tier', name: 'create_tier', module: 'Tier' },
//       { title: 'Edit Tier', name: 'edit_tier', module: 'Tier' },
//       { title: 'View Tier', name: 'view_tier', module: 'Tier' },
//       { title: 'Delete Tier', name: 'delete_tier', module: 'Tier' },
//       { title: 'Tier Status', name: 'tier_status', module: 'Tier' },

//       /* Advertisement */
//       { title: 'Access Advertisement', name: 'access_advertisement', module: 'Advertisement' },
//       { title: 'Create Advertisement', name: 'create_advertisement', module: 'Advertisement' },
//       { title: 'Edit Advertisement', name: 'edit_advertisement', module: 'Advertisement' },
//       { title: 'View Advertisement', name: 'view_advertisement', module: 'Advertisement' },
//       { title: 'Delete Advertisement', name: 'delete_advertisement', module: 'Advertisement' },
//       { title: 'Advertisement Status', name: 'advertisement_status', module: 'Advertisement' },

//       /* Setting */
//       { title: 'Access Setting', name: 'access_setting', module: 'Setting' },
//       { title: 'Create Setting', name: 'create_setting', module: 'Setting' },
//       { title: 'Edit Setting', name: 'edit_setting', module: 'Setting' },
//       { title: 'View Setting', name: 'view_setting', module: 'Setting' },
//       { title: 'Delete Setting', name: 'delete_setting', module: 'Setting' },
//       { title: 'Setting Status', name: 'setting_status', module: 'Setting' },

//       /* Contact Request */
//       { title: 'Access Contact Request', name: 'access_contact_request', module: 'Contact Request' },
//       { title: 'Create Contact Request', name: 'create_contact_request', module: 'Contact Request' },
//       { title: 'Edit Contact Request', name: 'edit_contact_request', module: 'Contact Request' },
//       { title: 'View Contact Request', name: 'view_contact_request', module: 'Contact Request' },
//       { title: 'Delete Contact Request', name: 'delete_contact_request', module: 'Contact Request' },
//       { title: 'Read Contact Request', name: 'read_contact_request', module: 'Contact Request' },
//     ];

//     const createdPermissions = [];
//     let createdCount = 0;

//     for (const perm of permissionData) {
//       const exists = await Permission.findOne({ name: perm.name, isDeleted: false });

//       if (!exists) {
//         const createdPermission = await Permission.create({
//           ...perm,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         });
//         createdPermissions.push(createdPermission);
//         console.log(`Created permission: ${perm.name}`);
//         createdCount++;
//       } else {
//         console.log(`Permission already exists: ${perm.name}`);
//       }
//     }

//     console.log(`Permissions seeding completed! ${createdCount} new permission(s) created.`);
//     return createdPermissions;
//   } catch (error) {
//     console.error('Error seeding permissions:', error);
//     throw error;
//   }
// };

// module.exports = seedPermissions;

const Permission = require('../../models/permission');

const seedPermissions = async () => {
  try {
    const permissionData = [
      /* Dashboard */
      { title: { en: 'Access Dashboard', ar: 'الوصول إلى لوحة التحكم' }, name: 'access_dashboard', module: { en: 'Dashboard', ar: 'لوحة التحكم' } },

      /* Profile */
      { title: { en: 'Access Profile', ar: 'الوصول إلى الملف الشخصي' }, name: 'access_profile', module: { en: 'Profile', ar: 'الملف الشخصي' } },
      { title: { en: 'Edit Profile', ar: 'تعديل الملف الشخصي' }, name: 'edit_profile', module: { en: 'Profile', ar: 'الملف الشخصي' } },
      { title: { en: 'Delete Profile', ar: 'حذف الملف الشخصي' }, name: 'delete_profile', module: { en: 'Profile', ar: 'الملف الشخصي' } },

      /* Notification */
      { title: { en: 'Access Notification', ar: 'الوصول إلى الإشعارات' }, name: 'access_notification', module: { en: 'Notification', ar: 'الإشعارات' } },
      { title: { en: 'View Notification', ar: 'عرض الإشعارات' }, name: 'view_notification', module: { en: 'Notification', ar: 'الإشعارات' } },
      { title: { en: 'Delete Notification', ar: 'حذف الإشعارات' }, name: 'delete_notification', module: { en: 'Notification', ar: 'الإشعارات' } },
      { title: { en: 'Mark Notification as Read', ar: 'تمييز الإشعارات كمقروءة' }, name: 'mark_notification_read', module: { en: 'Notification', ar: 'الإشعارات' } },

      /* System User Module */
      { title: { en: 'Access System User', ar: 'الوصول إلى مستخدم النظام' }, name: 'access_system_user', module: { en: 'System User', ar: 'مستخدم النظام' } },
      { title: { en: 'Create System User', ar: 'إنشاء مستخدم نظام' }, name: 'create_system_user', module: { en: 'System User', ar: 'مستخدم النظام' } },
      { title: { en: 'Edit System User', ar: 'تعديل مستخدم النظام' }, name: 'edit_system_user', module: { en: 'System User', ar: 'مستخدم النظام' } },
      { title: { en: 'View System User', ar: 'عرض مستخدم النظام' }, name: 'view_system_user', module: { en: 'System User', ar: 'مستخدم النظام' } },
      { title: { en: 'Delete System User', ar: 'حذف مستخدم النظام' }, name: 'delete_system_user', module: { en: 'System User', ar: 'مستخدم النظام' } },
      { title: { en: 'Edit System User Status', ar: 'تعديل حالة مستخدم النظام' }, name: 'system_user_status', module: { en: 'System User', ar: 'مستخدم النظام' } },
      { title: { en: 'Resend System User Credential', ar: 'إعادة إرسال بيانات اعتماد مستخدم النظام' }, name: 'resend_system_user_credential', module: { en: 'System User', ar: 'مستخدم النظام' } },
      { title: { en: 'Assign Last Working Days', ar: 'تعيين آخر أيام العمل' }, name: 'assign_system_user_last_working_days', module: { en: 'System User', ar: 'مستخدم النظام' } },

      /* Platform User Module */
      { title: { en: 'Access Platform User', ar: 'الوصول إلى مستخدم المنصة' }, name: 'access_platform_user', module: { en: 'Platform User', ar: 'مستخدم المنصة' } },
      // { title: { en: 'Create Platform User', ar: 'إنشاء مستخدم منصة' }, name: 'create_platform_user', module: { en: 'Platform User', ar: 'مستخدم المنصة' } },
      // { title: { en: 'Edit Platform User', ar: 'تعديل مستخدم المنصة' }, name: 'edit_platform_user', module: { en: 'Platform User', ar: 'مستخدم المنصة' } },
      { title: { en: 'View Platform User', ar: 'عرض مستخدم المنصة' }, name: 'view_platform_user', module: { en: 'Platform User', ar: 'مستخدم المنصة' } },
      { title: { en: 'Delete Platform User', ar: 'حذف مستخدم المنصة' }, name: 'delete_platform_user', module: { en: 'Platform User', ar: 'مستخدم المنصة' } },
      { title: { en: 'Edit Platform User Status', ar: 'تعديل حالة مستخدم المنصة' }, name: 'platform_user_status', module: { en: 'Platform User', ar: 'مستخدم المنصة' } },

      /* Role Module */
      { title: { en: 'Access Role', ar: 'الوصول إلى الدور' }, name: 'access_role', module: { en: 'Role', ar: 'الدور' } },
      { title: { en: 'Create Role', ar: 'إنشاء دور' }, name: 'create_role', module: { en: 'Role', ar: 'الدور' } },
      { title: { en: 'Edit Role', ar: 'تعديل الدور' }, name: 'edit_role', module: { en: 'Role', ar: 'الدور' } },
      { title: { en: 'View Role', ar: 'عرض الدور' }, name: 'view_role', module: { en: 'Role', ar: 'الدور' } },
      { title: { en: 'Delete Role', ar: 'حذف الدور' }, name: 'delete_role', module: { en: 'Role', ar: 'الدور' } },

      /* Attribute */
      { title: { en: 'Access Attribute', ar: 'الوصول إلى السمة' }, name: 'access_attribute', module: { en: 'Attribute', ar: 'السمة' } },
      { title: { en: 'Create Attribute', ar: 'إنشاء سمة' }, name: 'create_attribute', module: { en: 'Attribute', ar: 'السمة' } },
      { title: { en: 'Edit Attribute', ar: 'تعديل السمة' }, name: 'edit_attribute', module: { en: 'Attribute', ar: 'السمة' } },
      { title: { en: 'View Attribute', ar: 'عرض السمة' }, name: 'view_attribute', module: { en: 'Attribute', ar: 'السمة' } },
      { title: { en: 'Delete Attribute', ar: 'حذف السمة' }, name: 'delete_attribute', module: { en: 'Attribute', ar: 'السمة' } },
      { title: { en: 'Attribute Status', ar: 'حالة السمة' }, name: 'attribute_status', module: { en: 'Attribute', ar: 'السمة' } },
      { title: { en: 'Attribute Verification', ar: 'التحقق من السمة' }, name: 'attribute_verification', module: { en: 'Attribute', ar: 'السمة' } },

      /* Category Type - commented out as in your original */
      /*
      { title: { en: 'Access Category Type', ar: 'الوصول إلى نوع الفئة' }, name: 'access_category_type', module: { en: 'Category Type', ar: 'نوع الفئة' } },
      { title: { en: 'Create Category Type', ar: 'إنشاء نوع الفئة' }, name: 'create_category_type', module: { en: 'Category Type', ar: 'نوع الفئة' } },
      { title: { en: 'Edit Category Type', ar: 'تعديل نوع الفئة' }, name: 'edit_category_type', module: { en: 'Category Type', ar: 'نوع الفئة' } },
      { title: { en: 'View Category Type', ar: 'عرض نوع الفئة' }, name: 'view_category_type', module: { en: 'Category Type', ar: 'نوع الفئة' } },
      { title: { en: 'Delete Category Type', ar: 'حذف نوع الفئة' }, name: 'delete_category_type', module: { en: 'Category Type', ar: 'نوع الفئة' } },
      { title: { en: 'Category Type Status', ar: 'حالة نوع الفئة' }, name: 'category_type_status', module: { en: 'Category Type', ar: 'نوع الفئة' } },
      */

      /* Category */
      { title: { en: 'Access Category', ar: 'الوصول إلى الفئة' }, name: 'access_category', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Create Category', ar: 'إنشاء فئة' }, name: 'create_category', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Edit Category', ar: 'تعديل الفئة' }, name: 'edit_category', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'View Category', ar: 'عرض الفئة' }, name: 'view_category', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Delete Category', ar: 'حذف الفئة' }, name: 'delete_category', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Category Status', ar: 'حالة الفئة' }, name: 'category_status', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Category Verification', ar: 'التحقق من الفئة' }, name: 'category_verification', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Category Import', ar: 'استيراد الفئة' }, name: 'category_import', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Create Postform', ar: 'إنشاء نموذج منشور' }, name: 'create_postform', module: { en: 'Category', ar: 'الفئة' } },
      { title: { en: 'Edit Postform', ar: 'تعديل نموذج منشور' }, name: 'edit_postform', module: { en: 'Category', ar: 'الفئة' } },


      /* Brand */
      { title: { en: 'Access Brand', ar: 'الوصول إلى العلامة التجارية' }, name: 'access_brand', module: { en: 'Brand', ar: 'العلامة التجارية' } },
      { title: { en: 'Create Brand', ar: 'إنشاء علامة تجارية' }, name: 'create_brand', module: { en: 'Brand', ar: 'العلامة التجارية' } },
      { title: { en: 'Edit Brand', ar: 'تعديل العلامة التجارية' }, name: 'edit_brand', module: { en: 'Brand', ar: 'العلامة التجارية' } },
      { title: { en: 'View Brand', ar: 'عرض العلامة التجارية' }, name: 'view_brand', module: { en: 'Brand', ar: 'العلامة التجارية' } },
      { title: { en: 'Delete Brand', ar: 'حذف العلامة التجارية' }, name: 'delete_brand', module: { en: 'Brand', ar: 'العلامة التجارية' } },
      { title: { en: 'Brand Status', ar: 'حالة العلامة التجارية' }, name: 'brand_status', module: { en: 'Brand', ar: 'العلامة التجارية' } },
      { title: { en: 'Brand Verification', ar: 'التحقق من العلامة التجارية' }, name: 'brand_verification', module: { en: 'Brand', ar: 'العلامة التجارية' } },

      /* Tag */
      { title: { en: 'Access Tag', ar: 'الوصول إلى الوسم' }, name: 'access_tag', module: { en: 'Tag', ar: 'الوسم' } },
      { title: { en: 'Create Tag', ar: 'إنشاء وسم' }, name: 'create_tag', module: { en: 'Tag', ar: 'الوسم' } },
      { title: { en: 'Edit Tag', ar: 'تعديل الوسم' }, name: 'edit_tag', module: { en: 'Tag', ar: 'الوسم' } },
      { title: { en: 'View Tag', ar: 'عرض الوسم' }, name: 'view_tag', module: { en: 'Tag', ar: 'الوسم' } },
      { title: { en: 'Delete Tag', ar: 'حذف الوسم' }, name: 'delete_tag', module: { en: 'Tag', ar: 'الوسم' } },
      { title: { en: 'Tag Status', ar: 'حالة الوسم' }, name: 'tag_status', module: { en: 'Tag', ar: 'الوسم' } },

      /* Product */
      { title: { en: 'Access Product', ar: 'الوصول إلى المنتج' }, name: 'access_product', module: { en: 'Product', ar: 'المنتج' } },
      { title: { en: 'Create Product', ar: 'إنشاء منتج' }, name: 'create_product', module: { en: 'Product', ar: 'المنتج' } },
      { title: { en: 'Edit Product', ar: 'تعديل المنتج' }, name: 'edit_product', module: { en: 'Product', ar: 'المنتج' } },
      { title: { en: 'View Product', ar: 'عرض المنتج' }, name: 'view_product', module: { en: 'Product', ar: 'المنتج' } },
      { title: { en: 'Delete Product', ar: 'حذف المنتج' }, name: 'delete_product', module: { en: 'Product', ar: 'المنتج' } },
      { title: { en: 'Product Status', ar: 'حالة المنتج' }, name: 'product_status', module: { en: 'Product', ar: 'المنتج' } },
      { title: { en: 'Product Verification', ar: 'التحقق من المنتج' }, name: 'product_verification', module: { en: 'Product', ar: 'المنتج' } },

      /* Order */
      { title: { en: 'Access Order', ar: 'الوصول إلى الطلب' }, name: 'access_order', module: { en: 'Order', ar: 'الطلب' } },
      { title: { en: 'View Order', ar: 'عرض الطلب' }, name: 'view_order', module: { en: 'Order', ar: 'الطلب' } },
      { title: { en: 'Delete Order', ar: 'حذف الطلب' }, name: 'delete_order', module: { en: 'Order', ar: 'الطلب' } },
      { title: { en: 'Order Status', ar: 'حالة الطلب' }, name: 'order_status', module: { en: 'Order', ar: 'الطلب' } },

      /* Reports and Analytics */
      { title: { en: 'Access Reports and Analytics', ar: 'الوصول إلى التقارير والتحليلات' }, name: 'access_report_analytics', module: { en: 'Reports and Analytics', ar: 'التقارير والتحليلات' } },
      { title: { en: 'View Reports and Analytics', ar: 'عرض التقارير والتحليلات' }, name: 'view_reports_analytics', module: { en: 'Reports and Analytics', ar: 'التقارير والتحليلات' } },
      { title: { en: 'Export Reports Data', ar: 'تصدير بيانات التقارير' }, name: 'export_reports_data', module: { en: 'Reports and Analytics', ar: 'التقارير والتحليلات' } },

      /* Return & Refund */
      { title: { en: 'Access Return & Refund', ar: 'الوصول إلى المرتجعات والاسترداد' }, name: 'access_return_refund', module: { en: 'Return & Refund', ar: 'المرتجعات والاسترداد' } },
      { title: { en: 'Create Return Request', ar: 'إنشاء طلب إرجاع' }, name: 'create_return_request', module: { en: 'Return & Refund', ar: 'المرتجعات والاسترداد' } },
      { title: { en: 'Edit Return Request', ar: 'تعديل طلب الإرجاع' }, name: 'edit_return_request', module: { en: 'Return & Refund', ar: 'المرتجعات والاسترداد' } },
      { title: { en: 'View Return Request', ar: 'عرض طلب الإرجاع' }, name: 'view_return_request', module: { en: 'Return & Refund', ar: 'المرتجعات والاسترداد' } },
      { title: { en: 'Delete Return Request', ar: 'حذف طلب الإرجاع' }, name: 'delete_return_request', module: { en: 'Return & Refund', ar: 'المرتجعات والاسترداد' } },
      { title: { en: 'Refund Status', ar: 'حالة الاسترداد' }, name: 'refund_status', module: { en: 'Return & Refund', ar: 'المرتجعات والاسترداد' } },

      /* Ticket Support */
      { title: { en: 'Access Support Tickets', ar: 'الوصول إلى تذاكر الدعم' }, name: 'access_support_ticket', module: { en: 'Support Ticket', ar: 'تذاكر الدعم' } },
      { title: { en: 'Create Support Ticket', ar: 'إنشاء تذكرة دعم' }, name: 'create_support_ticket', module: { en: 'Support Ticket', ar: 'تذاكر الدعم' } },
      { title: { en: 'Edit Support Ticket', ar: 'تعديل تذكرة الدعم' }, name: 'edit_support_ticket', module: { en: 'Support Ticket', ar: 'تذاكر الدعم' } },
      { title: { en: 'View Support Ticket', ar: 'عرض تذكرة الدعم' }, name: 'view_support_ticket', module: { en: 'Support Ticket', ar: 'تذاكر الدعم' } },
      { title: { en: 'Close Support Ticket', ar: 'إغلاق تذكرة الدعم' }, name: 'close_support_ticket', module: { en: 'Support Ticket', ar: 'تذاكر الدعم' } },
      { title: { en: 'Reply to Support Ticket', ar: 'الرد على تذكرة الدعم' }, name: 'reply_support_ticket', module: { en: 'Support Ticket', ar: 'تذاكر الدعم' } },

      /* Reviews */
      { title: { en: 'Access Reviews', ar: 'الوصول إلى التقييمات' }, name: 'access_reviews', module: { en: 'Reviews', ar: 'التقييمات' } },
      { title: { en: 'View Review', ar: 'عرض التقييم' }, name: 'view_review', module: { en: 'Reviews', ar: 'التقييمات' } },
      { title: { en: 'Edit Review', ar: 'تعديل التقييم' }, name: 'edit_review', module: { en: 'Reviews', ar: 'التقييمات' } },
      { title: { en: 'Delete Review', ar: 'حذف التقييم' }, name: 'delete_review', module: { en: 'Reviews', ar: 'التقييمات' } },
      { title: { en: 'Approve Review', ar: 'الموافقة على التقييم' }, name: 'approve_review', module: { en: 'Reviews', ar: 'التقييمات' } },
      { title: { en: 'Reject Review', ar: 'رفض التقييم' }, name: 'reject_review', module: { en: 'Reviews', ar: 'التقييمات' } },

      /* Announcement */
      { title: { en: 'Access Announcement', ar: 'الوصول إلى الإعلانات' }, name: 'access_announcement', module: { en: 'Announcement', ar: 'الإعلانات' } },
      { title: { en: 'Create Announcement', ar: 'إنشاء إعلان' }, name: 'create_announcement', module: { en: 'Announcement', ar: 'الإعلانات' } },
      { title: { en: 'Edit Announcement', ar: 'تعديل الإعلان' }, name: 'edit_announcement', module: { en: 'Announcement', ar: 'الإعلانات' } },
      { title: { en: 'View Announcement', ar: 'عرض الإعلان' }, name: 'view_announcement', module: { en: 'Announcement', ar: 'الإعلانات' } },
      { title: { en: 'Delete Announcement', ar: 'حذف الإعلان' }, name: 'delete_announcement', module: { en: 'Announcement', ar: 'الإعلانات' } },
      { title: { en: 'Announcement Status', ar: 'حالة الإعلان' }, name: 'announcement_status', module: { en: 'Announcement', ar: 'الإعلانات' } },

      /* Tier */
      { title: { en: 'Access Tier', ar: 'الوصول إلى المستوى' }, name: 'access_tier', module: { en: 'Tier', ar: 'المستوى' } },
      { title: { en: 'Create Tier', ar: 'إنشاء مستوى' }, name: 'create_tier', module: { en: 'Tier', ar: 'المستوى' } },
      { title: { en: 'Edit Tier', ar: 'تعديل المستوى' }, name: 'edit_tier', module: { en: 'Tier', ar: 'المستوى' } },
      { title: { en: 'View Tier', ar: 'عرض المستوى' }, name: 'view_tier', module: { en: 'Tier', ar: 'المستوى' } },
      { title: { en: 'Delete Tier', ar: 'حذف المستوى' }, name: 'delete_tier', module: { en: 'Tier', ar: 'المستوى' } },
      { title: { en: 'Tier Status', ar: 'حالة المستوى' }, name: 'tier_status', module: { en: 'Tier', ar: 'المستوى' } },

      /* Advertisement */
      { title: { en: 'Access Advertisement', ar: 'الوصول إلى الإعلان' }, name: 'access_advertisement', module: { en: 'Advertisement', ar: 'الإعلانات' } },
      { title: { en: 'Create Advertisement', ar: 'إنشاء إعلان' }, name: 'create_advertisement', module: { en: 'Advertisement', ar: 'الإعلانات' } },
      { title: { en: 'Edit Advertisement', ar: 'تعديل الإعلان' }, name: 'edit_advertisement', module: { en: 'Advertisement', ar: 'الإعلانات' } },
      { title: { en: 'View Advertisement', ar: 'عرض الإعلان' }, name: 'view_advertisement', module: { en: 'Advertisement', ar: 'الإعلانات' } },
      { title: { en: 'Delete Advertisement', ar: 'حذف الإعلان' }, name: 'delete_advertisement', module: { en: 'Advertisement', ar: 'الإعلانات' } },
      { title: { en: 'Advertisement Status', ar: 'حالة الإعلان' }, name: 'advertisement_status', module: { en: 'Advertisement', ar: 'الإعلانات' } },

      /* Setting */
      { title: { en: 'Access Setting', ar: 'الوصول إلى الإعدادات' }, name: 'access_setting', module: { en: 'Setting', ar: 'الإعدادات' } },
      { title: { en: 'Create Setting', ar: 'إنشاء إعداد' }, name: 'create_setting', module: { en: 'Setting', ar: 'الإعدادات' } },
      { title: { en: 'Edit Setting', ar: 'تعديل الإعداد' }, name: 'edit_setting', module: { en: 'Setting', ar: 'الإعدادات' } },
      { title: { en: 'View Setting', ar: 'عرض الإعداد' }, name: 'view_setting', module: { en: 'Setting', ar: 'الإعدادات' } },
      { title: { en: 'Delete Setting', ar: 'حذف الإعداد' }, name: 'delete_setting', module: { en: 'Setting', ar: 'الإعدادات' } },
      { title: { en: 'Setting Status', ar: 'حالة الإعداد' }, name: 'setting_status', module: { en: 'Setting', ar: 'الإعدادات' } },

      /* Contact Request */
      { title: { en: 'Access Contact Request', ar: 'الوصول إلى طلبات الاتصال' }, name: 'access_contact_request', module: { en: 'Contact Request', ar: 'طلبات الاتصال' } },
      { title: { en: 'Create Contact Request', ar: 'إنشاء طلب اتصال' }, name: 'create_contact_request', module: { en: 'Contact Request', ar: 'طلبات الاتصال' } },
      { title: { en: 'Edit Contact Request', ar: 'تعديل طلب الاتصال' }, name: 'edit_contact_request', module: { en: 'Contact Request', ar: 'طلبات الاتصال' } },
      { title: { en: 'View Contact Request', ar: 'عرض طلب الاتصال' }, name: 'view_contact_request', module: { en: 'Contact Request', ar: 'طلبات الاتصال' } },
      { title: { en: 'Delete Contact Request', ar: 'حذف طلب الاتصال' }, name: 'delete_contact_request', module: { en: 'Contact Request', ar: 'طلبات الاتصال' } },
      { title: { en: 'Read Contact Request', ar: 'قراءة طلب الاتصال' }, name: 'read_contact_request', module: { en: 'Contact Request', ar: 'طلبات الاتصال' } },


    ];

    const activePermissionNames = permissionData.map(p => p.name);
    const existingPermissions = await Permission.find({});

    const createdPermissions = [];
    let createdCount = 0, updatedCount = 0, deletedCount = 0;

    // Step 1: Soft-delete permissions not in the list
    for (const perm of existingPermissions) {
      if (!activePermissionNames.includes(perm.name) && !perm.isDeleted) {
        perm.isDeleted = true;
        perm.deletedAt = new Date();
        await perm.save();
        console.log(`Soft-deleted permission: ${perm.name}`);
        deletedCount++;
      }
    }

    // Step 2: Add or update permissions
    for (const perm of permissionData) {
      const existing = await Permission.findOne({ name: perm.name });

      if (!existing) {
        const createdPermission = await Permission.create({
          ...perm,
          isDeleted: false,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        createdPermissions.push(createdPermission);
        console.log(`Created permission: ${perm.name}`);
        createdCount++;
      } else {
        const shouldUpdate =
          existing.isDeleted ||
          JSON.stringify(existing.title) !== JSON.stringify(perm.title) ||
          JSON.stringify(existing.module) !== JSON.stringify(perm.module);

        if (shouldUpdate) {
          existing.title = perm.title;
          existing.module = perm.module;
          existing.isDeleted = false;
          existing.deletedAt = null;
          existing.updatedAt = new Date();
          await existing.save();
          updatedCount++;
          console.log(`Updated permission: ${perm.name}`);
        } else {
          console.log(`Permission already exists and is up-to-date: ${perm.name}`);
        }
      }
    }

    console.log(`Seeding Completed | Created: ${createdCount}, Updated: ${updatedCount}, Soft-deleted: ${deletedCount}`);
    return createdPermissions;
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error;
  }
};

module.exports = seedPermissions;