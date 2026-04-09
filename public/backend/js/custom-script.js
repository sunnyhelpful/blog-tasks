document.addEventListener('DOMContentLoaded', function () {
    const phoneInput = document.getElementById('phone_number');
    if(phoneInput){
        phoneInput.addEventListener('input', function (event) {
            let inputValue = event.target.value;
            inputValue = inputValue.replace(/[^0-9+]/g, '');
            if (inputValue.includes('+')) {
                inputValue = '+' + inputValue.replace(/\+/g, '');
            }
    
            event.target.value = inputValue;
        });
    }
});
