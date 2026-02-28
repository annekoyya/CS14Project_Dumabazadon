<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 480px; margin: 40px auto; background: #fff; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .badge { background: #1d4ed8; color: white; font-size: 13px; padding: 4px 12px; border-radius: 20px; display: inline-block; margin-bottom: 16px; }
        .creds { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .creds p { margin: 6px 0; font-size: 14px; color: #374151; }
        .creds strong { color: #111827; }
        .btn { display: block; width: fit-content; margin: 24px auto 0; background: #1d4ed8; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; }
        .footer { font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px; }
        .warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 6px; padding: 12px; font-size: 13px; color: #92400e; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="badge">Barangay Profiling System</div>
        <h2 style="color:#111827; margin-top:0;">Welcome, {{ $name }}!</h2>
        <p style="color:#6b7280; font-size:14px;">Your admin account has been created. Use the credentials below to log in.</p>

        <div class="creds">
            <p><strong>Email:</strong> {{ $email }}</p>
            <p><strong>Temporary Password:</strong> {{ $temporaryPassword }}</p>
        </div>

        <div class="warning">
            ⚠️ You will be required to change your password after your first login.
        </div>

        <a href="{{ $loginUrl }}" class="btn">Login Now</a>

        <div class="footer">
            Barangay Profiling System &mdash; Do not share your credentials with anyone.
        </div>
    </div>
</body>
</html>