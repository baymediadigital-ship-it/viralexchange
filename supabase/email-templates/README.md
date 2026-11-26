# Supabase Auth email templates

Branded versions of Supabase's sign-up, password-reset, magic-link and
change-email emails, matching the site's transactional emails (lib/email.ts),
including dark mode for mail apps that support it.

They live in the Supabase dashboard, not in code: Authentication -> Emails ->
Templates. Paste each file into the matching template's "Message body" and use
these subjects:

| Template         | File                | Subject                          |
| ---------------- | ------------------- | -------------------------------- |
| Confirm signup   | confirm-signup.html | Confirm your ViralExchange email |
| Reset password   | reset-password.html | Reset your ViralExchange password |
| Magic link       | magic-link.html     | Your ViralExchange login link    |
| Change email     | change-email.html   | Confirm your new email           |

Sending goes through Resend via custom SMTP (Authentication -> Emails -> SMTP
Settings): host smtp.resend.com, port 465, username "resend", password = a
Resend API key, sender ViralExchange <deals@viralexchange.io>.
