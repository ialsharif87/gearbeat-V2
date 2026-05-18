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
console.log("⚙️  GearBeat Pilot Self-Testing Reset Utility");
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

// 3. Define the relational tables and cleanup rules in dependency order
const TABLES_TO_CLEAN = [
  // 1. Booking Exceptions, Rules, & Pricing
  { name: "public.studio_availability_exceptions", keyColumn: "id" },
  { name: "public.studio_availability_pricing_rules", keyColumn: "id" },
  { name: "public.studio_availability_rules", keyColumn: "id" },
  { name: "public.studio_boost_subscriptions", keyColumn: "id" },
  { name: "public.studio_tier_rules", keyColumn: "id" },
  { name: "public.studio_certification_history", keyColumn: "id" },
  { name: "public.certified_studios", keyColumn: "id" },
  { name: "public.qr_verification_links", keyColumn: "id" },
  { name: "public.digital_badges", keyColumn: "badge_key" },
  { name: "public.certification_audit_events", keyColumn: "id" },
  { name: "public.certified_entities", keyColumn: "id" },

  // 2. Studio bookings & rooms
  { name: "public.studio_bookings", keyColumn: "id" },
  { name: "public.rooms", keyColumn: "id" },
  { name: "public.studios", keyColumn: "id" },

  // 3. Marketplace transactional & product tables
  { name: "public.marketplace_order_items", keyColumn: "id" },
  { name: "public.marketplace_orders", keyColumn: "id" },
  { name: "public.carts", keyColumn: "id" },
  { name: "public.cart_items", keyColumn: "id" },
  { name: "public.marketplace_promos", keyColumn: "id" },
  { name: "public.marketplace_products", keyColumn: "id" },
  { name: "public.marketplace_vendors", keyColumn: "id" },

  // 4. Academy & Services
  { name: "public.academy_enrollments", keyColumn: "id" },
  { name: "public.academy_lessons", keyColumn: "id" },
  { name: "public.service_bookings", keyColumn: "id" },
  { name: "public.service_listings", keyColumn: "id" },
  { name: "public.services", keyColumn: "id" },

  // 5. Events & Tickets
  { name: "public.event_tickets", keyColumn: "id" },
  { name: "public.event_profiles", keyColumn: "id" },
  { name: "public.events", keyColumn: "id" },

  // 6. Finance, payouts, & batches
  { name: "public.finance_audit_logs", keyColumn: "id" },
  { name: "public.finance_adjustments", keyColumn: "id" },
  { name: "public.settlement_batch_items", keyColumn: "id" },
  { name: "public.settlement_batches", keyColumn: "id" },
  { name: "public.payout_requests", keyColumn: "id" },
  { name: "public.payout_report_notes", keyColumn: "id" },
  { name: "public.payout_batches", keyColumn: "id" },
  { name: "public.finance_ledger_entries", keyColumn: "id" },
  { name: "public.finance_ledger", keyColumn: "id" },
  { name: "public.payment_transactions", keyColumn: "id" },
  { name: "public.payment_sessions", keyColumn: "id" },
  { name: "public.commission_settings", keyColumn: "id" },
  { name: "public.acceleration_orders", keyColumn: "id" },
  { name: "public.acceleration_packages", keyColumn: "id" },

  // 7. Rewards, loyalty, & referrals
  { name: "public.merch_fulfillment_orders", keyColumn: "id" },
  { name: "public.merch_kits", keyColumn: "id" },
  { name: "public.creator_seeding", keyColumn: "id" },
  { name: "public.media_coverage", keyColumn: "id" },
  { name: "public.pr_campaigns", keyColumn: "id" },
  { name: "public.customer_tiers", keyColumn: "id" },
  { name: "public.vendor_tiers", keyColumn: "id" },
  { name: "public.studio_tiers", keyColumn: "id" },
  { name: "public.points_ledger", keyColumn: "id" },
  { name: "public.wallets", keyColumn: "id", preserveSuperAdmin: true, userColumn: "user_id" },
  { name: "public.referral_records", keyColumn: "id" },
  { name: "public.loyalty_reward_accounts", keyColumn: "user_id", preserveSuperAdmin: true, userColumn: "user_id", resetColumn: "current_balance", resetValue: 0 },
  { name: "public.referral_codes", keyColumn: "id", preserveSuperAdmin: true, userColumn: "user_id" },

  // 8. CRM tables
  { name: "public.crm_accounts", keyColumn: "id" },
  { name: "public.crm_contacts", keyColumn: "id" },
  { name: "public.crm_leads", keyColumn: "id" },
  { name: "public.crm_notes", keyColumn: "id" },
  { name: "public.crm_tasks", keyColumn: "id" },
  { name: "public.provider_leads", keyColumn: "id" },

  // 9. Support & Ops
  { name: "public.support_tickets", keyColumn: "id" },
  { name: "public.admin_issues", keyColumn: "id" },
  { name: "public.notification_outbox", keyColumn: "id" },
  { name: "public.notifications", keyColumn: "id" },
  { name: "public.system_audit_logs", keyColumn: "id" },
  { name: "public.admin_audit_logs", keyColumn: "id" },
  { name: "public.trusted_devices", keyColumn: "id" },
  { name: "public.user_policy_acceptances", keyColumn: "id" },

  // 10. Partner structures
  { name: "public.partner_members", keyColumn: "id" },
  { name: "public.partner_accounts", keyColumn: "id" },

  // 11. Profile & roles (Super Admin preservation enforced)
  { name: "public.user_roles", keyColumn: "id", preserveSuperAdmin: true, userColumn: "user_id" },
  { name: "public.profiles", keyColumn: "id", preserveSuperAdmin: true, userColumn: "id" }
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

    // 3. Perform Super Admin value resets if defined
    if (isExecute && table.preserveSuperAdmin && table.resetColumn) {
      console.log(`   🔄 Resetting ${table.name} values for Super Admin...`);
      const { error: resetError } = await supabase
        .from(tableNameWithoutSchema)
        .update({ [table.resetColumn]: table.resetValue })
        .eq(userColumn, superAdminId);
        
      if (resetError) {
        console.warn(`   ⚠️ Warning: Failed to reset Super Admin row in ${table.name}: ${resetError.message}`);
      } else {
        console.log(`   ✅ Successfully reset ${table.name}.${table.resetColumn} to ${table.resetValue} for Super Admin.`);
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
