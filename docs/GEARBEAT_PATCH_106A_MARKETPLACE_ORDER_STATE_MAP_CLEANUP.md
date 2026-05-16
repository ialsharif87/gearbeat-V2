# GearBeat Patch 106A — Marketplace Order State Map Cleanup / Canonical Marketplace Order Lifecycle

## 1. Purpose
GearBeat's Marketplace requires a standardized, canonical order lifecycle to ensure consistency across the Customer, Vendor Partner, and Administrative interfaces. As the platform transitions from "Manual Pilot" to "Live Readiness," these states must be strictly defined to govern access control, payment reconciliation, vendor fulfillment, and inventory integrity.

This document serves as the Source of Truth for marketplace order state transitions before any UI alignment (Patch 106B) or future payment webhook implementation.

## 2. Canonical Order Statuses

| Status | Definition |
| :--- | :--- |
| **cart** | Items added to the user's shopping cart; no order has been created yet. |
| **pending_payment** | The order record is created and is awaiting a successful payment transaction. |
| **payment_review** | Payment is pending verification (e.g., manual bank transfer review or provider fraud check). |
| **paid** | Payment is verified and successful. The order is ready for vendor processing. |
| **processing** | The vendor has accepted the order and is preparing the items for shipment or pickup. |
| **ready_for_pickup** | (If applicable) The order is ready at the vendor's location for the customer to collect. |
| **shipped** | The order has been handed over to the shipping carrier. |
| **delivered** | The customer has received the order. |
| **cancelled** | The order was voided by either the customer, vendor, or admin (requires refund if paid). |
| **failed** | The order failed due to a payment decline or a technical conflict during creation. |
| **refunded** | The order was cancelled and the original payment has been returned to the customer. |
| **disputed** | A customer has flagged the order for administrative review (e.g., items not as described). |

## 3. Status Meaning & Relationships

| Status | Customer Perspective | Vendor Perspective | Payment State | Fulfillment State |
| :--- | :--- | :--- | :--- | :--- |
| **cart** | "Shopping" | No visibility | None | None |
| **pending_payment** | "Waiting to pay" | Incoming request | Expected | None |
| **payment_review** | "Payment being verified" | Waiting for admin | Pending | On Hold |
| **paid** | "Ordered" | "New Order" | Confirmed | To Process |
| **processing** | "Being prepared" | "In progress" | Confirmed | Preparing |
| **ready_for_pickup** | "Ready to collect" | "Awaiting pickup" | Confirmed | Staged |
| **shipped** | "On its way" | "Sent" | Confirmed | In Transit |
| **delivered** | "Received" | "Delivered" | Confirmed | Finished |
| **cancelled** | "Cancelled" | "Voided" | Refund Req. | Stopped |
| **failed** | "Payment failed" | No action | Failed | None |
| **refunded** | "Money returned" | "Refunded" | Refunded | Voided |
| **disputed** | "Problem reported" | "Review req." | Held/Blocked | Under Review |

## 4. Allowed Status Transitions

- **cart** → **pending_payment** (Checkout initiation)
- **pending_payment** → **payment_review** (Transaction started/Manual upload)
- **pending_payment** → **paid** (Instant payment success)
- **payment_review** → **paid** (Admin/Provider verification success)
- **paid** → **processing** (Vendor acceptance)
- **processing** → **ready_for_pickup** / **shipped** (Vendor fulfillment)
- **shipped** → **delivered** (Carrier confirmation/Customer receipt)
- **pending_payment** → **failed** (Payment decline)
- **paid** → **cancelled** (Admin/Vendor action before shipment)
- **delivered** → **disputed** (Post-delivery complaint)
- **disputed** → **refunded** (Admin resolution)
- **cancelled** → **refunded** (Automated/Manual refund processing)

## 5. Forbidden Transitions

- **Customer Direct Paid Status**: A customer cannot manually move an order to `paid` (Self-confirmation).
- **Frontend Delivered Status**: The UI cannot mark an order as `delivered` without a backend or carrier signal.
- **Vendor Bypass Verification**: A vendor cannot move an order from `payment_review` directly to `processing`.
- **Cancelled to Paid**: A cancelled order cannot accept new payments; the user must re-order.
- **Refunded to Processing**: Once money is returned, the order is dead; items must be re-ordered.
- **Failed to Delivered**: A failed transaction can never skip straight to delivery.

## 6. Payment Relationship
Marketplace order status and Payment status are linked but distinct:
- **Source of Truth**: The `payment_transactions` and `checkout_payment_sessions` tables remain the authoritative source for financial status.
- **Manual Lock**: Following **Patch 104A**, manual confirmation is restricted to admins in production.
- **Deferred Live**: Following **Patch 104B**, Tap live integration remains deferred; webhooks will be the future trigger for `paid` transitions.

## 7. Inventory Relationship
Future rules for inventory management:
- **Stock Reservation**: Inventory should be temporarily reserved when an order enters `pending_payment` or `payment_review`.
- **Stock Deduction**: Permanent deduction occurs only when the order is marked as `paid`.
- **Failure/Cancellation**: Inventory is automatically released back to the marketplace if an order fails or is cancelled before shipping.
- **Refunds/Returns**: Inventory is only restored to the catalog after a manual admin/vendor check confirms the item is re-sellable.

## 8. Display Labels (Suggested)

| Dashboard | `pending_payment` Label | `paid` Label | `shipped` Label |
| :--- | :--- | :--- | :--- |
| **Customer** | Awaiting Payment | Confirmed | On its Way |
| **Vendor Partner** | Pending Payment | New Order | Shipped |
| **Admin Ops** | UNPAID - ACTION REQ | PAID - SECURE | IN TRANSIT |

## 9. Risks and Gaps
- **Inconsistent Statuses**: Existing UI components may still use legacy or missing status labels.
- **DB Constraints**: The `status` column in the `marketplace_orders` table must be verified to support all canonical enums.
- **RLS Verification**: Ensure that customers/vendors cannot update their own order status to `paid` via direct SQL/API.
- **Manual Fulfillment**: Lack of integrated shipping carrier tracking means "shipped" and "delivered" are currently manual vendor updates, increasing risk of false status.
- **Inventory Locks**: High risk of race conditions without atomic stock reservation logic in the order creation RPC.

## 10. Next Patch Recommendation
**Patch 106B — Marketplace UI Safety Copy**
Focus on aligning the visible status labels and fulfillment clarity in the Customer, Vendor, and Admin marketplace dashboards to match this canonical map, without changing the underlying database logic.
