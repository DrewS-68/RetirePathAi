import { Hono } from "npm:hono@4.6.14";
import { cors } from 'npm:hono/cors';
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'apikey'],
}));

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

const BUCKET_NAME = 'village-images';

/**
 * Initialize storage bucket for village images
 * Creates bucket if it doesn't exist and sets up public access policies
 */
app.post("/make-server-3bba8be8/storage/init", async (c) => {
  try {
    console.log('Initializing storage bucket...');

    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return c.json({ error: 'Failed to list buckets', details: listError.message }, 500);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (bucketExists) {
      console.log(`Bucket '${BUCKET_NAME}' already exists`);
      return c.json({ 
        message: 'Storage bucket already initialized',
        bucket: BUCKET_NAME,
        status: 'exists'
      });
    }

    // Create the bucket with public access
    const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true, // Allow public read access
      fileSizeLimit: 5242880, // 5MB limit per file
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    });

    if (createError) {
      console.error('Error creating bucket:', createError);
      return c.json({ error: 'Failed to create bucket', details: createError.message }, 500);
    }

    console.log(`Successfully created bucket: ${BUCKET_NAME}`);

    return c.json({
      message: 'Storage bucket initialized successfully',
      bucket: BUCKET_NAME,
      status: 'created',
      publicUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/${BUCKET_NAME}/`
    });

  } catch (error) {
    console.error('Storage initialization error:', error);
    return c.json({ error: 'Storage initialization failed', details: error.message }, 500);
  }
});

/**
 * Upload village image to storage
 * Accepts base64 encoded image data
 */
app.post("/make-server-3bba8be8/storage/upload", async (c) => {
  try {
    const body = await c.req.json();
    const { villageId, imageData, fileName } = body;

    if (!villageId || !imageData || !fileName) {
      return c.json({ error: 'Missing required fields: villageId, imageData, fileName' }, 400);
    }

    // Check if bucket exists first
    console.log('Checking if bucket exists...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return c.json({ 
        error: 'Failed to check storage bucket', 
        details: listError.message,
        hint: 'Make sure to initialize storage first from the Storage Setup tab'
      }, 500);
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);
    
    if (!bucketExists) {
      console.error(`Bucket '${BUCKET_NAME}' does not exist`);
      return c.json({ 
        error: `Storage bucket '${BUCKET_NAME}' does not exist`,
        hint: 'Please initialize storage from the Storage Setup tab first',
        bucketName: BUCKET_NAME
      }, 400);
    }

    console.log(`Bucket '${BUCKET_NAME}' exists, proceeding with upload...`);

    // Decode base64 image
    let buffer;
    try {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
      buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    } catch (err) {
      console.error('Base64 decode error:', err);
      return c.json({ error: 'Invalid image data format' }, 400);
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${villageId}/${timestamp}_${sanitizedFileName}`;

    console.log(`Uploading to: ${filePath}`);

    // Upload to storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return c.json({ 
        error: 'Failed to upload image', 
        details: uploadError.message,
        storageError: uploadError
      }, 500);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    console.log(`Uploaded image: ${filePath}`);

    return c.json({
      success: true,
      path: filePath,
      url: publicUrlData.publicUrl
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return c.json({ 
      error: 'Upload failed', 
      details: error.message,
      stack: error.stack 
    }, 500);
  }
});

/**
 * Bulk upload images for a village
 * Accepts array of base64 encoded images
 */
app.post("/make-server-3bba8be8/storage/bulk-upload", async (c) => {
  try {
    const body = await c.req.json();
    const { villageId, images } = body;

    if (!villageId || !Array.isArray(images) || images.length === 0) {
      return c.json({ error: 'Missing or invalid fields: villageId, images array' }, 400);
    }

    console.log(`Bulk uploading ${images.length} images for village ${villageId}`);

    const results = [];
    const errors = [];

    for (let i = 0; i < images.length; i++) {
      const { imageData, fileName } = images[i];
      
      try {
        // Decode base64 image
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${villageId}/${timestamp}_${i}_${sanitizedFileName}`;

        // Upload to storage
        const { data, error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, buffer, {
            contentType: 'image/jpeg',
            upsert: false
          });

        if (uploadError) {
          console.error(`Upload error for image ${i}:`, uploadError);
          errors.push({ index: i, fileName, error: uploadError.message });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(filePath);

        results.push({
          index: i,
          fileName,
          path: filePath,
          url: publicUrlData.publicUrl
        });

      } catch (err) {
        console.error(`Error processing image ${i}:`, err);
        errors.push({ index: i, fileName, error: err.message });
      }
    }

    console.log(`Bulk upload complete: ${results.length} success, ${errors.length} errors`);

    return c.json({
      success: true,
      uploaded: results.length,
      failed: errors.length,
      results,
      errors
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return c.json({ error: 'Bulk upload failed', details: error.message }, 500);
  }
});

/**
 * Update village images in database
 * Adds new image URLs to the village's images array
 */
app.post("/make-server-3bba8be8/storage/update-village-images", async (c) => {
  try {
    const body = await c.req.json();
    const { villageId, imageUrls } = body;

    if (!villageId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return c.json({ error: 'Missing or invalid fields: villageId, imageUrls array' }, 400);
    }

    console.log(`Updating images for village ${villageId}`);

    // Get current village data
    const { data: village, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('images')
      .eq('id', villageId)
      .single();

    if (fetchError) {
      console.error('Error fetching village:', fetchError);
      return c.json({ error: 'Village not found', details: fetchError.message }, 404);
    }

    // Merge new URLs with existing ones (avoid duplicates)
    const existingImages = village.images || [];
    const allImages = [...new Set([...existingImages, ...imageUrls])];

    // Update village
    const { error: updateError } = await supabase
      .from('retirement_villages')
      .update({ images: allImages })
      .eq('id', villageId);

    if (updateError) {
      console.error('Error updating village:', updateError);
      return c.json({ error: 'Failed to update village', details: updateError.message }, 500);
    }

    console.log(`Updated village ${villageId} with ${imageUrls.length} new images`);

    return c.json({
      success: true,
      villageId,
      previousCount: existingImages.length,
      newCount: allImages.length,
      addedCount: imageUrls.length
    });

  } catch (error) {
    console.error('Update village images error:', error);
    return c.json({ error: 'Update failed', details: error.message }, 500);
  }
});

/**
 * Get storage info and bucket status
 */
app.get("/make-server-3bba8be8/storage/info", async (c) => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    return c.json({
      bucketName: BUCKET_NAME,
      exists: bucketExists,
      publicUrl: `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/${BUCKET_NAME}/`,
      buckets: buckets || []
    });
  } catch (error) {
    return c.json({ error: 'Failed to get storage info', details: error.message }, 500);
  }
});

/**
 * DEBUG: List sample files from storage bucket
 */
app.get("/make-server-3bba8be8/storage/list-sample-files", async (c) => {
  try {
    console.log('Listing sample files from storage...');

    // List first 50 files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 50,
        offset: 0
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return c.json({ error: 'Failed to list storage files', details: listError.message }, 500);
    }

    if (!files || files.length === 0) {
      return c.json({ 
        message: 'No files found in storage',
        files: []
      });
    }

    // Return just the filenames
    const fileNames = files
      .filter(f => f.name && !f.name.endsWith('/'))
      .map(f => f.name);

    return c.json({
      count: fileNames.length,
      totalInBucket: files.length,
      sampleFiles: fileNames
    });

  } catch (error) {
    console.error('List files error:', error);
    return c.json({ error: 'Failed to list files', details: error.message }, 500);
  }
});

/**
 * Scan storage bucket and return all village images
 */
app.get("/make-server-3bba8be8/storage/scan-images", async (c) => {
  try {
    console.log('Scanning storage for village images...');

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 10000,
        offset: 0
      });

    if (listError) {
      console.error('Error listing files:', listError);
      return c.json({ error: 'Failed to list storage files', details: listError.message }, 500);
    }

    if (!files || files.length === 0) {
      return c.json({ 
        message: 'No files found in storage',
        villageCount: 0,
        totalImages: 0,
        villages: []
      });
    }

    console.log(`Found ${files.length} files in storage`);

    // Group files by village ID (filename before extension is the UUID)
    const villageImagesMap = new Map<string, string[]>();

    for (const file of files) {
      if (!file.name || file.name.endsWith('/')) continue;

      // Extract UUID from filename (remove extension)
      const villageId = file.name.replace(/\.[^/.]+$/, '');
      
      // Validate it's a UUID format (basic check)
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(villageId)) {
        console.log(`Skipping non-UUID file: ${file.name}`);
        continue;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.name);

      if (urlData?.publicUrl) {
        if (!villageImagesMap.has(villageId)) {
          villageImagesMap.set(villageId, []);
        }
        villageImagesMap.get(villageId)!.push(urlData.publicUrl);
      }
    }

    // Convert map to array format
    const villages = Array.from(villageImagesMap.entries()).map(([villageId, images]) => ({
      villageId,
      images
    }));

    const totalImages = villages.reduce((sum, v) => sum + v.images.length, 0);

    console.log(`✅ Scan complete: Found ${villages.length} villages with ${totalImages} total images`);

    return c.json({
      villageCount: villages.length,
      totalImages,
      villages
    });

  } catch (error) {
    console.error('Scan error:', error);
    return c.json({ error: 'Failed to scan storage', details: error.message }, 500);
  }
});

/**
 * Link village images to database
 * Updates the village record with image URLs
 */
app.post("/make-server-3bba8be8/storage/link-village-images", async (c) => {
  try {
    const body = await c.req.json();
    const { villageId, imageUrls } = body;

    if (!villageId || !Array.isArray(imageUrls)) {
      return c.json({ error: 'Missing or invalid fields: villageId, imageUrls array' }, 400);
    }

    console.log('Linking images to village:', villageId, 'Count:', imageUrls.length);
    console.log('Image URLs:', imageUrls);

    // Get current village data
    const { data: village, error: fetchError } = await supabase
      .from('retirement_villages')
      .select('images')
      .eq('id', villageId)
      .single();

    if (fetchError) {
      console.error('Error fetching village:', fetchError);
      return c.json({ error: 'Village not found', details: fetchError.message }, 404);
    }

    // Merge new URLs with existing ones (avoid duplicates)
    const existingImages = village.images || [];
    const allImages = [...new Set([...existingImages, ...imageUrls])];
    
    console.log('Village images - Existing:', existingImages.length, 'Total:', allImages.length);

    // Update village
    const { error: updateError } = await supabase
      .from('retirement_villages')
      .update({ images: allImages })
      .eq('id', villageId);

    if (updateError) {
      console.error('Error updating village:', updateError);
      return c.json({ error: 'Failed to update village', details: updateError.message }, 500);
    }

    console.log('Successfully linked images to village:', villageId);
    
    // Verify the update
    const { data: updatedVillage } = await supabase
      .from('retirement_villages')
      .select('id, name, images')
      .eq('id', villageId)
      .single();
    
    console.log('VERIFIED - Village now has images:', updatedVillage?.images?.length || 0);
    console.log('Updated images:', updatedVillage?.images);

    return c.json({
      success: true,
      villageId,
      previousCount: existingImages.length,
      newCount: allImages.length,
      addedCount: imageUrls.length,
      verification: updatedVillage
    });

  } catch (error) {
    console.error('Link images error:', error);
    return c.json({ error: 'Failed to link images', details: error.message }, 500);
  }
});

export default app;