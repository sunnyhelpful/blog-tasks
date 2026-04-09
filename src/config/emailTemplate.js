module.exports = {
    login_otp_verification: {
        twoStepVerificationEn: `
            Hi {name},
            Thank you for logging into your account. To complete your login, we need to verify your identity.
            
            Step 1: Please use the One-Time Password (OTP) below on the OTP verification page:
            OTP: {otp}

            Step 2: After entering the OTP, you will be redirected to verify your account.

            Please note: The OTP expires in 10 minutes, so use it promptly. If you did not initiate this request, please disregard this email.

            If you have any issues, feel free to contact our support team.

            Best regards,
            The Team
        `,
        
        twoStepVerificationAr: `
            مرحبًا {name}،

            شكرًا لتسجيل الدخول إلى حسابك. لإكمال عملية تسجيل الدخول، نحتاج إلى التحقق من هويتك.

            الخطوة 1: يرجى استخدام كلمة المرور لمرة واحدة (OTP) التالية في صفحة التحقق:
            رمز التحقق: {otp}

            الخطوة 2: بعد إدخال رمز التحقق، سيتم توجيهك للتحقق من حسابك.

            ملاحظة: ينتهي صلاحية رمز التحقق خلال 10 دقائق، لذا يُرجى استخدامه بسرعة. إذا لم تقم بطلب هذا الرمز، يمكنك تجاهل هذا البريد الإلكتروني.

            إذا واجهت أي مشاكل، لا تتردد في التواصل مع فريق الدعم لدينا.

            مع أطيب التحيات،
            الفريق
        `

    },
};
