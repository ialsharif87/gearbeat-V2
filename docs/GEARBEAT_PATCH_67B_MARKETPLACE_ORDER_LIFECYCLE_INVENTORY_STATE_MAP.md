# GearBeat Patch 67B — Marketplace Order Lifecycle + Inventory State Map

## Patch Status

Patch 67B is a documentation/planning-only patch for GearBeat V2.

This patch defines the intended marketplace order lifecycle, cart and checkout boundaries, inventory reservation/decrement model, fulfillment states, cancellation/refund/return states, and payment-readiness boundaries before any backend, payment, or database implementation.

No SQL, RLS, database schema, API route, server action, auth, payment, checkout, webhook, package, or backend mutation is included in this patch.

---

## 1. Purpose

GearBeat Marketplace needs a clear transaction integrity model before live commercial payments are enabled.

The marketplace currently has strong public discovery, product detail, seller/store portal, admin, and planning foundations, but a production marketplace requires a precise source of truth for:

- Cart lifecycle
- Order lifecycle
- Inventory reservation
- Stock decrement timing
- Vendor fulfillment
- Shipping/delivery status
- Cancellation rules
- Refund/return rules
- Admin operations
- Payment provider boundaries
- Pilot/manual payment limitations

This document defines the target operating model without implementing it.

---

## 2. Current Marketplace / Cart / Order Observations

Based on the project direction and previous audits, GearBeat includes marketplace surfaces such as:

- Public marketplace discovery
- Product detail pages
- Store/vendor portal surfaces
- Customer order/account surfaces
- Admin order/marketplace operations surfaces
- Planning documentation for payment, trust, and launch readiness

However, several areas must remain gated before commercial launch:

- Live payment collection is not active.
- Tap live payment cannot be treated as production-ready until the company is activated, merchant account is approved, and live credentials/webhooks are verified.
- Manual payment flows are acceptable only for controlled pilot/testing.
- Inventory source of truth must be verified before allowing real orders.
- Fulfillment and refund states must be defined before accepting money from customers.
- Admin override rules must be documented before operational use.

---

## 3. Target Order Lifecycle States

Recommended marketplace order states:

1. `draft`
   - Customer is browsing or building cart.
   - No inventory is reserved.
   - No order should be considered active.

2. `cart_active`
   - Cart contains one or more items.
   - Prices and availability are still provisional.
   - Inventory is not permanently decremented.

3. `checkout_started`
   - Customer begins checkout.
   - System validates cart, seller status, item status, price, and inventory.
   - For future live payments, this is where payment session creation begins.

4. `payment_pending`
   - Order has been created but payment is not confirmed.
   - Inventory may be temporarily reserved depending on future implementation rules.
   - For manual pilot, admin may mark payment as pending/manual review.

5. `paid`
   - Payment confirmed by trusted source of truth.
   - For future Tap integration, webhook confirmation should be the source of truth, not only frontend redirect.
   - Inventory decrement may happen here or at `confirmed`, depending on final architecture.

6. `confirmed`
   - Order is accepted for fulfillment.
   - Vendor/store can begin processing.
   - Admin can monitor fulfillment.

7. `processing`
   - Vendor is preparing the order.
   - Inventory is committed.

8. `ready_to_ship`
   - Order is packed or prepared for delivery/pickup.

9. `shipped`
   - Shipment has started.
   - Tracking details may be attached later.

10. `delivered`
   - Customer received the item.
   - Order can become eligible for review, loyalty points, and post-purchase flows.

11. `completed`
   - Final business-complete state.
   - Order is closed from the standard operational journey.

12. `cancelled`
   - Order cancelled before fulfillment completion.
   - Refund/payment reversal rules depend on payment status and vendor progress.

13. `refund_requested`
   - Customer/admin requested refund review.
   - Refund is not yet approved.

14. `refund_approved`
   - Admin or policy engine approved refund.

15. `refunded`
   - Money returned or manual refund marked complete.
   - For future live payments, refund confirmation must come from payment provider/webhook or reconciliation process.

16. `return_requested`
   - Customer requested return after shipment/delivery.

17. `return_approved`
   - Return accepted according to marketplace policy.

18. `returned`
   - Returned item received/validated.

19. `disputed`
   - Customer/vendor/admin dispute exists.

20. `failed`
   - Checkout or payment failed.

21. `expired`
   - Checkout session or inventory reservation expired.

---

## 4. Customer Purchase Journey

Target customer journey:

1. Customer opens Marketplace.
2. Customer views product detail.
3. Customer adds product to cart.
4. Cart validates:
   - Product is active.
   - Vendor is approved.
   - Product has available inventory.
   - Price is current.
   - Shipping/pickup method is available.
5. Customer starts checkout.
6. System creates order draft or checkout session.
7. Payment step begins:
   - Pilot: manual payment / no real online payment.
   - Future: Tap hosted checkout or equivalent backend payment session.
8. Payment confirmation:
   - Pilot: admin/manual confirmation.
   - Future: webhook-confirmed payment.
9. Order becomes confirmed/processing.
10. Vendor fulfills order.
11. Customer receives order.
12. Customer may review product/vendor.
13. Loyalty/reward rules may run only after completed paid order in a future phase.

---

## 5. Vendor / Store Order Journey

Target vendor journey:

1. Vendor receives new confirmed order.
2. Vendor sees:
   - Order ID
   - Customer details allowed by privacy policy
   - Product items
   - Quantity
   - Fulfillment method
   - Payment status
   - Required action
3. Vendor accepts/starts processing.
4. Vendor prepares item.
5. Vendor marks ready/shipped.
6. Vendor enters tracking details if shipping exists.
7. Vendor handles return/refund requests through admin-controlled workflow.
8. Vendor payout eligibility is calculated only after payment and settlement rules are finalized.

Vendor must not be allowed to:
- Fulfill unpaid orders as paid.
- Override payment status directly.
- Change customer charges.
- Bypass admin policy for refunds/disputes.
- Decrement inventory inconsistently.

---

## 6. Admin Order Operations Journey

Admin should eventually be able to:

- View all orders.
- Filter by status, vendor, customer, date, payment status, fulfillment status, dispute status.
- Review manual payment proof during pilot.
- Mark pilot orders as manually confirmed only when policy allows.
- Cancel orders.
- Approve/reject refunds.
- Approve/reject returns.
- Open/close disputes.
- Audit vendor fulfillment.
- Review payment reconciliation.
- Review settlement/payout eligibility.
- Lock suspicious orders.
- Export order reports.

Admin should not directly edit sensitive payment data except through controlled actions with audit logs in a future backend phase.

---

## 7. Inventory Reservation / Decrement Model

Recommended model:

### 7.1 Inventory Concepts

- `available_stock`: quantity available for sale.
- `reserved_stock`: quantity temporarily held during checkout.
- `committed_stock`: quantity tied to paid/confirmed orders.
- `sold_stock`: quantity delivered/completed.
- `returned_stock`: quantity returned and accepted back into sellable inventory if condition allows.

### 7.2 Reservation Timing

Recommended future behavior:

1. Cart stage:
   - No stock decrement.
   - Optional soft availability check only.

2. Checkout started:
   - Reserve stock temporarily.
   - Reservation expires after a short window.

3. Payment pending:
   - Reservation remains active.
   - If payment fails/expires, reservation is released.

4. Payment confirmed:
   - Reserved stock becomes committed.
   - Available stock is decremented.

5. Order cancelled before fulfillment:
   - Stock may be released back if item not shipped.

6. Return accepted:
   - Stock may be returned to inventory only after condition inspection.

### 7.3 Risks Without Reservation Logic

- Overselling products.
- Customer pays for unavailable item.
- Vendor manually fulfills unavailable stock.
- Refund/dispute volume increases.
- Admin cannot reconcile stock against orders.

Inventory logic should not be implemented until schema reality and source-of-truth tables are verified.

---

## 8. Fulfillment and Shipping States

Recommended fulfillment states:

- `not_started`
- `processing`
- `packed`
- `ready_for_pickup`
- `ready_to_ship`
- `shipped`
- `out_for_delivery`
- `delivered`
- `failed_delivery`
- `returned_to_sender`
- `cancelled`

Recommended fields for future verification:

- Fulfillment method
- Pickup/delivery/shipping address
- Vendor handling time
- Carrier name
- Tracking number
- Tracking URL
- Shipment created at
- Shipped at
- Delivered at
- Delivery confirmation
- Return tracking details

---

## 9. Cancellation / Refund / Return States

### 9.1 Cancellation States

- `cancellation_requested`
- `cancellation_review`
- `cancellation_approved`
- `cancellation_rejected`
- `cancelled`

Cancellation rules should depend on:

- Payment status
- Vendor processing status
- Shipment status
- Product type
- Marketplace policy
- Manual admin review
- Fraud/dispute status

### 9.2 Refund States

- `refund_not_requested`
- `refund_requested`
- `refund_under_review`
- `refund_approved`
- `refund_rejected`
- `refund_processing`
- `refunded`
- `refund_failed`

Refund source of truth:

- Pilot/manual phase: admin records manual refund state.
- Future payment phase: payment provider/webhook/reconciliation confirms refund completion.

### 9.3 Return States

- `return_not_requested`
- `return_requested`
- `return_approved`
- `return_rejected`
- `return_in_transit`
- `return_received`
- `return_inspected`
- `return_completed`

Return handling should eventually connect to inventory condition checks.

---

## 10. Manual Payment / Pilot Limitations

Before the company is activated and Tap live merchant access is approved, GearBeat should treat marketplace transactions as pilot/manual only.

Allowed during controlled pilot:

- Manual order intake.
- Admin-supervised confirmation.
- No automated live payment claims.
- Limited vendor/customer cohort.
- Manual support and issue tracking.
- Clear communication that commercial online payment is not live.

Not allowed before payment activation:

- Public paid checkout claiming instant online payment.
- Automatic vendor settlement.
- Automatic refund execution.
- Loyalty points based on unverified payment.
- Public marketplace scale without fulfillment controls.

---

## 11. Future Tap Payment Boundaries

Future Tap integration should follow this boundary:

- Frontend should not own payment truth.
- Backend creates payment session/charge.
- Hosted checkout should be preferred for MVP.
- Webhook verification must be mandatory.
- Idempotency must be implemented to avoid duplicate payment/order creation.
- Payment reference should map to GearBeat order ID.
- Payment state should update only through verified provider response/webhook/reconciliation.
- Refunds should follow provider-confirmed lifecycle.
- No secret keys in frontend.
- No custom card handling in GearBeat MVP.

Commercial payment work requires explicit approval and active company/payment provider readiness.

---

## 12. Source-of-Truth Recommendations

Recommended source-of-truth hierarchy:

1. Order record:
   - Business lifecycle source.
2. Payment transaction record:
   - Payment state source.
3. Inventory movement/reservation record:
   - Stock source.
4. Fulfillment record:
   - Shipping/delivery source.
5. Refund/return record:
   - Post-purchase source.
6. Admin audit log:
   - Operational accountability source.

No single UI page should be treated as source of truth.

---

## 13. Data / Schema Assumptions Needing Verification

Before implementation, verify production Supabase reality for:

- Marketplace products table
- Product variants table, if applicable
- Product inventory table or inventory field
- Cart table or client-only cart model
- Orders table
- Order items table
- Payment transactions table
- Refunds table
- Returns table
- Vendor/store table
- Vendor payout/settlement tables
- Fulfillment/shipping table
- Admin audit log table
- Customer profile table
- Seller/vendor approval status fields
- Product status fields
- Stock reservation fields or movement ledger

No implementation should proceed until schema reality is confirmed and RLS boundaries are approved.

---

## 14. Risks / Blockers

Critical risks:

- Live payments cannot proceed before company/payment provider activation.
- Inventory can be oversold without reservation/decrement rules.
- Refunds can become operationally risky without source-of-truth payment records.
- Vendor fulfillment can become inconsistent without fulfillment states.
- Manual payment must remain restricted to pilot.
- Marketplace legal/refund policy must be reviewed before public paid launch.

Medium risks:

- Vendor/store routes may still need consolidation decisions.
- Product SEO and marketplace content quality may need further polish.
- Shipping/carrier integration is not defined.
- Tax/VAT invoice model is not finalized.
- Order notification flow may need later review.

---

## 15. Recommended Next Patch

Recommended next patch:

Patch 67C — Admin Operations + Phase 67 Transaction Integrity Closeout

Suggested scope:

- Document admin order/booking operations.
- Define cross-module transaction integrity principles.
- Summarize booking and marketplace lifecycle maps.
- Define implementation gates before backend/payment/database work.
- Close Phase 67.

This should remain documentation/planning-only unless explicit approval is given for backend/database/payment implementation.

---

## 16. Mutation Safety Confirmation

Patch 67B is documentation/planning-only.

No changes were made to:

- SQL
- RLS
- Supabase migrations
- Database schema
- API routes
- route.ts files
- Auth logic
- Payment logic
- Checkout logic
- Webhooks
- Server actions
- Backend logic
- Package files

