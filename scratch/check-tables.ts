import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkTables() {
  const tables = ['marketplace_carts', 'marketplace_cart_items', 'marketplace_orders', 'marketplace_order_items']
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      console.log(`Table ${table} error:`, error.message)
    } else {
      console.log(`Table ${table} exists.`)
    }
  }
}

checkTables()
