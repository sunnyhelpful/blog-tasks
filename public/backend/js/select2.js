$(document).ready(function () {
    $(".select2").select2();

    /* For permissions */
    $('.select2#permissions').select2({
        closeOnSelect: false
    });

    $('.select2#permissions').on('select2:unselecting', function(e) {
        $(this).data('unselecting', true);
    }).on('select2:open', function(e) {
        if ($(this).data('unselecting')) {
            $(this).removeData('unselecting');
            $(this).select2('close');
        }
    });

    // $(document).find('.select2#permissions').select2({closeOnSelect: false});
    // $(document).find(".select2").select2();
});