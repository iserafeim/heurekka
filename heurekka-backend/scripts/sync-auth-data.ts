/**
 * Script to sync landlord data to Supabase Auth
 * This fixes existing accounts where phone/display_name weren't synced
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function syncAuthData() {
  try {
    console.log('🔄 Starting auth data sync...\n');
    console.log('Supabase URL:', supabaseUrl);
    console.log('Has Service Key:', !!supabaseServiceKey);

    // Get all landlords with user data - use rpc to bypass RLS
    const { data: landlords, error } = await supabase.rpc('get_all_landlords_for_sync');

    console.log('Query error:', error);
    console.log('Query result:', landlords ? `Found ${landlords.length} landlords` : 'No landlords');

    if (error) {
      console.error('Error fetching landlords:', error);
      return;
    }

    console.log(`Found ${landlords?.length || 0} landlords to sync\n`);

    let successCount = 0;
    let errorCount = 0;

    for (const landlord of landlords || []) {
      // Determine display name and phone based on landlord type
      const displayName = landlord.full_name || landlord.company_name;
      const phone = landlord.phone || landlord.main_phone;

      if (!displayName && !phone) {
        console.log(`⏭️  Skipping ${landlord.user_id} - no data to sync`);
        continue;
      }

      console.log(`\n📝 Syncing user ${landlord.user_id}:`);
      console.log(`   Type: ${landlord.landlord_type}`);
      console.log(`   Name: ${displayName || 'N/A'}`);
      console.log(`   Phone: ${phone || 'N/A'}`);

      // Get current user data
      const { data: currentUser } = await supabase.auth.admin.getUserById(landlord.user_id);

      if (!currentUser?.user) {
        console.log(`   ❌ User not found in auth.users`);
        errorCount++;
        continue;
      }

      // Build update object
      const updateData: { user_metadata?: any; phone?: string } = {};

      if (displayName) {
        updateData.user_metadata = {
          ...currentUser.user.user_metadata,
          full_name: displayName
        };
      }

      if (phone) {
        updateData.phone = phone;
      }

      // Update user in Supabase Auth
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        landlord.user_id,
        updateData
      );

      if (updateError) {
        console.log(`   ❌ Error updating: ${updateError.message}`);
        errorCount++;
      } else {
        console.log(`   ✅ Successfully synced`);
        successCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`\n✨ Sync complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total: ${landlords?.length || 0}\n`);

  } catch (error) {
    console.error('\n❌ Script error:', error);
    process.exit(1);
  }
}

// Run the script
syncAuthData()
  .then(() => {
    console.log('✅ Script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
