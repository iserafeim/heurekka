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
 * Seed analytics data for testing the landlord dashboard
 * This will create property_views and leads for the landlord's properties
 */
async function seedAnalyticsData(landlordId: string) {
  console.log(`\n🌱 Seeding analytics data for landlord: ${landlordId}\n`);

  try {
    // 1. Get landlord's properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, name, location')
      .eq('landlord_id', landlordId);

    if (propertiesError) {
      console.error('❌ Error fetching properties:', propertiesError);
      return;
    }

    if (!properties || properties.length === 0) {
      console.error('❌ No properties found for this landlord');
      console.log('💡 Tip: Create some properties first before seeding analytics data');
      return;
    }

    console.log(`✅ Found ${properties.length} properties\n`);

    // 2. Generate property_views for the last 30 days
    console.log('📊 Creating property views...');
    const viewsToCreate = [];
    const now = new Date();

    for (const property of properties) {
      // Generate 5-50 views per property over the last 30 days
      const numViews = Math.floor(Math.random() * 46) + 5;

      for (let i = 0; i < numViews; i++) {
        // Random date in the last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const viewDate = new Date(now);
        viewDate.setDate(viewDate.getDate() - daysAgo);

        viewsToCreate.push({
          property_id: property.id,
          viewed_at: viewDate.toISOString(),
          viewer_id: `viewer_${Math.random().toString(36).substr(2, 9)}`, // Random viewer ID
        });
      }
    }

    const { error: viewsError } = await supabase
      .from('property_views')
      .insert(viewsToCreate);

    if (viewsError) {
      console.error('❌ Error creating property views:', viewsError);
    } else {
      console.log(`✅ Created ${viewsToCreate.length} property views\n`);
    }

    // 3. Generate leads for the last 30 days
    console.log('📧 Creating leads...');
    const leadsToCreate = [];

    for (const property of properties) {
      // Generate 2-10 leads per property
      const numLeads = Math.floor(Math.random() * 9) + 2;

      for (let i = 0; i < numLeads; i++) {
        // Random date in the last 30 days
        const daysAgo = Math.floor(Math.random() * 30);
        const leadDate = new Date(now);
        leadDate.setDate(leadDate.getDate() - daysAgo);

        // Random status: 70% new, 20% contacted, 10% converted
        const rand = Math.random();
        let status = 'new';
        if (rand > 0.7 && rand <= 0.9) status = 'contacted';
        else if (rand > 0.9) status = 'converted';

        leadsToCreate.push({
          property_id: property.id,
          landlord_id: landlordId,
          tenant_name: `Inquilino ${Math.floor(Math.random() * 1000)}`,
          tenant_email: `inquilino${Math.floor(Math.random() * 1000)}@email.com`,
          tenant_phone: `+504 ${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          message: `Hola, estoy interesado en la propiedad "${property.name}". ¿Podría proporcionarme más información?`,
          status: status,
          created_at: leadDate.toISOString(),
          updated_at: leadDate.toISOString(),
        });
      }
    }

    const { error: leadsError } = await supabase
      .from('leads')
      .insert(leadsToCreate);

    if (leadsError) {
      console.error('❌ Error creating leads:', leadsError);
    } else {
      console.log(`✅ Created ${leadsToCreate.length} leads\n`);
    }

    // 4. Summary
    console.log('📊 SEED SUMMARY');
    console.log('==========================================');
    console.log(`Properties: ${properties.length}`);
    console.log(`Property Views: ${viewsToCreate.length}`);
    console.log(`Leads Created: ${leadsToCreate.length}`);
    console.log(`  - New: ${leadsToCreate.filter(l => l.status === 'new').length}`);
    console.log(`  - Contacted: ${leadsToCreate.filter(l => l.status === 'contacted').length}`);
    console.log(`  - Converted: ${leadsToCreate.filter(l => l.status === 'converted').length}`);
    console.log('==========================================\n');

    console.log('✅ Analytics data seeded successfully!\n');
    console.log('💡 You can now view the analytics in your landlord dashboard\n');

  } catch (error) {
    console.error('❌ Error seeding analytics data:', error);
    throw error;
  }
}

// Get landlord ID from command line argument or use default
const landlordId = process.argv[2] || '70a55ea9-221f-4125-853d-5398a4c1f515';

seedAnalyticsData(landlordId)
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Error:', error);
    process.exit(1);
  });
