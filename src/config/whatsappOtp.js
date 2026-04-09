const axios = require('axios');

const sendOTP = async (recipientNumber, otp) => {
    try {
        const response = await axios.post('https://sandbox-api.sendchamp.com/api/v1/whatsapp/template/send', {
            recipient: recipientNumber,
            type: "template",
            template_code: process.env.WHATSAPP_TEMPLATE_CODE,
            sender: process.env.WHATSAPP_YOUR_WHATSAPP_NUMBER,
            custom_data: {
                body: {
                    "1": `Your OTP is ${otp}`,
                }
            }
        }, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${process.env.WHATSAPP_SECRET_KEY}`
            }
        });
        console.log(response.data);
    } catch (error) {
        console.error('Error sending OTP:', error);
    }
};


module.exports = {
    sendOTP
}