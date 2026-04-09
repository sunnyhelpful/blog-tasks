module.exports = {
    string_base: "The :attribute must be a text string.",
    string_empty: "The :attribute field cannot be empty.",
    string_min: "The :attribute must be at least :min characters.",
    string_max: "The :attribute must be no more than :max characters.",
    string_regex: "The :attribute format is invalid.",
    string_length: "The :attribute must be exactly :length characters.",
    string_alpha_only: "The :attribute must only contain letters.",
    string_pattern_base: "The :attribute must match the required pattern.",


    // Number validation
    number_base: "The :attribute must be a number.",
    number_min: "The :attribute must be at least :min.",
    number_max: "The :attribute must be no more than :max.",
    number_integer: "The :attribute must be an integer.",
    number_positive: "The :attribute must be a positive number.",
    number_negative: "The :attribute must be a negative number.",

    // Email validation
    email: "The :attribute must be a valid email address.",
    email_invalid: "The :attribute email format is invalid.",

    // Date validation
    date_base: "The :attribute must be a valid date.",
    date_min: "The :attribute must be later than :min.",
    date_max: "The :attribute must be earlier than :max.",
    date_format: "The :attribute must follow the format :format.",

    // Boolean validation
    boolean_base: "The :attribute must be true or false.",
    boolean_invalid: "The :attribute must be a boolean value (true/false).",

    // Array validation
    array_base: "The :attribute must be an at least one.",
    array_min: "The :attribute must have at least :min items.",
    array_max: "The :attribute must not have more than :max items.",
    array_unique: "The :attribute must contain unique items.",

    // Required fields
    any_required: "The :attribute field is required.",
    string_required: "The :attribute field cannot be empty.",
    number_required: "The :attribute field is required and must be a number.",
    array_required: "The :attribute field is required and must have at least one item.",

    // Invalid formats
    invalid_format: "The :attribute format is invalid.",
    regex: "The :attribute format is invalid.",
    invalid_phone_number: "The phone number is invalid. Please provide a valid phone number.",

    // Custom validation messages
    custom_validation: "The :attribute failed custom validation.",
    duplicate_entry: "The :attribute already exists.",
    unauthorized_action: "You are not authorized to perform this action on :attribute.",
    password_strength: "The :attribute must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    password_mismatch: "The confirmation password does not match the :attribute.",
    password_incorrect: "Current password is incorrect",

    password_same_as_old: "The new password must be different from the current password.",
    invalid_value: "The selected :attribute is invalid.",
    invalid_last_working_date: "The selected last working date is invalid. Please select today or a future date.",


    client_side_validate: {
        required_message: 'Please enter your :attribute.',
        min_length: "The :attribute must be at least :min characters long.",
        max_length: 'The :attribute cannot exceed :max characters.',
        valid_message: "Please enter a valid :attribute.",
        select_required_message: "Please select a :attribute.",
        equal_to_message: "Password and confirm password do not match.",
        upload_file: "Please upload a file",
        invalid_image_type: "Invalid image type. Only JPEG, PNG, and GIF are allowed.",
        failed_to_update: "Failed to update :attribute status.",
        invalid_file_selected: "Please select a valid file. Accepted formats: ",
        file_extension_required: "Please upload a file with one of the following extensions: ",
        min_value: "The :attribute must be at least :min.",
        max_value: "The :attribute must be no more than :max.",
    },

    custom_message: {
        already_exists: ':attribute already exists',
        does_not_exists: ':attribute does not exist',
        multiple_space_not_allow: 'Multiple spaces between words are not allowed.',
        alphanum_only: ':attribute must only contain alphanumeric characters (letters and numbers).',
        strong_password: ":attribute must start with a capital letter, include lowercase letters, numbers, and a special character, and be at least 8 characters long."
    },
    
    custom: {
        'attribute-name': {
            'rule-name': 'custom-message',
        },
    },
    
    /*
    |---------------------------------------------------------------------------
    | Custom Validation Attributes
    |---------------------------------------------------------------------------
    |
    | The following language lines are used to swap our attribute placeholder
    | with something more reader-friendly such as "E-Mail Address" instead
    | of "email". This simply helps us make our message more expressive.
    |
    */
    
    attributes: {},
};
