import { createClient } from "@supabase/supabase-js";

// ============================================================================
// GEARBEAT: FULL RESET & PRESERVE SUPER ADMIN OPERATIONAL SCRIPT
// ============================================================================

// 1. Env Variables Validation
const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "") as string;
const supabaseUrl = (process.env.SUPABASE_URL || "") as string;
const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "") as string;
const confirmReset = process.env.CONFIRM_RESET;
const modeEnv = process.env.MODE;

console.log("==========================================================");
console.log("⚙️  GearBeat Founder Full-Journey Self-Test Reset Utility");
console.log("==========================================================");

if (!superAdminEmail || !supabaseUrl || !serviceRoleKey) {
  console.error("❌ Error: Missing required environment variables.");
  console.error("Please supply:");
  console.error("  - SUPER_ADMIN_EMAIL       (e.g., admin@gearbeat.com)");
  console.error("  - SUPABASE_URL            (e.g., https://your-proj.supabase.co)");
  console.error("  - SUPABASE_SERVICE_ROLE_KEY (Service role key to bypass RLS)");
  console.log("==========================================================");
  process.exit(1);
}

// Determine running mode (Dry-run by default)
const isExecute = process.argv.includes("--execute") || modeEnv === "EXECUTE";

if (isExecute) {
  console.log("🔥 WARNING: Running in EXECUTE mode. This will perform destructive deletions.");
  if (confirmReset !== "GEARBEAT_FULL_RESET") {
    console.error("❌ Error: EXECUTE mode requires CONFIRM_RESET=GEARBEAT_FULL_RESET.");
    console.log("==========================================================");
    process.exit(1);
  }
} else {
  console.log("🔍 Running in DRY_RUN mode. No rows will be modified.");
}

// 2. Initialize Supabase Admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 3. Define the relational tables and cleanup rules in safe dependency order (children deleted before parents)
const TABLES_TO_CLEAN = [
  // --------------------------------------------------------------------------
  // Category 9: Analytics & Events (Leaves/Logs first)
  // --------------------------------------------------------------------------
  { name: "public.audit_logs", keyColumn: "id" },
  { name: "public.customer_favorites", keyColumn: "id" },
  { name: "public.share_events", keyColumn: "id" },
  { name: "public.studio_accelerations", keyColumn: "id" },
  { name: "public.studio_performance_daily", keyColumn: "id" },
  { name: "public.marketplace_events", keyColumn: "id" },
  { name: "public.certification_audit_events", keyColumn: "id" },
  { name: "public.studio_boost_subscriptions", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 8: CRM & Support & Developer Logs
  // --------------------------------------------------------------------------
  { name: "public.provider_leads", keyColumn: "id" },
  { name: "public.vendor_api_request_logs", keyColumn: "id" },
  { name: "public.vendor_product_sync_logs", keyColumn: "id" },
  { name: "public.vendor_api_keys", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 7: Loyalty, Wallets & Promotions
  // --------------------------------------------------------------------------
  { name: "public.merch_fulfillment_orders", keyColumn: "id" },
  { name: "public.offer_claims", keyColumn: "id" },
  { name: "public.offer_events", keyColumn: "id" },
  { name: "public.offers", keyColumn: "id" },
  { name: "public.loyalty_earning_rules", keyColumn: "id" },
  { name: "public.coupon_validation_logs", keyColumn: "id" },
  { name: "public.coupon_redemptions", keyColumn: "id" },
  { name: "public.coupons", keyColumn: "id" },
  { name: "public.loyalty_points_ledger", keyColumn: "id" },
  { name: "public.customer_wallets", keyColumn: "id", preserveSuperAdmin: true, userColumn: "auth_user_id" },
  { name: "public.loyalty_tiers", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 6: Financials, Settlements & Invoicing
  // --------------------------------------------------------------------------
  { name: "public.platform_payment_transactions", keyColumn: "id" },
  { name: "public.platform_settlements", keyColumn: "id" },
  { name: "public.platform_payout_items", keyColumn: "id" },
  { name: "public.platform_payouts", keyColumn: "id" },
  { name: "public.platform_refunds", keyColumn: "id" },
  { name: "public.platform_invoice_items", keyColumn: "id" },
  { name: "public.platform_invoices", keyColumn: "id" },
  { name: "public.platform_payments", keyColumn: "id" },
  { name: "public.payment_provider_configs", keyColumn: "id" },
  { name: "public.checkout_payment_sessions", keyColumn: "id" },
  { name: "public.payment_transactions", keyColumn: "id" },
  { name: "public.payment_provider_events", keyColumn: "id" },
  { name: "public.payment_refunds", keyColumn: "id" },
  { name: "public.commission_settings", keyColumn: "id" },
  { name: "public.studio_commissions", keyColumn: "id" },
  { name: "public.booking_commissions", keyColumn: "id" },
  { name: "public.studio_commission_rules", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 5: Compliance, Agreements & Banking
  // --------------------------------------------------------------------------
  { name: "public.owner_compliance_documents", keyColumn: "id" },
  { name: "public.owner_compliance_profiles", keyColumn: "id", preserveSuperAdmin: true, userColumn: "owner_auth_user_id" },
  { name: "public.owner_agreements", keyColumn: "id", preserveSuperAdmin: true, userColumn: "owner_auth_user_id" },
  { name: "public.owner_bank_accounts", keyColumn: "id", preserveSuperAdmin: true, userColumn: "owner_auth_user_id" },
  { name: "public.vendor_compliance_documents", keyColumn: "id" },
  { name: "public.business_verifications", keyColumn: "id" },
  { name: "public.verification_documents", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 4: Marketplace & E-Commerce
  // --------------------------------------------------------------------------
  { name: "public.marketplace_order_items", keyColumn: "id" },
  { name: "public.marketplace_orders", keyColumn: "id" },
  { name: "public.marketplace_product_reviews", keyColumn: "id" },
  { name: "public.marketplace_reviews", keyColumn: "id" },
  { name: "public.marketplace_cart_items", keyColumn: "id" },
  { name: "public.marketplace_carts", keyColumn: "id" },
  { name: "public.marketplace_product_images", keyColumn: "id" },
  { name: "public.marketplace_product_variants", keyColumn: "id" },
  { name: "public.marketplace_inventory", keyColumn: "id" },
  { name: "public.marketplace_product_import_rows", keyColumn: "id" },
  { name: "public.marketplace_product_import_batches", keyColumn: "id" },
  { name: "public.marketplace_products", keyColumn: "id" },
  { name: "public.vendor_commission_rules", keyColumn: "id" },
  { name: "public.vendor_profiles", keyColumn: "id" },
  { name: "public.marketplace_brands", keyColumn: "id" },
  { name: "public.marketplace_categories", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 3: Bookings & Reviews
  // --------------------------------------------------------------------------
  { name: "public.reviews", keyColumn: "id" },
  { name: "public.studio_reviews", keyColumn: "id" },
  { name: "public.review_requests", keyColumn: "id" },
  { name: "public.external_review_sources", keyColumn: "id" },
  { name: "public.bookings", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 2: Studios & Listings
  // --------------------------------------------------------------------------
  { name: "public.studio_feature_links", keyColumn: "id" },
  { name: "public.studio_features", keyColumn: "id" },
  { name: "public.studio_equipment", keyColumn: "id" },
  { name: "public.studio_images", keyColumn: "id" },
  { name: "public.studio_availability_exceptions", keyColumn: "id" },
  { name: "public.studio_availability_rules", keyColumn: "id" },
  { name: "public.studio_applications", keyColumn: "id" },
  { name: "public.certified_studios", keyColumn: "id" },
  { name: "public.studio_tier_rules", keyColumn: "id" },
  { name: "public.studio_tiers", keyColumn: "id" },
  { name: "public.studio_certification_history", keyColumn: "id" },
  { name: "public.qr_verification_links", keyColumn: "id" },
  { name: "public.digital_badges", keyColumn: "id" },
  { name: "public.studios", keyColumn: "id" },

  // --------------------------------------------------------------------------
  // Category 1: User / Profile / Customer (Parents last)
  // --------------------------------------------------------------------------
  { name: "public.user_verifications", keyColumn: "id" },
  { name: "public.otp_verification_sessions", keyColumn: "id" },
  { name: "public.account_deletion_requests", keyColumn: "id" },
  { name: "public.staff_role_permissions", keyColumn: "id" },
  { name: "public.admin_users", keyColumn: "id", preserveSuperAdmin: true, userColumn: "auth_user_id" },
  { name: "public.profiles", keyColumn: "id", preserveSuperAdmin: true, userColumn: "auth_user_id" },
  { name: "public.customers", keyColumn: "id" },
  { name: "public.users", keyColumn: "id", preserveSuperAdmin: true, userColumn: "auth_user_id" }
];

async function runReset() {
  // A. Fetch All Auth Users to Identify Super Admin
  console.log("👥 Fetching auth users...");
  let page = 1;
  const allUsers: any[] = [];
  
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100
    });
    
    if (error) {
      console.error("❌ Error retrieving auth user list:", error.message);
      process.exit(1);
    }
    
    if (!data.users || data.users.length === 0) break;
    allUsers.push(...data.users);
    page++;
  }
  
  console.log(`📋 Total auth users found: ${allUsers.length}`);

  // Find Super Admin Auth User
  const superAdmin = allUsers.find(
    u => u.email?.toLowerCase() === superAdminEmail.toLowerCase()
  );

  if (!superAdmin) {
    console.error(`❌ CRITICAL BLOCKER: Super Admin email "${superAdminEmail}" was not found in auth.users.`);
    console.error("To proceed, you must register this user first, or verify the SUPER_ADMIN_EMAIL env variable.");
    console.log("==========================================================");
    process.exit(1);
  }

  const superAdminId = superAdmin.id;
  console.log(`🟢 Verified Super Admin preservation target:`);
  console.log(`   - Email: ${superAdmin.email}`);
  console.log(`   - ID:    ${superAdminId}`);
  console.log("==========================================================");

  // B. Auth Users Deletion Phase
  const usersToDelete = allUsers.filter(u => u.id !== superAdminId);
  console.log(`👥 Auth Users targeting for deletion: ${usersToDelete.length}`);
  
  for (const user of usersToDelete) {
    console.log(`   - [TARGET] Delete User: ${user.email} (${user.id})`);
    if (isExecute) {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteUserError) {
        console.error(`     ❌ Failed to delete ${user.email}: ${deleteUserError.message}`);
      } else {
        console.log(`     ✅ Successfully deleted user ${user.email}`);
      }
    }
  }
  console.log("==========================================================");

  // C. Public Database Tables Cleanup Phase
  console.log("📊 Starting Database Tables Audit & Cleanup...");
  
  for (const table of TABLES_TO_CLEAN) {
    const tableNameWithoutSchema = table.name.replace("public.", "");
    const keyColumn = table.keyColumn || "id";
    const userColumn = table.userColumn || "user_id";

    // 1. Get row counts
    let countQuery = supabase
      .from(tableNameWithoutSchema)
      .select("*", { count: "exact", head: true });

    if (table.preserveSuperAdmin) {
      countQuery = countQuery.neq(userColumn, superAdminId);
    } else {
      // Force non-blank matching query
      countQuery = countQuery.neq(keyColumn, "00000000-0000-0000-0000-000000000000");
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      if (
        countError.code === "42P01" || 
        countError.message.includes("does not exist") ||
        countError.message.includes("relation")
      ) {
        console.log(`ℹ️  Table ${table.name} does not exist. Skipping.`);
        continue;
      }
      console.error(`❌ Error querying table ${table.name}: ${countError.message}`);
      continue;
    }

    const targetedRows = count || 0;
    console.log(`📊 Table ${table.name}: ${targetedRows} rows targeted.`);

    // 2. Perform deletion if in EXECUTE mode and targeted rows exist
    if (isExecute && targetedRows > 0) {
      let deleteQuery = supabase.from(tableNameWithoutSchema).delete();

      if (table.preserveSuperAdmin) {
        deleteQuery = deleteQuery.neq(userColumn, superAdminId);
      } else {
        deleteQuery = deleteQuery.neq(keyColumn, "00000000-0000-0000-0000-000000000000");
      }

      const { error: deleteError } = await deleteQuery;
      
      if (deleteError) {
        console.error(`   ❌ Failed to delete from ${table.name}: ${deleteError.message}`);
      } else {
        console.log(`   ✅ Cleared ${targetedRows} rows from ${table.name}.`);
      }
    }
  }

  console.log("==========================================================");
  console.log(`🎉 Reset operational run completed successfully in ${isExecute ? "EXECUTE" : "DRY_RUN"} mode.`);
  if (!isExecute) {
    console.log("💡 To perform the actual deletion, run with environmental configs and '--execute' flag.");
  }
  console.log("==========================================================");
}

runReset().catch(err => {
  console.error("❌ CRITICAL UNHANDLED SCRIPT EXCEPTION:", err);
  process.exit(1);
});
