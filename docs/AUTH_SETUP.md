# Authentication Setup

To ensure the password reset flow works correctly, please configure the following in the Supabase Dashboard:

## URL Configuration

1. Go to **Authentication** → **URL Configuration**.
2. Under **Redirect URLs**, add:
   `https://gearbeat.app/update-password`
3. Ensure the **Site URL** is set to:
   `https://gearbeat.app`

## Email Templates

Ensure the **Confirm Password Change** or **Reset Password** email template uses the correct redirect link or the default `{{ .ConfirmationURL }}` which will point to our configured Redirect URL.
