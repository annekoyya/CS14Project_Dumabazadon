<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; }
        .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; }
        .otp { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8; text-align: center; padding: 20px; background: #eff6ff; border-radius: 8px; margin: 20px 0; }
        .warning { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Password Reset Request</h2>
        <p>Hi {{ $name }}, use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div class="otp">{{ $otp }}</div>
        <p class="warning">If you didn't request this, ignore this email. Your password won't change.</p>
    </div>
</body>
</html>