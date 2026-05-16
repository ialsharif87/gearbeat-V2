# GearBeat Patch 106B — Marketplace UI Safety Copy

## 1. Purpose
This patch aligns the visible marketplace order and payment labels with the canonical state map defined in **Patch 106A**. It also introduces safety copy to inform customers and vendors that payment confirmation is strictly a backend/administrative process, preventing unauthorized status manipulation in the UI.

## 2. Pages Inspected & Updated
- **Customer Dashboard** (`app/customer/orders/page.tsx`):
    - Aligned status badges with canonical states: `pending_payment`, `payment_review`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`, `failed`, `refunded`, `disputed`.
    - Added safety notice: "Customers cannot manually confirm payments. Fulfillment depends on admin/vendor confirmation."
- **Vendor Portal** (`app/portal/store/orders/page.tsx`):
    - Updated `statusLabels` map to include all canonical marketplace statuses.
    - Aligned badge colors with the new lifecycle (e.g., `paid` and `delivered` as success/teal, `cancelled`/`failed` as danger/red).
    - Added Safety Notice: "Vendors cannot move an order to 'Paid' status. Payment confirmation is handled automatically or by administrators."
- **Admin Dashboard** (`app/admin/orders/page.tsx`):
    - Implemented `getStatusLabel` helper for universal label alignment.
    - Updated badge colors to match the marketplace lifecycle.
- **Marketplace Discovery** (`app/marketplace/page.tsx`):
    - Added a "Secure Checkout" notice clarifying that all payments are verified by backend systems, Tap integration is deferred (Patch 104B), and manual overrides are disabled (Patch 104A).
- **Product Details** (`app/marketplace/products/[slug]/page.tsx`):
    - Updated "Pilot Phase" notice to explicitly mention backend-only payment verification.

## 3. Copy & Labels Aligned

| Status | UI Label (EN) | UI Label (AR) | Badge Context |
| :--- | :--- | :--- | :--- |
| `pending_payment` | Awaiting Payment / Unpaid | في انتظار الدفع / غير مدفوع | Warning (Gold/Yellow) |
| `payment_review` | Payment Review / In Review | مراجعة الدفع / قيد المراجعة | Warning (Gold/Yellow) |
| `paid` | Paid & Confirmed | مدفوع ومؤكد | Success (Teal/Green) |
| `processing` | Being Prepared / Processing | قيد التجهيز / قيد المعالجة | Info (Blue) |
| `ready_for_pickup` | Ready for Pickup / Ready | جاهز للاستلام / جاهز | Info (Blue) |
| `shipped` | On its Way / Shipped | في الطريق / تم الشحن | Purple / Info |
| `delivered` | Received / Delivered | تم الاستلام / تم التسليم | Success (Teal/Green) |
| `cancelled` | Cancelled | ملغي | Danger (Red) |
| `failed` | Payment Failed / Failed | فشل الدفع / فشل | Danger (Red) |

## 4. Remaining Marketplace UI Gaps
- **Fulfillment Automation**: "Shipped" and "Delivered" statuses still require manual updates by vendors/admins until carrier API integration is implemented.
- **Dispute Flow**: While the label exists, the actual UI for a customer to trigger a `disputed` state remains in the backlog.
- **Refund Automation**: Refunds are currently conceptual and require manual financial reversal before setting the `refunded` status.

## 5. Confirmation
- ✅ **UI/Copy Only**: No changes were made to backend logic, API behavior, Supabase queries, or payment handling.
- ✅ **Brand Consistency**: Preserved GearBeat premium dark/gold identity and bilingual support.
- ✅ **Safety Lock**: Reinforced the "Manual Payment Safety Lock" (Patch 104A) and "Tap Webhook Safety Plan" (Patch 104B) through explicit UI messaging.
