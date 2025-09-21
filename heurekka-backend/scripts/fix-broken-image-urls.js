#!/usr/bin/env node

/**
 * Script to fix broken image URLs that return 404 errors
 * This resolves the navigation issues in property cards caused by invalid Unsplash URLs
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Valid Unsplash image IDs for replacement (verified working URLs)
const validUnsplashImages = [
  'photo-1560448204-e02f11c3d0e2', // Modern apartment
  'photo-1567684014761-b65e2e59b5ae', // Living room
  'photo-1566908829077-2dd2d8776cb2', // Kitchen
  'photo-1600585154340-be6161a56a0c', // Bedroom
  'photo-1600566753190-17f0baa2a6c3', // Bathroom
  'photo-1600607687939-ce8a6c25118c', // Dining room
  'photo-1484154218962-a197022b5858', // Balcony view
  'photo-1502672260266-1c1ef2d93688', // Modern living space
  'photo-1560185007-5f0bb1866d7e', // Kitchen island
  'photo-1571508601891-ca5e7a713859', // Cozy bedroom
  'photo-1556909114-f6e7ad7d3136', // Apartment exterior
  'photo-1545324418-cc1a3fa10c00', // Luxury interior
  'photo-1493809842364-78817add7ffb', // Minimalist room
  'photo-1616594039964-ae9021a400a0', // Modern bathroom
  'photo-1586023492125-27b2c045efd7'  // Spacious living
];

async function validateImageUrl(url) {
  try {
    // Extract the photo ID from URL if it's already a full Unsplash URL
    let photoId = url;
    if (url.includes('unsplash.com/')) {
      const match = url.match(/photo-([a-zA-Z0-9_-]+)/);
      if (match) {
        photoId = `photo-${match[1]}`;
      }
    }

    // Construct proper Unsplash URL for validation
    const testUrl = `https://images.unsplash.com/${photoId}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`;

    console.log(`🔍 Validating: ${testUrl}`);
    const response = await fetch(testUrl, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error(`❌ Error validating ${url}:`, error.message);
    return false;
  }
}

async function getRandomValidImage(excludeUsed = []) {
  const available = validUnsplashImages.filter(img => !excludeUsed.includes(img));
  if (available.length === 0) {
    // If all are used, just pick a random one
    return validUnsplashImages[Math.floor(Math.random() * validUnsplashImages.length)];
  }
  return available[Math.floor(Math.random() * available.length)];
}

async function fixBrokenImageUrls() {
  try {
    console.log('🔍 Starting broken image URL validation and replacement...');

    // Get all image URLs from the database
    const { data: allImages, error: fetchError } = await supabase
      .from('property_images')
      .select('id, property_id, url, order_index')
      .order('property_id')
      .order('order_index');

    if (fetchError) {
      console.error('❌ Error fetching images:', fetchError);
      return;
    }

    console.log(`📷 Found ${allImages.length} images to validate`);

    const brokenImages = [];
    const validationPromises = allImages.map(async (image) => {
      const isValid = await validateImageUrl(image.url);
      if (!isValid) {
        brokenImages.push(image);
        console.log(`❌ Broken URL found: ${image.url} (Property: ${image.property_id})`);
      } else {
        console.log(`✅ Valid URL: ${image.url}`);
      }
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    // Process validations in smaller batches to avoid overwhelming Unsplash
    const batchSize = 5;
    for (let i = 0; i < validationPromises.length; i += batchSize) {
      const batch = validationPromises.slice(i, i + batchSize);
      await Promise.all(batch);
      console.log(`📊 Processed ${Math.min(i + batchSize, validationPromises.length)}/${validationPromises.length} images`);
    }

    console.log(`\n🔧 Found ${brokenImages.length} broken image URLs to fix`);

    if (brokenImages.length === 0) {
      console.log('✅ All image URLs are valid! No fixes needed.');
      return;
    }

    // Group broken images by property to ensure each property gets unique images
    const imagesByProperty = {};
    brokenImages.forEach(image => {
      if (!imagesByProperty[image.property_id]) {
        imagesByProperty[image.property_id] = [];
      }
      imagesByProperty[image.property_id].push(image);
    });

    // Fix broken images
    for (const [propertyId, images] of Object.entries(imagesByProperty)) {
      console.log(`\n🏠 Fixing ${images.length} broken images for property ${propertyId}`);

      const usedImages = [];

      for (const image of images) {
        const newImageId = await getRandomValidImage(usedImages);
        usedImages.push(newImageId);

        const { error: updateError } = await supabase
          .from('property_images')
          .update({
            url: newImageId,
            updated_at: new Date().toISOString()
          })
          .eq('id', image.id);

        if (updateError) {
          console.error(`❌ Error updating image ${image.id}:`, updateError);
        } else {
          console.log(`✅ Updated image ${image.id}: ${image.url} → ${newImageId}`);
        }
      }
    }

    console.log('\n🎉 Broken image URL fix completed successfully!');
    console.log('🧪 Please test the property card navigation to verify the fix.');

  } catch (error) {
    console.error('❌ Error fixing broken image URLs:', error);
    process.exit(1);
  }
}

// Run the fix
fixBrokenImageUrls();