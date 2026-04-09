module.exports = {
    fetch_success_message: ':attribute Fetch Successfully!',
    add_success_message: ':attribute added successfully!',
    edit_success_message: ':attribute updated successfully!',
    update_success_message: ':attribute updated successfully!',
    delete_success_message: ':attribute deleted successfully!',
    import_success_message: ':count :attribute imported successfully!',
    validation_error : 'Validation Error',
    approve_success_message: 'Request Approved successfully',
    invalid_pagination_parameters: 'Invalid pagination parameters',
    please_enter: 'Please Enter',
    please_select: 'Please Select',
    oops_something_went_wrong: 'Oops! Something went wrong with :attribute, Please try again later.',
    not_found: ':attribute not found!',
    cannot_delete_with_children: ':attribute cannot be deleted because it has child categories.',
    please_enter_some_content: 'Please enter some content!',
    you_are_already: 'You are already :attribute',
    invalid_key: 'Invalid :attribute value',
    invalid_format: 'Invalid :attribute format',
    key_update: ':attribute status updated to :status',
    file_exceed: 'File size should not exceed :num MB.',
    uploaded_file_to_large: 'The uploaded file is too large. Max size is :num MB.',
    access_denied_title: "Access Denied",
    access_denied_message: "You don't have permission to view this dashboard.",
    access_denied_contact: "Please contact your administrator if you believe this is a mistake.",
    credentials_resent_successfully: "Credentials resent successfully.",
    missing_field_requireds: "Missing required fields: ",
    download_sample_file: "Download a sample file to ensure your :attribute data is formatted correctly.",
    add_keywords: "Add keywords",
    all_right_reserved: "All rights reserved.",

    
    notifications: {
        new_message: "You have a new message from :sender.",
        new_order: "A new order has been placed by :customer.",
        system_alert: "System alert: :message",
        account_update: "Your account details have been updated successfully.",
    },

    toastr: {
        success: 'Success',
        info: 'Information',
        warning: 'Warning',
        error: 'Error',

    },

    dashboard_fileration: {
        weekly: 'Weekly',
        monthly: 'Monthly',
        yearly: 'Yearly',
    },

    sweetalert: {
        success: 'Success',
        info: 'Information',
        warning: 'Warning',
        error: 'Error',
        confirm_button_text: "Yes, proceed!",
        cancel_button_text: "Cancel",

        delete: {
            title: 'Delete Record',
            message: 'Are you sure you want to delete this record?',
        },
        logout: {
            title: 'Are you Sure?',
            message: 'Are you sure you want to logout?',
        },
        send_credential: {
            title: 'Are you Sure?',
            message: 'Are you sure you want to send crendential?',
        },
        profile_delete: {
            title: 'Are you sure?',
            message: 'Once deleted, your account can’t be recovered.',
        },        
        default: {
            title: 'Perform Action',
            message: 'Are you sure you want to perform this action?',
        }
    },

    pages: {
        bad_request: {
            title: 'Bad Request',
            heading: 'Bad Request',
            subContent: 'The request could not be understood or was missing required information. Please check your input and try again.',
        },

        not_found: {
            title: 'Page Not Found',
            heading: 'Sorry, Something Goes Wrong',
            subContent: 'The page you are attempting to reach is currently not available. This may be because the page does not exist or has been moved.',
        },

        server_error: {
            title: 'Server Error',
            heading: 'Internal Server Error',
            subContent: 'The page you are attempting to reach is currently not available. This may be because the page does not exist or has been moved.',
        }
    }


};