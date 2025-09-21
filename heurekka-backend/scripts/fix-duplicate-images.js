#!/usr/bin/env node

/**
 * Script to fix duplicate image URLs in the property_images table
 * This resolves the navigation issues in property cards caused by shared image URLs
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

async function fixDuplicateImageUrls() {
  try {
    console.log('🔍 Analyzing duplicate image URLs...');

    // First, identify all duplicate URLs
    const { data: duplicates, error: duplicatesError } = await supabase
      .rpc('get_duplicate_image_urls');

    if (duplicatesError) {
      console.log('Note: Custom RPC not available, proceeding with manual fix...');
    }

    console.log('🔧 Fixing known duplicate URLs...');

    // Fix first duplicate: photo-1556909114-f6e7ad7d3136
    // This URL is shared between "Apartamento Céntrico Comayagüela" and "Casa Moderna en Las Colinas"
    const { data: properties1, error: propsError1 } = await supabase
      .from('properties')
      .select('id, title')
      .ilike('title', '%Casa Moderna en Las Colinas%')
      .limit(1);

    if (propsError1) {
      console.error('Error finding properties:', propsError1);
      return;
    }

    if (properties1 && properties1.length > 0) {
      const { error: updateError1 } = await supabase
        .from('property_images')
        .update({ url: 'photo-1560448204-e02f11c3d0e2' })
        .eq('url', 'photo-1556909114-f6e7ad7d3136')
        .eq('property_id', properties1[0].id);

      if (updateError1) {
        console.error('Error updating first duplicate:', updateError1);
      } else {
        console.log('✅ Fixed first duplicate for:', properties1[0].title);
      }
    }

    // Fix second duplicate: photo-1571508601891-ca5e7a713859
    // This URL is shared between "Apartamento en El Trapiche" and "Apartamento Económico en Palmira"
    const { data: properties2, error: propsError2 } = await supabase
      .from('properties')
      .select('id, title')
      .ilike('title', '%Apartamento Económico en Palmira%')
      .limit(1);

    if (properties2 && properties2.length > 0) {
      const { error: updateError2 } = await supabase
        .from('property_images')
        .update({ url: 'photo-1567684014761-b65e2e59b5ae' })
        .eq('url', 'photo-1571508601891-ca5e7a713859')
        .eq('property_id', properties2[0].id);

      if (updateError2) {
        console.error('Error updating second duplicate:', updateError2);
      } else {
        console.log('✅ Fixed second duplicate for:', properties2[0].title);
      }
    }

    // Fix third duplicate: photo-1556909114-35e9dad68eb5
    // This URL is shared between "Apartamento en El Trapiche" and "Apartamento Ejecutivo Los Castaños"
    const { data: properties3, error: propsError3 } = await supabase
      .from('properties')
      .select('id, title')
      .ilike('title', '%Apartamento Ejecutivo Los Castaños%')
      .limit(1);

    if (properties3 && properties3.length > 0) {
      const { error: updateError3 } = await supabase
        .from('property_images')
        .update({ url: 'photo-1566908829077-2dd2d8776cb2' })
        .eq('url', 'photo-1556909114-35e9dad68eb5')
        .eq('property_id', properties3[0].id);

      if (updateError3) {
        console.error('Error updating third duplicate:', updateError3);
      } else {
        console.log('✅ Fixed third duplicate for:', properties3[0].title);
      }
    }

    // Add more images to properties that have fewer than 3 images for better navigation testing
    console.log('📷 Adding additional images for navigation testing...');

    const { data: propertiesWithFewImages, error: fewImagesError } = await supabase
      .from('properties')
      .select(`
        id,
        title,
        property_images(id)
      `)
      .limit(10);

    if (fewImagesError) {
      console.error('Error finding properties with few images:', fewImagesError);
    } else {
      for (const property of propertiesWithFewImages || []) {
        const imageCount = property.property_images?.length || 0;

        if (imageCount < 3) {
          // Add additional unique images
          const newImages = [
            'photo-1600585154340-be6161a56a0c',
            'photo-1600566753190-17f0baa2a6c3',
            'photo-1600607687939-ce8a6c25118c',
            'photo-1484154218962-a197022b5858',
            'photo-1502672260266-1c1ef2d93688'
          ];

          for (let i = imageCount; i < Math.min(3, imageCount + 2); i++) {
            const { error: insertError } = await supabase
              .from('property_images')
              .insert({
                property_id: property.id,
                url: newImages[i % newImages.length],
                alt: `Imagen ${i + 1} de la propiedad`,
                order_index: i + 1
              });

            if (insertError) {
              console.error(`Error adding image to ${property.title}:`, insertError);
            }
          }

          console.log(`📷 Added images to: ${property.title}`);
        }
      }
    }

    console.log('✅ Duplicate image URL fix completed successfully!');
    console.log('🧪 Please test the property card navigation to verify the fix.');

  } catch (error) {
    console.error('❌ Error fixing duplicate image URLs:', error);
    process.exit(1);
  }
}

// Run the fix
fixDuplicateImageUrls();