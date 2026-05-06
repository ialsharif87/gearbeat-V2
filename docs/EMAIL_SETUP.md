# Email Setup Guide

To fix emails going to Spam:
1. Go to Cloudflare DNS for gearbeat.app
2. Add this TXT record:
   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:admin@gearbeat.app
3. Verify SPF and DKIM records exist in Resend dashboard
4. After adding, wait 24-48 hours for Gmail to trust the domain
