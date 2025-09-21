#!/usr/bin/env node

/**
 * Script to fix image URLs that are just photo IDs instead of complete Unsplash URLs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function createUnsplashUrl(photoId) {
  // Remove 'photo-' prefix if it exists
  const cleanId = photoId.replace(/^photo-/, '');

  // Create complete Unsplash URL with proper parameters
  return `https://images.unsplash.com/photo-${cleanId}?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80`;
}

async function fixIncompleteUrls() {
  try {
    console.log('🔧 Finding and fixing incomplete image URLs...');

    // Get all images that look like photo IDs instead of full URLs
    const { data: images, error: fetchError } = await supabase
      .from('property_images')
      .select('id, url, property_id')
      .like('url', 'photo-%')
      .not('url', 'like', 'https://%');

    if (fetchError) {
      console.error('❌ Error fetching images:', fetchError);
      return;
    }

    console.log(`📷 Found ${images.length} incomplete URLs to fix`);

    if (images.length === 0) {
      console.log('✅ All URLs are already properly formatted!');
      return;
    }

    for (const image of images) {
      const fullUrl = createUnsplashUrl(image.url);

      console.log(`🔄 Converting: ${image.url} → ${fullUrl}`);

      const { error: updateError } = await supabase
        .from('property_images')
        .update({ url: fullUrl })
        .eq('id', image.id);

      if (updateError) {
        console.error(`❌ Error updating image ${image.id}:`, updateError);
      } else {
        console.log(`✅ Updated image ${image.id} for property ${image.property_id}`);
      }
    }

    console.log('\n🎉 All incomplete URLs have been converted to full Unsplash URLs!');
    console.log('🧪 Property card navigation should now work correctly.');

  } catch (error) {
    console.error('❌ Error fixing incomplete URLs:', error);
    process.exit(1);
  }
}

fixIncompleteUrls();