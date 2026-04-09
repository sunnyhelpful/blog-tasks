module.exports = {
    fetch_success_message: 'تم جلب :attribute بنجاح',
    add_success_message: 'تم إضافة :attribute بنجاح',
    edit_success_message: 'تم تحديث :attribute بنجاح',
    update_success_message: 'تم تحديث :attribute بنجاح',
    delete_success_message: 'تم حذف :attribute بنجاح',
    import_success_message: 'تم استيراد :count :attribute بنجاح',
    validation_error: 'خطأ في التحقق من الصحة',
    approve_success_message: 'تمت الموافقة على الطلب بنجاح',
    please_enter: 'يرجى إدخال',
    please_select: 'يرجى اختيار',
    invalid_pagination_parameters: 'معلمات ترقيم الصفحات غير صالحة',
    oops_something_went_wrong: 'عذراً! حدث خطأ ما في :attribute، يرجى المحاولة لاحقاً.',
    not_found: 'لم يتم العثور على :attribute!',
    cannot_delete_with_children: 'لا يمكن حذف :attribute لأنه يحتوي على فئات فرعية.',
    please_enter_some_content: 'يرجى إدخال بعض المحتوى!',
    you_are_already: 'أنت بالفعل :attribute',
    invalid_key: 'قيمة :attribute غير صالحة',
    invalid_format: 'تنسيق :attribute غير صالح',
    key_update: 'تم تحديث حالة :attribute إلى :status',
    file_exceed: 'حجم الملف يجب ألا يتجاوز :num ميجابايت.',
    uploaded_file_to_large: 'الملف الذي تم رفعه كبير جدًا. الحد الأقصى هو :num ميجابايت.',
    access_denied_title: "تم رفض الوصول",
    access_denied_message: "ليس لديك إذن لعرض هذه اللوحة.",
    access_denied_contact: "يرجى الاتصال بالمسؤول إذا كنت تعتقد أن هذا خطأ.",
    credentials_resent_successfully: "تم إعادة إرسال بيانات الاعتماد بنجاح.",
    missing_field_requireds: "الحقول المطلوبة مفقودة: ",
    download_sample_file: "قم بتحميل ملف عينة لضمان تنسيق بيانات :attribute بشكل صحيح.",
    add_keywords: "أضف كلمات مفتاحية",
    all_right_reserved: "جميع الحقوق محفوظة.",

    notifications: {
        new_message: "لديك رسالة جديدة من :sender.",
        new_order: "تم تقديم طلب جديد من :customer.",
        system_alert: "تنبيه النظام: :message",
        account_update: "تم تحديث تفاصيل حسابك بنجاح.",
    },
    
    toastr: {
        success: 'نجاح',
        info: 'معلومة',
        warning: 'تحذير',
        error: 'خطأ',
    },

    dashboard_fileration: {
        weekly: 'أسبوعي',
        monthly: 'شهري',
        yearly: 'سنوي',
    },

    
    sweetalert: {
        success: 'نجاح',
        info: 'معلومات',
        warning: 'تحذير',
        error: 'خطأ',
        confirm_button_text: "نعم، تابع!",
        cancel_button_text: "إلغاء",
    
        delete: {
            title: 'حذف السجل',
            message: 'هل أنت متأكد أنك تريد حذف هذا السجل؟',
        },
        logout: {
            title: 'هل أنت متأكد؟',
            message: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
        },
        send_credential: {
            title: 'هل أنت متأكد؟',
            message: 'هل أنت متأكد أنك تريد إرسال بيانات الاعتماد؟',
        },
        profile_delete: {
            title: 'هل أنت متأكد؟',
            message: 'بمجرد الحذف، لا يمكن استعادة حسابك.',
        },        
        default: {
            title: 'تنفيذ الإجراء',
            message: 'هل أنت متأكد أنك تريد تنفيذ هذا الإجراء؟',
        }
    },

    pages: {
        bad_request: {
            title: 'طلب غير صالح',
            heading: 'طلب غير صالح',
            subContent: 'تعذر فهم الطلب أو كان يفتقد معلومات ضرورية. يرجى التحقق من مدخلاتك وحاول مرة أخرى.',
        },

        not_found: {
            title: 'الصفحة غير موجودة',
            heading: 'عذرًا، حدث خطأ ما',
            subContent: 'الصفحة التي تحاول الوصول إليها غير متوفرة حاليًا. قد يكون السبب أن الصفحة غير موجودة أو تم نقلها.',
        },

        server_error: {
            title: 'خطأ في الخادم',
            heading: 'خطأ داخلي في الخادم',
            subContent: 'الصفحة التي تحاول الوصول إليها غير متوفرة حاليًا. قد يكون السبب أن الصفحة غير موجودة أو تم نقلها.',
        }
    },

};
