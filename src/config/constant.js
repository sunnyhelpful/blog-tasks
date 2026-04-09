

module.exports = {
    APP_MODE: [
        'development',
        'production',
        'staging',
        'testing',
        'local',
    ],

    USER_STATUS: {
        ACTIVE: 1,
        INACTIVE: 0,
    },

    DATE_FORMAT: [
        // Date Only Formats
        'YYYY-MM-DD',             // 0 - ISO format (technical/universal)
        'MM/DD/YYYY',             // 1 - US format
        'DD-MM-YYYY',             // 2 - UK/European format
        'MMMM Do, YYYY',          // 3 - "April 25th, 2025"
        'dddd, MMMM Do YYYY',     // 4 - "Friday, April 25th 2025"
        
        // 24-hour Time Formats
        'YYYY-MM-DD HH:mm',       // 5 - "2025-04-25 14:30"
        'YYYY-MM-DD HH:mm:ss',    // 6 - "2025-04-25 14:30:45"
        'DD-MM-YYYY HH:mm',       // 7 - "25-04-2025 14:30"
        'DD-MM-YYYY HH:mm:ss',    // 8 - "25-04-2025 14:30:45"
        'MMMM Do, YYYY HH:mm',    // 9 - "April 25th, 2025 14:30"
        
        // 12-hour Time Formats with AM/PM
        'YYYY-MM-DD hh:mm A',     // 10 - "2025-04-25 02:30 PM"
        'YYYY-MM-DD hh:mm:ss A',  // 11 - "2025-04-25 02:30:45 PM"
        'MM/DD/YYYY hh:mm A',     // 12 - "04/25/2025 02:30 PM"
        'DD-MM-YYYY hh:mm A',     // 13 - "25-04-2025 02:30 PM"
        'MMMM Do, YYYY hh:mm A',  // 14 - "April 25th, 2025 02:30 PM"
        'dddd, MMMM Do YYYY hh:mm A', // 15 - "Friday, April 25th 2025 02:30 PM"
        
        // Time Only Formats
        'HH:mm',                  // 16 - "14:30" (24-hour)
        'HH:mm:ss',               // 17 - "14:30:45" (24-hour)
        'hh:mm A',                // 18 - "02:30 PM" (12-hour)
        'hh:mm:ss A',             // 19 - "02:30:45 PM" (12-hour)
        
        // Compact Formats
        'MMM D, YYYY',            // 20 - "Apr 25, 2025"
        'MMM D, YYYY hh:mm A',    // 21 - "Apr 25, 2025 02:30 PM"
        'MM/DD/YY',               // 22 - "04/25/25"
        'DD-MM-YY',               // 23 - "25-04-25"
        
        // Special Formats
        'YYYY-MM-DD[T]HH:mm:ss',  // 24 - ISO 8601 format "2025-04-25T14:30:45"
        'ddd, MMM D, YYYY hh:mm A', // 25 - "Fri, Apr 25, 2025 02:30 PM"
        'YYYY [Week] W',          // 26 - "2025 Week 17" (week number)
        'Qo [Quarter] YYYY'       // 27 - "2nd Quarter 2025"
    ],
    
  
    FLAGS: {
        TRUE: true,
        FALSE: false
    },

    PAGINATION_DEFAULTS: {
        PAGE: 1,
        LIMIT: 10,
        SORT_FIELD: 'createdAt',
        SORT_ORDER: 'desc'
    },

    COMPANY_DETAILS: {
        NAME: 'Example',
        SLOGAN: 'Innovate. Create. Inspire.',
        COPYRIGHTS: '© 2025 Example',
        FOUNDED: '2021',
        HEADQUARTERS: 'San Francisco, CA, USA',
        WEBSITE: 'https://www.example.com',
        CONTACT_EMAIL: 'contact@example.com',
        PHONE: '+1 (555) 123-4567',
        SOCIAL_MEDIA: {
            TWITTER: 'https://twitter.com/example',
            LINKEDIN: 'https://www.linkedin.com/company/example',
            INSTAGRAM: 'https://instagram.com/example'
        },
        LOGO_URL: 'https://www.example.com/assets/logo.png'
    },

    ATTRIBUTES: {
        TYPES: {
            TEXT: 'text',
            NUMBER: 'number',
            BOOLEAN: 'boolean',
            RADIO: 'radio',
            RADIOIMAGE: 'radioimage',
            RADIOIMAGETITLE: 'radioimagetitle',
            CHECKBOX: 'checkbox',
            CHECKBOXIMAGE: 'checkboximage',
            CHECKBOXIMAGETITLE: 'checkboximagetitle',
            DATE: 'date',
            SINGLEIMAGEUPLOADER: 'singleimageuploader',
            MULTIPLEIMAGEUPLOADER: 'multipleimageuploader',
            SINGLESELECTDROPDOWN: 'singleselectdropdown',
            SINGLESELECTDROPDOWNWITHSEARCH: 'singleselectdropdownwithsearch',
            MULTIPLESELECTDROPDOWN: 'multipleselectdropdown',
            MULTIPLESELECTDROPDOWNWITHSEARCH: 'multipleselectdropdownwithsearch',
            TOGGLESWITCHTITLE: 'toggleswitchtitle',
            TOGGLESWITCHTITLEINPUT: 'toggleswitchtitleinput',
            GOOGLEMAP: 'googlemap',
            TEXTAREA: 'textarea',
            TEXTEDITOR: 'texteditor'
        },
        
        TYPE_CONFIGS: {
            text: { inputType: 'text', component: 'TextInput' },
            number: { inputType: 'number', component: 'NumberInput' },
            boolean: { inputType: 'checkbox', component: 'ToggleSwitch' },
            select: { inputType: 'select', component: 'DropdownSelect' },
            multiselect: { inputType: 'multiselect', component: 'MultiSelect' },
            color: { inputType: 'color', component: 'ColorPicker' },
            date: { inputType: 'date', component: 'DatePicker' }
        },
    },   
    
    TAGS: {
        TYPE: {
            PRODUCT: 'product',
            CATEGORY: 'category',
            BRAND: 'brand',
            PROMOTIONAL: 'promotional',
            FEATURE: 'feature',
            OCCASION: 'occasion',
            SEASONAL: 'seasonal',
            OTHER: 'other',
        },

        VISIBILITY: {
            PUBLIC: 'public',
            PRIVATE: 'private',
            RESTRICTED: 'restricted',
        }
    }, 

    MONTHS: {
        en: [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ],
        ar: [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ]
    },


    SHORT_MONTHS: {
        en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        ar: ['ينا', 'فبر', 'مار', 'أبر', 'ماي', 'يون', 'يول', 'أغس', 'سبت', 'أكت', 'نوف', 'ديس']
    },

    WEEKDAYS: {
        en: [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ],
        ar: [
            'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'
        ]
    },

    SHORT_WEEKDAYS: {
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        ar: ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت']
    },

    /* ...Tier... */
    TIER :{
        TIER_NUMBERS: {
            0: 'suspended',
            1: 'standard',
            2: 'gold',
            3: 'diamond',
        },
    }


};
