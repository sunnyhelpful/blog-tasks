module.exports = {
    string_base: "يجب أن يكون :attribute نصًا.",
    string_empty: "حقل :attribute لا يمكن أن يكون فارغًا.",
    string_min: "يجب أن يكون :attribute على الأقل :min حروف.",
    string_max: "يجب ألا يتجاوز :attribute :max حروف.",
    string_regex: "تنسيق :attribute غير صالح.",
    string_length: "يجب أن يكون :attribute بطول :length حرفًا بالضبط.",
    string_alpha_only: "يجب أن يحتوي :attribute على أحرف فقط.",
    string_pattern_base: "يجب أن يطابق :attribute النمط المطلوب.",


    // Number validation
    number_base: "يجب أن يكون :attribute رقمًا.",
    number_min: "يجب أن يكون :attribute على الأقل :min.",
    number_max: "يجب ألا يتجاوز :attribute :max.",
    number_integer: "يجب أن يكون :attribute عددًا صحيحًا.",
    number_positive: "يجب أن يكون :attribute رقمًا موجبًا.",
    number_negative: "يجب أن يكون :attribute رقمًا سالبًا.",

    // Email validation
    email: "يجب أن يكون :attribute عنوان بريد إلكتروني صالح.",
    email_invalid: "تنسيق البريد الإلكتروني في :attribute غير صالح.",

    // Date validation
    date_base: "يجب أن يكون :attribute تاريخًا صالحًا.",
    date_min: "يجب أن يكون :attribute بعد :min.",
    date_max: "يجب أن يكون :attribute قبل :max.",
    date_format: "يجب أن يتبع :attribute التنسيق :format.",

    // Boolean validation
    boolean_base: "يجب أن يكون :attribute صحيح أو خطأ.",
    boolean_invalid: "يجب أن يكون :attribute قيمة منطقية (صحيح/خطأ).",

    // Array validation
    array_base: "يجب أن يحتوي :attribute على عنصر واحد على الأقل.",
    array_min: "يجب أن يحتوي :attribute على الأقل على :min عناصر.",
    array_max: "يجب ألا يحتوي :attribute على أكثر من :max عناصر.",
    array_unique: "يجب أن يحتوي :attribute على عناصر فريدة.",

    // Required fields
    any_required: "حقل :attribute مطلوب.",
    string_required: "حقل :attribute لا يمكن أن يكون فارغًا.",
    number_required: "حقل :attribute مطلوب ويجب أن يكون رقمًا.",
    array_required: "حقل :attribute مطلوب ويجب أن يحتوي على عنصر واحد على الأقل.",

    // Invalid formats
    invalid_format: "تنسيق :attribute غير صالح.",
    regex: "تنسيق :attribute غير صالح.",
    invalid_phone_number: "رقم الهاتف غير صالح. يرجى إدخال رقم هاتف صالح.",

    // Custom validation messages
    custom_validation: "فشل التحقق المخصص لـ :attribute.",
    duplicate_entry: ":attribute موجود بالفعل.",
    unauthorized_action: "أنت غير مصرح لك بتنفيذ هذا الإجراء على :attribute.",
    password_strength: "يجب أن تحتوي :attribute على حرف كبير واحد على الأقل، حرف صغير، رقم، ورمز خاص.",
    password_mismatch: "تأكيد كلمة المرور لا يطابق :attribute.",
    password_incorrect: "كلمة المرور الحالية غير صحيحة.",

    password_same_as_old: "يجب أن تكون كلمة المرور الجديدة مختلفة عن الحالية.",
    invalid_value: "القيمة المحددة لـ :attribute غير صالحة.",
    invalid_last_working_date: "تاريخ العمل المحدد غير صالح. يُرجى اختيار تاريخ اليوم أو تاريخ مستقبلي.",


    client_side_validate: {
        required_message: 'يرجى إدخال :attribute.',
        min_length: "يجب أن يحتوي :attribute على الأقل :min حروف.",
        max_length: 'لا يمكن أن يتجاوز :attribute :max حروف.',
        valid_message: "يرجى إدخال عنوان :attribute صالح.",
        select_required_message: "يرجى اختيار :attribute.",
        equal_to_message: "كلمة المرور وتأكيد كلمة المرور غير متطابقين.",
        upload_file: "يرجى تحميل ملف.",
        invalid_image_type: "نوع الصورة غير صالح. يُسمح فقط بصيغ JPEG وPNG وGIF.",
        failed_to_update: "فشل في تحديث حالة :attribute.",
        invalid_file_selected: "يرجى اختيار ملف صالح. التنسيقات المقبولة هي: ",
        file_extension_required: "يرجى تحميل ملف بإحدى الامتدادات التالية: ",
        min_value: "يجب أن تكون قيمة :attribute على الأقل :min.",
        max_value: "يجب ألا تزيد قيمة :attribute عن :max.",
    },

    custom_message: {
        already_exists: 'الحقل :attribute موجود بالفعل',
        does_not_exists: 'الحقل :attribute غير موجود',
        multiple_space_not_allow: 'لا يُسمح بوجود مسافات متتالية بين الكلمات.',
        alphanum_only: 'الحقل :attribute يجب أن يحتوي فقط على حروف وأرقام.',
        strong_password: 'يجب أن يبدأ الحقل :attribute بحرف كبير، ويحتوي على حروف صغيرة وأرقام ورمز خاص، وأن يكون طوله 8 أحرف على الأقل.'
    },

    custom: {
        'attribute-name': {
            'rule-name': 'رسالة مخصصة',
        },
    },
    
    /*
    |--------------------------------------------------------------------------- 
    | Custom Validation Attributes
    |--------------------------------------------------------------------------- 
    | 
    | الأسطر التالية تستخدم لاستبدال العنصر القائم بمكانه مع شيء أكثر
    | سهولة في القراءة مثل "عنوان البريد الإلكتروني" بدلاً من "البريد الإلكتروني".
    | هذا يساعدنا فقط في جعل الرسائل أكثر تعبيرًا.
    | 
    */
    
    attributes: {},
};
