import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listLandlords() {
  console.log('\n📋 Listing all landlords...\n');

  const { data: landlords, error } = await supabase
    .from('landlords')
    .select('id, user_id, landlord_type, full_name, company_name, onboarding_completed, created_at')
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('❌ Error fetching landlords:', error);
    return;
  }

  if (!landlords || landlords.length === 0) {
    console.log('No landlords found');
    return;
  }

  console.log('Recent Landlords:');
  console.log('==========================================');
  landlords.forEach((landlord, index) => {
    console.log(`${index + 1}. ${landlord.id}`);
    console.log(`   Type: ${landlord.landlord_type}`);
    console.log(`   Name: ${landlord.full_name || landlord.company_name || 'N/A'}`);
    console.log(`   Onboarding: ${landlord.onboarding_completed ? '✓' : '✗'}`);
    console.log(`   Created: ${landlord.created_at}`);
    console.log('');
  });
}

listLandlords()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
