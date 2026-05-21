# Patch 128B — Customer Account Pages Premium UI + Arabic Localization

## Pages Polished

- Customer account navigation across `/customer/*` pages.
- Customer profile/account page at `/profile`.
- Payments and receipts page at `/customer/payments`.
- Customer bookings page at `/customer/bookings`.
- Customer orders page at `/customer/orders`.
- Marketplace orders page at `/customer/marketplace-orders`.
- Customer rewards and membership page at `/customer/rewards`.
- Saved/favorites surfaces at `/customer/saved` and `/customer/wishlist`.

## Localization Fixes

- Added Arabic/English customer account navigation labels.
- Localized the Payments & Receipts page shell and payment report UI.
- Added the required Arabic payment labels:
  - المدفوعات والإيصالات
  - سجل المدفوعات
  - تصفية المدفوعات
  - المصدر
  - حالة الدفع
  - لا توجد سجلات دفع
  - تصدير CSV
  - العودة إلى لوحة العميل
  - إجمالي السجلات
  - إجمالي المبلغ
  - المبلغ المدفوع
  - المبلغ المعلّق
  - الملغي/المسترد
- Kept existing Arabic/English support on bookings, orders, rewards, saved, and wishlist pages.

## Profile And Social Links

- Redesigned `/profile` into a premium customer account center with:
  - Initials avatar.
  - Full name, email, account type, and account status.
  - Email, phone, and identity status chips.
  - Personal information, contact information, verification/security, preferences, and social links sections.
- Social links are UI/readiness-only in this patch.
- Instagram, TikTok, X / Twitter, YouTube, LinkedIn, Facebook, and Website fields are disabled with coming-soon copy.
- No new profile columns, SQL, schema changes, or save behavior were added.

## Safety Boundaries

- UI/localization-only patch.
- No SQL was run.
- No Supabase CLI or Supabase MCP was used.
- No `.env` files were edited.
- No auth/signup/login flow changes were made.
- No admin, partner, studio owner, seller, or subdomain routing changes were made.
- No payment provider, booking mutation, order mutation, marketplace mutation, or rewards fulfillment logic was changed.
- No fake customer data was added.

## Testing Result

- Typecheck: passed with `npm.cmd run typecheck`.
- Build: passed with `npm.cmd run build`.
