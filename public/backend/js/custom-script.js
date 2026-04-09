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

    /* const observer = new MutationObserver(function (mutationsList, observer) {
        const richTextEditor = document.querySelector('.richtexteditor');
        
        if (richTextEditor) {
            const editorIframe = richTextEditor.querySelector('iframe');
            
            if (editorIframe) {
                observer.disconnect();
                
                var innerDoc = editorIframe.contentDocument;
                const body = document.body;
                if (innerDoc) {
                    const rteToggleBorder = innerDoc.querySelector('.rte-toggleborder');
                    if (rteToggleBorder) {
                        rteToggleBorder.style.color = body.classList.contains('dark-only') ? '#A1A1A1' : 'black';
                    } else {
                        console.log('.rte-toggleborder not found inside iframe.');
                    }
                }

            }
        }
    });
    
    observer.observe(document.body, { childList: true, subtree: true }); */
});
