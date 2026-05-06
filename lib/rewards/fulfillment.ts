import { createClient } from "@/lib/supabase/server";

/**
 * GearBeat Fulfillment Logic
 * Handles automatic triggering of merch kits and rewards.
 */

export type KitType = 
  | 'welcome_kit' 
  | 'premium_sticker_kit' 
  | 'premium_partner_box' 
  | 'luxury_black_box' 
  | 'flagship_kit'
  | 'welcome_sticker_pack'
  | 'merch_kit_1'
  | 'merch_kit_2'
  | 'merch_kit_3'
  | 'insider_luxury_kit';

/**
 * Check and trigger merch fulfillment for a customer after a completed booking
 */
export async function checkCustomerFulfillment(userId: string) {
  const supabase = await createClient();

  // 1. Get completed bookings count
  const { count, error: bookingError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('customer_id', userId)
    .eq('status', 'completed')
    .eq('payment_status', 'paid');

  if (bookingError || count === null) return;

  // 2. Logic for First Booking Welcome Kit
  if (count === 1) {
    await triggerFulfillment(userId, null, 'welcome_sticker_pack');
  }

  // 3. Logic for other milestones could go here
}

/**
 * Check and trigger merch fulfillment for a studio owner after approval/first booking
 */
export async function checkStudioFulfillment(studioId: string) {
  const supabase = await createClient();

  // 1. Get studio details
  const { data: studio, error: studioError } = await supabase
    .from('studios')
    .select('owner_auth_user_id, status, completion_score')
    .eq('id', studioId)
    .single();

  if (studioError || !studio) return;

  // 2. Trigger Welcome Kit after approval and profile completion
  if (studio.status === 'approved' && studio.completion_score >= 90) {
    // Check if already sent
    const { count } = await supabase
      .from('merch_fulfillment_orders')
      .select('id', { count: 'exact', head: true })
      .eq('studio_id', studioId)
      .eq('kit_id', (await getKitIdByType('welcome_kit')));

    if (count === 0) {
      await triggerFulfillment(studio.owner_auth_user_id, studioId, 'welcome_kit');
    }
  }
}

/**
 * Internal helper to create a fulfillment order
 */
async function triggerFulfillment(userId: string | null, studioId: string | null, kitType: KitType) {
  const supabase = await createClient();
  
  const kitId = await getKitIdByType(kitType);
  if (!kitId) return;

  const { error } = await supabase
    .from('merch_fulfillment_orders')
    .insert({
      user_id: userId,
      studio_id: studioId,
      kit_id: kitId,
      status: 'pending'
    });

  if (error) {
    console.error(`Fulfillment Error: Failed to trigger ${kitType}`, error);
  }
}

/**
 * Helper to resolve kit_type to UUID from merch_kits table
 */
async function getKitIdByType(kitType: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('merch_kits')
    .select('id')
    .eq('kit_type', kitType)
    .single();

  if (error || !data) return null;
  return data.id;
}
