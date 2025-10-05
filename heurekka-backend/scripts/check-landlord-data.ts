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

async function checkLandlordData(landlordId: string) {
  console.log(`\n🔍 Checking landlord data for ID: ${landlordId}\n`);

  // Get landlord profile
  const { data: landlord, error } = await supabase
    .from('landlords')
    .select('*')
    .eq('id', landlordId)
    .single();

  if (error) {
    console.error('❌ Error fetching landlord:', error);
    return;
  }

  if (!landlord) {
    console.error('❌ Landlord not found');
    return;
  }

  console.log('📋 LANDLORD PROFILE:');
  console.log('==========================================');
  console.log(`ID: ${landlord.id}`);
  console.log(`User ID: ${landlord.user_id}`);
  console.log(`Type: ${landlord.landlord_type}`);
  console.log(`\n✅ Basic Info:`);
  console.log(`  - Full Name: ${landlord.full_name}`);
  console.log(`  - Phone: ${landlord.phone}`);
  console.log(`  - WhatsApp: ${landlord.whatsapp_number}`);
  console.log(`  - Email Verified: ${landlord.email_verified}`);
  console.log(`  - Phone Verified: ${landlord.phone_verified}`);

  console.log(`\n📊 Profile Status:`);
  console.log(`  - Completion: ${landlord.profile_completion_percentage}%`);
  console.log(`  - Onboarding Completed: ${landlord.onboarding_completed}`);
  console.log(`  - Verification Status: ${landlord.verification_status}`);
  console.log(`  - Profile Photo: ${landlord.profile_photo_url ? '✓' : '✗'}`);

  if (landlord.landlord_type === 'real_estate_agent') {
    console.log(`\n🏢 Real Estate Agent Info:`);
    console.log(`  - Agent Type: ${landlord.agent_type}`);
    console.log(`  - Company Name: ${landlord.company_name}`);
    console.log(`  - Years Experience: ${landlord.years_experience}`);
    console.log(`  - Specializations: ${JSON.stringify(landlord.specializations)}`);
    console.log(`  - Coverage Areas: ${JSON.stringify(landlord.coverage_areas)}`);
    console.log(`  - Properties Managed: ${landlord.properties_in_management}`);
    console.log(`  - Professional Bio: ${landlord.professional_bio ? landlord.professional_bio.substring(0, 50) + '...' : 'N/A'}`);
  }

  console.log(`\n📦 Onboarding Data:`);
  console.log(JSON.stringify(landlord.onboarding_data, null, 2));

  // Get badges
  const { data: badges, error: badgesError } = await supabase
    .from('profile_badges')
    .select('*')
    .eq('landlord_id', landlordId)
    .order('awarded_at', { ascending: false });

  console.log(`\n🏆 BADGES (${badges?.length || 0}):`);
  console.log('==========================================');
  if (badges && badges.length > 0) {
    badges.forEach(badge => {
      console.log(`  ${badge.badge_icon} ${badge.badge_name} - ${badge.badge_description}`);
    });
  } else {
    console.log('  No badges awarded yet');
  }

  console.log('\n==========================================\n');
}

// Get landlord ID from command line argument
const landlordId = process.argv[2] || '70a55ea9-221f-4125-853d-5398a4c1f515';

checkLandlordData(landlordId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
