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

/**
 * Clear all analytics data (property_views and leads) for a landlord
 */
async function clearAnalyticsData(landlordId: string) {
  console.log(`\n🗑️  Clearing analytics data for landlord: ${landlordId}\n`);

  try {
    // 1. Get landlord's properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id')
      .eq('landlord_id', landlordId);

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }

    if (!properties || properties.length === 0) {
      console.log('ℹ️  No properties found for this landlord');
      return;
    }

    const propertyIds = properties.map(p => p.id);

    // 2. Delete property_views
    console.log('🗑️  Deleting property views...');
    const { error: viewsError } = await supabase
      .from('property_views')
      .delete()
      .in('property_id', propertyIds);

    if (viewsError) {
      console.error('❌ Error deleting property views:', viewsError);
    } else {
      console.log('✅ Property views deleted\n');
    }

    // 3. Delete leads
    console.log('🗑️  Deleting leads...');
    const { error: leadsError } = await supabase
      .from('leads')
      .delete()
      .eq('landlord_id', landlordId);

    if (leadsError) {
      console.error('❌ Error deleting leads:', leadsError);
    } else {
      console.log('✅ Leads deleted\n');
    }

    // 4. Invalidate analytics cache
    console.log('🗑️  Invalidating analytics cache...');
    const { error: cacheError } = await supabase
      .from('lead_analytics')
      .delete()
      .eq('landlord_id', landlordId);

    if (cacheError) {
      console.error('❌ Error invalidating cache:', cacheError);
    } else {
      console.log('✅ Analytics cache cleared\n');
    }

    console.log('✅ All analytics data cleared successfully!\n');

  } catch (error) {
    console.error('❌ Error clearing analytics data:', error);
    throw error;
  }
}

// Get landlord ID from command line argument or use default
const landlordId = process.argv[2] || '70a55ea9-221f-4125-853d-5398a4c1f515';

clearAnalyticsData(landlordId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
