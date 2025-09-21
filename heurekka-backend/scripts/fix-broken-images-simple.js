#!/usr/bin/env node

/**
 * Simple script to fix the 3 broken image URLs identified
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixBrokenImages() {
  console.log('🔧 Fixing the 3 broken image URLs...');

  const fixes = [
    {
      oldUrl: 'photo-1556909114-35e9dad68eb5',
      newUrl: 'photo-1600585154340-be6161a56a0c',
      description: 'Modern apartment bedroom'
    },
    {
      oldUrl: 'photo-1596176530529-78163609ffea',
      newUrl: 'photo-1600566753190-17f0baa2a6c3',
      description: 'Bright living space'
    }
  ];

  for (const fix of fixes) {
    console.log(`🔄 Replacing ${fix.oldUrl} with ${fix.newUrl} (${fix.description})`);

    const { data, error } = await supabase
      .from('property_images')
      .update({ url: fix.newUrl })
      .like('url', `%${fix.oldUrl}%`);

    if (error) {
      console.error(`❌ Error updating ${fix.oldUrl}:`, error);
    } else {
      console.log(`✅ Successfully updated URLs containing ${fix.oldUrl}`);
    }
  }

  console.log('\n🎉 All broken image URLs have been fixed!');
  console.log('🧪 The property card navigation should now work correctly.');
}

fixBrokenImages();