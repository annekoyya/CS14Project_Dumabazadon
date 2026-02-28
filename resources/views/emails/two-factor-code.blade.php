<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1d4ed8; text-align: center; margin: 24px 0; }
        .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; }
    </style>
</head>
<body>
    <div class="container">
        <h2 style="text-align:center; color:#111827;">Barangay Profiling System</h2>
        <p>Hello, <strong>{{ $user->name }}</strong>.</p>
        <p>Your one-time verification code is:</p>
        <div class="code">{{ $code }}</div>
        <p style="text-align:center; color:#6b7280;">This code expires in <strong>10 minutes</strong>.</p>
        <p>If you did not attempt to log in, please contact your administrator immediately.</p>
        <div class="footer">Barangay Profiling System &mdash; Do not reply to this email.</div>
    </div>
</body>
</html>