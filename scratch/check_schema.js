const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('Checking marketplace_categories...');
  const { data: catData, error: catError } = await supabase
    .from('marketplace_categories')
    .select('*')
    .limit(1);
  
  if (catError) {
    console.error('Error fetching categories:', catError);
  } else {
    console.log('Category sample:', catData);
  }

  console.log('Checking marketplace_brands...');
  const { data: brandData, error: brandError } = await supabase
    .from('marketplace_brands')
    .select('*')
    .limit(1);
  
  if (brandError) {
    console.error('Error fetching brands:', brandError);
  } else {
    console.log('Brand sample:', brandData);
  }
}

checkSchema();
