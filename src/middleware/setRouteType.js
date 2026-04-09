// ===========================
// Route Config Definitions
// ===========================

const modules = [
    // 1. Authentication
    { base: 'login',            type: 'login',         label: 'Login' },
    { base: 'logout',           type: 'logout',        label: 'Logout' },

    // 2. Dashboard & Profile
    { base: 'dashboard',        type: 'dashboard',     label: 'Dashboard' },
    { base: 'profile',          type: 'profile',       label: 'Profile' },

    // 3. Users & Roles
    { base: 'platform-user',    type: 'platformUser',  label: 'Platform User' },
    { base: 'user',             type: 'user',          label: 'System User' },
    { base: 'role',             type: 'role',          label: 'Role' },

    // 4. Categories & Types
    // { base: 'category-type',    type: 'categoryType',  label: 'Category Type' },
    { base: 'category',         type: 'category',      label: 'Category' },

    // 5. Brands & Tags
    { base: 'brand',            type: 'brand',         label: 'Brand' },
    { base: 'tag',              type: 'tag',           label: 'Tag' },

    // 6. Attributes
    { base: 'attribute',        type: 'attribute',     label: 'Attribute' },

    // 7. Announcements & Notifications
    { base: 'announcement',     type: 'announcement',  label: 'Announcement' },
    { base: 'notification',     type: 'notification',  label: 'Notification' },

    // 8. Tiers
    { base: 'tier',             type: 'tier',          label: 'Tier' },     

    // 8. Settings & Logs
    { base: 'setting',          type: 'setting',       label: 'Setting' },
    { base: 'log',              type: 'log',           label: 'Log' },
];

// ===========================
// Route Pattern Map Generator
// ===========================

const routeTypeMap = modules.map(m => ({
    pattern: new RegExp(`^/admin/${m.base}s?(\\/|\\?|$)`),
    type: m.type,
    label: m.label,
}));

// ===========================
// Middleware Function
// ===========================

function setRouteType(req, res, next) {

    const found = routeTypeMap.find(r => r.pattern.test(req.path));
    if (found) {
        req.routeType = found.type;
        req.routeLabel = found.label;
        res.locals.routeType = found.type;
        res.locals.routeLabel = found.label;
        console.log(`Matched route: ${found.type}`);
    } else {
        req.routeType = null;
        req.routeLabel = null;
        res.locals.routeType = null;
        res.locals.routeLabel = null;
        // console.log('No matching route found');
    }

    next();
}

// ===========================
// Export Middleware
// ===========================

module.exports = setRouteType;
